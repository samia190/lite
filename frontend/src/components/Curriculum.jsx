// src/components/Curriculum.jsx
import { useEffect, useState } from "react";
import { get } from "../utils/api";
import { safePath } from "../utils/paths";
import LazyImage from "./LazyImage";
import LazyVideo from "./LazyVideo";

export default function Curriculum() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    setLoading(true);
    get("/api/content/curriculum")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data[0].items || []);
        } else if (data && data.items) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      })
      .catch(() => setError("Failed to load curriculum information."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loading">Loading curriculum...</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  return (
    <div className="page curriculum-page">
      <h1>Our Curriculum</h1>

      {items.length === 0 && <p>Curriculum content will be available soon.</p>}

      <div className="cards-grid">
        {items.map((item, index) => (
          <div key={index} className="card curriculum-card">
            {item.heading && <h2 className="card-heading">{item.heading}</h2>}
            {item.title && <h3 className="card-title">{item.title}</h3>}
            {item.description && (
              <p className="card-description">{item.description}</p>
            )}

            {/* Media section */}
            {item.media && item.media.length > 0 && (
              <div className="card-media">
                {item.media.map((m, i) => {
                  const mime = m.mimeType || "";
                  const isImage = mime.startsWith("image/");
                  const isVideo = mime.startsWith("video/");
                  const isAudio = mime.startsWith("audio/");

                  if (isImage) {
                    return (
                      <div
                        key={i}
                        className="media-thumb image-thumb"
                        onClick={() => setLightboxUrl(m.url)}
                      >
                        <LazyImage src={safePath(m.url)} alt={m.originalName || "Curriculum"} />
                      </div>
                    );
                  }

                  if (isVideo) {
                    return (
                      <div key={i} className="media-thumb video-thumb">
                        <LazyVideo src={safePath(m.url)} controls />
                      </div>
                    );
                  }

                  if (isAudio) {
                    return (
                      <div key={i} className="media-thumb audio-thumb">
                        <audio src={safePath(m.url)} controls />
                      </div>
                    );
                  }

                  // Other files (PDF, docs, etc.)
                  return (
                    <div key={i} className="media-file-link">
                      <a href={m.url} target="_blank" rel="noreferrer">
                        {m.originalName || "Download file"}
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Simple lightbox for images */}
      {lightboxUrl && (
        <div className="lightbox" onClick={() => setLightboxUrl(null)}>
          <div className="lightbox-backdrop" />
          <div className="lightbox-content">
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setLightboxUrl(null)}
            >
              ×
            </button>
            <LazyImage src={safePath(lightboxUrl)} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
