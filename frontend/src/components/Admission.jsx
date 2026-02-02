import React, { useState } from "react";
import { upload } from "../utils/api";

const Admission = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [applicationForm, setApplicationForm] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicationForm) return setMessage({ type: "error", text: "Please attach application PDF." });
    if (!image) return setMessage({ type: "error", text: "Please attach a profile image." });
    setLoading(true);
    setMessage(null);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("classLevel", classLevel);
    fd.append("applicationForm", applicationForm);
    fd.append("image", image);

    try {
      const data = await upload("/api/submit-form", fd);
      if (data && data.success) {
        setMessage({ type: "success", text: "Application submitted successfully." });
        setName(""); setEmail(""); setPhone(""); setClassLevel(""); setApplicationForm(null); setImage(null);
      } else {
        setMessage({ type: "error", text: (data && data.error) || "Submission failed" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admission-card">
      <h2>Admission Form</h2>
      {message && <div className={`alert ${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit} className="admission-form">
        <label>Name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Phone</label>
        <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Class / Level</label>
        <input className="form-input" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} />

        <label>Application Form (PDF)</label>
        <input type="file" accept="application/pdf" onChange={(e) => setApplicationForm(e.target.files[0])} />

        <label>Profile Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <button className="btn" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Application"}</button>
      </form>
    </div>
  );
};

export default Admission;
