import React, { useEffect, useState } from "react";
import { get, put, upload, del } from "../utils/api";

/**
 * SubpageManagement - Universal management component for all subpages
 * Handles: text content, tables, staff lists, images, files
 */
export default function SubpageManagement({ 
  pageType,           // e.g., "curriculum/overview", "staff/leadership"
  pageTitle,          // Display title for the management section
  contentTypes = []   // Array of content types: "text", "table", "staffList", "images", "files"
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [textForm, setTextForm] = useState({ title: "", body: "", intro: "" });
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [newStaffMember, setNewStaffMember] = useState({ name: "", role: "", bio: "", image: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch content on mount
  useEffect(() => {
    fetchContent();
  }, [pageType]);

  async function fetchContent() {
    setLoading(true);
    setError("");
    try {
      const data = await get(`/api/content/${pageType.replace("/", "-")}`);
      setContent(data || {});
      
      // Initialize form states from fetched content
      setTextForm({
        title: data?.title || "",
        body: data?.body || "",
        intro: data?.intro || "",
      });
      
      // Initialize table data
      if (data?.data?.table) {
        setTableData(data.data.table.rows || []);
        setTableColumns(data.data.table.columns || []);
      }
      
      // Initialize staff list
      if (data?.data?.staff) {
        setStaffList(data.data.staff || []);
      }
      
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }

  // ========== TEXT CONTENT ==========
  async function handleSaveText() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("type", pageType.replace("/", "-"));
      fd.append("title", textForm.title);
      fd.append("body", textForm.body);
      fd.append("intro", textForm.intro);

      await upload("/api/admin/content", fd);
      setSuccess("Text content saved successfully!");
      await fetchContent();
    } catch (err) {
      setError(err.message || "Failed to save text content");
    } finally {
      setSaving(false);
    }
  }

  // ========== TABLE MANAGEMENT ==========
  function addTableColumn() {
    const colName = prompt("Enter column name:");
    if (colName && colName.trim()) {
      setTableColumns([...tableColumns, colName.trim()]);
    }
  }

  function removeTableColumn(index) {
    if (!window.confirm("Remove this column?")) return;
    const newCols = tableColumns.filter((_, i) => i !== index);
    setTableColumns(newCols);
    // Also remove this column from all rows
    setTableData(tableData.map(row => {
      const newRow = { ...row };
      delete newRow[tableColumns[index]];
      return newRow;
    }));
  }

  function addTableRow() {
    const newRow = {};
    tableColumns.forEach(col => { newRow[col] = ""; });
    newRow.id = Date.now().toString();
    setTableData([...tableData, newRow]);
  }

  function updateTableCell(rowIndex, column, value) {
    const updated = [...tableData];
    updated[rowIndex] = { ...updated[rowIndex], [column]: value };
    setTableData(updated);
  }

  function removeTableRow(index) {
    if (!window.confirm("Remove this row?")) return;
    setTableData(tableData.filter((_, i) => i !== index));
  }

  async function saveTableData() {
    if (!content?._id) {
      setError("Please save text content first to create the page.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await put(`/api/content/${content._id}`, {
        data: {
          ...(content.data || {}),
          table: {
            columns: tableColumns,
            rows: tableData,
          },
        },
      });
      setSuccess("Table saved successfully!");
      await fetchContent();
    } catch (err) {
      setError(err.message || "Failed to save table");
    } finally {
      setSaving(false);
    }
  }

  // ========== STAFF LIST MANAGEMENT ==========
  function handleStaffInputChange(field, value) {
    setNewStaffMember(prev => ({ ...prev, [field]: value }));
  }

  function addStaffMember() {
    if (!newStaffMember.name.trim()) {
      setError("Staff name is required");
      return;
    }
    const member = {
      id: Date.now().toString(),
      ...newStaffMember,
      createdAt: new Date().toISOString(),
    };
    setStaffList([...staffList, member]);
    setNewStaffMember({ name: "", role: "", bio: "", image: "" });
  }

  function updateStaffMember(index, field, value) {
    const updated = [...staffList];
    updated[index] = { ...updated[index], [field]: value };
    setStaffList(updated);
  }

  function removeStaffMember(index) {
    if (!window.confirm("Remove this staff member?")) return;
    setStaffList(staffList.filter((_, i) => i !== index));
  }

  async function saveStaffList() {
    if (!content?._id) {
      setError("Please save text content first to create the page.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await put(`/api/content/${content._id}`, {
        data: {
          ...(content.data || {}),
          staff: staffList,
        },
      });
      setSuccess("Staff list saved successfully!");
      await fetchContent();
    } catch (err) {
      setError(err.message || "Failed to save staff list");
    } finally {
      setSaving(false);
    }
  }

  // ========== FILE/IMAGE UPLOADS ==========
  function handleFileSelect(e) {
    setSelectedFiles(Array.from(e.target.files || []));
  }

  async function handleUploadFiles() {
    if (!selectedFiles.length) {
      setError("Please select files to upload");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("type", pageType.replace("/", "-"));
      selectedFiles.forEach(file => fd.append("files", file));

      await upload("/api/admin/content", fd);
      setSuccess("Files uploaded successfully!");
      setSelectedFiles([]);
      await fetchContent();
    } catch (err) {
      setError(err.message || "Failed to upload files");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAttachment(attachmentId) {
    if (!content?._id) return;
    if (!window.confirm("Delete this file permanently?")) return;
    
    try {
      await del(`/api/admin/content/${content._id}/media/${encodeURIComponent(attachmentId)}`);
      setSuccess("File deleted successfully!");
      await fetchContent();
    } catch (err) {
      setError(err.message || "Failed to delete file");
    }
  }

  // ========== RENDER ==========
  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>📄 {pageTitle}</h2>
        <p style={styles.loading}>Loading...</p>
      </div>
    );
  }

  const attachments = content?.attachments || [];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📄 {pageTitle}</h2>
      <p style={styles.subtitle}>Manage content for <code>{pageType}</code></p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* TEXT CONTENT SECTION */}
      {(contentTypes.includes("text") || contentTypes.length === 0) && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📝 Text Content</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Page Title</label>
              <input
                type="text"
                value={textForm.title}
                onChange={(e) => setTextForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter page title..."
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Introduction</label>
              <textarea
                value={textForm.intro}
                onChange={(e) => setTextForm(prev => ({ ...prev, intro: e.target.value }))}
                placeholder="Brief introduction..."
                rows={2}
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Main Content</label>
              <textarea
                value={textForm.body}
                onChange={(e) => setTextForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Main page content..."
                rows={6}
                style={styles.textarea}
              />
            </div>
          </div>
          <button onClick={handleSaveText} disabled={saving} style={styles.saveBtn}>
            {saving ? "Saving..." : "💾 Save Text Content"}
          </button>
        </section>
      )}

      {/* TABLE SECTION */}
      {contentTypes.includes("table") && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Table Data</h3>
          
          {/* Column Management */}
          <div style={styles.tableControls}>
            <button onClick={addTableColumn} style={styles.addBtn}>+ Add Column</button>
            <div style={styles.columnTags}>
              {tableColumns.map((col, idx) => (
                <span key={idx} style={styles.columnTag}>
                  {col}
                  <button 
                    onClick={() => removeTableColumn(idx)} 
                    style={styles.removeTagBtn}
                    title="Remove column"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Table Editor */}
          {tableColumns.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {tableColumns.map((col, idx) => (
                      <th key={idx} style={styles.th}>{col}</th>
                    ))}
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, rowIdx) => (
                    <tr key={row.id || rowIdx}>
                      {tableColumns.map((col, colIdx) => (
                        <td key={colIdx} style={styles.td}>
                          <input
                            type="text"
                            value={row[col] || ""}
                            onChange={(e) => updateTableCell(rowIdx, col, e.target.value)}
                            style={styles.tableInput}
                          />
                        </td>
                      ))}
                      <td style={styles.td}>
                        <button 
                          onClick={() => removeTableRow(rowIdx)} 
                          style={styles.deleteBtn}
                        >🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addTableRow} style={styles.addRowBtn}>+ Add Row</button>
            </div>
          )}

          <button onClick={saveTableData} disabled={saving} style={styles.saveBtn}>
            {saving ? "Saving..." : "💾 Save Table"}
          </button>
        </section>
      )}

      {/* STAFF LIST SECTION */}
      {contentTypes.includes("staffList") && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>👥 Staff Members</h3>
          
          {/* Add Staff Form */}
          <div style={styles.staffForm}>
            <input
              type="text"
              placeholder="Name *"
              value={newStaffMember.name}
              onChange={(e) => handleStaffInputChange("name", e.target.value)}
              style={styles.staffInput}
            />
            <input
              type="text"
              placeholder="Role / Title"
              value={newStaffMember.role}
              onChange={(e) => handleStaffInputChange("role", e.target.value)}
              style={styles.staffInput}
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={newStaffMember.image}
              onChange={(e) => handleStaffInputChange("image", e.target.value)}
              style={styles.staffInput}
            />
            <textarea
              placeholder="Bio / Description"
              value={newStaffMember.bio}
              onChange={(e) => handleStaffInputChange("bio", e.target.value)}
              rows={2}
              style={styles.staffTextarea}
            />
            <button onClick={addStaffMember} style={styles.addBtn}>+ Add Staff Member</button>
          </div>

          {/* Staff List */}
          <div style={styles.staffGrid}>
            {staffList.map((member, idx) => (
              <div key={member.id || idx} style={styles.staffCard}>
                {member.image && (
                  <img src={member.image} alt={member.name} style={styles.staffImage} />
                )}
                <div style={styles.staffInfo}>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateStaffMember(idx, "name", e.target.value)}
                    style={styles.staffEditInput}
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={member.role || ""}
                    onChange={(e) => updateStaffMember(idx, "role", e.target.value)}
                    style={styles.staffEditInput}
                    placeholder="Role"
                  />
                  <textarea
                    value={member.bio || ""}
                    onChange={(e) => updateStaffMember(idx, "bio", e.target.value)}
                    style={styles.staffEditTextarea}
                    placeholder="Bio"
                    rows={2}
                  />
                  <button 
                    onClick={() => removeStaffMember(idx)} 
                    style={styles.removeStaffBtn}
                  >🗑️ Remove</button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={saveStaffList} disabled={saving} style={styles.saveBtn}>
            {saving ? "Saving..." : "💾 Save Staff List"}
          </button>
        </section>
      )}

      {/* FILES/IMAGES SECTION */}
      {(contentTypes.includes("images") || contentTypes.includes("files")) && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📁 Files & Media</h3>
          
          {/* Upload */}
          <div style={styles.uploadArea}>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            <button 
              onClick={handleUploadFiles} 
              disabled={saving || !selectedFiles.length} 
              style={styles.uploadBtn}
            >
              {saving ? "Uploading..." : `📤 Upload ${selectedFiles.length} file(s)`}
            </button>
          </div>

          {/* Existing Attachments */}
          <div style={styles.attachmentsGrid}>
            {attachments.map((file, idx) => {
              const isImage = file.mimetype?.startsWith("image/");
              const href = file.downloadUrl || file.url;
              const id = file._id || file.id || file.url || file.originalName;
              
              return (
                <div key={idx} style={styles.attachmentCard}>
                  {isImage && href ? (
                    <img src={href} alt={file.title || file.originalName} style={styles.attachmentImage} />
                  ) : (
                    <div style={styles.attachmentIcon}>📄</div>
                  )}
                  <p style={styles.attachmentName}>{file.title || file.originalName || "Unnamed"}</p>
                  <div style={styles.attachmentActions}>
                    {href && (
                      <a href={href} target="_blank" rel="noreferrer" style={styles.viewLink}>View</a>
                    )}
                    <button 
                      onClick={() => deleteAttachment(id)} 
                      style={styles.deleteAttachBtn}
                    >🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    padding: "24px",
    maxWidth: "100%",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginBottom: "24px",
  },
  loading: {
    color: "#64748b",
    fontStyle: "italic",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight: "500",
  },
  success: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight: "500",
  },
  section: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "2px solid #e2e8f0",
  },
  formGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    resize: "vertical",
    fontFamily: "inherit",
  },
  saveBtn: {
    marginTop: "16px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  addBtn: {
    padding: "10px 16px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  // Table styles
  tableControls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  columnTags: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  columnTag: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  removeTagBtn: {
    background: "transparent",
    border: "none",
    color: "#0369a1",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    padding: "0 2px",
  },
  tableWrapper: {
    overflowX: "auto",
    marginBottom: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "12px",
  },
  th: {
    background: "#f1f5f9",
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "#334155",
    borderBottom: "2px solid #e2e8f0",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #e2e8f0",
  },
  tableInput: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    fontSize: "0.85rem",
  },
  addRowBtn: {
    padding: "8px 14px",
    background: "#f1f5f9",
    border: "1px dashed #94a3b8",
    borderRadius: "6px",
    color: "#475569",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  deleteBtn: {
    background: "#fee2e2",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  // Staff styles
  staffForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  staffInput: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
  },
  staffTextarea: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    gridColumn: "span 2",
  },
  staffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  staffCard: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #e2e8f0",
  },
  staffImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "12px",
  },
  staffInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  staffEditInput: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "0.85rem",
  },
  staffEditTextarea: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "0.85rem",
    resize: "none",
  },
  removeStaffBtn: {
    marginTop: "8px",
    padding: "6px 12px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  // File upload styles
  uploadArea: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "2px dashed #cbd5e1",
  },
  fileInput: {
    flex: "1",
  },
  uploadBtn: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
  attachmentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
  },
  attachmentCard: {
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "12px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  attachmentImage: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  attachmentIcon: {
    fontSize: "2.5rem",
    marginBottom: "8px",
  },
  attachmentName: {
    fontSize: "0.8rem",
    color: "#475569",
    marginBottom: "8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  attachmentActions: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
  },
  viewLink: {
    fontSize: "0.8rem",
    color: "#2563eb",
    textDecoration: "none",
  },
  deleteAttachBtn: {
    background: "#fee2e2",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};
