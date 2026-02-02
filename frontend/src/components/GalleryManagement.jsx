import { useEffect, useMemo, useState } from "react";
import { safePath } from "../utils/paths";
import { get, post, patch, del, upload } from "../utils/api";
import EditableText from "../components/EditableText";
import EditableHeading from "../components/EditableHeading";

export default function GalleryManagement() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({});
  const [preview, setPreview] = useState(null);

  // create new section
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [creating, setCreating] = useState(false);

  const API_ORIGIN = useMemo(() => {
    try {
      if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_ORIGIN) {
        return import.meta.env.VITE_API_ORIGIN;
      }
    } catch {}
    return "http:///localhost:4000";
  }, []);

  function absUrl(u) {
    if (!u) return "";
    if (u.startsWith("http")) return u;
    return `${API_ORIGIN}${u}`;
  }

  function isImage(m) {
    return !!m && m.startsWith("image/");
  }
  function isVideo(m) {
    return !!m && m.startsWith("video/");
  }

  async function loadGallery() {
    try {
      setError("");
      const data = await get("/api/content/gallery");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load gallery items.");
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  async function updateItem(id, fields) {
    try {
      const updated = await patch(`/api/content/gallery/${id}`, fields);
      const next = updated?.updated || updated;
      setItems((prev) =>
        prev.map((it) => (String(it._id || it.id) === String(id) ? next : it))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to save changes.");
    }
  }

  /**
   * NEW: Upload files via /api/files, then PATCH the gallery item
   * with a new attachments array. No more /api/content/gallery/:id/attachments.
   */
  async function uploadAttachments(itemId, fileArray) {
    const files = Array.from(fileArray || []);
    if (files.length === 0) return;

    const section = items.find((it) => String(it._id || it.id) === String(itemId));
    const currentAttachments = section?.attachments || [];

    try {
      setUploading((s) => ({
        ...s,
        [itemId]: { uploading: true, progress: 0, message: "Uploading..." },
      }));

      const form = new FormData();
      files.forEach((file) => form.append("files", file));

      // Use your existing files upload endpoint.
      // Adjust this path if your backend uses a different one (e.g. /api/upload).
      const uploaded = await upload("/api/files", form);

      const uploadedFiles = Array.isArray(uploaded)
        ? uploaded
        : Array.isArray(uploaded?.files)
        ? uploaded.files
        : [];

      const newAttachments = [...currentAttachments, ...uploadedFiles];

      // Save updated attachments on the gallery item
      const updatedItem = await patch(`/api/content/gallery/${itemId}`, {
        attachments: newAttachments,
      });

      const clean = updatedItem?.updated || updatedItem || {
        ...(section || {}),
        attachments: newAttachments,
      };

      setItems((prev) =>
        prev.map((it) => (String(it._id || it.id) === String(itemId) ? clean : it))
      );

      setUploading((s) => ({
        ...s,
        [itemId]: { uploading: false, progress: 100, message: "✅ Upload complete" },
      }));
    } catch (e) {
      console.error(e);
      setUploading((s) => ({
        ...s,
        [itemId]: {
          uploading: false,
          progress: 0,
          message: `❌ Upload failed (${e?.message || "error"})`,
        },
      }));
      alert("Upload failed. Check /api/files route on the backend.");
    }
  }

  async function removeAttachment(itemId, attachmentId) {
    if (!window.confirm("Remove this attachment?")) return;
    try {
      const section = items.find((it) => String(it._id || it.id) === String(itemId));
      const current = section?.attachments || [];
      const nextAttachments = current.filter((a) => String(a._id) !== String(attachmentId));

      const updatedItem = await patch(`/api/content/gallery/${itemId}`, {
        attachments: nextAttachments,
      });

      const clean = updatedItem?.updated || updatedItem || {
        ...(section || {}),
        attachments: nextAttachments,
      };

      setItems((prev) =>
        prev.map((it) => (String(it._id || it.id) === String(itemId) ? clean : it))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to remove attachment.");
    }
  }

  async function deleteItem(itemId) {
    if (!window.confirm("Delete this gallery section and all its media?")) return;
    try {
      await del(`/api/content/gallery/${itemId}`);
      setItems((prev) => prev.filter((it) => String(it._id || it.id) !== String(itemId)));
    } catch (e) {
      console.error(e);
      alert("Failed to delete gallery item.");
    }
  }

  async function createSectionWithMedia() {
    if (!newTitle.trim() && !newBody.trim() && newFiles.length === 0) {
      alert("Add a title/body or select media files.");
      return;
    }

    try {
      setCreating(true);

      // 1) Create section (title + body, no attachments yet)
      const created = await post("/api/content/gallery", {
        title: newTitle.trim(),
        body: newBody.trim(),
      });

      const item = created?.item || created;
      const itemId = item?._id || item?.id;
      if (!itemId) throw new Error("Create gallery item did not return an ID");

      // Optimistically add to list
      setItems((prev) => [item, ...prev]);

      // 2) Upload attachments if any
      if (newFiles.length > 0) {
        await uploadAttachments(itemId, newFiles);
      }

      setNewTitle("");
      setNewBody("");
      setNewFiles([]);
    } catch (e) {
      console.error(e);
      alert(`Failed to create section. ${e?.message || ""}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section style={{ padding: 20 }}>
      <h2>Gallery Management</h2>
      <p style={{ maxWidth: 800, fontSize: 14, color: "#4b5563" }}>
        Create and manage gallery sections. Each section can have a title, description, and multiple media
        attachments (images, videos, PDFs, etc.). Changes here will reflect on the public Gallery page.
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Admin create form */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          maxWidth: 900,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Create New Gallery Section</h3>

        <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
          Section Title
        </label>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="e.g. Sports Day 2025"
          style={{ width: "100%", padding: 6, marginBottom: 8 }}
        />

        <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
          Description / Body
        </label>
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Short description of this event or gallery section."
          rows={3}
          style={{ width: "100%", padding: 6, marginBottom: 8 }}
        />

        <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
          Media files (images, videos, documents)
        </label>
        <input
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={(e) => setNewFiles(Array.from(e.target.files || []))}
        />
        {newFiles.length > 0 && (
          <p style={{ fontSize: 13, marginTop: 6 }}>
            Selected: <b>{newFiles.length}</b> files
          </p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={createSectionWithMedia} disabled={creating}>
            {creating ? "Creating..." : "+ Create Section"}
          </button>
          <button type="button" onClick={loadGallery} disabled={creating}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Existing gallery items */}
      {items.length === 0 && !error && <p>No gallery items found.</p>}

      <div
        style={{
          display: "grid",
          gap: "1.2rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {items.map((item) => {
          const itemId = item._id || item.id;
          const status = uploading[itemId] || { uploading: false, progress: 0, message: "" };

          return (
            <article
              key={itemId}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <EditableHeading
                value={item.title || "Untitled section"}
                onSave={(val) => updateItem(itemId, { title: val })}
                isAdmin={true}
                level={3}
              />

              <EditableText
                value={item.body || ""}
                onSave={(val) => updateItem(itemId, { body: val })}
                isAdmin={true}
              />

              {/* Upload more media to this section */}
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                  Add media to this section
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={(e) => uploadAttachments(itemId, Array.from(e.target.files || []))}
                />
                {status.uploading && (
                  <p style={{ fontSize: 12, marginTop: 4 }}>
                    {status.message} ({status.progress}%)
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div style={{ marginTop: 8 }}>
                {(!item.attachments || item.attachments.length === 0) && (
                  <p style={{ margin: 0, fontSize: 13 }}>No media attachments yet.</p>
                )}

                <div style={{ display: "grid", gap: 8 }}>
                  {item.attachments?.map((att, idx) => {
                    const url = absUrl(att.url);
                    const img = isImage(att.mimetype);
                    const vid = isVideo(att.mimetype);

                    return (
                      <div key={att._id || idx} style={{ position: "relative" }}>
                        {img && (
                          <img
                            src={safePath(url)}
                            alt={att.originalName || "image"}
                            style={{ width: "100%", borderRadius: 6, cursor: "pointer" }}
                            onClick={() => setPreview({ url, name: att.originalName })}
                          />
                        )}

                        {vid && (
                          <video
                            src={safePath(url)}
                            controls
                            style={{ width: "100%", borderRadius: 6 }}
                          />
                        )}

                        {!img && !vid && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 13 }}
                          >
                            {att.originalName || "Download file"}
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => removeAttachment(itemId, att._id)}
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 999,
                            width: 26,
                            height: 26,
                            cursor: "pointer",
                          }}
                          title="Remove this file"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
                <button
                  type="button"
                  onClick={() => deleteItem(itemId)}
                  style={{
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "#fee2e2",
                    color: "#b91c1c",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Delete Section
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Image preview overlay */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ maxWidth: "95%", maxHeight: "95%" }}>
            <img
              src={safePath(preview.url)}
              alt={preview.name || "preview"}
              style={{ width: "100%", height: "auto", borderRadius: 8 }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
