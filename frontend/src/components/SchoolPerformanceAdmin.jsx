// components/SchoolPerformanceAdmin.jsx
import React, { useState, useEffect } from "react";

const SchoolPerformanceAdmin = ({ user }) => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState(null);
  const [filters, setFilters] = useState({
    year: "",
    term: "",
    category: "",
    published: ""
  });

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    term: "Annual",
    category: "Academic Excellence",
    title: "",
    description: "",
    metric: "",
    ranking: "",
    published: false,
    displayOrder: 0
  });

  useEffect(() => {
    fetchPerformances();
  }, [filters]);

  const fetchPerformances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.term) params.append("term", filters.term);
      if (filters.category) params.append("category", filters.category);
      if (filters.published) params.append("published", filters.published);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/performance/admin/all?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPerformances(data.performances || []);
      } else {
        setError(data.error || "Failed to fetch performance data");
      }
    } catch (err) {
      setError("Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      term: "Annual",
      category: "Academic Excellence",
      title: "",
      description: "",
      metric: "",
      ranking: "",
      published: false,
      displayOrder: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const url = editingPerformance
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/performance/admin/${editingPerformance._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/performance/admin/create`;

      const method = editingPerformance ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingPerformance ? "Performance updated successfully!" : "Performance created successfully!");
        setShowForm(false);
        setEditingPerformance(null);
        resetForm();
        fetchPerformances();
      } else {
        setError(data.error || "Failed to save performance");
      }
    } catch (err) {
      setError("Failed to save performance");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (performance) => {
    setEditingPerformance(performance);
    setFormData({
      year: performance.year,
      term: performance.term,
      category: performance.category,
      title: performance.title,
      description: performance.description,
      metric: performance.metric || "",
      ranking: performance.ranking || "",
      published: performance.published,
      displayOrder: performance.displayOrder || 0
    });
    setShowForm(true);
  };

  const togglePublish = async (performanceId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/performance/admin/${performanceId}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ published: !currentStatus })
        }
      );

      if (response.ok) {
        setSuccess(`Performance ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
        fetchPerformances();
      }
    } catch (err) {
      setError("Failed to update publication status");
    }
  };

  const deletePerformance = async (performanceId) => {
    if (!confirm("Are you sure you want to delete this performance record? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/performance/admin/${performanceId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setSuccess("Performance deleted successfully!");
        fetchPerformances();
      }
    } catch (err) {
      setError("Failed to delete performance");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0 }}>🏆 School Performance Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingPerformance(null);
              resetForm();
            }
          }}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          {showForm ? "✖ Cancel" : "➕ Add Performance Record"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "#fee",
          border: "1px solid #fcc",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px",
          color: "#c33"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "#efe",
          border: "1px solid #cfc",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px",
          color: "#3c3"
        }}>
          {success}
        </div>
      )}

      {showForm && (
        <div style={{
          background: "white",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h2>{editingPerformance ? "Edit Performance Record" : "Add New Performance Record"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  min="2020"
                  max="2030"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Term/Period *
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                >
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="KCSE Results">KCSE Results</option>
                  <option value="National Rankings">National Rankings</option>
                  <option value="Co-curricular">Co-curricular Activities</option>
                  <option value="Competitions">Competitions & Awards</option>
                  <option value="University Admissions">University Admissions</option>
                  <option value="Other">Other Achievements</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  min="0"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
                <small style={{ color: "#666" }}>Lower numbers appear first</small>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Top 10 Nationally in KCSE"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  placeholder="Detailed description of the achievement"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Metric/Score
                </label>
                <input
                  type="text"
                  value={formData.metric}
                  onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                  placeholder="e.g., 95%, 1st Place"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Ranking Level
                </label>
                <select
                  value={formData.ranking}
                  onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">-- Select Level --</option>
                  <option value="National">National</option>
                  <option value="Regional">Regional</option>
                  <option value="County">County</option>
                  <option value="Sub-County">Sub-County</option>
                  <option value="International">International</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <span style={{ fontWeight: "600" }}>Publish immediately (visible to public)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "15px 40px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Saving..." : editingPerformance ? "Update Performance" : "Create Performance"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <input
          type="number"
          placeholder="Filter by year"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          style={{
            padding: "10px",
            border: "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px",
            width: "150px"
          }}
        />

        <select
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          style={{
            padding: "10px",
            border: "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          <option value="">All Terms</option>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
          <option value="Annual">Annual</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          style={{
            padding: "10px",
            border: "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          <option value="">All Categories</option>
          <option value="Academic Excellence">Academic Excellence</option>
          <option value="KCSE Results">KCSE Results</option>
          <option value="National Rankings">National Rankings</option>
          <option value="Co-curricular">Co-curricular</option>
          <option value="Competitions">Competitions</option>
          <option value="University Admissions">University Admissions</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={filters.published}
          onChange={(e) => setFilters({ ...filters, published: e.target.value })}
          style={{
            padding: "10px",
            border: "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Performance Table */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Year/Term</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Category</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Title</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Metric</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Ranking</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Status</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  Loading...
                </td>
              </tr>
            ) : performances.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  No performance records found
                </td>
              </tr>
            ) : (
              performances.map((performance) => (
                <tr key={performance._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontWeight: "600" }}>{performance.year}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{performance.term}</div>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: "#e3f2fd",
                      color: "#1976d2"
                    }}>
                      {performance.category}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontWeight: "600" }}>{performance.title}</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      {performance.description.substring(0, 80)}{performance.description.length > 80 ? '...' : ''}
                    </div>
                  </td>
                  <td style={{ padding: "15px", fontWeight: "600", color: "#667eea" }}>
                    {performance.metric || '-'}
                  </td>
                  <td style={{ padding: "15px" }}>
                    {performance.ranking || '-'}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: performance.published ? "#d4edda" : "#fff3cd",
                      color: performance.published ? "#155724" : "#856404"
                    }}>
                      {performance.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button
                        onClick={() => startEdit(performance)}
                        style={{
                          padding: "6px 12px",
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => togglePublish(performance._id, performance.published)}
                        style={{
                          padding: "6px 12px",
                          background: performance.published ? "#ffc107" : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        {performance.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deletePerformance(performance._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolPerformanceAdmin;
