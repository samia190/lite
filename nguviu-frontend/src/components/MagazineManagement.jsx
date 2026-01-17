import React, { useState, useEffect } from "react";
import { get } from "../utils/api";

export default function MagazineManagement({ user }) {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableFiles, setAvailableFiles] = useState([]);
  const [showPdfPicker, setShowPdfPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    _id: "",
    title: "School Magazine",
    issue: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    pdfUrl: "",
    coverImage: ""
  });

  useEffect(() => {
    fetchMagazines();
    fetchFiles();
  }, []);

  async function fetchMagazines() {
    try {
      setLoading(true);
      setError("");
      const data = await get("/api/school-magazine/all");
      setMagazines(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load magazines:", err);
      setError("Failed to load magazines");
      setLoading(false);
    }
  }

  async function fetchFiles() {
    try {
      const data = await get("/api/files");
      if (Array.isArray(data)) {
        setAvailableFiles(data);
      } else if (Array.isArray(data?.files)) {
        setAvailableFiles(data.files);
      }
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.pdfUrl) {
      setError("PDF URL is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/school-magazine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to save magazine");
      }

      const result = await response.json();
      setSuccess(formData._id ? "Magazine updated successfully!" : "Magazine created successfully!");
      
      // Reset form
      setFormData({
        _id: "",
        title: "School Magazine",
        issue: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        pdfUrl: "",
        coverImage: ""
      });

      // Refresh list
      fetchMagazines();
      setSaving(false);
    } catch (err) {
      console.error("Error saving magazine:", err);
      setError("Failed to save magazine");
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this magazine?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/school-magazine/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete magazine");
      }

      setSuccess("Magazine deleted successfully!");
      fetchMagazines();
    } catch (err) {
      console.error("Error deleting magazine:", err);
      setError("Failed to delete magazine");
    }
  }

  function handleEdit(magazine) {
    setFormData({
      _id: magazine._id,
      title: magazine.title || "School Magazine",
      issue: magazine.issue || "",
      date: magazine.date ? new Date(magazine.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: magazine.description || "",
      pdfUrl: magazine.pdfUrl || "",
      coverImage: magazine.coverImage || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    setFormData({
      _id: "",
      title: "School Magazine",
      issue: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      pdfUrl: "",
      coverImage: ""
    });
    setError("");
    setSuccess("");
    setShowPdfPicker(false);
    setShowCoverPicker(false);
  }

  function selectPdfFile(file) {
    setFormData({ ...formData, pdfUrl: file.downloadUrl || file.url });
    setShowPdfPicker(false);
  }

  function selectCoverFile(file) {
    setFormData({ ...formData, coverImage: file.downloadUrl || file.url });
    setShowCoverPicker(false);
  }

  function getFileExtension(filename) {
    const qIndex = filename.indexOf("?");
    const clean = qIndex === -1 ? filename : filename.slice(0, qIndex);
    const dot = clean.lastIndexOf(".");
    if (dot === -1) return "";
    return clean.slice(dot).toLowerCase();
  }

  function isPdfFile(file) {
    const ext = getFileExtension(file.url || file.downloadUrl || "");
    return ext === ".pdf";
  }

  function isImageFile(file) {
    const ext = getFileExtension(file.url || file.downloadUrl || "");
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
  }

  const pdfFiles = availableFiles.filter(isPdfFile);
  const imageFiles = availableFiles.filter(isImageFile);

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to manage school magazines.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1>📖 School Magazine Management</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Upload and manage school magazine PDFs that appear on the Newsletter page and Footer.
      </p>

      {/* Success/Error Messages */}
      {error && (
        <div style={{
          padding: "1rem",
          background: "#fee",
          border: "1px solid #c00",
          borderRadius: 6,
          color: "#c00",
          marginBottom: "1rem"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: "1rem",
          background: "#efe",
          border: "1px solid #0c0",
          borderRadius: 6,
          color: "#060",
          marginBottom: "1rem"
        }}>
          ✅ {success}
        </div>
      )}

      {/* Upload Form */}
      <div style={{
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1.5rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ marginTop: 0 }}>
          {formData._id ? "Edit Magazine" : "Upload New Magazine"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Issue/Edition (e.g., "Vol 1, Issue 2" or "2026 Edition")
            </label>
            <input
              type="text"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="e.g., January 2026 Edition"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Publication Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this magazine edition..."
              rows={4}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4,
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Magazine PDF File *
            </label>
            
            {formData.pdfUrl ? (
              <div style={{
                padding: "12px",
                background: "#e8f5e9",
                border: "2px solid #4caf50",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#2e7d32" }}>PDF Selected</div>
                    <small style={{ color: "#555", wordBreak: "break-all" }}>{formData.pdfUrl}</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pdfUrl: "" })}
                  style={{
                    padding: "6px 12px",
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPdfPicker(!showPdfPicker)}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#fff",
                  border: "2px dashed #481010ff",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#481010ff",
                  fontWeight: "bold",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff5f5";
                  e.currentTarget.style.borderColor = "#6b1515";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#481010ff";
                }}
              >
                📁 Select PDF from Files
              </button>
            )}

            {showPdfPicker && (
              <div style={{
                marginTop: 12,
                padding: "1rem",
                background: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: 6,
                maxHeight: 300,
                overflowY: "auto"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12
                }}>
                  <strong>Select a PDF file:</strong>
                  <button
                    type="button"
                    onClick={() => setShowPdfPicker(false)}
                    style={{
                      padding: "4px 8px",
                      background: "#666",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Close
                  </button>
                </div>
                
                {pdfFiles.length === 0 ? (
                  <p style={{ color: "#666", fontStyle: "italic" }}>
                    No PDF files found. Please upload a PDF file first using the Files/Media manager.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {pdfFiles.map((file) => (
                      <div
                        key={file._id || file.id}
                        onClick={() => selectPdfFile(file)}
                        style={{
                          padding: "10px",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#e3f2fd";
                          e.currentTarget.style.borderColor = "#2196F3";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.borderColor = "#ddd";
                        }}
                      >
                        <span style={{ fontSize: 20 }}>📄</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", fontSize: 14 }}>
                            {file.originalName || file.name || "Untitled"}
                          </div>
                          <small style={{ color: "#666" }}>
                            {file.url || file.downloadUrl}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Cover Image (Optional)
            </label>
            
            {formData.coverImage ? (
              <div style={{
                padding: "12px",
                background: "#e8f5e9",
                border: "2px solid #4caf50",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    style={{
                      width: 60,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #ddd"
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: "bold", color: "#2e7d32" }}>Cover Image Selected</div>
                    <small style={{ color: "#555", wordBreak: "break-all" }}>{formData.coverImage}</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: "" })}
                  style={{
                    padding: "6px 12px",
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#fff",
                  border: "2px dashed #666",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#666",
                  fontWeight: "bold",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                  e.currentTarget.style.borderColor = "#333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#666";
                }}
              >
                🖼️ Select Cover Image from Files
              </button>
            )}

            {showCoverPicker && (
              <div style={{
                marginTop: 12,
                padding: "1rem",
                background: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: 6,
                maxHeight: 300,
                overflowY: "auto"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12
                }}>
                  <strong>Select a cover image:</strong>
                  <button
                    type="button"
                    onClick={() => setShowCoverPicker(false)}
                    style={{
                      padding: "4px 8px",
                      background: "#666",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Close
                  </button>
                </div>
                
                {imageFiles.length === 0 ? (
                  <p style={{ color: "#666", fontStyle: "italic" }}>
                    No image files found. Please upload an image first using the Files/Media manager.
                  </p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                    {imageFiles.map((file) => (
                      <div
                        key={file._id || file.id}
                        onClick={() => selectCoverFile(file)}
                        style={{
                          cursor: "pointer",
                          border: "2px solid #ddd",
                          borderRadius: 4,
                          overflow: "hidden",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#2196F3";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#ddd";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <img
                          src={file.url || file.downloadUrl}
                          alt={file.originalName || file.name}
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover"
                          }}
                        />
                        <div style={{
                          padding: "4px 6px",
                          background: "#f5f5f5",
                          fontSize: 11,
                          textAlign: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {file.originalName || file.name || "Image"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 24px",
                background: saving ? "#ccc" : "#481010ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: "bold",
                cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              {saving ? "Saving..." : (formData._id ? "Update Magazine" : "Create Magazine")}
            </button>

            {formData._id && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "10px 24px",
                  background: "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Magazine List */}
      <div>
        <h2>Existing Magazines</h2>
        
        {loading ? (
          <p>Loading magazines...</p>
        ) : magazines.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No magazines uploaded yet. Create your first magazine above.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {magazines.map((mag) => (
              <div
                key={mag._id}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: "1rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center"
                }}
              >
                {mag.coverImage && (
                  <img
                    src={mag.coverImage}
                    alt="Cover"
                    style={{
                      width: 80,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #ddd"
                    }}
                  />
                )}
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 4px 0" }}>{mag.title}</h3>
                  {mag.issue && <p style={{ margin: "0 0 4px 0", color: "#666" }}>{mag.issue}</p>}
                  {mag.date && (
                    <p style={{ margin: "0 0 4px 0", fontSize: 14, color: "#888" }}>
                      {new Date(mag.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {mag.description && (
                    <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>
                      {mag.description}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => handleEdit(mag)}
                    style={{
                      padding: "6px 16px",
                      background: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 14
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  <a
                    href={mag.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "6px 16px",
                      background: "#2196F3",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 14,
                      textAlign: "center",
                      textDecoration: "none"
                    }}
                  >
                    👁️ View
                  </a>

                  <button
                    onClick={() => handleDelete(mag._id)}
                    style={{
                      padding: "6px 16px",
                      background: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 14
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
