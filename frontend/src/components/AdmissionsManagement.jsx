import React, { useEffect, useState } from "react";
import notify from "../utils/notify";
import AdminButton from "./AdminButton";
import { get, put, upload, del } from "../utils/api";
import Loader from "./Loader";

function fileHref(file) {
  return file?.downloadUrl || file?.url || "";
}

export default function AdmissionsManagement() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // text form
  const [textForm, setTextForm] = useState({
    title: "",
    overview: "",
    process: "",
    requirements: "",
    importantDates: "",
    contactInfo: "",
    downloadsHeading: "",
  });
  const [savingText, setSavingText] = useState(false);

  // file uploads
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/api/content/admissions");
      const safe = data || {};
      setContent(safe);

      setTextForm({
        title: safe.title || "Admissions",
        overview:
          safe.overview ||
          safe.body ||
          "We welcome applications from girls across Kenya who are passionate about learning and growth.",
        process:
          safe.process ||
          "Our admissions process is transparent, student–centered, and guided by the Ministry of Education regulations.",
        requirements:
          safe.requirements ||
          "Applicants should attach recent report forms, birth certificate, and any supporting documents requested.",
        importantDates:
          safe.importantDates ||
          "Key dates such as interview days and reporting dates will be communicated through this page.",
        contactInfo:
          safe.contactInfo ||
          "For any question on admissions, kindly reach the school office through the official contacts on the Contact page.",
        downloadsHeading:
          safe.downloadsHeading ||
          "Downloads – application forms and related documents",
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading admissions content");
      setLoading(false);
    }
  }

  const attachments = content?.attachments || [];

  // ---------- TEXT SAVE ----------
  function handleTextChange(e) {
    const { name, value } = e.target;
    setTextForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveText(e) {
    e.preventDefault();
    if (!content?._id) {
      setError(
        "Cannot save text yet. Please upload at least one file or save once using this form."
      );
      return;
    }
    setSavingText(true);
    setError("");
    setSuccess("");

    try {
      const updated = await put(`/api/content/${content._id}`, {
        title: textForm.title,
        overview: textForm.overview,
        process: textForm.process,
        requirements: textForm.requirements,
        importantDates: textForm.importantDates,
        contactInfo: textForm.contactInfo,
        downloadsHeading: textForm.downloadsHeading,
      });
      setContent(updated);
      setSuccess("Admissions text saved.");
      notify("Admissions text saved", "success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving admissions text");
    } finally {
      setSavingText(false);
    }
  }

  // ---------- FILE UPLOAD ----------
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
      fd.append("type", "admissions");
      // we can optionally send title/body, but not required
      selectedFiles.forEach((file) => {
        fd.append("files", file);
      });

      const data = await upload("/api/admin/content", fd);
      const updated = data.content || data;
      setContent(updated);
      setSelectedFiles([]);
      setSuccess("Admissions files uploaded successfully.");
      notify("Admissions files uploaded", "success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error uploading files");
    } finally {
      setUploading(false);
    }
  }

  // ---------- MEDIA META (TITLE / DESCRIPTION) ----------
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
      notify("Media titles and descriptions saved", "success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving media details");
      notify(err?.message || "Error saving media details", "error");
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

  if (loading) {
    return (
      <section>
        <h2>Admissions Management</h2>
        <Loader message="Loading admissions content…" />
      </section>
    );
  }

  return (
    <section>
      <h2>Admissions Management</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* TEXT FORM */}
      <form onSubmit={handleSaveText} style={{ marginBottom: "2.5rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Page title</label>
          <input
            type="text"
            name="title"
            value={textForm.title}
            onChange={handleTextChange}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Overview</label>
          <textarea
            name="overview"
            value={textForm.overview}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Admissions process
          </label>
          <textarea
            name="process"
            value={textForm.process}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Requirements
          </label>
          <textarea
            name="requirements"
            value={textForm.requirements}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Important dates
          </label>
          <textarea
            name="importantDates"
            value={textForm.importantDates}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Contact info
          </label>
          <textarea
            name="contactInfo"
            value={textForm.contactInfo}
            onChange={handleTextChange}
            rows={2}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Downloads heading
          </label>
          <input
            type="text"
            name="downloadsHeading"
            value={textForm.downloadsHeading}
            onChange={handleTextChange}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <AdminButton type="submit" disabled={savingText} variant="primary">
          {savingText ? "Saving…" : "Save Admissions Text"}
        </AdminButton>
      </form>

      {/* FILE UPLOAD */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Upload Admissions Documents / Media</h3>
        <p style={{ fontSize: "0.85rem" }}>
          Upload application forms, brochures, or other relevant documents. They
          will appear on the public Admissions page under Downloads.
        </p>
        <form onSubmit={handleUploadFiles}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ marginBottom: "0.5rem" }}
          />
          <br />
          <AdminButton type="submit" disabled={uploading} variant="primary">
            {uploading ? "Uploading…" : "Upload Files"}
          </AdminButton>
        </form>
      </div>

      {/* MEDIA TITLES / DESCRIPTIONS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Uploaded Admissions Files</h3>
        {attachments.length === 0 && <p>No files uploaded yet.</p>}

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
                Description
              </label>
              <textarea
                value={file.description || ""}
                onChange={(e) =>
                  handleMediaMetaChange(idx, "description", e.target.value)
                }
                rows={2}
                placeholder="Short description shown under the file"
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
          <div style={{ marginTop: 8 }}>
            <AdminButton onClick={handleSaveMediaDetails} variant="primary">Save Media Titles &amp; Descriptions</AdminButton>
          </div>
        )}
      </div>
    </section>
  );
}
