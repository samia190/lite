// components/SchoolPerformance.jsx - Public display component
import React, { useState, useEffect } from "react";

const SchoolPerformance = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/performance/public`
      );
      const data = await response.json();
      if (data.success) {
        setPerformances(data.performances);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPerformances = performances.filter(p => {
    const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
    const yearMatch = selectedYear === "All" || p.year.toString() === selectedYear;
    return categoryMatch && yearMatch;
  });

  const categories = ["All", ...new Set(performances.map(p => p.category))];
  const years = ["All", ...new Set(performances.map(p => p.year.toString()))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return b - a;
  });

  const groupedPerformances = filteredPerformances.reduce((acc, perf) => {
    const category = perf.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perf);
    return acc;
  }, {});

  return (
    <div style={{ width: "100%" }}>
      {/* Filters */}
      <div style={{
        display: "flex",
        gap: "15px",
        justifyContent: "flex-start",
        marginBottom: "25px",
        flexWrap: "wrap"
      }}>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            background: "rgba(255,255,255,0.95)",
            color: "#333",
            outline: "none"
          }}
        >
          {years.map(year => (
            <option key={year} value={year}>{year === "All" ? "All Years" : year}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            background: "rgba(255,255,255,0.95)",
            color: "#333",
            outline: "none"
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          color: "rgba(255,255,255,0.9)", 
          fontSize: "16px" 
        }}>
          Loading performance data...
        </div>
      ) : filteredPerformances.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "12px",
          color: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)"
        }}>
          <p style={{ fontSize: "16px", margin: 0 }}>No performance records found for the selected filters.</p>
        </div>
      ) : (
        <>
          {/* Performance Table */}
          <div style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{
                  background: "rgba(0,0,0,0.05)",
                  color: "#333"
                }}>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid rgba(102,126,234,0.3)" }}>
                    Year/Term
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid rgba(102,126,234,0.3)" }}>
                    Category
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid rgba(102,126,234,0.3)" }}>
                    Achievement
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid rgba(102,126,234,0.3)" }}>
                    Metric
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid rgba(102,126,234,0.3)" }}>
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformances.map((perf, index) => (
                  <tr
                    key={perf._id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f0f4ff";
                      e.currentTarget.style.transform = "scale(1.01)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? "#ffffff" : "#f9fafb";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "700", fontSize: "15px", color: "#1f2937" }}>
                        {perf.year}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                        {perf.term}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "5px 12px",
                        borderRadius: "16px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: getCategoryColor(perf.category).bg,
                        color: getCategoryColor(perf.category).text,
                        display: "inline-block"
                      }}>
                        {perf.category}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937", marginBottom: "4px" }}>
                        {perf.title}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>
                        {perf.description}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      {perf.metric ? (
                        <span style={{
                          fontSize: "17px",
                          fontWeight: "700",
                          color: "#667eea"
                        }}>
                          {perf.metric}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      {perf.ranking ? (
                        <span style={{
                          padding: "5px 12px",
                          borderRadius: "16px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: getRankingColor(perf.ranking).bg,
                          color: getRankingColor(perf.ranking).text,
                          display: "inline-block"
                        }}>
                          {perf.ranking}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Helper functions for colors
const getCategoryColor = (category) => {
  const colors = {
    "Academic Excellence": { bg: "#e3f2fd", text: "#1976d2" },
    "KCSE Results": { bg: "#f3e5f5", text: "#7b1fa2" },
    "National Rankings": { bg: "#fff3e0", text: "#e65100" },
    "Co-curricular": { bg: "#e8f5e9", text: "#2e7d32" },
    "Competitions": { bg: "#fce4ec", text: "#c2185b" },
    "University Admissions": { bg: "#e0f2f1", text: "#00695c" },
    "Other": { bg: "#f5f5f5", text: "#616161" }
  };
  return colors[category] || colors["Other"];
};

const getRankingColor = (ranking) => {
  const colors = {
    "National": { bg: "#ffd700", text: "#8b6914" },
    "International": { bg: "#ff6b6b", text: "#ffffff" },
    "Regional": { bg: "#4ecdc4", text: "#ffffff" },
    "County": { bg: "#95e1d3", text: "#1a5653" },
    "Sub-County": { bg: "#dfe6e9", text: "#2d3436" }
  };
  return colors[ranking] || { bg: "#e0e0e0", text: "#666" };
};

export default SchoolPerformance;
