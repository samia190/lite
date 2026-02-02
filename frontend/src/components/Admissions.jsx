import React, { useEffect, useState } from "react";
import EditableFileList from "./EditableFileList";
import AdmissionForm from "./AdmissionForm";
import { get } from "../utils/api";
import Loader from "./Loader";

export default function Admissions({ user }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError("");
        const data = await get("/api/content/admissions");
        setContent(data || {});
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load admissions information.");
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading) {
    return (
      <section style={{ padding: 20 }}>
        <h1>Admissions</h1>
        <Loader message="Loading admissions information…" />
      </section>
    );
  }

  if (!content) {
    return (
      <section style={{ padding: 20 }}>
        <h1>Admissions</h1>
        <p>No admissions information available yet.</p>
      </section>
    );
  }

  const title = content.title || "Admissions";
  const overview =
    content.overview ||
    content.body ||
    "We welcome applications from girls across Kenya who are passionate about learning and growth.";

  const process =
    content.process ||
    "Our admissions process is transparent, student–centered, and guided by the Ministry of Education regulations.";

  const requirements =
    content.requirements ||
    "Applicants should attach recent report forms, birth certificate, and any supporting documents requested.";

  const importantDates =
    content.importantDates ||
    "Key dates such as interview days and reporting dates will be communicated through this page.";

  const contactInfo =
    content.contactInfo ||
    "For any question on admissions, kindly reach the school office through the official contacts on the Contact page.";

  const downloadsHeading =
    content.downloadsHeading ||
    "Downloads – application forms and related documents";

  const attachments = content.attachments || [];

  return (
    <section style={{ padding: "20px 8px", textAlign: "left" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem", textAlign: "left" }}>{title}</h1>
        <p style={{ fontSize: "0.98rem", color: "black", fontStyle: "italic", margin: 0, textAlign: "left" }}>{overview}</p>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section style={{ marginTop: "1rem" }}>
        <h2>Admissions Process</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{process}</p>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <h2>Requirements</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{requirements}</p>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <h2>Important Dates</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{importantDates}</p>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <h2>Contact for Admissions</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{contactInfo}</p>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>{downloadsHeading}</h2>
        {attachments.length === 0 && (
          <p>
            No downloadable documents have been uploaded yet. Please check back
            later or contact the school office.
          </p>
        )}
        {attachments.length > 0 && (
          <EditableFileList files={attachments} isAdmin={false} />
        )}
      </section>

      {/* Embedded admission submission form */}
      <section style={{ marginTop: "2rem" }}>
        <AdmissionForm />
      </section>
    </section>
  );
}
