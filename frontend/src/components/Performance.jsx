import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import EditableText from "../components/EditableText";
import EditableFileList from "../components/EditableFileList";
import SchoolPerformance from "../components/SchoolPerformance";
import EditablePerformanceTable from "../components/EditablePerformanceTable";
import PerformanceAnalytics from "../components/PerformanceAnalytics";

export default function Performance({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  // Default performance data
  const defaultPerformanceData = [
    { year: "2024", meanGrade: "C+", topScore: "A- (84 points)", passRate: "68.5%" },
    { year: "2023", meanGrade: "C+", topScore: "A- (82 points)", passRate: "64.26%" },
    { year: "2022", meanGrade: "C+", topScore: "B+ (76 points)", passRate: "59.8%" },
    { year: "2021", meanGrade: "C+", topScore: "B+ (74 points)", passRate: "56.3%" },
    { year: "2020", meanGrade: "C", topScore: "B (70 points)", passRate: "52.1%" },
  ];

  // Get performance data - use saved data if available, otherwise use default
  const performanceData = content.performanceTable && content.performanceTable.length > 0 
    ? content.performanceTable 
    : defaultPerformanceData;

  useEffect(() => {
    get("/api/content/performance")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load performance content."));
  }, []);

  function updateSection(section, value) {
    patch(`/api/content/performance/${section}`, { value })
      .then(() => setContent((prev) => ({ ...prev, [section]: value })))
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  return (
    <section style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "40px 20px",
      background: "#ffffff"
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "50px",
        paddingBottom: "30px",
        borderBottom: "3px solid #667eea"
      }}>
        <EditableHeading
          value={content.title || "School Performance"}
          onSave={(val) => updateSection("title", val)}
          isAdmin={user?.role === "admin"}
          level={2}
        />

        <div style={{ 
          maxWidth: "800px", 
          margin: "20px auto 0",
          fontSize: "1.1rem",
          lineHeight: "1.8",
          color: "#4b5563"
        }}>
          <EditableText
            value={
              content.intro ||
              "We are proud of our students' achievements and continually strive for academic excellence. Our performance reflects the dedication of our learners, teachers, and parents."
            }
            onSave={(val) => updateSection("intro", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>

      {/* School Performance Overview Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "30px",
        marginBottom: "50px",
        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.2)"
      }}>
        <h3 style={{ 
          color: "#ffffff", 
          marginTop: 0,
          marginBottom: "25px",
          fontSize: "1.8rem",
          fontWeight: "600"
        }}>
          📊 Academic Excellence Overview
        </h3>
        <SchoolPerformance />
      </div>

      {/* Historical Performance Section */}
      <div style={{ 
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "30px",
        marginBottom: "40px",
        border: "1px solid #e5e7eb"
      }}>
        <EditableSubheading
          value={content.resultsHeading || "Historical KCSE Performance"}
          onSave={(val) => updateSection("resultsHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
        />

        <EditablePerformanceTable
          data={performanceData}
          onSave={(tableData) => updateSection("performanceTable", tableData)}
          isAdmin={user?.role === "admin"}
        />
      </div>

      {/* Performance Analytics Section */}
      <div style={{ 
        background: "white",
        borderRadius: "12px",
        padding: "30px",
        marginBottom: "40px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{ 
          margin: "0 0 25px 0",
          fontSize: "1.8rem",
          fontWeight: "600",
          color: "#1f2937",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          📊 Performance Analytics & Trends
        </h3>
        <PerformanceAnalytics data={performanceData} />
      </div>

      {/* Progress Highlights Section */}
      <div style={{ 
        background: "#fff7ed",
        borderRadius: "12px",
        padding: "30px",
        marginBottom: "40px",
        borderLeft: "5px solid #f59e0b"
      }}>
        <EditableSubheading
          value={content.highlightsHeading || "Progress Highlights"}
          onSave={(val) => updateSection("highlightsHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
        />
        
        <div style={{ 
          fontSize: "1.05rem",
          lineHeight: "1.9",
          color: "#374151"
        }}>
          <EditableText
            value={
              content.highlights ||
              `• Consistent improvement in mean grade over the past 5 years\n• Over 90% of students qualify for university admission\n• Strong performance in STEM subjects and languages`
            }
            onSave={(val) => updateSection("highlights", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>

      {/* Downloadable Reports Section */}
      <div style={{ 
        background: "#ecfdf5",
        borderRadius: "12px",
        padding: "30px",
        marginBottom: "20px",
        borderLeft: "5px solid #10b981"
      }}>
        <EditableSubheading
          value={content.reportsHeading || "Downloadable Reports"}
          onSave={(val) => updateSection("reportsHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
        />
        
        <EditableFileList
          files={
            content.reports || [
              { name: "2021 Performance Report", url: "/files/downloads/Biology" },
              { name: "2023 Performance Report", url: "/files/performance-report-2023.pdf" }
            ]
          }
          onSave={(files) => updateSection("reports", files)}
          isAdmin={user?.role === "admin"}
        />
      </div>

      {error && (
        <div style={{ 
          background: "#fef2f2",
          color: "#dc2626",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "20px",
          border: "1px solid #fecaca"
        }}>
          {error}
        </div>
      )}
    </section>
  );
}
