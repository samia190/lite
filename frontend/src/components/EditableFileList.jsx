// src/components/EditableFileList.jsx
import React, { useEffect, useState } from "react";
import { get } from "../utils/api";
import { safePath } from "../utils/paths";
import LazyImage from "./LazyImage";
import LazyVideo from "./LazyVideo";

function getHref(file) {
  return file?.downloadUrl || file?.url || "";
}

function getHeading(file) {
  return file?.heading || "";
}

function getTitle(file) {
  return file?.title || file?.name || file?.originalName || "";
}

function getDescription(file) {
  return file?.description || "";
}

function getExtension(file) {
  const href = getHref(file);
  const qIndex = href.indexOf("?");
  const clean = qIndex === -1 ? href : href.slice(0, qIndex);
  const dot = clean.lastIndexOf(".");
  if (dot === -1) return "";
  return clean.slice(dot).toLowerCase();
}

function isImage(file) {
  const ext = getExtension(file);
  return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
}

function isVideo(file) {
  const ext = getExtension(file);
  return [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].includes(ext);
}

function isAudio(file) {
  const ext = getExtension(file);
  return [".mp3", ".wav", ".ogg", ".m4a"].includes(ext);
}

export default function EditableFileList({ files = [], onSave, isAdmin }) {
  const [items, setItems] = useState(files || []);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState("");

  // keep local state in sync
  useEffect(() => {
    setItems(files || []);
  }, [files]);

  // load media library
  useEffect(() => {
    if (!isAdmin) return;

    async function fetchFiles() {
      try {
        const data = await get("/api/files");
        if (Array.isArray(data)) {
          setAvailableFiles(data);
        } else if (Array.isArray(data?.files)) {
          setAvailableFiles(data.files);
        }
      } catch (err) {
        console.error("Failed to load media library:", err);
      }
    }

    fetchFiles();
  }, [isAdmin]);

  function handleHeadingChange(index, value) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], heading: value };
      return copy;
    });
  }

  function handleTitleChange(index, value) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], title: value };
      return copy;
    });
  }

  function handleDescriptionChange(index, value) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: value };
      return copy;
    });
  }

  function handleRemove(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAttach() {
    if (!selectedFileId) return;
    const fileDoc = availableFiles.find(
      (f) => f._id === selectedFileId || f.id === selectedFileId
    );
    if (!fileDoc) return;

    const newItem = {
      id: fileDoc._id || fileDoc.id,
      url: fileDoc.url,
      downloadUrl: fileDoc.downloadUrl,
      name: fileDoc.originalName || fileDoc.name,
      heading: "", // admin will type this
      title: fileDoc.originalName || fileDoc.name,
      description: "",
      mimeType: fileDoc.mimeType,
    };

    setItems((prev) => [...prev, newItem]);
  }

  function handleSave() {
    if (typeof onSave === "function") {
      onSave(items);
    }
    alert("Media list saved.");
  }

  function renderMedia(file) {
    const href = getHref(file);
    if (!href) return null;

    if (isImage(file)) {
      return (
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            cursor: "pointer",
            maxHeight: 220,
          }}
          onClick={() => setLightboxSrc(href)}
        >
          <LazyImage
            src={safePath(href)}
            alt={getTitle(file) || getHeading(file)}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      );
    }

    if (isVideo(file)) {
      return (
        <LazyVideo
          src={safePath(href)}
          controls
          style={{
            width: "100%",
            maxHeight: 260,
            borderRadius: 8,
            display: "block",
          }}
        >
          <source src={safePath(href)} />
          Your browser does not support the video tag.
        </LazyVideo>
      );
    }

    if (isAudio(file)) {
      return (
        <audio controls style={{ width: "100%" }}>
          <source src={safePath(href)} />
          Your browser does not support the audio element.
        </audio>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ wordBreak: "break-all" }}
      >
        Download {getTitle(file) || getHeading(file) || "file"}
      </a>
    );
  }

  const lightboxOverlay = lightboxSrc ? (
    <div
      onClick={() => setLightboxSrc("")}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90%",
          maxHeight: "90%",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxSrc("");
          }}
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            background: "#fff",
            borderRadius: "999px",
            border: "none",
            padding: "4px 8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✕
        </button>
        <LazyImage
          src={safePath(lightboxSrc)}
          alt=""
          style={{
            maxWidth: "100%",
            maxHeight: "90vh",
            display: "block",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* PUBLIC DISPLAY */}
      {items && items.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {items.map((file, index) => (
            <article
              key={file.id || file.url || index}
              style={{
                flex: "1 1 260px",
                maxWidth: "340px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: "0.75rem",
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* 1. HEADING */}
              {getHeading(file) && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {getHeading(file)}
                </h3>
              )}

              {/* 2. TITLE */}
              {getTitle(file) && (
                <h4
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  {getTitle(file)}
                </h4>
              )}

              {/* 3. DESCRIPTION */}
              {getDescription(file) && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#4b5563",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {getDescription(file)}
                </p>
              )}

              {/* 4. MEDIA / REST */}
              <div
                style={{
                  marginTop: "0.4rem",
                  borderRadius: 10,
                  padding: "0.25rem",
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(236,72,153,0.08))",
                }}
              >
                {renderMedia(file)}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
            Admin Media Manager
          </h4>

          {items.map((file, index) => (
            <div
              key={file.id || file.url || index}
              style={{
                marginBottom: "0.75rem",
                padding: "0.5rem",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              {/* HEADING */}
              <div style={{ marginBottom: 4 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Heading
                </label>
                <input
                  type="text"
                  value={file.heading || ""}
                  onChange={(e) =>
                    handleHeadingChange(index, e.target.value)
                  }
                  style={{ width: "100%", padding: 4, fontSize: "0.85rem" }}
                />
              </div>

              {/* TITLE */}
              <div style={{ marginBottom: 4 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={file.title || ""}
                  onChange={(e) =>
                    handleTitleChange(index, e.target.value)
                  }
                  style={{ width: "100%", padding: 4, fontSize: "0.85rem" }}
                />
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: 4 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={2}
                  value={file.description || ""}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  style={{ width: "100%", padding: 4, fontSize: "0.85rem" }}
                />
              </div>

              {/* INFO + REMOVE */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <small
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    maxWidth: "70%",
                    wordBreak: "break-all",
                  }}
                >
                  Linked file: {getHref(file) || "—"}
                </small>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  style={{
                    border: "none",
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                    borderRadius: 6,
                    background: "#fee2e2",
                    color: "#b91c1c",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Attach from library */}
          <div
            style={{
              marginTop: 4,
              paddingTop: 8,
              borderTop: "1px dashed #e5e7eb",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              style={{ flexGrow: 1, padding: 4 }}
            >
              <option value="">Select file from library…</option>
              {availableFiles.map((f) => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.originalName || f.name || f.url}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAttach}>
              + Attach
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={handleSave}>
              Save media list
            </button>
          </div>
        </div>
      )}

      {lightboxOverlay}
    </>
  );
}
