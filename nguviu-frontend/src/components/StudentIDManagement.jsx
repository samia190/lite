import React, { useState, useEffect } from "react";
import { get, post } from "../utils/api";
import QRCode from "qrcode";
import StudentIDCard from "./StudentIDCard";

export default function StudentIDManagement({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const [status, setStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const response = await get("/api/student-verification/students");
      setStudents(response.students || []);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function generateQRCode(student) {
    try {
      setStatus("Generating QR code...");
      
      // Generate fresh token
      const response = await post(`/api/student-verification/generate-token/${student._id}`);
      
      // Create verification URL with token
      const baseUrl = window.location.origin;
      const verificationUrl = `${baseUrl}/#/verify-student?t=${encodeURIComponent(response.token)}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
      setSelectedStudent(student);
      setShowQRModal(true);
      setStatus(`QR code generated for ${student.fullName} (valid for 2 minutes)`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function issueNewCard(studentId) {
    if (!confirm("Issue new ID card? This will invalidate all previous QR codes for this student.")) {
      return;
    }
    
    try {
      setStatus("Issuing new ID card...");
      await post(`/api/student-verification/issue-card/${studentId}`);
      setStatus("New ID card issued successfully!");
      loadStudents();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function deactivateCard(studentId) {
    if (!confirm("Deactivate this student's ID card? They won't be able to verify until reactivated.")) {
      return;
    }
    
    try {
      setStatus("Deactivating ID card...");
      await post(`/api/student-verification/deactivate-card/${studentId}`);
      setStatus("ID card deactivated!");
      loadStudents();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const studentData = Object.fromEntries(formData);
    
    try {
      setStatus("Creating student...");
      await post("/api/student-verification/students", studentData);
      setStatus("Student created successfully!");
      setShowAddForm(false);
      e.target.reset();
      loadStudents();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  function downloadQRCode() {
    const link = document.createElement('a');
    link.download = `${selectedStudent.admissionNumber}_QR.png`;
    link.href = qrCodeUrl;
    link.click();
  }

  function printQRCode() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${selectedStudent.fullName}</title>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .id-card {
              width: 85.6mm;
              height: 54mm;
              border: 2px solid #000;
              border-radius: 8px;
              padding: 10px;
              box-sizing: border-box;
              page-break-after: always;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 2px solid #059669;
              padding-bottom: 5px;
            }
            .header h2 {
              margin: 0;
              font-size: 14px;
              color: #059669;
            }
            .header p {
              margin: 2px 0;
              font-size: 10px;
              color: #666;
            }
            .content {
              display: flex;
              gap: 10px;
            }
            .qr-container {
              flex-shrink: 0;
            }
            .qr-container img {
              width: 120px;
              height: 120px;
            }
            .details {
              flex: 1;
              font-size: 10px;
            }
            .details h3 {
              margin: 0 0 8px 0;
              font-size: 12px;
              color: #000;
            }
            .details p {
              margin: 3px 0;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .footer {
              text-align: center;
              font-size: 8px;
              color: #999;
              margin-top: 8px;
              padding-top: 5px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <h2>ST ANGELA NGUVIU GIRLS</h2>
              <p>Student Identification Card</p>
            </div>
            <div class="content">
              <div class="qr-container">
                <img src="${qrCodeUrl}" alt="QR Code" />
              </div>
              <div class="details">
                <h3>${selectedStudent.fullName}</h3>
                <p><span class="label">Adm No:</span> ${selectedStudent.admissionNumber}</p>
                <p><span class="label">Class:</span> ${selectedStudent.class}${selectedStudent.stream ? ' - ' + selectedStudent.stream : ''}</p>
                <p><span class="label">Year:</span> ${selectedStudent.yearOfAdmission}</p>
                <p><span class="label">Status:</span> ${selectedStudent.status}</p>
              </div>
            </div>
            <div class="footer">
              Valid until ${new Date(selectedStudent.idCardExpiryDate).toLocaleDateString()} • Scan to verify
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  if (user?.role !== "admin") {
    return <div style={{ padding: "20px" }}>Access denied - Admin only</div>;
  }

  return (
    <div style={{ padding: "20px 8px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Student ID Management</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Generate secure QR codes for student verification
        </p>
      </div>

      <div style={{ marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "12px 24px",
            background: "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          {showAddForm ? "Cancel" : "+ Add New Student"}
        </button>
        <button
          onClick={loadStudents}
          style={{
            padding: "12px 24px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {status && (
        <div style={{
          padding: "16px",
          background: status.includes("Error") ? "#fef2f2" : "#f0fdf4",
          color: status.includes("Error") ? "#dc2626" : "#059669",
          borderRadius: "8px",
          marginBottom: "24px",
          border: `1px solid ${status.includes("Error") ? "#fecaca" : "#bbf7d0"}`
        }}>
          {status}
        </div>
      )}

      {showAddForm && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "2px solid #10b981"
        }}>
          <h2 style={{ marginTop: 0, color: "#059669" }}>Add New Student</h2>
          <form onSubmit={handleAddStudent} style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            <input name="admissionNumber" placeholder="Admission Number*" required style={inputStyle} />
            <input name="firstName" placeholder="First Name*" required style={inputStyle} />
            <input name="lastName" placeholder="Last Name*" required style={inputStyle} />
            <input name="otherNames" placeholder="Other Names" style={inputStyle} />
            <input name="dateOfBirth" type="date" placeholder="Date of Birth*" required style={inputStyle} />
            <select name="gender" required style={inputStyle}>
              <option value="">Select Gender*</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            <input name="class" placeholder="Class*" required style={inputStyle} />
            <input name="stream" placeholder="Stream" style={inputStyle} />
            <input name="yearOfAdmission" type="number" placeholder="Year of Admission*" required style={inputStyle} />
            <input name="assessmentNumber" placeholder="Assessment Number (CBC)" style={inputStyle} />
            <input name="email" type="email" placeholder="Email" style={inputStyle} />
            <input name="phoneNumber" placeholder="Phone Number" style={inputStyle} />
            <input name="guardianName" placeholder="Guardian Name*" required style={inputStyle} />
            <input name="guardianPhone" placeholder="Guardian Phone*" required style={inputStyle} />
            <input name="guardianEmail" type="email" placeholder="Guardian Email" style={inputStyle} />
            <input name="photoUrl" placeholder="Photo URL" style={inputStyle} />
            <button type="submit" style={{
              gridColumn: "1 / -1",
              padding: "14px",
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}>
              Create Student & Issue ID Card
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading students...</div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {students.map(student => (
            <div key={student._id} style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: student.idCardActive ? "2px solid #10b981" : "2px solid #ef4444"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#1f2937" }}>
                    {student.fullName}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#6b7280", display: "grid", gap: "4px" }}>
                    <div><strong>Adm No:</strong> {student.admissionNumber}</div>
                    <div><strong>Class:</strong> {student.class}{student.stream ? ` - ${student.stream}` : ''}</div>
                    <div><strong>Status:</strong> <span style={{ color: student.idCardActive ? "#059669" : "#dc2626", fontWeight: "600" }}>
                      {student.idCardActive ? "Active" : "Deactivated"}
                    </span></div>
                    {student.idCardExpiryDate && (
                      <div><strong>Expires:</strong> {new Date(student.idCardExpiryDate).toLocaleDateString()}</div>
                    )}
                    <div><strong>Verifications:</strong> {student.verificationCount || 0}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowIDCard(true);
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "#8b5cf6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    🪪 View ID Card
                  </button>
                  <button
                    onClick={() => generateQRCode(student)}
                    style={{
                      padding: "10px 20px",
                      background: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    📱 Generate QR
                  </button>
                  <button
                    onClick={() => issueNewCard(student._id)}
                    style={{
                      padding: "10px 20px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    🔄 Reissue Card
                  </button>
                  {student.idCardActive ? (
                    <button
                      onClick={() => deactivateCard(student._id)}
                      style={{
                        padding: "10px 20px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      🔒 Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => issueNewCard(student._id)}
                      style={{
                        padding: "10px 20px",
                        background: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      ✅ Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedStudent && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowQRModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center"
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: "#059669" }}>Student ID QR Code</h2>
            <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>{selectedStudent.fullName}</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#6b7280" }}>
              Admission Number: <strong>{selectedStudent.admissionNumber}</strong>
            </p>
            
            <div style={{
              background: "#f9fafb",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "24px"
            }}>
              <img src={qrCodeUrl} alt="QR Code" style={{ width: "300px", height: "300px" }} />
            </div>

            <div style={{
              background: "#fef3c7",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#854d0e"
            }}>
              ⏰ <strong>Valid for 2 minutes only!</strong> Generate a new QR code when needed.
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={downloadQRCode}
                style={{
                  padding: "12px 24px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                💾 Download
              </button>
              <button
                onClick={printQRCode}
                style={{
                  padding: "12px 24px",
                  background: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                🖨️ Print ID Card
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                style={{
                  padding: "12px 24px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showIDCard && selectedStudent && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowIDCard(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <StudentIDCard student={selectedStudent} onClose={() => setShowIDCard(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  border: "2px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none"
};
