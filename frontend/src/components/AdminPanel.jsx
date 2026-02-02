import React, { useEffect, useState } from "react";
import AdminContentForm from "./AdminContentForm";
import EditableHeading from "./EditableHeading";
import EditableSubheading from "./EditableSubheading";
import EditableText from "./EditableText";
import { get, del, patch } from "../utils/api";

export default function AdminPanel({ setLoading, user }) {
  const [items, setItems] = useState([]);
  const [content, setContent] = useState({});
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError("");
      try {
        setLoading && setLoading(true);
        const [data, meta] = await Promise.all([
          get("/api/content"),
          get("/api/content/adminpanel")
        ]);
        if (mounted) {
          setItems(Array.isArray(data) ? data : []);
          setContent(meta || {});
        }
      } catch (err) {
        setError(err?.body?.error || err?.message || "Failed to load content");
      } finally {
        setLoading && setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [refreshKey, setLoading]);

  async function updateSection(section, value) {
    try {
      await patch(`/api/content/adminpanel/${section}`, { value });
      setContent((prev) => ({ ...prev, [section]: value }));
    } catch (err) {
      alert("Failed to save section: " + (err?.body?.error || err?.message));
    }
  }

  async function handleSaved(entry) {
    setRefreshKey(k => k + 1);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this content entry?")) return;
    try {
      setLoading && setLoading(true);
      // The canonical delete endpoint for content is /api/content/:id
      await del(`/api/content/${id}`);
      // Some responses/items may use `_id` or `id`. Remove any matching item.
      setItems((prev) => prev.filter((i) => String(i._id || i.id) !== String(id)));
    } catch (err) {
      alert(err?.body?.error || err?.message || "Delete failed");
    } finally {
      setLoading && setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <EditableHeading
        value={content.title || "Admin Panel"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={2}
      />

      <EditableText
        value={
          content.intro ||
          "Manage school content, upload newsletters, gallery items, and admission updates. You can also delete outdated entries below."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      <div style={{ marginBottom: 30 }}>
        <EditableSubheading
          value={content.formHeading || "Add New Content"}
          onSave={(val) => updateSection("formHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
        />
        <AdminContentForm onSaved={handleSaved} />
      </div>

      <hr />

      <div>
        <EditableSubheading
          value={content.listHeading || "Existing Content"}
          onSave={(val) => updateSection("listHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
        />
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {items.length === 0 && <div>No content yet.</div>}
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {items.map(item => (
            <article key={item._id || item.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{item.title}</strong> <small style={{ color: "#666" }}>({item.type})</small>
                  <div style={{ color: "#555", marginTop: 6 }}>{item.body}</div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {item.attachments?.map((a, ai) => {
                      const key = a.filename || a.name || a._id || ai;
                      if (String(a.mimetype || "").startsWith("image/")) {
                        return (
                          <img key={key} src={a.url} alt={a.originalName || a.name || "attachment"} style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 4 }} />
                        );
                      }
                      // If video, render video; otherwise render a download link
                      if (String(a.mimetype || "").startsWith("video/")) {
                        return (
                          <video key={key} src={a.url} controls style={{ width: 200, height: 120, borderRadius: 4 }} />
                        );
                      }
                      return (
                        <a key={key} href={a.downloadUrl || a.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
                          {a.originalName || a.name || "Download"}
                        </a>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(item._id || item.id)}
                    style={{
                      background: "#f44336",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
                <span>By: {item.author || "system"}</span> · <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
