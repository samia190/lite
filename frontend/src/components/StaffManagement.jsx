import { useEffect, useState } from "react";
import { get, patch, upload } from "../utils/api";

/**
 * StaffManagement - Full CRUD for staff members
 * Stores data in /api/content/staff
 */

const DEFAULTS = {
  title: "Staff Directory",
  intro: "Our dedicated team of educators and administrators are committed to providing quality education.",
  staffList: [],
};

function uid(prefix = "staff") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function StaffManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [content, setContent] = useState(DEFAULTS);

  // New staff form
  const [newStaff, setNewStaff] = useState({
    name: "",
    department: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
    image: "",
    visible: true,
  });

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    try {
      const data = await get("/api/content/staff");
      const merged = {
        ...DEFAULTS,
        ...(data || {}),
        staffList: Array.isArray(data?.staffList) ? data.staffList : 
                   Array.isArray(data?.data?.staffList) ? data.data.staffList : [],
      };
      setContent(merged);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSection(section, value) {
    setSaving(true);
    setSuccess("");
    try {
      await patch(`/api/content/staff/${section}`, { value });
      setContent((prev) => ({ ...prev, [section]: value }));
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error("Save failed:", e);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ===== CRUD Operations =====
  async function addStaff() {
    if (!newStaff.name.trim()) {
      setError("Name is required.");
      return;
    }
    const member = { id: uid(), ...newStaff, createdAt: new Date().toISOString() };
    const next = [...content.staffList, member];
    await saveSection("staffList", next);
    setNewStaff({ name: "", department: "", email: "", phone: "", role: "", bio: "", image: "", visible: true });
  }

  async function updateStaff(id, updates) {
    const next = content.staffList.map((s) => (s.id === id ? { ...s, ...updates } : s));
    await saveSection("staffList", next);
  }

  async function deleteStaff(id) {
    if (!window.confirm("Delete this staff member?")) return;
    const next = content.staffList.filter((s) => s.id !== id);
    await saveSection("staffList", next);
  }

  function startEdit(staff) {
    setEditingId(staff.id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  // Handle image upload
  async function handleImageUpload(e, staffId = null) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("type", "staff-images");
      form.append("files", file);
      const data = await upload("/api/admin/content", form);
      const uploadedUrl = data?.content?.attachments?.[0]?.downloadUrl || data?.content?.attachments?.[0]?.url;
      
      if (uploadedUrl) {
        if (staffId) {
          await updateStaff(staffId, { image: uploadedUrl });
        } else {
          setNewStaff((prev) => ({ ...prev, image: uploadedUrl }));
        }
        setSuccess("Image uploaded!");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. You can paste a URL instead.");
    }
    e.target.value = "";
  }

  return (
    <section style={styles.container}>
      <h2 style={styles.title}>👔 Staff Management</h2>
      <p style={styles.subtitle}>Add, edit, and manage staff members for the school website.</p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      {saving && <p style={styles.saving}>Saving...</p>}

      {loading ? (
        <p>Loading staff data...</p>
      ) : (
        <>
          {/* Page Content Settings */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Page Content</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Page Title</label>
              <input
                value={content.title || ""}
                onChange={(e) => setContent((p) => ({ ...p, title: e.target.value }))}
                onBlur={() => saveSection("title", content.title || "")}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Introduction</label>
              <textarea
                value={content.intro || ""}
                onChange={(e) => setContent((p) => ({ ...p, intro: e.target.value }))}
                onBlur={() => saveSection("intro", content.intro || "")}
                rows={3}
                style={styles.textarea}
              />
            </div>
          </div>

          {/* Add New Staff Form */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>➕ Add New Staff Member</h3>
            <div style={styles.formGrid}>
              <input
                placeholder="Full Name *"
                value={newStaff.name}
                onChange={(e) => setNewStaff((p) => ({ ...p, name: e.target.value }))}
                style={styles.input}
              />
              <input
                placeholder="Role/Position"
                value={newStaff.role}
                onChange={(e) => setNewStaff((p) => ({ ...p, role: e.target.value }))}
                style={styles.input}
              />
              <input
                placeholder="Department"
                value={newStaff.department}
                onChange={(e) => setNewStaff((p) => ({ ...p, department: e.target.value }))}
                style={styles.input}
              />
              <input
                placeholder="Email"
                value={newStaff.email}
                onChange={(e) => setNewStaff((p) => ({ ...p, email: e.target.value }))}
                style={styles.input}
              />
              <input
                placeholder="Phone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff((p) => ({ ...p, phone: e.target.value }))}
                style={styles.input}
              />
              <div style={styles.inputWithUpload}>
                <input
                  placeholder="Image URL"
                  value={newStaff.image}
                  onChange={(e) => setNewStaff((p) => ({ ...p, image: e.target.value }))}
                  style={styles.input}
                />
                <label style={styles.uploadBtn}>
                  📤
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
              </div>
              <textarea
                placeholder="Bio/Description"
                value={newStaff.bio}
                onChange={(e) => setNewStaff((p) => ({ ...p, bio: e.target.value }))}
                rows={2}
                style={{ ...styles.textarea, gridColumn: "span 2" }}
              />
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newStaff.visible}
                  onChange={(e) => setNewStaff((p) => ({ ...p, visible: e.target.checked }))}
                />
                Visible on website
              </label>
            </div>
            <button onClick={addStaff} style={styles.addBtn}>+ Add Staff Member</button>
          </div>

          {/* Staff List */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👥 Staff List ({content.staffList.length})</h3>
            
            {content.staffList.length === 0 ? (
              <p style={styles.empty}>No staff members added yet.</p>
            ) : (
              <div style={styles.staffGrid}>
                {content.staffList.map((staff) => (
                  <div key={staff.id} style={styles.staffCard}>
                    {staff.image && (
                      <img src={staff.image} alt={staff.name} style={styles.staffImage} />
                    )}
                    
                    {editingId === staff.id ? (
                      // Edit Mode
                      <div style={styles.editForm}>
                        <input
                          value={staff.name}
                          onChange={(e) => updateStaff(staff.id, { name: e.target.value })}
                          placeholder="Name"
                          style={styles.editInput}
                        />
                        <input
                          value={staff.role || ""}
                          onChange={(e) => updateStaff(staff.id, { role: e.target.value })}
                          placeholder="Role"
                          style={styles.editInput}
                        />
                        <input
                          value={staff.department || ""}
                          onChange={(e) => updateStaff(staff.id, { department: e.target.value })}
                          placeholder="Department"
                          style={styles.editInput}
                        />
                        <input
                          value={staff.email || ""}
                          onChange={(e) => updateStaff(staff.id, { email: e.target.value })}
                          placeholder="Email"
                          style={styles.editInput}
                        />
                        <input
                          value={staff.phone || ""}
                          onChange={(e) => updateStaff(staff.id, { phone: e.target.value })}
                          placeholder="Phone"
                          style={styles.editInput}
                        />
                        <input
                          value={staff.image || ""}
                          onChange={(e) => updateStaff(staff.id, { image: e.target.value })}
                          placeholder="Image URL"
                          style={styles.editInput}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, staff.id)}
                          style={styles.fileInput}
                        />
                        <textarea
                          value={staff.bio || ""}
                          onChange={(e) => updateStaff(staff.id, { bio: e.target.value })}
                          placeholder="Bio"
                          rows={2}
                          style={styles.editTextarea}
                        />
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={staff.visible !== false}
                            onChange={(e) => updateStaff(staff.id, { visible: e.target.checked })}
                          />
                          Visible
                        </label>
                        <button onClick={cancelEdit} style={styles.doneBtn}>✓ Done</button>
                      </div>
                    ) : (
                      // View Mode
                      <div style={styles.staffInfo}>
                        <h4 style={styles.staffName}>{staff.name}</h4>
                        {staff.role && <p style={styles.staffRole}>{staff.role}</p>}
                        {staff.department && <p style={styles.staffDept}>📁 {staff.department}</p>}
                        {staff.email && <p style={styles.staffContact}>✉️ {staff.email}</p>}
                        {staff.phone && <p style={styles.staffContact}>📞 {staff.phone}</p>}
                        {staff.bio && <p style={styles.staffBio}>{staff.bio}</p>}
                        <p style={styles.visibility}>
                          {staff.visible !== false ? "✅ Visible" : "🚫 Hidden"}
                        </p>
                        
                        <div style={styles.cardActions}>
                          <button onClick={() => startEdit(staff)} style={styles.editBtn}>✏️ Edit</button>
                          <button onClick={() => deleteStaff(staff.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

const styles = {
  container: { padding: "24px", maxWidth: "100%" },
  title: { fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", marginBottom: "8px" },
  subtitle: { fontSize: "0.9rem", color: "#64748b", marginBottom: "24px" },
  error: { background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" },
  success: { background: "#dcfce7", color: "#16a34a", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" },
  saving: { color: "#64748b", fontStyle: "italic" },
  section: { background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  sectionTitle: { fontSize: "1.1rem", fontWeight: "600", color: "#334155", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" },
  formGroup: { marginBottom: "12px" },
  label: { display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" },
  inputWithUpload: { display: "flex", gap: "8px" },
  uploadBtn: { padding: "10px 14px", background: "#3b82f6", color: "#fff", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#475569" },
  addBtn: { padding: "12px 24px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  empty: { color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "20px" },
  staffGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
  staffCard: { background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" },
  staffImage: { width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "12px", display: "block", margin: "0 auto 12px" },
  staffInfo: { textAlign: "center" },
  staffName: { fontSize: "1rem", fontWeight: "600", color: "#1e293b", marginBottom: "4px" },
  staffRole: { fontSize: "0.9rem", color: "#7c3aed", fontWeight: "500", marginBottom: "8px" },
  staffDept: { fontSize: "0.8rem", color: "#64748b", marginBottom: "4px" },
  staffContact: { fontSize: "0.8rem", color: "#64748b", marginBottom: "2px" },
  staffBio: { fontSize: "0.8rem", color: "#475569", marginTop: "8px", fontStyle: "italic" },
  visibility: { fontSize: "0.75rem", marginTop: "8px" },
  cardActions: { display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" },
  editBtn: { padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
  deleteBtn: { padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
  editForm: { display: "flex", flexDirection: "column", gap: "8px" },
  editInput: { padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem" },
  editTextarea: { padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", resize: "none" },
  fileInput: { fontSize: "0.8rem" },
  doneBtn: { padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
};