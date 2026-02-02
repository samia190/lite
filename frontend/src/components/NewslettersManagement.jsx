import React, { useEffect, useState } from "react";
import { get, put, upload, del } from "../utils/api";

function fileHref(file) {
  return file?.downloadUrl || file?.url || "";
}

const COLOR_OPTIONS = [
  { value: "#f3f4f6", label: "Light Grey" },
  { value: "#e0f2fe", label: "Light Blue" },
  { value: "#dcfce7", label: "Light Green" },
  { value: "#fef3c7", label: "Light Yellow" },
  { value: "#fee2e2", label: "Light Red" },
];

export default function NewslettersManagement() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Text (intro) form
  const [textForm, setTextForm] = useState({ title: "", body: "" });
  const [savingText, setSavingText] = useState(false);

  // Upload files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Media meta (titles/descriptions per file)
  const attachments = content?.attachments || [];

  // Newsletter items / containers
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({
    title: "",
    body: "",
    color: COLOR_OPTIONS[0].value,
  });
  const [savingPosts, setSavingPosts] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/api/content/newsletter");
      const safe = data || {};
      setContent(safe);
      setTextForm({
        title: safe.title || "",
        body: safe.body || safe.intro || "",
      });
      const existingPosts =
        (safe.data && Array.isArray(safe.data.posts) && safe.data.posts) || [];
      setPosts(existingPosts);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading newsletter content");
      setLoading(false);
    }
  }

  // ---------------- TEXT (INTRO) ----------------
  function handleTextChange(e) {
    const { name, value } = e.target;
    setTextForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveText(e) {
    e.preventDefault();
    setSavingText(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("type", "newsletter");

      if (textForm.title && textForm.title.trim().length > 0) {
        fd.append("title", textForm.title);
      }
      if (textForm.body && textForm.body.trim().length > 0) {
        fd.append("body", textForm.body);
      }

      await upload("/api/admin/content", fd);
      setSuccess("Newsletter intro text saved.");
      await fetchContent();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving text");
    } finally {
      setSavingText(false);
    }
  }

  // ---------------- FILE UPLOADS ----------------
  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  }

  async function handleUploadFiles(e) {
    e.preventDefault();
    if (!selectedFiles.length) {
      setError("Please choose one or more files to upload.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("type", "newsletter");
      selectedFiles.forEach((file) => {
        fd.append("files", file);
      });

      await upload("/api/admin/content", fd);
      setSuccess("Files uploaded successfully.");
      setSelectedFiles([]);
      await fetchContent();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error uploading files");
    } finally {
      setUploading(false);
    }
  }

  // ---------------- MEDIA META (TITLES / DESCRIPTIONS) ----------------
  function handleMediaMetaChange(index, field, value) {
    setContent((prev) => {
      if (!prev) return prev;
      const nextAttachments = [...(prev.attachments || [])];
      nextAttachments[index] = { ...nextAttachments[index], [field]: value };
      return { ...prev, attachments: nextAttachments };
    });
  }

  async function handleSaveMediaDetails() {
    if (!content?._id) {
      setError("Cannot save media details: missing content ID.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const updated = await put(`/api/content/${content._id}`, {
        attachments: content.attachments || [],
      });
      setContent(updated);
      setSuccess("Media titles and descriptions saved.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving media details");
    }
  }

  async function handleDeleteMedia(mediaId) {
    if (!content?._id) return;

    if (!window.confirm("Delete this file permanently?")) return;

    try {
      await del(`/api/admin/content/${content._id}/media/${mediaId}`);
      setSuccess("Media deleted.");
      await fetchContent();
    } catch (err) {
      setError(err.message || "Failed to delete media");
    }
  }

  async function handleReplaceMedia(mediaId, newFile) {
    const fd = new FormData();
    fd.append("file", newFile);

    try {
      await upload(
        `/api/admin/content/${content._id}/media/${mediaId}`,
        fd,
        {},
        { method: "PUT" }
      );
      setSuccess("Media replaced.");
      await fetchContent();
    } catch (err) {
      setError("Failed to replace media");
    }
  }

  // ---------------- NEWSLETTER ITEMS / CONTAINERS ----------------
  function handlePostFormChange(e) {
    const { name, value } = e.target;
    setPostForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddPost(e) {
    e.preventDefault();
    if (!content?._id) {
      setError(
        "Please save the newsletter intro text or upload a file once before adding items."
      );
      return;
    }
    if (!postForm.title.trim() && !postForm.body.trim()) {
      setError("Please provide at least a title or body for the newsletter item.");
      return;
    }

    setSavingPosts(true);
    setError("");
    setSuccess("");

    try {
      const newPost = {
        id: Date.now().toString(),
        title: postForm.title,
        body: postForm.body,
        color: postForm.color || COLOR_OPTIONS[0].value,
        createdAt: new Date().toISOString(),
      };

      const updatedPosts = [newPost, ...(posts || [])];

      const updated = await put(`/api/content/${content._id}`, {
        data: {
          ...(content.data || {}),
          posts: updatedPosts,
        },
      });
      if (!updated) throw new Error("Failed to save newsletter items");
      setContent(updated);
      const freshPosts =
        (updated.data && Array.isArray(updated.data.posts) && updated.data.posts) ||
        [];
      setPosts(freshPosts);
      setPostForm({
        title: "",
        body: "",
        color: postForm.color,
      });
      setSuccess("Newsletter item added.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error adding newsletter item");
    } finally {
      setSavingPosts(false);
    }
  }

  function handlePostChange(index, field, value) {
    setPosts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  async function handleSaveAllPosts() {
    if (!content?._id) {
      setError("Cannot save newsletter items: missing content ID.");
      return;
    }

    setSavingPosts(true);
    setError("");
    setSuccess("");

    try {
      const updated = await put(`/api/content/${content._id}`, {
        data: {
          ...(content.data || {}),
          posts,
        },
      });
      if (!updated) throw new Error("Failed to save newsletter items");
      setContent(updated);
      const freshPosts =
        (updated.data && Array.isArray(updated.data.posts) && updated.data.posts) ||
        [];
      setPosts(freshPosts);
      setSuccess("All newsletter items saved.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving newsletter items");
    } finally {
      setSavingPosts(false);
    }
  }

  function handleDeletePost(index) {
    setPosts((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <section>
        <h2>Newsletter Management</h2>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Newsletter Management</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* TEXT SECTION (INTRO) */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Newsletter Intro Text</h3>
        <form onSubmit={handleSaveText}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Title</label>
            <input
              type="text"
              name="title"
              value={textForm.title}
              onChange={handleTextChange}
              style={{ width: "100%", padding: "6px" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Intro text</label>
            <textarea
              name="body"
              value={textForm.body}
              onChange={handleTextChange}
              rows={4}
              style={{ width: "100%", padding: "6px" }}
            />
          </div>
          <button type="submit" disabled={savingText}>
            {savingText ? "Saving..." : "Save Intro"}
          </button>
        </form>
      </div>

      {/* UPLOAD SECTION */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Upload Newsletter Media</h3>
        <p style={{ fontSize: "0.85rem" }}>
          Upload images, videos, PDFs, or other files to appear on the public Newsletter
          page.
        </p>
        <form onSubmit={handleUploadFiles}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ marginBottom: "0.5rem" }}
          />
          <br />
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </form>
      </div>

      {/* MEDIA META SECTION */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Media Titles & Descriptions</h3>
        {attachments.length === 0 && <p>No media uploaded yet.</p>}

        {attachments.map((file, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "0.75rem",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          >
            <div style={{ marginBottom: "0.25rem", fontSize: "0.85rem" }}>
              File: {file.originalName || file.name || "(unnamed)"}{" "}
              {file.mimetype ? ` · ${file.mimetype}` : ""}{" "}
              {file.size ? ` · ${(file.size / 1024).toFixed(1)} KB` : ""}
            </div>

            <div style={{ marginBottom: "0.25rem" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Title</label>
              <input
                type="text"
                value={file.title || ""}
                onChange={(e) =>
                  handleMediaMetaChange(idx, "title", e.target.value)
                }
                placeholder="Title shown on public page"
                style={{ width: "100%", padding: "4px" }}
              />
            </div>

            <div style={{ marginBottom: "0.25rem" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                Description / Caption
              </label>
              <textarea
                value={file.description || ""}
                onChange={(e) =>
                  handleMediaMetaChange(idx, "description", e.target.value)
                }
                rows={2}
                placeholder="Short description shown under the media"
                style={{ width: "100%", padding: "4px" }}
              />
            </div>

            {fileHref(file) && (
              <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                <a href={fileHref(file)} target="_blank" rel="noreferrer">
                  Open file
                </a>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => handleDeleteMedia(file._id)}
                style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

              <label style={{ fontSize: "0.8rem", cursor: "pointer" }}>
                Replace
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleReplaceMedia(file._id, e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>
        ))}

        {attachments.length > 0 && (
          <button onClick={handleSaveMediaDetails} style={{ marginTop: "0.5rem" }}>
            Save Media Titles & Descriptions
          </button>
        )}
      </div>

      {/* NEWSLETTER ITEMS / COLOURED CONTAINERS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Newsletter Items (Coloured Containers)</h3>
        <form onSubmit={handleAddPost} style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Item title</label>
            <input
              type="text"
              name="title"
              value={postForm.title}
              onChange={handlePostFormChange}
              style={{ width: "100%", padding: "6px" }}
              placeholder="e.g. 'Midterm Exams Schedule'"
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Item text</label>
            <textarea
              name="body"
              value={postForm.body}
              onChange={handlePostFormChange}
              rows={3}
              style={{ width: "100%", padding: "6px" }}
              placeholder="Details of this newsletter item..."
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Container colour
            </label>
            <select
              name="color"
              value={postForm.color}
              onChange={handlePostFormChange}
              style={{ padding: "4px" }}
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={savingPosts}>
            {savingPosts ? "Adding..." : "Add Newsletter Item"}
          </button>
        </form>

        {/* Existing posts list */}
        {posts.length === 0 && <p>No newsletter items yet.</p>}

        {posts.length > 0 && (
          <div>
            {posts.map((post, index) => (
              <div
                key={post.id || post._id || index}
                style={{
                  marginBottom: "0.75rem",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  backgroundColor: post.color || "#f3f4f6",
                }}
              >
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Item title
                  </label>
                  <input
                    type="text"
                    value={post.title || ""}
                    onChange={(e) =>
                      handlePostChange(index, "title", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px" }}
                  />
                </div>
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Item text
                  </label>
                  <textarea
                    value={post.body || ""}
                    onChange={(e) =>
                      handlePostChange(index, "body", e.target.value)
                    }
                    rows={3}
                    style={{ width: "100%", padding: "4px" }}
                  />
                </div>
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Container colour
                  </label>
                  <select
                    value={post.color || COLOR_OPTIONS[0].value}
                    onChange={(e) =>
                      handlePostChange(index, "color", e.target.value)
                    }
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {post.createdAt && (
                  <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                    Created:{" "}
                    {new Date(post.createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDeletePost(index)}
                  style={{
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fecaca",
                    padding: "2px 6px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Delete item
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleSaveAllPosts}
              disabled={savingPosts}
              style={{ marginTop: "0.5rem" }}
            >
              {savingPosts ? "Saving..." : "Save All Newsletter Items"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
