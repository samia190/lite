import React, { useEffect, useState } from "react";
import { get } from "../utils/api";
import EditableFileList from "./EditableFileList";
import Loader from "./Loader";


const eventsWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  alignItems: "stretch",
  marginTop: "1rem",
};

const eventCardBaseStyle = {
  flex: "1 1 260px",
  maxWidth: "360px",
  borderRadius: "8px",
  padding: "0.75rem 1rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  boxSizing: "border-box",
};

const backCardStyle = {
  borderRadius: "8px",
  padding: "0.5rem 0.75rem",
  backgroundColor: "#f3f4ff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  marginBottom: "0.75rem",
  fontSize: "0.9rem",
};

export default function Events() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({}); // for "Read more" per event

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError("");
        const data = await get("/api/content/events");
        setContent(data || {});
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load events.");
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  function toggleReadMore(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return (
      <main className="page events-page">
        <h1>Events</h1>
        <Loader message="Loading events…" />
      </main>
    );
  }

  const introTitle = content?.title || "School Events";
  const introBody =
    content?.body ||
    content?.intro ||
    "Here you will find upcoming and past events, activities, and key dates for our school.";

  const events = (content?.data && content.data.events) || [];
  const attachments = content?.attachments || [];

  return (
    <main className="page events-page" style={{ padding: "1rem 8px", textAlign: "left" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem", textAlign: "left" }}>{introTitle}</h1>
        <p style={{ margin: 0, textAlign: "left" }}>{introBody}</p>
      </div>

      {/* Back to Newsletter link */}
      <div style={backCardStyle}>
        <span>Want to see general news and updates? </span>
        <a
          href="#newsletter"
          onClick={(e) => {
            e.preventDefault();
            if (window.setRoute) {
              window.setRoute("newsletter");
            }
          }}
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Go back to Newsletter &raquo;
        </a>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* EVENTS CARDS */}
      {events.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Upcoming & Recent Events</h2>
          <div style={eventsWrapperStyle}>
            {events.map((ev, index) => {
              const id = ev.id || ev._id || String(index);
              const bgColor = ev.color || "#f3f4f6";
              const isOpen = !!expanded[id];
              const fullText = ev.description || ev.body || "";
              const shortText =
                fullText.length > 280 ? fullText.slice(0, 280) + "…" : fullText;

              const dateLabel = ev.date
                ? new Date(ev.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <article
                  key={id}
                  style={{ ...eventCardBaseStyle, backgroundColor: bgColor }}
                >
                  <h3 style={{ marginTop: 0 }}>{ev.title || "Event"}</h3>

                  {dateLabel && (
                    <p style={{ fontSize: "0.85rem", margin: 0 }}>
                      <strong>Date:</strong> {dateLabel}
                    </p>
                  )}

                  {ev.location && (
                    <p style={{ fontSize: "0.85rem", margin: "0 0 0.25rem 0" }}>
                      <strong>Location:</strong> {ev.location}
                    </p>
                  )}

                  {fullText && (
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {isOpen ? fullText : shortText}
                    </p>
                  )}

                  {fullText.length > 280 && (
                    <button
                      type="button"
                      onClick={() => toggleReadMore(id)}
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        color: "#2563eb",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      {isOpen ? "Show less" : "Read more"}
                    </button>
                  )}

                  {ev.linkUrl && (
                    <p style={{ marginTop: "0.5rem" }}>
                      <a
                        href={ev.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "underline" }}
                      >
                        More details &raquo;
                      </a>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ATTACHMENTS / MEDIA (IMAGES, VIDEOS, DOCS) */}
      {attachments.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Event Media & Downloads</h2>
          {/* Public view: no admin editing here */}
          <EditableFileList files={attachments} isAdmin={false} />
        </section>
      )}
    </main>
  );
}
