import React, { useState, useEffect } from "react";
import EditableFileList from "./EditableFileList";
import { get, upload as apiUpload, del } from "../utils/api";
import Loader from "./Loader";

export default function FeeStructure({ user }) {
  const [content, setContent] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [downloadName, setDownloadName] = useState("");
  const [downloadFile, setDownloadFile] = useState(null);
  const [uploadingDownload, setUploadingDownload] = useState(false);

  // Load both content and downloads in parallel for faster loading
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        
        // Parallel API calls for faster loading
        const [contentData, downloadsData] = await Promise.all([
          get("/api/content/feestructure").catch(() => null),
          get("/api/downloads").catch(() => [])
        ]);
        
        setContent(contentData || null);
        setDownloads(downloadsData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load fee structure content.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDownloadSubmit(e) {
    e.preventDefault();
    setError("");
    if (!downloadName || !downloadFile) {
      setError("Name and file are required to upload.");
      return;
    }

      try {
        setUploadingDownload(true);
        const fd = new FormData();
        fd.append("name", downloadName);
        fd.append("file", downloadFile);

        const newFile = await apiUpload("/api/downloads", fd);
        setDownloads((prev) => [...prev, newFile]);
        setDownloadName("");
        setDownloadFile(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to upload fee structure file.");
      } finally {
        setUploadingDownload(false);
      }
  }

  if (loading) {
    return (
      <section style={{ padding: "20px 8px" }}>
        <h1>Fee Structure</h1>
        <Loader message="Loading fee structure…" />
      </section>
    );
  }

  const title = content?.title || "Fee Structure";
  const intro =
    content?.body ||
    content?.intro ||
    "Here you will find the current official fee structures and related payment information.";
  const notes =
    content?.notes ||
    content?.data?.notes ||
    "Please ensure you use the most recent approved fee structure when making payments.";
  const paymentInfo =
    content?.paymentInfo ||
    content?.data?.paymentInfo ||
    "Payment details (bank, paybill, account number) will be provided in the documents below or by the school office.";

  const attachments = content?.attachments || [];

  // Ensure attachments link to the server-side download endpoint to force download
  const downloadableAttachments = (attachments || []).map((att) => {
    if (!att) return att;
    // If attachment is local (relative url) and we have content id, point to download proxy
    if (content?._id && att._id && !(att.downloadUrl || "").startsWith("http")) {
      return { ...att, downloadUrl: `/api/content/${content._id}/attachments/${att._id}/download` };
    }
    return att;
  });

  return (
    <section style={{ padding: "20px 8px", textAlign: "left" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem", textAlign: "left" }}>{title}</h1>
        <p style={{ fontSize: "0.95rem", margin: 0, textAlign: "left" }}>{intro}</p>
      </div>

      {error && <p style={{ color: "red", textAlign: "left" }}>{error}</p>}

      <section style={{ marginTop: "1rem", textAlign: "left" }}>
        <h2 style={{ textAlign: "left" }}>Important Notes</h2>
        <p style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>{notes}</p>
      </section>

      <section style={{ marginTop: "1rem", textAlign: "left" }}>
        <h2 style={{ textAlign: "left" }}>Payment Information</h2>
        <p style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>{paymentInfo}</p>
      </section>

      {/* Attachments managed via Admin -> Fee Structure */}
      <section style={{ marginTop: "1.5rem", textAlign: "left" }}>
        <h2 style={{ textAlign: "left" }}>Fee Structure Documents &amp; Media</h2>
        {downloadableAttachments.length === 0 && (
          <p>
            No fee structure documents have been uploaded yet. Please check back
            later or contact the school office.
          </p>
        )}
        {downloadableAttachments.length > 0 && (
          <EditableFileList files={downloadableAttachments} isAdmin={false} />
        )}
      </section>

      {/* Separate "Downloadable files" section using /api/downloads */}
      <section style={{ marginTop: "2rem", textAlign: "left" }}>
        <h2 style={{ textAlign: "left" }}>Downloadable Files</h2>
        <p style={{ fontSize: "0.9rem", textAlign: "left" }}>
          Official fee breakdown PDFs, bank details, and other important
          documents.
        </p>

        {user?.role === "teacher" && (
          <form
            onSubmit={handleDownloadSubmit}
            encType="multipart/form-data"
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Upload Fee Document (Teacher Only)</h3>
            <div style={{ marginBottom: "0.5rem" }}>
              <input
                placeholder="File name (e.g. 2025 Form 1 Fee Structure)"
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value)}
                style={{ width: "100%", padding: 6 }}
              />
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <input
                type="file"
                onChange={(e) => setDownloadFile(e.target.files[0])}
              />
            </div>
            <button type="submit" disabled={uploadingDownload}>
              {uploadingDownload ? "Uploading…" : "Upload Downloadable File"}
            </button>
          </form>
        )}

        {downloads.length === 0 && (
          <p>No additional downloadable files have been uploaded yet.</p>
        )}
        {downloads.length > 0 && (
          <ul>
            {downloads.map((file) => (
              <li key={file._id} style={{ marginBottom: "0.25rem" }}>
                <a href={file.fileUrl} download>
                  {file.name}
                </a>
                {user?.role === "teacher" && (
                  <button
                    onClick={async () => {
                      try {
                        await del(`/api/downloads/${file._id}`);
                        setDownloads((prev) => prev.filter((f) => f._id !== file._id));
                      } catch (err) {
                        console.error(err);
                        setError("Failed to delete file.");
                      }
                    }}
                    style={{ marginLeft: 10, color: "red" }}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
