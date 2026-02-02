// src/components/CurriculumManagement.jsx
import { useEffect, useState } from "react";
import { get, post, put /*, del */ } from "../utils/api"; // adjust if you use a different delete helper

const EMPTY_ITEM = {
  heading: "",
  title: "",
  description: "",
  media: [], // [{ fileId, url, mimeType, originalName }]
};

export default function CurriculumManagement() {
  const [docId, setDocId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_ITEM);

  // Load existing curriculum content
  useEffect(() => {
    setLoading(true);
    get("/api/content/curriculum")
      .then((data) => {
        // Support either a single document or an array with one document
        if (Array.isArray(data) && data.length > 0) {
          setDocId(data[0]._id);
          setItems(data[0].items || []);
        } else if (data && data._id) {
          setDocId(data._id);
          setItems(data.items || []);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setError("Failed to load curriculum content.");
      })
      .finally(() => setLoading(false));
  }, []);

  function startAdd() {
    setEditingIndex(null);
    setFormData(EMPTY_ITEM);
  }

  function startEdit(index) {
    setEditingIndex(index);
    setFormData(items[index]);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setFormData(EMPTY_ITEM);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setSaving(true);
      const uploadedMedia = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        // IMPORTANT:
        // Your ../utils/api `post` helper should detect FormData and set the correct headers.
        // If not, adjust this call to match how you upload in other sections (Admissions/Newsletter).
        const uploaded = await post("/api/files", fd);

        // Normalise what we store in the content document
        uploadedMedia.push({
          fileId: uploaded._id, // adjust if your API returns id instead of _id
          url: uploaded.url,
          mimeType: uploaded.mimeType || uploaded.mimetype,
          originalName: uploaded.originalName || uploaded.filename || file.name,
        });
      }

      setFormData((prev) => ({
        ...prev,
        media: [...(prev.media || []), ...uploadedMedia],
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to upload one or more files.");
    } finally {
      setSaving(false);
      // reset input so the same file can be chosen again if needed
      e.target.value = "";
    }
  }

  function removeMedia(indexToRemove) {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indexToRemove),
    }));
  }

  async function handleSaveItem(e) {
    e.preventDefault();
    setError("");

    const updatedItems = [...items];

    if (editingIndex === null) {
      // Add new card
      updatedItems.push(formData);
    } else {
      // Update existing card
      updatedItems[editingIndex] = formData;
    }

    setSaving(true);
    try {
      let savedDoc;
      if (docId) {
        savedDoc = await put(`/api/content/${docId}`, {
          type: "curriculum",
          items: updatedItems,
        });
      } else {
        savedDoc = await post("/api/content", {
          type: "curriculum",
          items: updatedItems,
        });
      }

      setDocId(savedDoc._id);
      setItems(savedDoc.items || updatedItems);
      setFormData(EMPTY_ITEM);
      setEditingIndex(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save curriculum item.");
    } finally {
      setSaving(false);
    }
  }

  // Optional: delete a card entirely
  async function handleDeleteItem(index) {
    if (!window.confirm("Delete this curriculum section?")) return;
    const updatedItems = items.filter((_, i) => i !== index);

    setSaving(true);
    setError("");
    try {
      if (docId) {
        const savedDoc = await put(`/api/content/${docId}`, {
          type: "curriculum",
          items: updatedItems,
        });
        setItems(savedDoc.items || updatedItems);
      } else {
        setItems(updatedItems);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete curriculum item.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading curriculum content...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Curriculum Management</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Existing cards */}
      <div className="items-list">
        {items.length === 0 && <p>No curriculum sections created yet.</p>}

        {items.map((item, index) => (
          <div key={index} className="admin-card">
            <div className="admin-card-header">
              <h3>{item.heading || "Untitled section"}</h3>
              <div className="admin-card-actions">
                <button type="button" onClick={() => startEdit(index)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDeleteItem(index)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p><strong>Title:</strong> {item.title}</p>
            <p><strong>Description:</strong> {item.description}</p>
            {item.media && item.media.length > 0 && (
              <ul className="media-list">
                {item.media.map((m, i) => (
                  <li key={i}>
                    {m.originalName || "File"} ({m.mimeType || "file"})
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <hr />

      {/* Add / Edit form */}
      <div className="admin-form">
        <h3>{editingIndex === null ? "Add Curriculum Section" : "Edit Curriculum Section"}</h3>

        <form onSubmit={handleSaveItem}>
          <div className="form-group">
            <label>Heading</label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. STEM Pathway"
              required
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Science, Technology, Engineering & Mathematics"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe this curriculum section..."
            />
          </div>

          <div className="form-group">
            <label>Attach Media (upload from your computer)</label>
            <input
              type="file"
              multiple
              onChange={handleFilesSelected}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
            />
            {formData.media && formData.media.length > 0 && (
              <ul className="media-list editable">
                {formData.media.map((m, i) => (
                  <li key={i}>
                    {m.originalName || "File"} ({m.mimeType || "file"})
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="link-button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Section"}
            </button>
            {editingIndex !== null && (
              <button type="button" onClick={cancelEdit} className="secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
