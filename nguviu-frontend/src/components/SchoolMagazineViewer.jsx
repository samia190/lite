import React, { useEffect, useState } from "react";
import { get } from "../utils/api";

export default function SchoolMagazineViewer() {
  const [magazine, setMagazine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    async function fetchMagazine() {
      try {
        setLoading(true);
        const data = await get("/api/school-magazine");
        setMagazine(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load magazine:", err);
        setLoading(false);
      }
    }

    fetchMagazine();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div className="spinner" style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #481010ff",
          borderRadius: "50%",
          width: 40,
          height: 40,
          animation: "spin 1s linear infinite",
          margin: "0 auto"
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <p style={{ marginTop: 12 }}>Loading magazine...</p>
      </div>
    );
  }

  if (!magazine || !magazine.pdfUrl) {
    return (
      <div style={{
        textAlign: "center",
        padding: "2rem",
        background: "#fff",
        borderRadius: 8,
        border: "1px dashed #ccc"
      }}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>📰</span>
        <p style={{ color: "#666", marginTop: 12 }}>
          No magazine available at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Magazine Info Card */}
      <div style={{
        background: "#fff",
        borderRadius: 8,
        padding: "1.5rem",
        marginBottom: 16,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Magazine Cover Preview */}
          <div style={{
            flex: "0 0 auto",
            width: 150,
            height: 200,
            background: "linear-gradient(135deg, #481010ff 0%, #7506065d 100%)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            position: "relative",
            overflow: "hidden"
          }}>
            {magazine.coverImage ? (
              <img
                src={magazine.coverImage}
                alt="Magazine Cover"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div style={{
                textAlign: "center",
                color: "#fff",
                padding: 16
              }}>
                <span style={{ fontSize: 48 }}>📖</span>
                <p style={{ fontSize: 12, marginTop: 8 }}>School Magazine</p>
              </div>
            )}
          </div>

          {/* Magazine Details */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#481010ff" }}>
              {magazine.title || "School Magazine"}
            </h3>
            {magazine.issue && (
              <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: 14 }}>
                <strong>Issue:</strong> {magazine.issue}
              </p>
            )}
            {magazine.date && (
              <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: 14 }}>
                <strong>Published:</strong> {new Date(magazine.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
            {magazine.description && (
              <p style={{ margin: "12px 0 0 0", color: "#444", lineHeight: 1.6 }}>
                {magazine.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => setShowPdf(!showPdf)}
            style={{
              padding: "12px 24px",
              background: "#481010ff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#6b1515";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#481010ff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>{showPdf ? "📖" : "👁️"}</span>
            {showPdf ? "Hide Magazine" : "Read Magazine"}
          </button>

          <a
            href={magazine.pdfUrl}
            download
            style={{
              padding: "12px 24px",
              background: "#fff",
              color: "#481010ff",
              border: "2px solid #481010ff",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: "bold",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>⬇️</span>
            Download PDF
          </a>

          <a
            href={magazine.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "12px 24px",
              background: "#e0ef0aff",
              color: "#333",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: "bold",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c5d309";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#e0ef0aff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>🔗</span>
            Open in New Tab
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      {showPdf && (
        <div style={{
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            background: "#481010ff",
            color: "#fff",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <strong>📖 Magazine Viewer</strong>
            <button
              onClick={() => setShowPdf(false)}
              style={{
                background: "transparent",
                border: "1px solid #fff",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Close ✕
            </button>
          </div>
          <div style={{
            position: "relative",
            width: "100%",
            height: "80vh",
            minHeight: 500
          }}>
            <iframe
              src={magazine.pdfUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none"
              }}
              title="School Magazine PDF"
            />
          </div>
          <div style={{
            background: "#f5f5f5",
            padding: "8px 16px",
            fontSize: 12,
            color: "#666",
            textAlign: "center"
          }}>
            If the PDF doesn't display properly, you can{" "}
            <a
              href={magazine.pdfUrl}
              download
              style={{ color: "#481010ff", fontWeight: "bold" }}
            >
              download it here
            </a>
            {" "}or{" "}
            <a
              href={magazine.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#481010ff", fontWeight: "bold" }}
            >
              open in a new tab
            </a>
            .
          </div>
        </div>
      )}
    </div>
  );
}
