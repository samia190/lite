import { useEffect, useState } from "react";
import { get, patch, upload } from "../utils/api";

/**
 * ParentsManagement - Full CRUD for parents portal content
 * Stores data in /api/content/parents
 */

const DEFAULTS = {
  title: "Parents Portal",
  intro: "Welcome to the Parents Portal. Access important information, resources, and stay connected with your child's education.",
  announcements: [],
  resources: [],
  events: [],
};

function uid(prefix = "p") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ParentsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [content, setContent] = useState(DEFAULTS);

  // Forms for new items
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", date: "", visible: true });
  const [newResource, setNewResource] = useState({ name: "", description: "", url: "", type: "link", visible: true });
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", location: "", description: "", visible: true });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    try {
      const data = await get("/api/content/parents");
      const merged = {
        ...DEFAULTS,
        ...(data || {}),
        announcements: Array.isArray(data?.announcements) ? data.announcements : [],
        resources: Array.isArray(data?.resources) ? data.resources : [],
        events: Array.isArray(data?.events) ? data.events : [],
      };
      setContent(merged);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load parents portal data.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSection(section, value) {
    setSaving(true);
    setSuccess("");
    try {
      await patch(`/api/content/parents/${section}`, { value });
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
    setNewAnnouncement({ title: "", body: "", date: "", visible: true });
  }

  async function updateAnnouncement(id, updates) {
    const next = content.announcements.map((a) => (a.id === id ? { ...a, ...updates } : a));
    await saveSection("announcements", next);
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement?")) return;
    await saveSection("announcements", content.announcements.filter((a) => a.id !== id));
  }

  // ===== Resources CRUD =====
  async function addResource() {
    if (!newResource.name.trim()) return setError("Name is required.");
    const item = { id: uid("res"), ...newResource, createdAt: new Date().toISOString() };
    await saveSection("resources", [...content.resources, item]);
    setNewResource({ name: "", description: "", url: "", type: "link", visible: true });
  }

  async function updateResource(id, updates) {
    const next = content.resources.map((r) => (r.id === id ? { ...r, ...updates } : r));
    await saveSection("resources", next);
  }

  async function deleteResource(id) {
    if (!window.confirm("Delete this resource?")) return;
    await saveSection("resources", content.resources.filter((r) => r.id !== id));
  }

  // ===== Events CRUD =====
  async function addEvent() {
    if (!newEvent.title.trim()) return setError("Title is required.");
    const item = { id: uid("evt"), ...newEvent, createdAt: new Date().toISOString() };
    await saveSection("events", [...content.events, item]);
    setNewEvent({ title: "", date: "", time: "", location: "", description: "", visible: true });
  }

  async function updateEvent(id, updates) {
    const next = content.events.map((e) => (e.id === id ? { ...e, ...updates } : e));
    await saveSection("events", next);
  }

  async function deleteEvent(id) {
    if (!window.confirm("Delete this event?")) return;
    await saveSection("events", content.events.filter((e) => e.id !== id));
  }

  return (
    <section style={styles.container}>
      <h2 style={styles.title}>👨‍👩‍👧 Parents Portal Management</h2>
      <p style={styles.subtitle}>Manage announcements, resources, and events for parents.</p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      {saving && <p style={styles.saving}>Saving...</p>}

      {loading ? (
        <p>Loading...</p>
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
            <h3 style={styles.sectionTitle}>📢 Announcements ({content.announcements.length})</h3>
            
            <div style={styles.formGrid}>
              <input placeholder="Title *" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement((p) => ({ ...p, title: e.target.value }))} style={styles.input} />
              <input type="date" value={newAnnouncement.date} onChange={(e) => setNewAnnouncement((p) => ({ ...p, date: e.target.value }))} style={styles.input} />
              <textarea placeholder="Announcement content" value={newAnnouncement.body} onChange={(e) => setNewAnnouncement((p) => ({ ...p, body: e.target.value }))} rows={2} style={{ ...styles.textarea, gridColumn: "span 2" }} />
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
                  <textarea value={a.body || ""} onChange={(e) => updateAnnouncement(a.id, { body: e.target.value })} rows={2} style={styles.itemTextarea} />
                  <div style={styles.itemActions}>
                    <label><input type="checkbox" checked={a.visible !== false} onChange={(e) => updateAnnouncement(a.id, { visible: e.target.checked })} /> Visible</label>
                    <button onClick={() => deleteAnnouncement(a.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📁 Resources ({content.resources.length})</h3>
            
            <div style={styles.formGrid}>
              <input placeholder="Resource name *" value={newResource.name} onChange={(e) => setNewResource((p) => ({ ...p, name: e.target.value }))} style={styles.input} />
              <input placeholder="URL (link or file)" value={newResource.url} onChange={(e) => setNewResource((p) => ({ ...p, url: e.target.value }))} style={styles.input} />
              <select value={newResource.type} onChange={(e) => setNewResource((p) => ({ ...p, type: e.target.value }))} style={styles.input}>
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="document">Document</option>
                <option value="video">Video</option>
              </select>
              <textarea placeholder="Description" value={newResource.description} onChange={(e) => setNewResource((p) => ({ ...p, description: e.target.value }))} rows={2} style={styles.textarea} />
              <button onClick={addResource} style={styles.addBtn}>+ Add Resource</button>
            </div>

            <div style={styles.itemList}>
              {content.resources.map((r) => (
                <div key={r.id} style={styles.itemCard}>
                  <input value={r.name} onChange={(e) => updateResource(r.id, { name: e.target.value })} placeholder="Name" style={styles.itemInput} />
                  <input value={r.url || ""} onChange={(e) => updateResource(r.id, { url: e.target.value })} placeholder="URL" style={styles.itemInput} />
                  <select value={r.type || "link"} onChange={(e) => updateResource(r.id, { type: e.target.value })} style={styles.itemInput}>
                    <option value="link">Link</option>
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                  </select>
                  <div style={styles.itemActions}>
                    <label><input type="checkbox" checked={r.visible !== false} onChange={(e) => updateResource(r.id, { visible: e.target.checked })} /> Visible</label>
                    <button onClick={() => deleteResource(r.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Parent Events ({content.events.length})</h3>
            
            <div style={styles.formGrid}>
              <input placeholder="Event title *" value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} style={styles.input} />
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))} style={styles.input} />
              <input placeholder="Time" value={newEvent.time} onChange={(e) => setNewEvent((p) => ({ ...p, time: e.target.value }))} style={styles.input} />
              <input placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent((p) => ({ ...p, location: e.target.value }))} style={styles.input} />
              <textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))} rows={2} style={{ ...styles.textarea, gridColumn: "span 2" }} />
              <button onClick={addEvent} style={styles.addBtn}>+ Add Event</button>
            </div>

            <div style={styles.itemList}>
              {content.events.map((e) => (
                <div key={e.id} style={styles.itemCard}>
                  <input value={e.title} onChange={(ev) => updateEvent(e.id, { title: ev.target.value })} placeholder="Title" style={styles.itemInput} />
                  <input type="date" value={e.date || ""} onChange={(ev) => updateEvent(e.id, { date: ev.target.value })} style={styles.itemInput} />
                  <input value={e.time || ""} onChange={(ev) => updateEvent(e.id, { time: ev.target.value })} placeholder="Time" style={styles.itemInput} />
                  <input value={e.location || ""} onChange={(ev) => updateEvent(e.id, { location: ev.target.value })} placeholder="Location" style={styles.itemInput} />
                  <div style={styles.itemActions}>
                    <label><input type="checkbox" checked={e.visible !== false} onChange={(ev) => updateEvent(e.id, { visible: ev.target.checked })} /> Visible</label>
                    <button onClick={() => deleteEvent(e.id)} style={styles.deleteBtn}>🗑️ Delete</button>
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
  checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#475569" },
  addBtn: { padding: "12px 24px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  itemList: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px", marginTop: "16px" },
  itemCard: { background: "#f8fafc", borderRadius: "10px", padding: "14px", border: "1px solid #e2e8f0" },
  itemInput: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", marginBottom: "8px", boxSizing: "border-box" },
  itemTextarea: { width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", resize: "none", marginBottom: "8px", boxSizing: "border-box" },
  itemActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" },
  deleteBtn: { padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
};
