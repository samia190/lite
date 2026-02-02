import { useState } from "react";

export default function EditablePerformanceTable({ data = [], onSave, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tableData, setTableData] = useState(data);
  const [newRow, setNewRow] = useState({
    year: "",
    meanGrade: "",
    topScore: "",
    passRate: "",
  });

  const defaultData = [
    { year: "2024", meanGrade: "C+", topScore: "A- (84 points)", passRate: "54.4%" },
    { year: "2023", meanGrade: "C+", topScore: "A- (82 points)", passRate: "64.26%" },
    { year: "2022", meanGrade: "C+", topScore: "B+ (76 points)", passRate: "53.37%" },
    { year: "2021", meanGrade: "C+", topScore: "A-(82 points)", passRate: "63.3%" },
    { year: "2020", meanGrade: "C+", topScore: "B+ (78 points)", passRate: "60%" },
  ];

  const displayData = tableData.length > 0 ? tableData : defaultData;

  const handleSave = () => {
    onSave(tableData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTableData(data.length > 0 ? data : defaultData);
    setIsEditing(false);
  };

  const handleAddRow = () => {
    if (newRow.year && newRow.meanGrade && newRow.topScore && newRow.passRate) {
      const updated = [...tableData, { ...newRow }];
      setTableData(updated);
      setNewRow({ year: "", meanGrade: "", topScore: "", passRate: "" });
    } else {
      alert("Please fill all fields to add a new row");
    }
  };

  const handleDeleteRow = (index) => {
    const updated = tableData.filter((_, i) => i !== index);
    setTableData(updated);
  };

  const handleUpdateRow = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    setTableData(updated);
  };

  return (
    <div style={{ width: "100%", marginTop: "20px" }}>
      {isAdmin && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          style={{
            marginBottom: "15px",
            padding: "10px 20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
          }}
        >
          ✏️ Edit Table
        </button>
      )}

      {isEditing && (
        <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
            }}
          >
            ✓ Save Changes
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
            }}
          >
            ✗ Cancel
          </button>
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <table
          style={{
            width: "100%",
            minWidth: "600px",
            borderCollapse: "collapse",
            background: "white"
          }}
        >
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <th style={{ 
                padding: "16px", 
                textAlign: "left", 
                color: "white",
                fontWeight: "700",
                fontSize: "13px",
                letterSpacing: "0.5px"
              }}>
                Year
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left", 
                color: "white",
                fontWeight: "700",
                fontSize: "13px",
                letterSpacing: "0.5px"
              }}>
                KCSE Mean Grade
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left", 
                color: "white",
                fontWeight: "700",
                fontSize: "13px",
                letterSpacing: "0.5px"
              }}>
                Top Score
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left", 
                color: "white",
                fontWeight: "700",
                fontSize: "13px",
                letterSpacing: "0.5px"
              }}>
                Pass Rate
              </th>
              {isEditing && (
                <th style={{ 
                  padding: "16px", 
                  textAlign: "center", 
                  color: "white",
                  fontWeight: "700",
                  fontSize: "13px",
                  letterSpacing: "0.5px"
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <tr 
                key={index} 
                style={{ 
                  borderBottom: "1px solid #e5e7eb",
                  background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => !isEditing && (e.currentTarget.style.background = "#f0f4ff")}
                onMouseLeave={(e) => !isEditing && (e.currentTarget.style.background = index % 2 === 0 ? "#ffffff" : "#f9fafb")}
              >
                {isEditing ? (
                  <>
                    <td style={{ padding: "12px" }}>
                      <input
                        type="text"
                        value={row.year}
                        onChange={(e) => handleUpdateRow(index, "year", e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px 12px", 
                          border: "2px solid #e5e7eb", 
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#667eea"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                    </td>
                    <td style={{ padding: "12px" }}>
                      <input
                        type="text"
                        value={row.meanGrade}
                        onChange={(e) => handleUpdateRow(index, "meanGrade", e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px 12px", 
                          border: "2px solid #e5e7eb", 
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#667eea"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                    </td>
                    <td style={{ padding: "12px" }}>
                      <input
                        type="text"
                        value={row.topScore}
                        onChange={(e) => handleUpdateRow(index, "topScore", e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px 12px", 
                          border: "2px solid #e5e7eb", 
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#667eea"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                    </td>
                    <td style={{ padding: "12px" }}>
                      <input
                        type="text"
                        value={row.passRate}
                        onChange={(e) => handleUpdateRow(index, "passRate", e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px 12px", 
                          border: "2px solid #e5e7eb", 
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#667eea"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      />
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteRow(index)}
                        style={{
                          padding: "6px 12px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                      {row.year}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                      {row.meanGrade}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                      {row.topScore}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                      {row.passRate}
                    </td>
                  </>
                )}
              </tr>
            ))}

            {/* Add new row form in editing mode */}
            {isEditing && (
              <tr style={{ background: "#f0f9ff", borderTop: "2px solid #667eea" }}>
                <td style={{ padding: "12px" }}>
                  <input
                    type="text"
                    placeholder="Year"
                    value={newRow.year}
                    onChange={(e) => setNewRow({ ...newRow, year: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "2px solid #bfdbfe", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white"
                    }}
                  />
                </td>
                <td style={{ padding: "12px" }}>
                  <input
                    type="text"
                    placeholder="Mean Grade"
                    value={newRow.meanGrade}
                    onChange={(e) => setNewRow({ ...newRow, meanGrade: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "2px solid #bfdbfe", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white"
                    }}
                  />
                </td>
                <td style={{ padding: "12px" }}>
                  <input
                    type="text"
                    placeholder="Top Score"
                    value={newRow.topScore}
                    onChange={(e) => setNewRow({ ...newRow, topScore: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "2px solid #bfdbfe", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white"
                    }}
                  />
                </td>
                <td style={{ padding: "12px" }}>
                  <input
                    type="text"
                    placeholder="Pass Rate"
                    value={newRow.passRate}
                    onChange={(e) => setNewRow({ ...newRow, passRate: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "2px solid #bfdbfe", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white"
                    }}
                  />
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={handleAddRow}
                    style={{
                      padding: "6px 12px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#059669"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#10b981"}
                  >
                    + Add
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {displayData.length === 0 && !isEditing && (
        <p style={{ 
          textAlign: "center", 
          color: "#6b7280", 
          marginTop: "30px",
          fontSize: "15px",
          fontStyle: "italic"
        }}>
          No performance data available yet. Click "Edit Table" to add records.
        </p>
      )}
    </div>
  );
}
