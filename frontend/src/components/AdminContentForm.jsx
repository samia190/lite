import React, { useState, useRef, useEffect } from "react";
import { upload } from "../utils/api";
import AdminButton from "./AdminButton";
 // Make sure you import upload

export default function AdminContentForm({ onSaved }) {
  const [type, setType] = useState("newsletter");
  const [title, setTitle] = useState("Form 4 KCSE Results 2025");
  const [body, setBody] = useState(
    "Our Form 4 candidates achieved a 92% pass rate, with 15 students scoring A or A-. This marks our best performance in the last five years."
  );
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef();

  // Cleanup object URLs when previews change or component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch {}
      });
    };
  }, [previews]);

  const handleFiles = (e) => {
    // Clear old previews URLs
    previews.forEach((p) => {
      try {
        URL.revokeObjectURL(p.url);
      } catch {}
    });

    const list = Array.from(e.target.files || []);
    setFiles(list);
    setPreviews(
      list.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    if (!title.trim() || !type.trim()) {
      setStatus("Type and title are required");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("title", title);
      fd.append("body", body || "");

      files.forEach((file) => fd.append("files", file));

      // <--- Corrected part starts here
      const data = await upload("/api/admin/content", fd);
      // <--- Corrected part ends here

      if (data.ok === false) {
        setStatus(data.error || "Upload failed");
        setLoading(false);
        return;
      }

      setStatus("Saved");

      // Clear previews and files
      previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch {}
      });
      setFiles([]);
      setPreviews([]);
      if (fileRef.current) fileRef.current.value = null;
      setTitle("");
      setBody("");

      if (onSaved) onSaved(data);
    } catch (err) {
      setStatus(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
      <div>
        <label htmlFor="type">Content Type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="newsletter">Newsletter</option>
          <option value="gallery">Gallery</option>
          <option value="admission">Admission</option>
          <option value="performance">Performance</option>
          <option value="policy">Policy</option>
        </select>
      </div>

      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Form 4 KCSE Results 2025"
          required
        />
      </div>

      <div>
        <label htmlFor="body">Content Body</label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a short summary or description..."
          rows={5}
        />
      </div>

      <div>
        <label htmlFor="files">Upload Files (PNG, JPG, MP4)</label>
        <input
          ref={fileRef}
          id="files"
          type="file"
          name="files"
          accept="image/png,image/jpeg,video/mp4,video/webm"
          multiple
          onChange={handleFiles}
        />
      </div>

      {previews.length > 0 && (
        <div
          style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}
        >
          {previews.map((f, i) =>
            f.type.startsWith("image/") ? (
              <img
                key={i}
                src={f.url}
                alt={f.name}
                style={{ width: 120, height: 80, objectFit: "cover" }}
              />
            ) : (
              <video
                key={i}
                src={f.url}
                controls
                style={{ width: 160, height: 90 }}
              />
            )
          )}
        </div>
      )}

      {status && (
        <div style={{ marginTop: 8, color: status === "Saved" ? "green" : "red" }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <AdminButton type="submit" disabled={loading} variant="primary">
          {loading ? "Uploading..." : "Add Content"}
        </AdminButton>
      </div>
    </form>
  );
}
