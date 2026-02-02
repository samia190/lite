import React, { useEffect, useState } from "react";
import { get, put, upload } from "../utils/api";

export default function ContactManagement() {
  const [contentDoc, setContentDoc] = useState(null);
  const [form, setForm] = useState({
    address: "",
    phone: "",
    email: "",
    whatsappNumber: "",
    whatsappLink: "",
    mapEmbed: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------- LOAD EXISTING CONTACT CONTENT ----------
  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const data = await get("/api/content/contact");
        if (!data) {
          // First time: nothing saved yet
          setContentDoc(null);
          setForm({
            address: "",
            phone: "",
            email: "",
            whatsappNumber: "",
            whatsappLink: "",
            mapEmbed: "",
          });
          setLoading(false);
          return;
        }

        const safe = data || {};
        setContentDoc(safe);

        setForm({
          address: safe.address || "",
          phone: safe.phone || "",
          email: safe.email || "",
          whatsappNumber: safe.whatsappNumber || "",
          whatsappLink: safe.whatsappLink || "",
          mapEmbed: safe.mapEmbed || "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading contact content.");
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  // ---------- FORM HANDLERS ----------
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (contentDoc && contentDoc._id) {
        // Update existing Content document
        const updatedDoc = {
          ...contentDoc,
          address: form.address,
          phone: form.phone,
          email: form.email,
          whatsappNumber: form.whatsappNumber,
          whatsappLink: form.whatsappLink,
          mapEmbed: form.mapEmbed,
        };

        const updated = await put(`/api/content/${contentDoc._id}`, updatedDoc);
        setContentDoc(updated);

        setForm({
          address: updated.address || "",
          phone: updated.phone || "",
          email: updated.email || "",
          whatsappNumber: updated.whatsappNumber || "",
          whatsappLink: updated.whatsappLink || "",
          mapEmbed: updated.mapEmbed || "",
        });

        setSuccess("Contact content saved successfully.");
      } else {
        // First time: create new Content document via /api/admin/content
        const fd = new FormData();
        fd.append("type", "contact");
        fd.append("address", form.address);
        fd.append("phone", form.phone);
        fd.append("email", form.email);
        fd.append("whatsappNumber", form.whatsappNumber);
        fd.append("whatsappLink", form.whatsappLink);
        fd.append("mapEmbed", form.mapEmbed);

        const data = await upload("/api/admin/content", fd);
        const created = data.content || data;
        setContentDoc(created);

        setForm({
          address: created.address || "",
          phone: created.phone || "",
          email: created.email || "",
          whatsappNumber: created.whatsappNumber || "",
          whatsappLink: created.whatsappLink || "",
          mapEmbed: created.mapEmbed || "",
        });

        setSuccess("Contact content saved successfully.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving contact content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section>
        <h2>Contact Management</h2>
        <p>Loading contact content…</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Contact Management</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          style={{ width: "100%", padding: "8px" }}
          placeholder="e.g. KANGARU GIRLS, P.O. Box 123, Embu, Kenya"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>Phone</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px" }}
          placeholder="e.g. +254 7xx xxx xxx"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px" }}
          placeholder="e.g. info@kangarugirls.ac.ke"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>
          WhatsApp number
        </label>
        <input
          type="text"
          name="whatsappNumber"
          value={form.whatsappNumber}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px" }}
          placeholder="e.g. 0712 345 678 or +254712345678"
        />
        <small style={{ fontSize: "0.8rem", color: "#4b5563" }}>
          We will turn this into a direct WhatsApp link on the Contact page.
        </small>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>
          Custom WhatsApp link (optional)
        </label>
        <input
          type="text"
          name="whatsappLink"
          value={form.whatsappLink}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px" }}
          placeholder="e.g. https://wa.me/2547xxxxxxxx or a pre-filled link"
        />
        <small style={{ fontSize: "0.8rem", color: "#4b5563" }}>
          If you fill this, the Contact page will use it directly. Otherwise it
          will build a wa.me link from the number.
        </small>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>
          Map Embed Code (optional)
        </label>
        <textarea
          name="mapEmbed"
          value={form.mapEmbed}
          onChange={handleChange}
          rows={4}
          placeholder='<iframe src="..."></iframe>'
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: 15, padding: "10px 20px" }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </section>
  );
}
