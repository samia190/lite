import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function StudentIDCard({ student, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showBack, setShowBack] = useState(false);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    generateQRCode();
    generateBarcode();
  }, [student]);

  async function generateQRCode() {
    try {
      const verificationData = JSON.stringify({
        admissionNumber: student.admissionNumber,
        name: student.fullName,
        dob: student.dateOfBirth
      });
      
      const qrDataUrl = await QRCode.toDataURL(verificationData, {
        errorCorrectionLevel: 'H',
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  }

  function generateBarcode() {
    try {
      const canvas = document.getElementById('barcode-canvas');
      if (canvas) {
        JsBarcode(canvas, student.admissionNumber, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 5
        });
      }
    } catch (err) {
      console.error("Error generating barcode:", err);
    }
  }

  async function downloadAsPDF() {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98] // Credit card size
    });

    // Capture front
    const frontCanvas = await html2canvas(frontRef.current, {
      scale: 3,
      backgroundColor: '#ffffff'
    });
    const frontImg = frontCanvas.toDataURL('image/png');
    pdf.addImage(frontImg, 'PNG', 0, 0, 85.6, 53.98);

    // Add new page for back
    pdf.addPage();
    const backCanvas = await html2canvas(backRef.current, {
      scale: 3,
      backgroundColor: '#ffffff'
    });
    const backImg = backCanvas.toDataURL('image/png');
    pdf.addImage(backImg, 'PNG', 0, 0, 85.6, 53.98);

    pdf.save(`${student.fullName}_ID_Card.pdf`);
  }

  const cardStyle = {
    width: '856px',
    height: '540px',
    border: '8px solid #CC0000',
    borderRadius: '20px',
    background: '#FFFFFF',
    position: 'relative',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    margin: '20px auto',
    overflow: 'hidden'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setShowBack(!showBack)}
          style={{
            padding: '10px 30px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {showBack ? 'Show Front' : 'Show Back'}
        </button>
        <button
          onClick={downloadAsPDF}
          style={{
            padding: '10px 30px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Download PDF
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 30px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>

      {/* FRONT OF CARD */}
      <div ref={frontRef} style={{ ...cardStyle, display: showBack ? 'none' : 'block' }}>
        {/* Top curved border */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '30px',
          background: '#CC0000',
          borderRadius: '0 0 50% 50%',
          zIndex: 1
        }} />

        {/* Header */}
        <div style={{ paddingTop: '35px', textAlign: 'center' }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#CC0000', 
            fontWeight: '700',
            letterSpacing: '1px'
          }}>
            DIOCESE OF EMBU
          </div>
          <div style={{ 
            fontSize: '24px', 
            color: '#CC0000', 
            fontWeight: '900',
            lineHeight: '1.2',
            marginTop: '5px'
          }}>
            ST. ANGELA-NGUVIU GIRLS' SENIOR SCHOOL
          </div>
          <div style={{ 
            fontSize: '18px', 
            color: '#000', 
            fontStyle: 'italic',
            fontFamily: 'Brush Script MT, cursive',
            marginTop: '5px'
          }}>
            Strive For Excellence
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'flex', 
          padding: '20px 30px',
          gap: '20px',
          marginTop: '10px'
        }}>
          {/* Photo Section */}
          <div style={{ flex: '0 0 180px' }}>
            <div style={{
              width: '180px',
              height: '220px',
              background: '#8B7355',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '3px solid #666'
            }}>
              {student.photoUrl ? (
                <img 
                  src={student.photoUrl} 
                  alt={student.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ color: '#fff', fontSize: '14px', textAlign: 'center' }}>
                  STUDENT<br />PHOTO
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div style={{ flex: 1, paddingTop: '10px' }}>
            <table style={{ width: '100%', fontSize: '16px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>Name</td>
                  <td style={{ padding: '8px 10px' }}>: {student.fullName?.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>Adm No.</td>
                  <td style={{ padding: '8px 10px' }}>: {student.admissionNumber}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>Date of Adm</td>
                  <td style={{ padding: '8px 10px' }}>: {student.dateOfAdmission || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>Class of Adm</td>
                  <td style={{ padding: '8px 10px' }}>: {student.classOfAdmission || 'FORM 1'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>Date of Birth</td>
                  <td style={{ padding: '8px 10px' }}>: {student.dateOfBirth}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>YEAR</td>
                  <td style={{ 
                    padding: '8px 10px', 
                    color: '#CC0000', 
                    fontSize: '20px',
                    fontWeight: '700',
                    fontStyle: 'italic'
                  }}>
                    : {new Date().getFullYear()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', fontWeight: '600', verticalAlign: 'top' }}>
                    COMBINATION:
                  </td>
                  <td style={{ 
                    padding: '8px 10px',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: '#CC0000'
                  }}>
                    : {student.subjects || 'Maths,matter,/Biology/Chemistry'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QR Code */}
          <div style={{ 
            flex: '0 0 100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
          }}>
            {qrCodeUrl && (
              <>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ width: '90px', height: '90px', border: '2px solid #000' }}
                />
                <div style={{ fontSize: '9px', textAlign: 'center', fontWeight: '600' }}>
                  SCAN TO VERIFY
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ 
          position: 'absolute',
          bottom: '20px',
          left: '30px',
          right: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '700',
            fontStyle: 'italic'
          }}>
            Valid until 2026
          </div>
          <canvas 
            id="barcode-canvas"
            style={{ 
              maxWidth: '200px',
              height: 'auto'
            }}
          />
        </div>
      </div>

      {/* BACK OF CARD */}
      <div ref={backRef} style={{ ...cardStyle, display: showBack ? 'block' : 'none' }}>
        {/* Top curved border */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '30px',
          background: '#CC0000',
          borderRadius: '0 0 50% 50%',
          zIndex: 1
        }} />

        <div style={{ padding: '40px 30px 20px 30px' }}>
          {/* Header with Logo and School Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #CC0000'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: '#f0f0f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              textAlign: 'center',
              border: '2px solid #CC0000'
            }}>
              DIOCESE<br/>OF<br/>EMBU
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '900', 
                color: '#CC0000',
                lineHeight: '1.3'
              }}>
                DIOCESE OF EMBU<br/>
                STANGELA-NGUVIU GIRLS' SENIOR SCHOOL
              </div>
              <div style={{ 
                fontSize: '12px', 
                marginTop: '5px',
                color: '#000'
              }}>
                P.O. Box 12 - 60100, Embu<br/>
                Tel: 0113 688 538<br/>
                Email: stangela.kg@yahoo.com
              </div>
            </div>
            {/* QR Code on Back */}
            {qrCodeUrl && (
              <div style={{ flex: '0 0 80px' }}>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ width: '80px', height: '80px', border: '2px solid #000' }}
                />
              </div>
            )}
          </div>

          {/* Motto, Vision, Mission */}
          <div style={{ marginBottom: '15px' }}>
            <table style={{ width: '100%', fontSize: '13px', lineHeight: '1.6' }}>
              <tbody>
                <tr>
                  <td style={{ 
                    fontWeight: '700', 
                    paddingRight: '10px',
                    verticalAlign: 'top',
                    width: '100px'
                  }}>
                    Motto:
                  </td>
                  <td style={{ fontStyle: 'italic' }}>
                    Strive for Excellence
                  </td>
                </tr>
                <tr>
                  <td style={{ 
                    fontWeight: '700', 
                    paddingRight: '10px',
                    verticalAlign: 'top',
                    paddingTop: '8px'
                  }}>
                    Vision:
                  </td>
                  <td style={{ fontStyle: 'italic', paddingTop: '8px' }}>
                    A holistically developed person
                  </td>
                </tr>
                <tr>
                  <td style={{ 
                    fontWeight: '700', 
                    paddingRight: '10px',
                    verticalAlign: 'top',
                    paddingTop: '8px'
                  }}>
                    Mission:
                  </td>
                  <td style={{ fontStyle: 'italic', paddingTop: '8px' }}>
                    To nurture excellence in a Christ Centered
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Principal's Signature */}
          <div style={{ 
            marginTop: '20px',
            marginBottom: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #ccc'
          }}>
            <div style={{ 
              fontSize: '12px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              _______________________________<br/>
              Principal's Signature
            </div>
          </div>

          {/* Warning Text */}
          <div style={{ 
            fontSize: '10px',
            textAlign: 'center',
            fontWeight: '600',
            lineHeight: '1.4',
            marginTop: '15px',
            padding: '10px',
            background: '#f9f9f9',
            borderRadius: '5px'
          }}>
            THE PERSON WHOSE DETAILS APPEAR ON THIS FOUR ID'S A FIRE STUDENT<br/>
            IF FOUND LOST PLEASE RETURN IT TO THE SCHOOL
          </div>
        </div>
      </div>
    </div>
  );
}
