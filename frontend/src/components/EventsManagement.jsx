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

export default function EventsManagement() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Intro form
  const [textForm, setTextForm] = useState({ title: "", body: "" });
  const [savingText, setSavingText] = useState(false);

  // Upload files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Attachments
  const attachments = content?.attachments || [];

  // Events list
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    color: COLOR_OPTIONS[0].value,
    linkUrl: "",
  });
  const [savingEvents, setSavingEvents] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/api/content/events");
      const safe = data || {};
      setContent(safe);
      setTextForm({
        title: safe.title || "School Events",
        body:
          safe.body ||
          safe.intro ||
          "Manage upcoming and past events, activities, and key dates.",
      });
      const existingEvents =
        (safe.data && Array.isArray(safe.data.events) && safe.data.events) || [];
      setEvents(existingEvents);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading events content");
      setLoading(false);
    }
  }

  // -------- Intro text --------
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
      fd.append("type", "events");

      if (textForm.title && textForm.title.trim().length > 0) {
        fd.append("title", textForm.title);
      }
      if (textForm.body && textForm.body.trim().length > 0) {
        fd.append("body", textForm.body);
      }

      await upload("/api/admin/content", fd);
      setSuccess("Events intro text saved.");
      await fetchContent();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving intro text");
    } finally {
      setSavingText(false);
    }
  }

  // -------- File uploads --------
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
      fd.append("type", "events");
      selectedFiles.forEach((file) => {
        fd.append("files", file);
      });

      await upload("/api/admin/content", fd);
      setSuccess("Event files uploaded successfully.");
      setSelectedFiles([]);
      await fetchContent();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error uploading files");
    } finally {
      setUploading(false);
    }
  }

  // -------- Media meta (title / description for each attachment) --------
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
  if (!content?._id) {
    setError("Cannot delete media: please save/upload at least one file first.");
    return;
  }

  if (!window.confirm("Delete this file permanently?")) return;

  try {
    await del(`/api/admin/content/${content._id}/media/${encodeURIComponent(mediaId)}`);
    setSuccess("Media deleted.");
    await fetchContent();
  } catch (err) {
    setError(err.message || "Failed to delete media");
  }
}

async function handleReplaceMedia(mediaId, newFile) {
  if (!content?._id) {
    setError("Cannot replace media: please save/upload at least one file first.");
    return;
  }

  const fd = new FormData();
  fd.append("file", newFile);

  try {
    await upload(
      `/api/admin/content/${content._id}/media/${encodeURIComponent(mediaId)}`,
      fd,
      {},
      { method: "PUT" }
    );
    setSuccess("Media replaced.");
    await fetchContent();
  } catch (err) {
    setError(err.message || "Failed to replace media");
  }
}


  // -------- Events list --------
  function handleEventFormChange(e) {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    if (!content?._id) {
      setError(
        "Please save the events intro text or upload a file once before adding events."
      );
      return;
    }
    if (!eventForm.title.trim() && !eventForm.description.trim()) {
      setError("Please provide at least a title or description for the event.");
      return;
    }

    setSavingEvents(true);
    setError("");
    setSuccess("");

    try {
      const newEvent = {
        id: Date.now().toString(),
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date || null,
        location: eventForm.location || "",
        color: eventForm.color || COLOR_OPTIONS[0].value,
        linkUrl: eventForm.linkUrl || "",
        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [newEvent, ...(events || [])];

      const updated = await put(`/api/content/${content._id}`, {
        data: {
          ...(content.data || {}),
          events: updatedEvents,
        },
      });
      if (!updated) throw new Error("Failed to save events");
      setContent(updated);
      const freshEvents =
        (updated.data && Array.isArray(updated.data.events) && updated.data.events) ||
        [];
      setEvents(freshEvents);
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        color: eventForm.color,
        linkUrl: "",
      });
      setSuccess("Event added.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error adding event");
    } finally {
      setSavingEvents(false);
    }
  }

  function handleEventChange(index, field, value) {
    setEvents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  async function handleSaveAllEvents() {
    if (!content?._id) {
      setError("Cannot save events: missing content ID.");
      return;
    }
    setSavingEvents(true);
    setError("");
    setSuccess("");

    try {
      const updated = await put(`/api/content/${content._id}`, {
        data: {
          ...(content.data || {}),
          events,
        },
      });
      if (!updated) throw new Error("Failed to save events");
      setContent(updated);
      const freshEvents =
        (updated.data && Array.isArray(updated.data.events) && updated.data.events) ||
        [];
      setEvents(freshEvents);
      setSuccess("All events saved.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving events");
    } finally {
      setSavingEvents(false);
    }
  }

  function handleDeleteEvent(index) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <section>
        <h2>Events Management</h2>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Events Management</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Intro text */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Events Intro Text</h3>
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

      {/* Upload media */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Upload Event Media</h3>
        <p style={{ fontSize: "0.85rem" }}>
          Upload images, videos, PDFs, or other files linked to events.
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

      {/* Media titles/descriptions - HORIZONTAL GRID LAYOUT */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>📁 Media Files ({attachments.length})</h3>
        {attachments.length === 0 && (
          <div style={{ 
            padding: "2rem", 
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", 
            borderRadius: "12px", 
            textAlign: "center",
            border: "2px dashed #cbd5e1"
          }}>
            <p style={{ color: "#64748b", margin: 0 }}>No media uploaded yet. Upload files above to get started.</p>
          </div>
        )}

        {/* HORIZONTAL GRID - 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}>
          {attachments.map((file, idx) => {
            const isVideo = file.mimetype?.startsWith("video/");
            const isImage = file.mimetype?.startsWith("image/");
            const href = fileHref(file);
            
            return (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Media Preview */}
                <div style={{ 
                  height: "140px", 
                  background: "linear-gradient(135deg, #1e293b, #334155)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {isImage && href && (
                    <img 
                      src={href} 
                      alt={file.title || file.originalName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {isVideo && (
                    <div style={{ textAlign: "center", color: "#fff" }}>
                      <span style={{ fontSize: "2.5rem" }}>🎬</span>
                      <p style={{ margin: "4px 0 0", fontSize: "0.75rem", opacity: 0.8 }}>Video</p>
                    </div>
                  )}
                  {!isImage && !isVideo && (
                    <div style={{ textAlign: "center", color: "#fff" }}>
                      <span style={{ fontSize: "2.5rem" }}>📄</span>
                      <p style={{ margin: "4px 0 0", fontSize: "0.75rem", opacity: 0.8 }}>Document</p>
                    </div>
                  )}
                  {/* File type badge */}
                  <span style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "600"
                  }}>
                    {file.mimetype?.split("/")[1]?.toUpperCase() || "FILE"}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: "1rem" }}>
                  {/* File info */}
                  <p style={{ 
                    fontSize: "0.75rem", 
                    color: "#64748b", 
                    margin: "0 0 0.75rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {file.originalName || file.name || "(unnamed)"} · {file.size ? `${(file.size / 1024).toFixed(0)} KB` : ""}
                  </p>

                  {/* Title input */}
                  <div style={{ marginBottom: "0.5rem" }}>
                    <input
                      type="text"
                      value={file.title || ""}
                      onChange={(e) => handleMediaMetaChange(idx, "title", e.target.value)}
                      placeholder="Enter title..."
                      style={{ 
                        width: "100%", 
                        padding: "8px 10px", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* Description input */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <textarea
                      value={file.description || ""}
                      onChange={(e) => handleMediaMetaChange(idx, "description", e.target.value)}
                      rows={2}
                      placeholder="Add description..."
                      style={{ 
                        width: "100%", 
                        padding: "8px 10px", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        resize: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* Open file link */}
                  {href && (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ 
                        fontSize: "0.8rem", 
                        color: "#2563eb",
                        textDecoration: "none",
                        display: "inline-block",
                        marginBottom: "0.75rem"
                      }}
                    >
                      🔗 Open file
                    </a>
                  )}

                  {/* ACTION BUTTONS - DELETE AND REPLACE */}
                  <div style={{ 
                    display: "flex", 
                    gap: "0.5rem", 
                    paddingTop: "0.75rem", 
                    borderTop: "1px solid #f1f5f9"
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        const id = file._id || file.id || file.url || file.downloadUrl || file.originalName || file.name;
                        handleDeleteMedia(id);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      🗑️ Delete
                    </button>

                    <label
                      style={{
                        flex: 1,
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        textAlign: "center"
                      }}
                    >
                      🔄 Replace
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          const id = file._id || file.id || file.url || file.downloadUrl || file.originalName || file.name;
                          if (e.target.files && e.target.files[0]) {
                            handleReplaceMedia(id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {attachments.length > 0 && (
          <button 
            onClick={handleSaveMediaDetails} 
            style={{ 
              marginTop: "1.5rem",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            💾 Save All Media Details
          </button>
        )}
      </div>

      {/* Events list */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Events List</h3>
        <form onSubmit={handleAddEvent} style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Event title</label>
            <input
              type="text"
              name="title"
              value={eventForm.title}
              onChange={handleEventFormChange}
              style={{ width: "100%", padding: "6px" }}
              placeholder="e.g. 'Prize Giving Day'"
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Description / details
            </label>
            <textarea
              name="description"
              value={eventForm.description}
              onChange={handleEventFormChange}
              rows={3}
              style={{ width: "100%", padding: "6px" }}
              placeholder="Details about this event..."
            />
          </div>
          <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Date</label>
              <input
                type="date"
                name="date"
                value={eventForm.date}
                onChange={handleEventFormChange}
                style={{ width: "100%", padding: "4px" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Location</label>
              <input
                type="text"
                name="location"
                value={eventForm.location}
                onChange={handleEventFormChange}
                style={{ width: "100%", padding: "4px" }}
                placeholder="e.g. School Hall"
              />
            </div>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Container colour
            </label>
            <select
              name="color"
              value={eventForm.color}
              onChange={handleEventFormChange}
              style={{ padding: "4px" }}
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Optional link (more details)
            </label>
            <input
              type="text"
              name="linkUrl"
              value={eventForm.linkUrl}
              onChange={handleEventFormChange}
              style={{ width: "100%", padding: "4px" }}
              placeholder="https://..."
            />
          </div>
          <button type="submit" disabled={savingEvents}>
            {savingEvents ? "Adding..." : "Add Event"}
          </button>
        </form>

        {events.length === 0 && <p>No events added yet.</p>}

        {events.length > 0 && (
          <div>
            {events.map((ev, index) => (
              <div
                key={ev.id || ev._id || index}
                style={{
                  marginBottom: "0.75rem",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  backgroundColor: ev.color || "#f3f4f6",
                }}
              >
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Event title
                  </label>
                  <input
                    type="text"
                    value={ev.title || ""}
                    onChange={(e) => handleEventChange(index, "title", e.target.value)}
                    style={{ width: "100%", padding: "4px" }}
                  />
                </div>
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Description / details
                  </label>
                  <textarea
                    value={ev.description || ""}
                    onChange={(e) =>
                      handleEventChange(index, "description", e.target.value)
                    }
                    rows={3}
                    style={{ width: "100%", padding: "4px" }}
                  />
                </div>
                <div
                  style={{
                    marginBottom: "0.25rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={ev.date ? ev.date.substring(0, 10) : ""}
                      onChange={(e) =>
                        handleEventChange(index, "date", e.target.value)
                      }
                      style={{ width: "100%", padding: "4px" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={ev.location || ""}
                      onChange={(e) =>
                        handleEventChange(index, "location", e.target.value)
                      }
                      style={{ width: "100%", padding: "4px" }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Container colour
                  </label>
                  <select
                    value={ev.color || COLOR_OPTIONS[0].value}
                    onChange={(e) =>
                      handleEventChange(index, "color", e.target.value)
                    }
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "0.25rem" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Optional link (more details)
                  </label>
                  <input
                    type="text"
                    value={ev.linkUrl || ""}
                    onChange={(e) =>
                      handleEventChange(index, "linkUrl", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px" }}
                    placeholder="https://..."
                  />
                </div>
                {ev.createdAt && (
                  <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                    Created:{" "}
                    {new Date(ev.createdAt).toLocaleString(undefined, {
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
                  onClick={() => handleDeleteEvent(index)}
                  style={{
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fecaca",
                    padding: "2px 6px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Delete event
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleSaveAllEvents}
              disabled={savingEvents}
              style={{ marginTop: "0.5rem" }}
            >
              {savingEvents ? "Saving..." : "Save All Events"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
