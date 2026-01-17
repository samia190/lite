import React, { useEffect, useState, useRef } from "react";
import { get } from "../utils/api";

export default function SchoolMagazineViewer() {
  const [magazine, setMagazine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render PDF page
  async function renderPage(pageNum) {
    if (!pdfDoc || rendering) return;
    
    setRendering(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Error rendering page:', err);
    } finally {
      setRendering(false);
    }
  }

  // Load PDF document
  async function loadPdf(url) {
    if (!window.pdfjsLib) {
      console.error('PDF.js not loaded');
      return;
    }

    try {
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Wait a moment for canvas to be ready
      setTimeout(() => renderPage(1), 100);
    } catch (err) {
      console.error('Error loading PDF:', err);
    }
  }

  // Handle page changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0 && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc, scale]);

  // Load PDF when viewer is opened
  useEffect(() => {
    if (showPdf && magazine?.pdfUrl && !pdfDoc) {
      loadPdf(magazine.pdfUrl);
    }
  }, [showPdf, magazine]);

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
          {/* Viewer Header */}
          <div style={{
            background: "#481010ff",
            color: "#fff",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}>
            <strong>📖 Magazine Viewer</strong>
            
            {/* Page Controls */}
            {totalPages > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.1)",
                padding: "6px 12px",
                borderRadius: 6
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || rendering}
                  style={{
                    background: currentPage <= 1 ? "#666" : "#e0ef0aff",
                    color: currentPage <= 1 ? "#999" : "#333",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: 14
                  }}
                >
                  ← Prev
                </button>
                
                <span style={{ fontSize: 14, fontWeight: "bold" }}>
                  Page {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || rendering}
                  style={{
                    background: currentPage >= totalPages ? "#666" : "#e0ef0aff",
                    color: currentPage >= totalPages ? "#999" : "#333",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: 14
                  }}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                disabled={rendering}
                style={{
                  background: "#fff",
                  color: "#333",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: "bold"
                }}
                title="Zoom Out"
              >
                −
              </button>
              <span style={{ fontSize: 13 }}>{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(Math.min(3, scale + 0.25))}
                disabled={rendering}
                style={{
                  background: "#fff",
                  color: "#333",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: "bold"
                }}
                title="Zoom In"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                setShowPdf(false);
                setPdfDoc(null);
                setCurrentPage(1);
              }}
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

          {/* PDF Canvas Display */}
          <div 
            ref={containerRef}
            style={{
              position: "relative",
              width: "100%",
              minHeight: 500,
              maxHeight: "80vh",
              overflow: "auto",
              background: "#f5f5f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "20px"
            }}
          >
            {rendering && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(255,255,255,0.9)",
                padding: "20px",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 10
              }}>
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
                <p style={{ marginTop: 12, fontSize: 14 }}>Loading page...</p>
              </div>
            )}
            
            <canvas 
              ref={canvasRef}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                background: "#fff",
                maxWidth: "100%",
                height: "auto"
              }}
            />
          </div>

          {/* Page Navigation Footer */}
          {totalPages > 0 && (
            <div style={{
              background: "#f5f5f5",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              borderTop: "1px solid #ddd"
            }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || rendering}
                style={{
                  padding: "6px 12px",
                  background: currentPage === 1 ? "#ddd" : "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: 13
                }}
              >
                First
              </button>
              
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                style={{
                  width: 60,
                  padding: "6px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  textAlign: "center",
                  fontSize: 13
                }}
              />
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || rendering}
                style={{
                  padding: "6px 12px",
                  background: currentPage === totalPages ? "#ddd" : "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: 13
                }}
              >
                Last
              </button>
            </div>
          )}

          {/* Help Text */}
          <div style={{
            background: "#f5f5f5",
            padding: "8px 16px",
            fontSize: 12,
            color: "#666",
            textAlign: "center",
            borderTop: "1px solid #ddd"
          }}>
            Use the navigation buttons to browse pages, or{" "}
            <a
              href={magazine.pdfUrl}
              download
              style={{ color: "#481010ff", fontWeight: "bold" }}
            >
              download the full PDF
            </a>
            {" "}to read offline.
          </div>
        </div>
      )}
    </div>
  );
}
