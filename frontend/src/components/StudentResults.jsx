// components/StudentResults.jsx
import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  PerformanceDashboard, 
  TrendBadge, 
  RiskIndicator,
  ProgressChart,
  SubjectRadarChart,
  RecommendationsCard,
  PredictionCard
} from "./PerformanceCharts";

const StudentResults = ({ user }) => {
  const [step, setStep] = useState("verification"); // verification, results
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentName: "",
    dateOfBirth: "",
    assessmentNumber: ""
  });
  const [studentData, setStudentData] = useState(null);
  const [results, setResults] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/verify-and-fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStudentData(data.student);
      setResults(data.results);
      setLatestResult(data.latestResult);
      setStep("results");

    } catch (err) {
      setError(err.message || "Failed to verify student details");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (result) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // School header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("kangaru-girls KANGARU GIRLS' SENIOR SCHOOL", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("P.O. Box 123, KANGARU GIRLS- Kenya", pageWidth / 2, 28, { align: "center" });
    doc.text("Tel: 0712-345-678 | Email: info@kangaru.ac.ke", pageWidth / 2, 35, { align: "center" });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(15, 40, pageWidth - 15, 40);

    // Report title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT ACADEMIC REPORT", pageWidth / 2, 50, { align: "center" });
    
    // Curriculum badge
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const curriculumText = result.curriculum === "CBC" ? "CBC System (Competency-Based)" : "8-4-4 System";
    doc.text(curriculumText, pageWidth / 2, 56, { align: "center" });

    // Student information
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let yPos = 64;
    
    doc.text(`Name: ${result.studentName}`, 15, yPos);
    doc.text(`Admission No: ${result.admissionNumber}`, pageWidth - 15, yPos, { align: "right" });
    yPos += 7;
    
    doc.text(`Class: ${result.class}${result.stream ? ' ' + result.stream : ''}`, 15, yPos);
    doc.text(`Term: ${result.term}`, pageWidth - 15, yPos, { align: "right" });
    yPos += 7;
    
    doc.text(`Year: ${result.year}`, 15, yPos);
    doc.text(`Exam: ${result.examType}`, pageWidth - 15, yPos, { align: "right" });
    yPos += 10;

    // Subject results table
    const tableColumns = result.curriculum === "CBC" 
      ? ['#', 'Subject', 'Marks', 'Grade', 'Competency Level', 'Remarks']
      : ['#', 'Subject', 'Marks', 'Grade', 'Remarks'];

    const tableData = result.subjects.map((subject, index) => {
      const baseRow = [
        index + 1,
        subject.subjectName,
        subject.marks,
        subject.grade
      ];
      
      if (result.curriculum === "CBC") {
        baseRow.push(subject.competencyLevel || "N/A");
      }
      
      baseRow.push(subject.remarks || "");
      return baseRow;
    });

    doc.autoTable({
      startY: yPos,
      head: [tableColumns],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'left'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Summary section
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 15, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Marks: ${result.totalMarks}`, 15, yPos);
    doc.text(`Average: ${result.averageMarks.toFixed(2)}%`, 80, yPos);
    doc.text(`Grade: ${result.overallGrade}`, 140, yPos);
    yPos += 7;

    if (result.position && result.outOf) {
      doc.text(`Position: ${result.position} out of ${result.outOf}`, 15, yPos);
      yPos += 7;
    }

    // Attendance
    if (result.attendance) {
      yPos += 3;
      doc.text(`Attendance: ${result.attendance.daysPresent || 0}/${result.attendance.totalDays || 0} days present`, 15, yPos);
      yPos += 7;
    }

    // Conduct
    if (result.conduct && result.conduct.grade) {
      doc.text(`Conduct: ${result.conduct.grade}`, 15, yPos);
      if (result.conduct.remarks) {
        doc.text(` - ${result.conduct.remarks}`, 50, yPos);
      }
      yPos += 10;
    }

    // Remarks
    if (result.teacherRemarks) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Class Teacher's Remarks:", 15, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const teacherLines = doc.splitTextToSize(result.teacherRemarks, pageWidth - 30);
      doc.text(teacherLines, 15, yPos);
      yPos += teacherLines.length * 5 + 5;
    }

    if (result.headTeacherRemarks) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Head Teacher's Remarks:", 15, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const headLines = doc.splitTextToSize(result.headTeacherRemarks, pageWidth - 30);
      doc.text(headLines, 15, yPos);
      yPos += headLines.length * 5 + 10;
    }

    // Signature section
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text("_______________________", 15, yPos);
    doc.text("_______________________", pageWidth - 70, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text("Class Teacher's Signature", 15, yPos);
    doc.text("Head Teacher's Signature", pageWidth - 70, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: "center" });

    // Download the PDF
    doc.save(`${result.studentName}_${result.term}_${result.year}_Report.pdf`);
  };

  if (!user || user.role !== "student") {
    return (
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          padding: "30px",
          maxWidth: "500px"
        }}>
          <h2 style={{ color: "#856404", marginBottom: "15px" }}>⚠️ Student Access Only</h2>
          <p style={{ color: "#856404", margin: 0 }}>
            This page is only accessible to students. Please log in with a student account to view your results.
          </p>
        </div>
      </div>
    );
  }

  if (step === "verification") {
    return (
      <div style={{
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        minHeight: "60vh"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "30px",
          borderRadius: "12px 12px 0 0",
          textAlign: "center"
        }}>
          <h1 style={{ margin: 0, fontSize: "28px" }}>📄 Student Results Portal</h1>
          <p style={{ margin: "10px 0 0 0", opacity: 0.9 }}>
            Access and download your academic results
          </p>
        </div>

        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ marginTop: 0, color: "#333" }}>Verify Your Identity</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Please enter your details below to access your results. CBC students must also provide their assessment number.
          </p>

          {error && (
            <div style={{
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: "6px",
              padding: "15px",
              marginBottom: "20px",
              color: "#c33"
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333"
              }}>
                Admission Number *
              </label>
              <input
                type="text"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g., ADM/2024/001"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "16px",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333"
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name as registered"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "16px",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333"
              }}>
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "16px",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333"
              }}>
                Assessment Number <span style={{ fontSize: "12px", color: "#666" }}>(For CBC Students)</span>
              </label>
              <input
                type="text"
                name="assessmentNumber"
                value={formData.assessmentNumber}
                onChange={handleInputChange}
                placeholder="Enter if you're a CBC student"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "16px",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "transform 0.2s",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
              }}
              onMouseDown={(e) => !loading && (e.target.style.transform = "scale(0.98)")}
              onMouseUp={(e) => e.target.style.transform = "scale(1)"}
            >
              {loading ? "Verifying..." : "Verify & View Results"}
            </button>
          </form>

          <div style={{
            marginTop: "25px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#666"
          }}>
            <strong>Note:</strong> Your results are confidential. Make sure you're using this on a secure device.
          </div>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div style={{
      padding: "40px 20px",
      maxWidth: "1000px",
      margin: "0 auto",
      minHeight: "60vh"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "30px",
        borderRadius: "12px",
        marginBottom: "30px",
        textAlign: "center"
      }}>
        <h1 style={{ margin: 0, fontSize: "28px" }}>✅ Verification Successful</h1>
        <p style={{ margin: "10px 0 0 0", opacity: 0.9, fontSize: "18px" }}>
          Welcome, {studentData?.name}
        </p>
        <p style={{ margin: "5px 0 0 0", opacity: 0.8, fontSize: "14px" }}>
          {studentData?.class} {studentData?.stream} • {studentData?.admissionNumber}
        </p>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ margin: 0, color: "#333" }}>Your Results ({results.length})</h2>
        <button
          onClick={() => {
            setStep("verification");
            setStudentData(null);
            setResults([]);
            setFormData({ admissionNumber: "", studentName: "", dateOfBirth: "", assessmentNumber: "" });
          }}
          style={{
            padding: "10px 20px",
            background: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🔒 Lock Results
        </button>
      </div>

      {results.length === 0 ? (
        <div style={{
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#856404", marginTop: 0 }}>No Results Available</h3>
          <p style={{ color: "#856404", margin: 0 }}>
            Your results have not been published yet. Please check back later.
          </p>
        </div>
      ) : !showHistory && latestResult ? (
        // Latest Result View
        <div>
          <div style={{
            background: "white",
            border: "2px solid #667eea",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 4px 16px rgba(102, 126, 234, 0.15)",
            marginBottom: "25px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "25px",
              flexWrap: "wrap",
              gap: "15px"
            }}>
              <div>
                <div style={{
                  display: "inline-block",
                  background: "#e3f2fd",
                  color: "#1976d2",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px"
                }}>
                  📌 LATEST RESULT
                </div>
                <h2 style={{ margin: "5px 0", color: "#333", fontSize: "26px" }}>
                  {latestResult.term} {latestResult.year}
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  {latestResult.examType} • {latestResult.curriculum || "8-4-4"}
                  {latestResult.isUploadedPdf && (
                    <span style={{
                      marginLeft: "10px",
                      background: "#fce4ec",
                      color: "#c2185b",
                      padding: "2px 8px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}>
                      📄 PDF Uploaded
                    </span>
                  )}
                </p>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "12px 28px",
                borderRadius: "24px",
                fontWeight: "700",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}>
                {latestResult.overallGrade}
              </div>
            </div>

            {/* Performance Metrics */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "25px",
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "8px"
            }}>
              {latestResult.totalMarks > 0 && (
                <div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Total Marks</div>
                  <div style={{ fontSize: "22px", fontWeight: "600", color: "#333" }}>{latestResult.totalMarks}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Average</div>
                <div style={{ fontSize: "22px", fontWeight: "600", color: "#333" }}>
                  {latestResult.averageMarks ? latestResult.averageMarks.toFixed(1) : 'N/A'}%
                </div>
              </div>
              {latestResult.position && latestResult.outOf && (
                <div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Position</div>
                  <div style={{ fontSize: "22px", fontWeight: "600", color: "#333" }}>{latestResult.position}/{latestResult.outOf}</div>
                </div>
              )}
              {latestResult.subjects && latestResult.subjects.length > 0 && (
                <div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Subjects</div>
                  <div style={{ fontSize: "22px", fontWeight: "600", color: "#333" }}>{latestResult.subjects.length}</div>
                </div>
              )}
            </div>

            {/* Performance Insights Panel */}
            {latestResult.subjects && latestResult.subjects.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                border: "1px solid #bbdefb",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "25px"
              }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                  gap: "10px"
                }}>
                  <h3 style={{ margin: 0, color: "#1976d2", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    📊 Performance Insights
                  </h3>
                  
                  {/* Overall Trend Badge */}
                  {latestResult.historicalAnalysis?.overallTrend && (
                    <TrendBadge trend={latestResult.historicalAnalysis.overallTrend} size="medium" />
                  )}
                </div>

                {/* Risk Indicator for high/medium risk */}
                {latestResult.riskLevel && latestResult.riskLevel !== 'low' && (
                  <RiskIndicator 
                    riskLevel={latestResult.riskLevel} 
                    riskFactors={latestResult.riskFactors} 
                  />
                )}

                {/* Prediction Card */}
                {latestResult.projectedNextTermAverage && (
                  <PredictionCard 
                    currentAverage={latestResult.averageMarks}
                    projectedAverage={latestResult.projectedNextTermAverage}
                  />
                )}

                {latestResult.performanceChange !== undefined && latestResult.performanceChange !== null && (
                  <div style={{
                    padding: "10px 15px",
                    background: "white",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "24px" }}>
                      {latestResult.performanceChange > 0 ? "📈" : latestResult.performanceChange < 0 ? "📉" : "➡️"}
                    </span>
                    <div>
                      <div style={{ fontWeight: "600", color: latestResult.performanceChange > 0 ? "#2e7d32" : latestResult.performanceChange < 0 ? "#c62828" : "#666" }}>
                        {latestResult.performanceChange > 0 ? "Improved" : latestResult.performanceChange < 0 ? "Declined" : "Maintained"} 
                        {latestResult.performanceChange !== 0 && ` by ${Math.abs(latestResult.performanceChange).toFixed(1)}%`}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Previous average: {latestResult.previousTermAverage?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* First Result Analysis */}
                {latestResult.firstResultAnalysis?.isFirstResult && (
                  <div style={{
                    padding: "12px 15px",
                    background: "#e8f5e9",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#2e7d32", marginBottom: "8px" }}>
                      🎯 First Term Analysis:
                    </div>
                    <div style={{ fontSize: "13px", color: "#555" }}>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Strongest:</strong> {latestResult.firstResultAnalysis.strongestSubject || 'N/A'}
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Needs Focus:</strong> {latestResult.firstResultAnalysis.weakestSubject || 'N/A'}
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Balance Score:</strong> {latestResult.firstResultAnalysis.balanceScore || 0}% 
                        <span style={{ fontSize: "11px", color: "#888", marginLeft: "5px" }}>
                          (How evenly distributed your marks are)
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Consistently Weak/Strong Subjects (from history) */}
                {latestResult.consistentlyWeakSubjects && latestResult.consistentlyWeakSubjects.length > 0 && (
                  <div style={{
                    padding: "10px 15px",
                    background: "#ffebee",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#c62828", marginBottom: "8px" }}>
                      🔴 Consistently Needs Improvement:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {latestResult.consistentlyWeakSubjects.map((subject, idx) => (
                        <span key={idx} style={{
                          background: "#ffcdd2",
                          color: "#b71c1c",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {latestResult.weakSubjects && latestResult.weakSubjects.length > 0 && (
                  <div style={{
                    padding: "10px 15px",
                    background: "#fff3e0",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#e65100", marginBottom: "8px" }}>
                      ⚠️ Areas Needing Attention (This Term):
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {latestResult.weakSubjects.map((subject, idx) => (
                        <span key={idx} style={{
                          background: "#ffccbc",
                          color: "#bf360c",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {latestResult.consistentlyStrongSubjects && latestResult.consistentlyStrongSubjects.length > 0 && (
                  <div style={{
                    padding: "10px 15px",
                    background: "#e8f5e9",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#2e7d32", marginBottom: "8px" }}>
                      🌟 Consistently Strong:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {latestResult.consistentlyStrongSubjects.map((subject, idx) => (
                        <span key={idx} style={{
                          background: "#a5d6a7",
                          color: "#1b5e20",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {latestResult.strongSubjects && latestResult.strongSubjects.length > 0 && (
                  <div style={{
                    padding: "10px 15px",
                    background: "#e8f5e9",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#2e7d32", marginBottom: "8px" }}>
                      ⭐ Strong Areas (This Term):
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {latestResult.strongSubjects.map((subject, idx) => (
                        <span key={idx} style={{
                          background: "#c8e6c9",
                          color: "#1b5e20",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improved/Declined Subjects */}
                {latestResult.improvedSubjects && latestResult.improvedSubjects.length > 0 && (
                  <div style={{
                    padding: "10px 15px",
                    background: "#e3f2fd",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#1565c0", marginBottom: "8px" }}>
                      📈 Most Improved:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {latestResult.improvedSubjects.map((subject, idx) => (
                        <span key={idx} style={{
                          background: "#bbdefb",
                          color: "#0d47a1",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {latestResult.improvementAreas && latestResult.improvementAreas.length > 0 && (
                  <div style={{
                    padding: "10px 15px",
                    background: "white",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#1976d2", marginBottom: "8px" }}>
                      📝 Study Recommendations:
                    </div>
                    <ul style={{ margin: "8px 0 0 20px", padding: 0, color: "#555", fontSize: "14px", lineHeight: "1.8" }}>
                      {latestResult.improvementAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Toggle Detailed Analysis Button */}
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: showDetailedAnalysis ? "#667eea" : "white",
                    color: showDetailedAnalysis ? "white" : "#667eea",
                    border: "2px solid #667eea",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    marginTop: "10px"
                  }}
                >
                  {showDetailedAnalysis ? "📊 Hide Detailed Analysis" : "📊 View Detailed Analysis & Charts"}
                </button>
              </div>
            )}

            {/* Detailed Analysis with Charts */}
            {showDetailedAnalysis && latestResult.subjects && latestResult.subjects.length > 0 && (
              <div style={{ marginBottom: "25px" }}>
                <PerformanceDashboard result={latestResult} showDetailed={true} />
              </div>
            )}

            {/* Smart Recommendations (if available and not showing detailed) */}
            {!showDetailedAnalysis && latestResult.recommendations && latestResult.recommendations.length > 0 && (
              <div style={{ marginBottom: "25px" }}>
                <RecommendationsCard recommendations={latestResult.recommendations.slice(0, 3)} />
              </div>
            )}

            {/* Download Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {latestResult.isUploadedPdf && latestResult.uploadedPdfUrl && (
                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${latestResult.uploadedPdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "14px",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "center",
                    textDecoration: "none",
                    display: "block",
                    boxShadow: "0 4px 12px rgba(240, 147, 251, 0.4)"
                  }}
                >
                  📄 View Official PDF
                </a>
              )}
              {latestResult.subjects && latestResult.subjects.length > 0 && (
                <button
                  onClick={() => generatePDF(latestResult)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "14px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                  }}
                >
                  📥 Download Detailed Report
                </button>
              )}
            </div>
          </div>

          {/* View History Button */}
          {results.length > 1 && (
            <button
              onClick={() => setShowHistory(true)}
              style={{
                width: "100%",
                padding: "16px",
                background: "#f8f9fa",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                color: "#666",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#e9ecef";
                e.target.style.borderColor = "#667eea";
                e.target.style.color = "#667eea";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#f8f9fa";
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.color = "#666";
              }}
            >
              📚 View Results History ({results.length - 1} past result{results.length - 1 !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      ) : (
        // History View or All Results
        <div>
          {showHistory && results.length > 1 && (
            <button
              onClick={() => setShowHistory(false)}
              style={{
                marginBottom: "20px",
                padding: "12px 24px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              ← Back to Latest Result
            </button>
          )}

          <div style={{ display: "grid", gap: "20px" }}>
            {results.map((result, index) => (
              <div
                key={result._id || index}
                style={{
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "25px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.3s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "15px"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "20px" }}>
                      {result.term} {result.year}
                    </h3>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      {result.examType} • {result.curriculum || "8-4-4"}
                      {result.isUploadedPdf && (
                        <span style={{
                          marginLeft: "10px",
                          background: "#fce4ec",
                          color: "#c2185b",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: "600"
                        }}>
                          📄 PDF
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "8px 20px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "18px"
                  }}>
                    Grade: {result.overallGrade}
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  {result.totalMarks > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Total Marks</div>
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>{result.totalMarks}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Average</div>
                    <div style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>
                      {result.averageMarks ? result.averageMarks.toFixed(1) : 'N/A'}%
                    </div>
                  </div>
                  {result.position && result.outOf && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Position</div>
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>{result.position}/{result.outOf}</div>
                    </div>
                  )}
                  {result.subjects && result.subjects.length > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Subjects</div>
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>{result.subjects.length}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {result.isUploadedPdf && result.uploadedPdfUrl && (
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${result.uploadedPdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        minWidth: "150px",
                        padding: "12px",
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        textAlign: "center",
                        textDecoration: "none",
                        display: "block"
                      }}
                    >
                      📄 View PDF
                    </a>
                  )}
                  {result.subjects && result.subjects.length > 0 && (
                    <button
                      onClick={() => generatePDF(result)}
                      style={{
                        flex: 1,
                        minWidth: "150px",
                        padding: "12px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      📥 Download Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResults;
