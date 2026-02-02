import { useEffect, useState } from "react";
import { get, patch, upload } from "../utils/api";

/**
 * StudentsManagement - Full CRUD for student portal content
 * Stores data in /api/content/students
 */

const DEFAULTS = {
  title: "Student Portal",
  intro: "Welcome to the Student Portal. Access important information about admissions, fees, exams, clubs, and support services.",
  announcements: [],
  downloads: [],
  faqs: [],
};

function uid(prefix = "s") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function StudentsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [content, setContent] = useState(DEFAULTS);

  // Forms
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", date: "", category: "", visible: true });
  const [newDownload, setNewDownload] = useState({ name: "", description: "", url: "", category: "", visible: true });
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "", visible: true });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    try {
      const data = await get("/api/content/students");
      const merged = {
        ...DEFAULTS,
        ...(data || {}),
        announcements: Array.isArray(data?.announcements) ? data.announcements : [],
        downloads: Array.isArray(data?.downloads) ? data.downloads : [],
        faqs: Array.isArray(data?.faqs) ? data.faqs : [],
      };
      setContent(merged);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load students data.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSection(section, value) {
    setSaving(true);
    setSuccess("");
    try {
      await patch(`/api/content/students/${section}`, { value });
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

  // ===== Announcements CRUD =====
  async function addAnnouncement() {
    if (!newAnnouncement.title.trim()) return setError("Title is required.");
    const item = { id: uid("ann"), ...newAnnouncement, createdAt: new Date().toISOString() };
    await saveSection("announcements", [...content.announcements, item]);
    setNewAnnouncement({ title: "", body: "", date: "", category: "", visible: true });
  }

  async function updateAnnouncement(id, updates) {
    const next = content.announcements.map((a) => (a.id === id ? { ...a, ...updates } : a));
    await saveSection("announcements", next);
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement?")) return;
    await saveSection("announcements", content.announcements.filter((a) => a.id !== id));
  }

  // ===== Downloads CRUD =====
  async function addDownload() {
    if (!newDownload.name.trim()) return setError("Name is required.");
    const item = { id: uid("dl"), ...newDownload, createdAt: new Date().toISOString() };
    await saveSection("downloads", [...content.downloads, item]);
    setNewDownload({ name: "", description: "", url: "", category: "", visible: true });
  }

  async function updateDownload(id, updates) {
    const next = content.downloads.map((d) => (d.id === id ? { ...d, ...updates } : d));
    await saveSection("downloads", next);
  }

  async function deleteDownload(id) {
    if (!window.confirm("Delete this download?")) return;
    await saveSection("downloads", content.downloads.filter((d) => d.id !== id));
  }

  // Handle file upload for downloads
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("type", "student-downloads");
      form.append("files", file);
      const data = await upload("/api/admin/content", form);
      const uploadedUrl = data?.content?.attachments?.[0]?.downloadUrl || data?.content?.attachments?.[0]?.url;
      
      if (uploadedUrl) {
        setNewDownload((prev) => ({ ...prev, url: uploadedUrl, name: prev.name || file.name }));
        setSuccess("File uploaded!");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload file. You can paste a URL instead.");
    }
    e.target.value = "";
  }

  // ===== FAQs CRUD =====
  async function addFaq() {
    if (!newFaq.question.trim()) return setError("Question is required.");
    const item = { id: uid("faq"), ...newFaq, createdAt: new Date().toISOString() };
    await saveSection("faqs", [...content.faqs, item]);
    setNewFaq({ question: "", answer: "", category: "", visible: true });
  }

  async function updateFaq(id, updates) {
    const next = content.faqs.map((f) => (f.id === id ? { ...f, ...updates } : f));
    await saveSection("faqs", next);
  }

  async function deleteFaq(id) {
    if (!window.confirm("Delete this FAQ?")) return;
    await saveSection("faqs", content.faqs.filter((f) => f.id !== id));
  }

  return (
    <section style={styles.container}>
      <h2 style={styles.title}>🎓 Students Portal Management</h2>
      <p style={styles.subtitle}>Manage announcements, downloadable resources, and FAQs for students.</p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      {saving && <p style={styles.saving}>Saving...</p>}

      {loading ? (
        <p>Loading students portal data...</p>
      ) : (
        <>
          {/* Page Content */}
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

          {/* Announcements */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📢 Student Announcements ({content.announcements.length})</h3>
            
            <div style={styles.formGrid}>
              <input placeholder="Title *" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement((p) => ({ ...p, title: e.target.value }))} style={styles.input} />
              <input type="date" value={newAnnouncement.date} onChange={(e) => setNewAnnouncement((p) => ({ ...p, date: e.target.value }))} style={styles.input} />
              <select value={newAnnouncement.category} onChange={(e) => setNewAnnouncement((p) => ({ ...p, category: e.target.value }))} style={styles.input}>
                <option value="">Select category</option>
                <option value="general">General</option>
                <option value="exams">Exams</option>
                <option value="clubs">Clubs</option>
                <option value="fees">Fees</option>
                <option value="admissions">Admissions</option>
              </select>
              <textarea placeholder="Content" value={newAnnouncement.body} onChange={(e) => setNewAnnouncement((p) => ({ ...p, body: e.target.value }))} rows={2} style={{ ...styles.textarea, gridColumn: "span 2" }} />
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={newAnnouncement.visible} onChange={(e) => setNewAnnouncement((p) => ({ ...p, visible: e.target.checked }))} /> Visible
              </label>
              <button onClick={addAnnouncement} style={styles.addBtn}>+ Add Announcement</button>
            </div>

            <div style={styles.itemList}>
              {content.announcements.map((a) => (
                <div key={a.id} style={styles.itemCard}>
                  <input value={a.title} onChange={(e) => updateAnnouncement(a.id, { title: e.target.value })} style={styles.itemInput} />
                  <input type="date" value={a.date || ""} onChange={(e) => updateAnnouncement(a.id, { date: e.target.value })} style={styles.itemInput} />
                  <select value={a.category || ""} onChange={(e) => updateAnnouncement(a.id, { category: e.target.value })} style={styles.itemInput}>
                    <option value="">No category</option>
                    <option value="general">General</option>
                    <option value="exams">Exams</option>
                    <option value="clubs">Clubs</option>
                    <option value="fees">Fees</option>
                    <option value="admissions">Admissions</option>
                  </select>
                  <textarea value={a.body || ""} onChange={(e) => updateAnnouncement(a.id, { body: e.target.value })} rows={2} style={styles.itemTextarea} />
                  <div style={styles.itemActions}>
                    <label><input type="checkbox" checked={a.visible !== false} onChange={(e) => updateAnnouncement(a.id, { visible: e.target.checked })} /> Visible</label>
                    <button onClick={() => deleteAnnouncement(a.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Downloads */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📥 Downloads & Resources ({content.downloads.length})</h3>
            
            <div style={styles.formGrid}>
              <input placeholder="File name *" value={newDownload.name} onChange={(e) => setNewDownload((p) => ({ ...p, name: e.target.value }))} style={styles.input} />
              <div style={styles.inputWithUpload}>
                <input placeholder="URL" value={newDownload.url} onChange={(e) => setNewDownload((p) => ({ ...p, url: e.target.value }))} style={styles.input} />
                <label style={styles.uploadBtn}>
                  📤
                  <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
              </div>
              <select value={newDownload.category} onChange={(e) => setNewDownload((p) => ({ ...p, category: e.target.value }))} style={styles.input}>
                <option value="">Select category</option>
                <option value="forms">Forms</option>
                <option value="timetables">Timetables</option>
                <option value="syllabus">Syllabus</option>
                <option value="guidelines">Guidelines</option>
                <option value="results">Results</option>
              </select>
              <textarea placeholder="Description" value={newDownload.description} onChange={(e) => setNewDownload((p) => ({ ...p, description: e.target.value }))} rows={2} style={styles.textarea} />
              <button onClick={addDownload} style={styles.addBtn}>+ Add Download</button>
            </div>

            <div style={styles.itemList}>
              {content.downloads.map((d) => (
                <div key={d.id} style={styles.itemCard}>
                  <input value={d.name} onChange={(e) => updateDownload(d.id, { name: e.target.value })} placeholder="Name" style={styles.itemInput} />
                  <input value={d.url || ""} onChange={(e) => updateDownload(d.id, { url: e.target.value })} placeholder="URL" style={styles.itemInput} />
                  <select value={d.category || ""} onChange={(e) => updateDownload(d.id, { category: e.target.value })} style={styles.itemInput}>
                    <option value="">No category</option>
                    <option value="forms">Forms</option>
                    <option value="timetables">Timetables</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="guidelines">Guidelines</option>
                    <option value="results">Results</option>
                  </select>
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={styles.viewLink}>📎 View File</a>}
                  <div style={styles.itemActions}>
                    <label><input type="checkbox" checked={d.visible !== false} onChange={(e) => updateDownload(d.id, { visible: e.target.checked })} /> Visible</label>
                    <button onClick={() => deleteDownload(d.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>❓ FAQs ({content.faqs.length})</h3>
            
            <div style={styles.formGrid}>
              <input placeholder="Question *" value={newFaq.question} onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))} style={{ ...styles.input, gridColumn: "span 2" }} />
              <textarea placeholder="Answer" value={newFaq.answer} onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))} rows={3} style={{ ...styles.textarea, gridColumn: "span 2" }} />
              <select value={newFaq.category} onChange={(e) => setNewFaq((p) => ({ ...p, category: e.target.value }))} style={styles.input}>
                <option value="">Select category</option>
                <option value="admissions">Admissions</option>
                <option value="fees">Fees</option>
                <option value="exams">Exams</option>
                <option value="campus">Campus Life</option>
                <option value="general">General</option>
              </select>
              <button onClick={addFaq} style={styles.addBtn}>+ Add FAQ</button>
            </div>

            <div style={styles.itemList}>
              {content.faqs.map((f) => (
                <div key={f.id} style={styles.itemCard}>
                  <input value={f.question} onChange={(e) => updateFaq(f.id, { question: e.target.value })} placeholder="Question" style={styles.itemInput} />
                  <textarea value={f.answer || ""} onChange={(e) => updateFaq(f.id, { answer: e.target.value })} placeholder="Answer" rows={3} style={styles.itemTextarea} />
                  <select value={f.category || ""} onChange={(e) => updateFaq(f.id, { category: e.target.value })} style={styles.itemInput}>
                    <option value="">No category</option>
                    <option value="admissions">Admissions</option>
                    <option value="fees">Fees</option>
                    <option value="exams">Exams</option>
                    <option value="campus">Campus Life</option>
                    <option value="general">General</option>
                  </select>
                  <div style={styles.itemActions}>
                    <label><input type="checkbox" checked={f.visible !== false} onChange={(e) => updateFaq(f.id, { visible: e.target.checked })} /> Visible</label>
                    <button onClick={() => deleteFaq(f.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
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
  itemList: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px", marginTop: "16px" },
  itemCard: { background: "#f8fafc", borderRadius: "10px", padding: "14px", border: "1px solid #e2e8f0" },
  itemInput: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", marginBottom: "8px", boxSizing: "border-box" },
  itemTextarea: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", resize: "none", marginBottom: "8px", boxSizing: "border-box" },
  itemActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" },
  deleteBtn: { padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
  viewLink: { fontSize: "0.85rem", color: "#2563eb", textDecoration: "none", display: "inline-block", marginBottom: "8px" },
};
