import React, { useEffect, useState } from "react";
import { get, put, upload, del } from "../utils/api";
import Loader from "./Loader";

function fileHref(file) {
  return file?.downloadUrl || file?.url || file?.fileUrl || "";
}

export default function FeeStructureManagement() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingText, setSavingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [textForm, setTextForm] = useState({
    title: "",
    body: "",
    notes: "",
    paymentInfo: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // ---------- LOAD EXISTING CONTENT ----------
  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/api/content/feestructure");
      if (!data) {
        setContent(null);
        setLoading(false);
        return;
      }
      const safe = data || {};
      setContent(safe);

      setTextForm({
        title: safe.title || "Fee Structure",
        body:
          safe.body ||
          safe.intro ||
          "Here you will find the current official fee structures and related payment information.",
        notes:
          safe.notes ||
          (safe.data && safe.data.notes) ||
          "Please ensure you use the most recent approved fee structure when making payments.",
        paymentInfo:
          safe.paymentInfo ||
          (safe.data && safe.data.paymentInfo) ||
          "Payment details (bank, paybill, account number) will be provided in the documents below or by the school office.",
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading fee structure content");
      setLoading(false);
    }
  }

  const attachments = content?.attachments || [];

  // ---------- TEXT FORM ----------
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
      // If content exists, update via PUT
      if (content?._id) {
        const updated = await put(`/api/content/${content._id}`, {
          title: textForm.title,
          body: textForm.body,
          notes: textForm.notes,
          paymentInfo: textForm.paymentInfo,
        });
        setContent(updated);
        setSuccess("Fee structure text saved.");
      } else {
        // First-time create: POST via /api/admin/content
        const fd = new FormData();
        fd.append("type", "feestructure");
        fd.append("title", textForm.title);
        fd.append("body", textForm.body);
        fd.append("notes", textForm.notes);
        fd.append("paymentInfo", textForm.paymentInfo);

        const data = await upload("/api/admin/content", fd);
        const created = data.content || data;
        setContent(created);
        setSuccess("Fee structure text saved.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving fee structure text");
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
      fd.append("type", "feestructure");
      selectedFiles.forEach((file) => {
        fd.append("files", file);
      });

      const data = await upload("/api/admin/content", fd);
      const updated = data.content || data;
      setContent(updated);
      setSelectedFiles([]);
      setSuccess("Fee structure files uploaded successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error uploading fee structure files");
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

  if (loading) {
    return (
      <section>
        <h2>Fee Structure Management</h2>
        <Loader message="Loading fee structure content…" />
      </section>
    );
  }

  return (
    <section>
      <h2>Fee Structure Management</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* ---------- TEXT FIELDS ---------- */}
      <form onSubmit={handleSaveText} style={{ marginBottom: "1.5rem" }}>
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
          <label style={{ display: "block", fontWeight: "bold" }}>
            Intro / main description
          </label>
          <textarea
            name="body"
            value={textForm.body}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Important notes
          </label>
          <textarea
            name="notes"
            value={textForm.notes}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Payment information
          </label>
          <textarea
            name="paymentInfo"
            value={textForm.paymentInfo}
            onChange={handleTextChange}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </div>

        <button type="submit" disabled={savingText}>
          {savingText ? "Saving…" : "Save Fee Structure Text"}
        </button>
      </form>

      {/* ---------- FILE UPLOAD ---------- */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Upload Fee Structure Documents / Media</h3>
        <p style={{ fontSize: "0.85rem" }}>
          Upload PDFs, images or other documents containing detailed fee
          breakdowns, bank details or payment instructions. They will appear on
          the public Fee Structure page.
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
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
        </form>
      </div>

      {/* ---------- MEDIA TITLES / DESCRIPTIONS ---------- */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Uploaded Fee Structure Files</h3>
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
          <button onClick={handleSaveMediaDetails} style={{ marginTop: "0.5rem" }}>
            Save Media Titles &amp; Descriptions
          </button>
        )}
      </div>
    </section>
  );
}
