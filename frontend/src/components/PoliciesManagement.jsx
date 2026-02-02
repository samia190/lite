import React, { useEffect, useState } from "react";
import { get, put } from "../utils/api";

export default function PoliciesManagement() {
  const [content, setContent] = useState({ title: "", policiesText: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await get("/api/content/policies");
        setContent(data || { title: "", policiesText: "" });
      } catch (err) {
        console.error(err);
        setError("Failed to load policies content.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    (async () => {
      try {
        await put("/api/content/policies", content);
        setSuccess("Policies content saved successfully.");
      } catch (err) {
        console.error(err);
        setError("Failed to save policies content.");
      } finally {
        setSaving(false);
      }
    })();
  }

  if (loading) return <p>Loading policies content...</p>;

  return (
    <section>
      <h2>Policies Management</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div>
        <label>Title</label><br />
        <input
          type="text"
          name="title"
          value={content.title}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginBottom: 12 }}
        />
      </div>

      <div>
        <label>Policies Text</label><br />
        <textarea
          name="policiesText"
          value={content.policiesText}
          onChange={handleChange}
          rows={10}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <button onClick={handleSave} disabled={saving} style={{ marginTop: 15, padding: "10px 20px" }}>
        {saving ? "Saving..." : "Save"}
      </button>
    </section>
  );
}
