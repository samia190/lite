import React, { useState, useEffect } from "react";
import { get } from "../utils/api";

export default function MagazineManagement({ user }) {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  
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

  function handlePdfFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError("Please select a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError("PDF file size must be less than 50MB");
        return;
      }
      setSelectedPdfFile(file);
      setError("");
    }
  }

  function handleCoverFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image file size must be less than 5MB");
        return;
      }
      setSelectedCoverFile(file);
      setError("");
    }
  }

  async function uploadFile(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    console.log(`Uploading ${type}:`, file.name, `Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    const token = localStorage.getItem("token");
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const uploadUrl = `${apiUrl}/api/files/upload`;
    
    console.log('Upload URL:', uploadUrl);

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Failed to upload ${type}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload success:', data);
      
      return data.url || data.path;
    } catch (err) {
      console.error(`Upload ${type} error:`, err);
      throw err;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!selectedPdfFile && !formData.pdfUrl) {
      setError("Please select a PDF file");
      return;
    }

    try {
      setSaving(true);
      setUploading(true);
      setError("");
      setSuccess("");

      let pdfUrl = formData.pdfUrl;
      let coverUrl = formData.coverImage;

      // Upload PDF if new file selected
      if (selectedPdfFile) {
        console.log('Starting PDF upload...');
        pdfUrl = await uploadFile(selectedPdfFile, 'pdf');
        console.log('PDF uploaded successfully:', pdfUrl);
      }

      // Upload cover image if new file selected
      if (selectedCoverFile) {
        console.log('Starting cover image upload...');
        coverUrl = await uploadFile(selectedCoverFile, 'image');
        console.log('Cover image uploaded successfully:', coverUrl);
      }

      setUploading(false);

      console.log('Submitting magazine data...');
      
      // Submit magazine data
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/school-magazine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...formData,
          pdfUrl,
          coverImage: coverUrl
        })
      });

      console.log('Magazine save response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Magazine save error:', errorText);
        throw new Error("Failed to save magazine");
      }

      const result = await response.json();
      console.log('Magazine saved successfully:', result);
      
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
      setSelectedPdfFile(null);
      setSelectedCoverFile(null);

      // Refresh list
      fetchMagazines();
      setSaving(false);
    } catch (err) {
      console.error("Error saving magazine:", err);
      setError(`Failed to save magazine: ${err.message}`);
      setSaving(false);
      setUploading(false);
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
    setSelectedPdfFile(null);
    setSelectedCoverFile(null);
    setError("");
    setSuccess("");
  }

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
              Magazine PDF File * <span style={{ color: '#666', fontWeight: 'normal', fontSize: 14 }}>(Max 50MB)</span>
            </label>
            
            {selectedPdfFile || formData.pdfUrl ? (
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
                    <div style={{ fontWeight: "bold", color: "#2e7d32" }}>
                      {selectedPdfFile ? selectedPdfFile.name : "PDF Selected"}
                    </div>
                    {selectedPdfFile && (
                      <small style={{ color: "#555" }}>
                        {(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    )}
                    {formData.pdfUrl && !selectedPdfFile && (
                      <small style={{ color: "#555", wordBreak: "break-all" }}>{formData.pdfUrl}</small>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPdfFile(null);
                    setFormData({ ...formData, pdfUrl: "" });
                  }}
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
              <div>
                <input
                  type="file"
                  id="pdfFileInput"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="pdfFileInput"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "20px",
                    background: "#fff",
                    border: "2px dashed #481010ff",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 16,
                    color: "#481010ff",
                    fontWeight: "bold",
                    textAlign: "center",
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
                  📁 Click to Select PDF from Your Computer
                  <div style={{ fontSize: 14, fontWeight: 'normal', marginTop: 8, color: '#666' }}>
                    Or drag and drop PDF file here
                  </div>
                </label>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Cover Image (Optional) <span style={{ color: '#666', fontWeight: 'normal', fontSize: 14 }}>(Max 5MB)</span>
            </label>
            
            {selectedCoverFile || formData.coverImage ? (
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
                  {selectedCoverFile ? (
                    <img
                      src={URL.createObjectURL(selectedCoverFile)}
                      alt="Cover preview"
                      style={{
                        width: 60,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #ddd"
                      }}
                    />
                  ) : formData.coverImage ? (
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
                  ) : null}
                  <div>
                    <div style={{ fontWeight: "bold", color: "#2e7d32" }}>
                      {selectedCoverFile ? selectedCoverFile.name : "Cover Image Selected"}
                    </div>
                    {selectedCoverFile && (
                      <small style={{ color: "#555" }}>
                        {(selectedCoverFile.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCoverFile(null);
                    setFormData({ ...formData, coverImage: "" });
                  }}
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
              <div>
                <input
                  type="file"
                  id="coverFileInput"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="coverFileInput"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "20px",
                    background: "#fff",
                    border: "2px dashed #666",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 16,
                    color: "#666",
                    fontWeight: "bold",
                    textAlign: "center",
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
                  🖼️ Click to Select Cover Image from Your Computer
                  <div style={{ fontSize: 14, fontWeight: 'normal', marginTop: 8, color: '#666' }}>
                    Or drag and drop image here
                  </div>
                </label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                padding: "10px 24px",
                background: saving ? "#ccc" : "#481010ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: "bold",
                cursor: (saving || uploading) ? "not-allowed" : "pointer",
                opacity: (saving || uploading) ? 0.7 : 1
              }}
            >
              {uploading ? "Uploading files..." : saving ? "Saving..." : (formData._id ? "Update Magazine" : "Create Magazine")}
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
