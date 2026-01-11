// components/ResultsManagement.jsx
import React, { useState, useEffect } from "react";

const ResultsManagement = ({ user }) => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [filters, setFilters] = useState({
    term: "",
    year: "",
    published: "",
    curriculum: ""
  });

  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentName: "",
    class: "",
    stream: "",
    assessmentNumber: "",
    curriculum: "8-4-4",
    term: "Term 1",
    year: new Date().getFullYear(),
    examType: "End of Term",
    subjects: [],
    totalMarks: 0,
    averageMarks: 0,
    overallGrade: "",
    position: "",
    outOf: "",
    attendance: {
      daysPresent: "",
      daysAbsent: "",
      totalDays: ""
    },
    conduct: {
      grade: "",
      remarks: ""
    },
    teacherRemarks: "",
    headTeacherRemarks: "",
    published: false
  });

  const [currentSubject, setCurrentSubject] = useState({
    subjectName: "",
    marks: "",
    grade: "",
    remarks: "",
    competencyLevel: ""
  });

  useEffect(() => {
    fetchResults();
    fetchStudents();
  }, [filters]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.term) params.append("term", filters.term);
      if (filters.year) params.append("year", filters.year);
      if (filters.published) params.append("published", filters.published);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/admin/all?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || "Failed to fetch results");
      }
    } catch (err) {
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student-verification/students`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const handleStudentSelect = (e) => {
    const admissionNumber = e.target.value;
    const student = students.find(s => s.admissionNumber === admissionNumber);
    if (student) {
      setFormData({
        ...formData,
        admissionNumber: student.admissionNumber,
        studentName: student.fullName || `${student.firstName} ${student.lastName}`,
        class: student.class || "",
        stream: student.stream || "",
        assessmentNumber: student.assessmentNumber || ""
      });
    }
  };

  const addSubject = () => {
    if (!currentSubject.subjectName || !currentSubject.marks || !currentSubject.grade) {
      alert("Please fill in subject name, marks, and grade");
      return;
    }

    setFormData({
      ...formData,
      subjects: [...formData.subjects, { ...currentSubject }]
    });

    setCurrentSubject({
      subjectName: "",
      marks: "",
      grade: "",
      remarks: "",
      competencyLevel: ""
    });

    // Auto-calculate totals
    calculateTotals([...formData.subjects, currentSubject]);
  };

  const removeSubject = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      subjects: newSubjects
    });
    calculateTotals(newSubjects);
  };

  const calculateTotals = (subjects) => {
    if (subjects.length === 0) return;

    const total = subjects.reduce((sum, s) => sum + parseFloat(s.marks || 0), 0);
    const average = total / subjects.length;

    let grade = "F";
    
    // Different grading for 8-4-4 vs CBC
    if (formData.curriculum === "CBC") {
      // CBC Senior School uses same letter grades but emphasizes competency
      if (average >= 80) grade = "A";
      else if (average >= 75) grade = "A-";
      else if (average >= 70) grade = "B+";
      else if (average >= 65) grade = "B";
      else if (average >= 60) grade = "B-";
      else if (average >= 55) grade = "C+";
      else if (average >= 50) grade = "C";
      else if (average >= 45) grade = "C-";
      else if (average >= 40) grade = "D+";
      else if (average >= 35) grade = "D";
      else if (average >= 30) grade = "D-";
      else if (average >= 25) grade = "E";
    } else {
      // 8-4-4 System
      if (average >= 80) grade = "A";
      else if (average >= 75) grade = "A-";
      else if (average >= 70) grade = "B+";
      else if (average >= 65) grade = "B";
      else if (average >= 60) grade = "B-";
      else if (average >= 55) grade = "C+";
      else if (average >= 50) grade = "C";
      else if (average >= 45) grade = "C-";
      else if (average >= 40) grade = "D+";
      else if (average >= 35) grade = "D";
      else if (average >= 30) grade = "D-";
      else if (average >= 25) grade = "E";
    }

    setFormData({
      ...formData,
      subjects,
      totalMarks: total,
      averageMarks: average,
      overallGrade: grade
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const url = editingResult
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/admin/${editingResult._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/admin/create`;

      const method = editingResult ? "PUT" : "POST";

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
        setSuccess(editingResult ? "Result updated successfully!" : "Result created successfully!");
        setShowForm(false);
        setEditingResult(null);
        resetForm();
        fetchResults();
      } else {
        setError(data.error || "Failed to save result");
      }
    } catch (err) {
      setError("Failed to save result");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file) {
      setError("Please select a PDF file");
      setLoading(false);
      return;
    }

    if (file.type !== 'application/pdf') {
      setError("Only PDF files are allowed");
      setLoading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setLoading(false);
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('pdfFile', file);
    uploadFormData.append('admissionNumber', formData.admissionNumber);
    uploadFormData.append('studentName', formData.studentName);
    uploadFormData.append('class', formData.class);
    uploadFormData.append('stream', formData.stream);
    uploadFormData.append('assessmentNumber', formData.assessmentNumber || '');
    uploadFormData.append('curriculum', formData.curriculum);
    uploadFormData.append('term', formData.term);
    uploadFormData.append('year', formData.year);
    uploadFormData.append('examType', formData.examType);
    uploadFormData.append('overallGrade', formData.overallGrade);
    uploadFormData.append('averageMarks', formData.averageMarks || 0);
    uploadFormData.append('published', formData.published);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/admin/upload-pdf`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: uploadFormData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("PDF result uploaded successfully!");
        setShowPdfUpload(false);
        resetForm();
        fetchResults();
      } else {
        setError(data.error || "Failed to upload PDF");
      }
    } catch (err) {
      setError("Failed to upload PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (resultId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/admin/${resultId}/publish`,
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
        setSuccess(`Result ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
        fetchResults();
      }
    } catch (err) {
      setError("Failed to update publication status");
    }
  };

  const deleteResult = async (resultId) => {
    if (!confirm("Are you sure you want to delete this result? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/admin/${resultId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setSuccess("Result deleted successfully!");
        fetchResults();
      }
    } catch (err) {
      setError("Failed to delete result");
    }
  };

  const resetForm = () => {
    setFormData({
      admissionNumber: "",
      studentName: "",
      class: "",
      stream: "",
      assessmentNumber: "",
      curriculum: "8-4-4",
      term: "Term 1",
      year: new Date().getFullYear(),
      examType: "End of Term",
      subjects: [],
      totalMarks: 0,
      averageMarks: 0,
      overallGrade: "",
      position: "",
      outOf: "",
      attendance: {
        daysPresent: "",
        daysAbsent: "",
        totalDays: ""
      },
      conduct: {
        grade: "",
        remarks: ""
      },
      teacherRemarks: "",
      headTeacherRemarks: "",
      published: false
    });
  };

  const startEdit = (result) => {
    setEditingResult(result);
    setFormData({
      ...result,
      attendance: result.attendance || { daysPresent: "", daysAbsent: "", totalDays: "" },
      conduct: result.conduct || { grade: "", remarks: "" }
    });
    setShowForm(true);
  };

  if (!user || user.role !== "admin") {
    return <div style={{ padding: "40px", textAlign: "center" }}>Access denied - Admin only</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <h1 style={{ margin: 0 }}>📊 Results Management</h1>
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowPdfUpload(false);
              if (!showForm) {
                setEditingResult(null);
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
            {showForm ? "✖ Cancel" : "➕ Add New Result"}
          </button>

          <button
            onClick={() => {
              setShowPdfUpload(!showPdfUpload);
              setShowForm(false);
              if (!showPdfUpload) {
                setEditingResult(null);
                resetForm();
              }
            }}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {showPdfUpload ? "✖ Cancel" : "📄 Upload PDF Result"}
          </button>
        </div>
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
          <h2>{editingResult ? "Edit Result" : "Create New Result"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Select Student *
                </label>
                <select
                  onChange={handleStudentSelect}
                  value={formData.admissionNumber}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student._id} value={student.admissionNumber}>
                      {student.fullName || `${student.firstName} ${student.lastName}`} ({student.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Assessment Number {formData.curriculum === "CBC" && <span style={{ color: "red" }}>*</span>}
                </label>
                <input
                  type="text"
                  value={formData.assessmentNumber}
                  onChange={(e) => setFormData({ ...formData, assessmentNumber: e.target.value })}
                  required={formData.curriculum === "CBC"}
                  placeholder={formData.curriculum === "CBC" ? "Required for CBC students" : "Optional"}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Curriculum System *
                </label>
                <select
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                >
                  <option value="8-4-4">8-4-4 System</option>
                  <option value="CBC">CBC System (Competency-Based)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Term *</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Exam Type *</label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                >
                  <option value="Mid Term">Mid Term</option>
                  <option value="End of Term">End of Term</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Mock Exam">Mock Exam</option>
                </select>
              </div>
            </div>

            <h3>Subjects & Marks</h3>
            <div style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: formData.curriculum === "CBC" ? "2fr 1fr 1fr 1.5fr 2fr auto" : "2fr 1fr 1fr 2fr auto", 
                gap: "10px", 
                marginBottom: "15px" 
              }}>
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={currentSubject.subjectName}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, subjectName: e.target.value })}
                  style={{ padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
                <input
                  type="number"
                  placeholder="Marks"
                  value={currentSubject.marks}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, marks: e.target.value })}
                  style={{ padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
                <input
                  type="text"
                  placeholder="Grade"
                  value={currentSubject.grade}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, grade: e.target.value })}
                  style={{ padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
                {formData.curriculum === "CBC" && (
                  <select
                    value={currentSubject.competencyLevel}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, competencyLevel: e.target.value })}
                    style={{ padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px", fontSize: "13px" }}
                  >
                    <option value="">Competency Level</option>
                    <option value="Exceeding Expectations">Exceeding Expectations</option>
                    <option value="Meeting Expectations">Meeting Expectations</option>
                    <option value="Approaching Expectations">Approaching Expectations</option>
                    <option value="Below Expectations">Below Expectations</option>
                  </select>
                )}
                <input
                  type="text"
                  placeholder="Remarks (optional)"
                  value={currentSubject.remarks}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, remarks: e.target.value })}
                  style={{ padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
                <button
                  type="button"
                  onClick={addSubject}
                  style={{
                    padding: "10px 20px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Add
                </button>
              </div>

              {formData.subjects.length > 0 && (
                <div>
                  <h4>Added Subjects ({formData.subjects.length})</h4>
                  {formData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px",
                        background: "white",
                        borderRadius: "6px",
                        marginBottom: "8px"
                      }}
                    >
                      <span>
                        <strong>{subject.subjectName}</strong>: {subject.marks} ({subject.grade})
                        {subject.competencyLevel && formData.curriculum === "CBC" && (
                          <span style={{ marginLeft: "10px", fontSize: "12px", color: "#666" }}>
                            • {subject.competencyLevel}
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        style={{
                          padding: "6px 12px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "15px", padding: "15px", background: "white", borderRadius: "6px" }}>
                <div><strong>Total Marks:</strong> {formData.totalMarks}</div>
                <div><strong>Average:</strong> {formData.averageMarks.toFixed(2)}%</div>
                <div><strong>Overall Grade:</strong> {formData.overallGrade}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Position</label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Out Of</label>
                <input
                  type="number"
                  value={formData.outOf}
                  onChange={(e) => setFormData({ ...formData, outOf: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Days Present</label>
                <input
                  type="number"
                  value={formData.attendance.daysPresent}
                  onChange={(e) => setFormData({
                    ...formData,
                    attendance: { ...formData.attendance, daysPresent: e.target.value }
                  })}
                  style={{ width: "100%", padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Total Days</label>
                <input
                  type="number"
                  value={formData.attendance.totalDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    attendance: { ...formData.attendance, totalDays: e.target.value }
                  })}
                  style={{ width: "100%", padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Class Teacher's Remarks</label>
              <textarea
                value={formData.teacherRemarks}
                onChange={(e) => setFormData({ ...formData, teacherRemarks: e.target.value })}
                rows="3"
                style={{ width: "100%", padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Head Teacher's Remarks</label>
              <textarea
                value={formData.headTeacherRemarks}
                onChange={(e) => setFormData({ ...formData, headTeacherRemarks: e.target.value })}
                rows="3"
                style={{ width: "100%", padding: "10px", border: "2px solid #e0e0e0", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  style={{ width: "20px", height: "20px" }}
                />
                <span style={{ fontWeight: "600" }}>Publish immediately (students can view)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || formData.subjects.length === 0}
              style={{
                padding: "14px 32px",
                background: loading || formData.subjects.length === 0 ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading || formData.subjects.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Saving..." : editingResult ? "Update Result" : "Create Result"}
            </button>
          </form>
        </div>
      )}

      {/* PDF Upload Form */}
      {showPdfUpload && (
        <div style={{
          background: "white",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h2>📄 Upload PDF Result</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Upload a pre-generated PDF result slip for a student. You'll need to provide student details and metadata.
          </p>

          <form onSubmit={handlePdfUpload}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              {/* Student Selection */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Select Student *
                </label>
                <select
                  value={formData.admissionNumber}
                  onChange={handleStudentSelect}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student.admissionNumber} value={student.admissionNumber}>
                      {student.admissionNumber} - {student.name} ({student.class} {student.stream})
                    </option>
                  ))}
                </select>
              </div>

              {/* Curriculum */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Curriculum *
                </label>
                <select
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                >
                  <option value="8-4-4">8-4-4 System</option>
                  <option value="CBC">CBC (Competency-Based)</option>
                </select>
              </div>

              {/* Term */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Term *
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
                </select>
              </div>

              {/* Year */}
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

              {/* Exam Type */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Exam Type *
                </label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                >
                  <option value="End of Term">End of Term</option>
                  <option value="Mid Term">Mid Term</option>
                  <option value="Mock">Mock Exam</option>
                  <option value="Final">Final Exam</option>
                </select>
              </div>

              {/* Overall Grade */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Overall Grade *
                </label>
                <input
                  type="text"
                  value={formData.overallGrade}
                  onChange={(e) => setFormData({ ...formData, overallGrade: e.target.value.toUpperCase() })}
                  required
                  placeholder="e.g., A, B+, C"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              {/* Average Marks */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Average Marks
                </label>
                <input
                  type="number"
                  value={formData.averageMarks}
                  onChange={(e) => setFormData({ ...formData, averageMarks: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Optional"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              {/* PDF File */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Upload PDF File * (Max 10MB)
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  accept="application/pdf"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              {/* Published */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <span style={{ fontWeight: "600" }}>Publish immediately (students can view)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "15px 40px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Uploading..." : "📤 Upload PDF Result"}
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
        </select>

        <input
          type="number"
          placeholder="Year"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          style={{
            padding: "10px",
            border: "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px",
            width: "120px"
          }}
        />

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

        <select
          value={filters.curriculum}
          onChange={(e) => setFilters({ ...filters, curriculum: e.target.value })}
          style={{
            padding: "10px",
            border: "2px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          <option value="">All Curricula</option>
          <option value="8-4-4">8-4-4 System</option>
          <option value="CBC">CBC System</option>
        </select>
      </div>

      {/* Results List */}
      <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Student</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Class</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Curriculum</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Type</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Term/Year</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Grade</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Average</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Status</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  Loading results...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  No results found
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontWeight: "600" }}>{result.studentName}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{result.admissionNumber}</div>
                  </td>
                  <td style={{ padding: "15px" }}>
                    {result.class} {result.stream}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: result.curriculum === "CBC" ? "#e3f2fd" : "#fff3e0",
                      color: result.curriculum === "CBC" ? "#1976d2" : "#e65100"
                    }}>
                      {result.curriculum || "8-4-4"}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: result.isUploadedPdf ? "#fce4ec" : "#e8f5e9",
                      color: result.isUploadedPdf ? "#c2185b" : "#2e7d32"
                    }}>
                      {result.isUploadedPdf ? "📄 PDF" : "✍️ Manual"}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div>{result.term} {result.year}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{result.examType}</div>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center", fontWeight: "600", fontSize: "18px" }}>
                    {result.overallGrade}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    {result.averageMarks.toFixed(1)}%
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: result.published ? "#d4edda" : "#fff3cd",
                      color: result.published ? "#155724" : "#856404"
                    }}>
                      {result.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => startEdit(result)}
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
                        onClick={() => togglePublish(result._id, result.published)}
                        style={{
                          padding: "6px 12px",
                          background: result.published ? "#ffc107" : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        {result.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteResult(result._id)}
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

export default ResultsManagement;
