import React, { useCallback, useState } from "react";
import { upload } from "../utils/api";

export default function DragDropUpload({ onUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    setFiles((prev) => [...prev, ...list].slice(0, 8));
  }, []);

  const onSelect = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list].slice(0, 8));
  };

  const removeAt = (idx) => setFiles((s) => s.filter((_, i) => i !== idx));

  const uploadAll = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        try {
          const data = await upload("/api/files/upload", fd);
          onUploaded && onUploaded(data);
        } catch (e) {
          console.error("Upload failed for file", f.name, e);
        }
      }
      setFiles([]);
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`drag-drop`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
          <span className="material-icon">cloud_upload</span>
          <div>
            <div style={{ fontWeight: 600 }}>Drag & drop files here</div>
            <div className="muted upload-hint" style={{ fontSize: 13 }}>or <label style={{ color: 'var(--accent)', cursor: 'pointer' }}><input onChange={onSelect} type="file" style={{ display: 'none' }} multiple /> browse</label> to choose</div>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="preview-grid">
            {files.map((f, i) => (
              <div key={i} className="preview">
                {f.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(f)} alt={f.name} />
                ) : (
                  <div style={{ padding: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{f.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{Math.round(f.size / 1024)} KB</div>
                  </div>
                )}
                <div className="remove" onClick={() => removeAt(i)}>×</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="menu-item" onClick={uploadAll} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button className="menu-item" onClick={() => setFiles([])} disabled={uploading}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
