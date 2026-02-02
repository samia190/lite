import { useEffect, useMemo, useState } from "react";
import { safePath } from "../utils/paths";
import LazyImage from "../components/LazyImage";
import { get, patch, upload } from "../utils/api";

/**
 * This management page stores EVERYTHING inside /api/content/performance sections,
 * so you don't need new backend endpoints for CRUD records.
 *
 * Saved sections used:
 * - title, intro, resultsHeading, results (array)
 * - highlightsHeading, highlights
 * - reportsHeading, reports (array)
 * - chartsHeading, charts (array)
 *
 * Each result row: { id, year, meanGrade, topScore, passRate, visible }
 * Each report: { id, name, url, visible }
 * Each chart: { id, name, url, visible }
 */

const DEFAULTS = {
  title: "School Performance",
  intro:
    "We are proud of our students' achievements and continually strive for academic excellence. Our performance reflects the dedication of our learners, teachers, and parents.",
  resultsHeading: "Recent Exam Results",
  results: [
    {
      id: "r-2024",
      year: "2024",
      meanGrade: "B+",
      topScore: "A (84 points)",
      passRate: "92%",
      visible: true,
    },
    {
      id: "r-2023",
      year: "2023",
      meanGrade: "B",
      topScore: "A- (78 points)",
      passRate: "88%",
      visible: true,
    },
    {
      id: "r-2022",
      year: "2022",
      meanGrade: "B-",
      topScore: "B+ (72 points)",
      passRate: "85%",
      visible: true,
    },
  ],
  highlightsHeading: "Progress Highlights",
  highlights:
    "• Consistent improvement in mean grade over the past 3 years\n• Over 90% of students qualify for university admission\n• Strong performance in STEM subjects and languages",
  reportsHeading: "Downloadable Reports",
  reports: [
    { id: "rep-2021", name: "2021 Performance Report", url: "/files/downloads/Biology", visible: true },
    { id: "rep-2023", name: "2023 Performance Report", url: "/files/performance-report-2023.pdf", visible: true },
  ],
  chartsHeading: "Charts / Images",
  charts: [],
};

function safeArray(val) {
  return Array.isArray(val) ? val : [];
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toCSV(rows) {
  const header = ["Year", "KCSE Mean Grade", "Top Score", "Pass Rate", "Visible"];
  const escape = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [r.year, r.meanGrade, r.topScore, r.passRate, r.visible ? "Yes" : "No"].map(escape).join(",")
  );
  return [header.map(escape).join(","), ...body].join("\n");
}

function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PerformanceManagement({ user }) {
  // Admin check removed - this component is already inside admin-only dashboard

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [content, setContent] = useState(DEFAULTS);

  // Forms
  const [newResult, setNewResult] = useState({
    year: "",
    meanGrade: "",
    topScore: "",
    passRate: "",
    visible: true,
  });

  const [newReport, setNewReport] = useState({ name: "", url: "", visible: true });
  const [newChart, setNewChart] = useState({ name: "", url: "", visible: true });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    get("/api/content/performance")
      .then((data) => {
        if (!mounted) return;

        const merged = {
          ...DEFAULTS,
          ...(data || {}),
          results: safeArray(data?.results).length ? data.results : DEFAULTS.results,
          reports: safeArray(data?.reports).length ? data.reports : DEFAULTS.reports,
          charts: safeArray(data?.charts),
        };

        // ensure each item has id + visible
        merged.results = merged.results.map((r) => ({
          id: r.id || uid("r"),
          year: r.year ?? "",
          meanGrade: r.meanGrade ?? "",
          topScore: r.topScore ?? "",
          passRate: r.passRate ?? "",
          visible: typeof r.visible === "boolean" ? r.visible : true,
        }));

        merged.reports = merged.reports.map((f) => ({
          id: f.id || uid("rep"),
          name: f.name ?? "",
          url: f.url ?? "",
          visible: typeof f.visible === "boolean" ? f.visible : true,
        }));

        merged.charts = merged.charts.map((c) => ({
          id: c.id || uid("chart"),
          name: c.name ?? "",
          url: c.url ?? "",
          visible: typeof c.visible === "boolean" ? c.visible : true,
        }));

        setContent(merged);
        setError("");
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load performance content.");
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  async function saveSection(section, value) {
    setSaving(true);
    try {
      await patch(`/api/content/performance/${section}`, { value });
      setContent((prev) => ({ ...prev, [section]: value }));
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to save content.");
    } finally {
      setSaving(false);
    }
  }

  // ===== Results CRUD =====
  async function addResult() {
    if (!newResult.year.trim()) return alert("Year is required.");
    const row = { id: uid("r"), ...newResult };
    const next = [...safeArray(content.results), row];
    await saveSection("results", next);
    setNewResult({ year: "", meanGrade: "", topScore: "", passRate: "", visible: true });
  }

  async function updateResult(id, patchObj) {
    const next = safeArray(content.results).map((r) => (r.id === id ? { ...r, ...patchObj } : r));
    await saveSection("results", next);
  }

  async function deleteResult(id) {
    if (!confirm("Delete this performance record?")) return;
    const next = safeArray(content.results).filter((r) => r.id !== id);
    await saveSection("results", next);
  }

  // ===== Reports CRUD =====
  async function addReport() {
    if (!newReport.name.trim() || !newReport.url.trim()) return alert("Name and URL are required.");
    const file = { id: uid("rep"), ...newReport };
    const next = [...safeArray(content.reports), file];
    await saveSection("reports", next);
    setNewReport({ name: "", url: "", visible: true });
  }

  async function updateReport(id, patchObj) {
    const next = safeArray(content.reports).map((f) => (f.id === id ? { ...f, ...patchObj } : f));
    await saveSection("reports", next);
  }

  async function deleteReport(id) {
    if (!confirm("Delete this report link?")) return;
    const next = safeArray(content.reports).filter((f) => f.id !== id);
    await saveSection("reports", next);
  }

  // ===== Charts/Images CRUD =====
  async function addChart() {
    if (!newChart.name.trim() || !newChart.url.trim()) return alert("Name and URL are required.");
    const item = { id: uid("chart"), ...newChart };
    const next = [...safeArray(content.charts), item];
    await saveSection("charts", next);
    setNewChart({ name: "", url: "", visible: true });
  }

  async function updateChart(id, patchObj) {
    const next = safeArray(content.charts).map((c) => (c.id === id ? { ...c, ...patchObj } : c));
    await saveSection("charts", next);
  }

  async function deleteChart(id) {
    if (!confirm("Delete this chart/image item?")) return;
    const next = safeArray(content.charts).filter((c) => c.id !== id);
    await saveSection("charts", next);
  }

  // Optional upload attempt (only if your backend supports POST /api/upload)
  async function uploadFileToServer(file) {
    // This is safe: if endpoint doesn't exist, it will fail and we fallback to manual URL.
    const form = new FormData();
    form.append("file", file);
    const data = await upload("/api/upload", form);
    if (!data?.url) throw new Error("Upload response missing url");
    return data.url;
  }

  async function handleChartFilePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFileToServer(file);
      setNewChart((prev) => ({ ...prev, url, name: prev.name || file.name }));
    } catch (err) {
      console.warn(err);
      alert(
        "Upload endpoint not available (or failed). You can still paste a hosted image URL (e.g. from your server, Drive, or CDN)."
      );
    } finally {
      e.target.value = "";
    }
  }

  const visibleResults = useMemo(
    () => safeArray(content.results).filter((r) => r.visible !== false),
    [content.results]
  );

  function exportCSV() {
    const csv = toCSV(safeArray(content.results));
    downloadText("performance-results.csv", csv, "text/csv");
  }

  function printToPDF() {
    // Browser print dialog -> user can "Save as PDF"
    window.print();
  }

  return (
    <section style={{ padding: 20 }}>
      <h2>Performance Management</h2>
      <p>Manage all content, records, files, and charts for the Performance page.</p>

      {loading && <p style={{ color: "#555" }}>Loading performance data…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {saving && <p style={{ color: "#555" }}>Saving…</p>}

      {!loading && (
        <>
          {/* ===== Page Text Content ===== */}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, marginBottom: 18 }}>
            <h3>Page Content</h3>

            <label style={{ display: "block", marginTop: 10 }}>
              <strong>Title</strong>
              <input
                value={content.title || ""}
                onChange={(e) => setContent((p) => ({ ...p, title: e.target.value }))}
                onBlur={() => saveSection("title", content.title || "")}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              <strong>Intro</strong>
              <textarea
                value={content.intro || ""}
                onChange={(e) => setContent((p) => ({ ...p, intro: e.target.value }))}
                onBlur={() => saveSection("intro", content.intro || "")}
                rows={4}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              <strong>Results Heading</strong>
              <input
                value={content.resultsHeading || ""}
                onChange={(e) => setContent((p) => ({ ...p, resultsHeading: e.target.value }))}
                onBlur={() => saveSection("resultsHeading", content.resultsHeading || "")}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              <strong>Highlights Heading</strong>
              <input
                value={content.highlightsHeading || ""}
                onChange={(e) => setContent((p) => ({ ...p, highlightsHeading: e.target.value }))}
                onBlur={() => saveSection("highlightsHeading", content.highlightsHeading || "")}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              <strong>Highlights (use new lines for bullets)</strong>
              <textarea
                value={content.highlights || ""}
                onChange={(e) => setContent((p) => ({ ...p, highlights: e.target.value }))}
                onBlur={() => saveSection("highlights", content.highlights || "")}
                rows={4}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              <strong>Reports Heading</strong>
              <input
                value={content.reportsHeading || ""}
                onChange={(e) => setContent((p) => ({ ...p, reportsHeading: e.target.value }))}
                onBlur={() => saveSection("reportsHeading", content.reportsHeading || "")}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              <strong>Charts Heading</strong>
              <input
                value={content.chartsHeading || "Charts / Images"}
                onChange={(e) => setContent((p) => ({ ...p, chartsHeading: e.target.value }))}
                onBlur={() => saveSection("chartsHeading", content.chartsHeading || "Charts / Images")}
                style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>
          </div>

          {/* ===== Results Table CRUD ===== */}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Performance Records</h3>
              <button
                onClick={exportCSV}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
              >
                Export CSV/Excel
              </button>
              <button
                onClick={printToPDF}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
              >
                Print to PDF
              </button>
            </div>

            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table className="table" style={{ width: "100%", minWidth: 760 }}>
                <thead>
                  <tr>
                    <th>Visible</th>
                    <th>Year</th>
                    <th>KCSE Mean Grade</th>
                    <th>Top Score</th>
                    <th>Pass Rate</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeArray(content.results).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={r.visible !== false}
                          onChange={(e) => updateResult(r.id, { visible: e.target.checked })}
                        />
                      </td>
                      <td>
                        <input
                          value={r.year}
                          onChange={(e) => updateResult(r.id, { year: e.target.value })}
                          style={{ width: 120, padding: 6 }}
                        />
                      </td>
                      <td>
                        <input
                          value={r.meanGrade}
                          onChange={(e) => updateResult(r.id, { meanGrade: e.target.value })}
                          style={{ width: 160, padding: 6 }}
                        />
                      </td>
                      <td>
                        <input
                          value={r.topScore}
                          onChange={(e) => updateResult(r.id, { topScore: e.target.value })}
                          style={{ width: 220, padding: 6 }}
                        />
                      </td>
                      <td>
                        <input
                          value={r.passRate}
                          onChange={(e) => updateResult(r.id, { passRate: e.target.value })}
                          style={{ width: 120, padding: 6 }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => deleteResult(r.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={newResult.visible}
                        onChange={(e) => setNewResult((p) => ({ ...p, visible: e.target.checked }))}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Year"
                        value={newResult.year}
                        onChange={(e) => setNewResult((p) => ({ ...p, year: e.target.value }))}
                        style={{ width: 120, padding: 6 }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Mean Grade"
                        value={newResult.meanGrade}
                        onChange={(e) => setNewResult((p) => ({ ...p, meanGrade: e.target.value }))}
                        style={{ width: 160, padding: 6 }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Top Score"
                        value={newResult.topScore}
                        onChange={(e) => setNewResult((p) => ({ ...p, topScore: e.target.value }))}
                        style={{ width: 220, padding: 6 }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Pass Rate"
                        value={newResult.passRate}
                        onChange={(e) => setNewResult((p) => ({ ...p, passRate: e.target.value }))}
                        style={{ width: 120, padding: 6 }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={addResult}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 10, color: "#666" }}>
              Visible rows: <strong>{visibleResults.length}</strong> / {safeArray(content.results).length}
            </p>
          </div>

          {/* ===== Reports CRUD ===== */}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, marginBottom: 18 }}>
            <h3>Reports / Downloads</h3>

            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", minWidth: 700 }}>
                <thead>
                  <tr>
                    <th>Visible</th>
                    <th>Name</th>
                    <th>URL</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeArray(content.reports).map((f) => (
                    <tr key={f.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={f.visible !== false}
                          onChange={(e) => updateReport(f.id, { visible: e.target.checked })}
                        />
                      </td>
                      <td>
                        <input
                          value={f.name}
                          onChange={(e) => updateReport(f.id, { name: e.target.value })}
                          style={{ width: "100%", padding: 6 }}
                        />
                      </td>
                      <td>
                        <input
                          value={f.url}
                          onChange={(e) => updateReport(f.id, { url: e.target.value })}
                          style={{ width: "100%", padding: 6 }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => deleteReport(f.id)}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={newReport.visible}
                        onChange={(e) => setNewReport((p) => ({ ...p, visible: e.target.checked }))}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Report name"
                        value={newReport.name}
                        onChange={(e) => setNewReport((p) => ({ ...p, name: e.target.value }))}
                        style={{ width: "100%", padding: 6 }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="https://... or /files/..."
                        value={newReport.url}
                        onChange={(e) => setNewReport((p) => ({ ...p, url: e.target.value }))}
                        style={{ width: "100%", padding: 6 }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={addReport}
                        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== Charts/Images CRUD ===== */}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
            <h3>Charts / Images</h3>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <input type="file" accept="image/*" onChange={handleChartFilePick} />
              <span style={{ color: "#666" }}>
                If upload fails, just paste a hosted image URL in the field below.
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", minWidth: 700 }}>
                <thead>
                  <tr>
                    <th>Visible</th>
                    <th>Name</th>
                    <th>Image/Chart URL</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeArray(content.charts).map((c) => (
                    <tr key={c.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={c.visible !== false}
                          onChange={(e) => updateChart(c.id, { visible: e.target.checked })}
                        />
                      </td>
                      <td>
                        <input
                          value={c.name}
                          onChange={(e) => updateChart(c.id, { name: e.target.value })}
                          style={{ width: "100%", padding: 6 }}
                        />
                      </td>
                      <td>
                        <input
                          value={c.url}
                          onChange={(e) => updateChart(c.id, { url: e.target.value })}
                          style={{ width: "100%", padding: 6 }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => deleteChart(c.id)}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={newChart.visible}
                        onChange={(e) => setNewChart((p) => ({ ...p, visible: e.target.checked }))}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Chart name"
                        value={newChart.name}
                        onChange={(e) => setNewChart((p) => ({ ...p, name: e.target.value }))}
                        style={{ width: "100%", padding: 6 }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="https://... or /files/..."
                        value={newChart.url}
                        onChange={(e) => setNewChart((p) => ({ ...p, url: e.target.value }))}
                        style={{ width: "100%", padding: 6 }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={addChart}
                        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {safeArray(content.charts).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
                {safeArray(content.charts)
                  .filter((c) => c.visible !== false)
                  .map((c) => (
                    <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.name}</div>
                      {c.url ? (
                        <LazyImage src={safePath(c.url)} alt={c.name} style={{ width: "100%", borderRadius: 8, display: "block" }} />
                      ) : (
                        <div style={{ color: "#777" }}>No URL</div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
