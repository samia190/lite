import React, { useState, useEffect } from "react";
import { post } from "../utils/api";
import Loader from "./Loader";

export default function StudentVerification() {
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Extract token from URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const tokenParam = params.get('t') || params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      verifyStudent(tokenParam);
    } else {
      setError("Invalid verification link - no token provided");
      setLoading(false);
    }

    // Prevent navigation
    const preventNavigation = (e) => {
      if (!e.target.closest('.allow-click')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('click', preventNavigation, true);
    
    // Prevent right-click
    const preventRightClick = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventRightClick);

    // Prevent keyboard shortcuts
    const preventShortcuts = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', preventShortcuts);

    return () => {
      document.removeEventListener('click', preventNavigation, true);
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventShortcuts);
    };
  }, []);

  async function verifyStudent(tokenToVerify) {
    setLoading(true);
    setError("");
    
    try {
      const response = await post("/api/student-verification/verify", { 
        token: tokenToVerify 
      });
      
      if (response.valid) {
        setVerificationData(response.student);
      } else {
        setError(response.error || "Verification failed");
      }
    } catch (err) {
      setError(err.message || "Failed to verify student ID");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '400px'
        }}>
          <Loader size={60} />
          <h2 style={{ color: '#1f2937', marginTop: '24px', marginBottom: '8px' }}>Verifying ID Card</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px'
          }}>❌</div>
          <h2 style={{ 
            color: '#dc2626', 
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: '700'
          }}>Verification Failed</h2>
          <p style={{ 
            color: '#991b1b', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '8px'
          }}>{error}</p>
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <p style={{ 
              color: '#7f1d1d', 
              fontSize: '13px',
              margin: 0
            }}>
              <strong>Possible reasons:</strong><br/>
              • ID card has expired<br/>
              • Token scanned too late (max 2 minutes)<br/>
              • ID card has been deactivated<br/>
              • Invalid or forged QR code
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return null;
  }

  const verifiedDate = new Date(verificationData.verifiedAt);
  const issueDate = verificationData.idCardIssueDate ? new Date(verificationData.idCardIssueDate) : null;
  const expiryDate = verificationData.idCardExpiryDate ? new Date(verificationData.idCardExpiryDate) : null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '0',
        boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
        maxWidth: '600px',
        width: '100%',
        overflow: 'hidden',
        border: '4px solid #10b981'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '32px',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '50px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>✓</div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '800',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>ID VERIFIED</h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            opacity: 0.95
          }}>kangaru-girls KANGARU GIRLS' Senior School</p>
        </div>

        {/* Student Photo */}
        {verificationData.photoUrl && (
          <div style={{
            padding: '32px 32px 0',
            textAlign: 'center'
          }}>
            <img 
              src={verificationData.photoUrl}
              alt="Student"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '5px solid #10b981',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        )}

        {/* Student Details */}
        <div style={{ padding: '32px' }}>
          <div style={{
            background: '#f0fdf4',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '2px solid #bbf7d0'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '28px',
              fontWeight: '700',
              color: '#065f46',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>{verificationData.fullName}</h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <DetailRow 
                label="Admission Number" 
                value={verificationData.admissionNumber}
                highlight={true}
              />
              {verificationData.assessmentNumber && (
                <DetailRow 
                  label="Assessment Number" 
                  value={verificationData.assessmentNumber}
                  highlight={true}
                />
              )}
              <DetailRow 
                label="Class" 
                value={`${verificationData.class}${verificationData.stream ? ' - ' + verificationData.stream : ''}`}
              />
              <DetailRow 
                label="Year of Admission" 
                value={verificationData.yearOfAdmission}
              />
              <DetailRow 
                label="Status" 
                value={verificationData.status}
                color={verificationData.status === 'Active' ? '#059669' : '#dc2626'}
              />
              {verificationData.websiteUrl && (
                <DetailRow 
                  label="School Website" 
                  value={<a href={verificationData.websiteUrl} target="_blank" rel="noopener noreferrer" className="allow-click" style={{ color: '#2563eb', textDecoration: 'underline' }}>{verificationData.websiteUrl}</a>}
                />
              )}
            </div>
          </div>

          {/* Verification Info */}
          <div style={{
            background: '#eff6ff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #bfdbfe'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e40af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Verification Details</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#1e40af' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Verified At:</span>
                <span style={{ fontWeight: '600' }}>
                  {verifiedDate.toLocaleString()}
                </span>
              </div>
              {issueDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Card Issued:</span>
                  <span style={{ fontWeight: '600' }}>
                    {issueDate.toLocaleDateString()}
                  </span>
                </div>
              )}
              {expiryDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Valid Until:</span>
                  <span style={{ fontWeight: '600' }}>
                    {expiryDate.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde047',
            fontSize: '12px',
            color: '#854d0e',
            lineHeight: '1.5'
          }}>
            <strong>🔒 Security Notice:</strong> This verification is cryptographically signed 
            and time-limited. The QR code cannot be copied, forged, or reused. 
            Each scan generates a unique token valid for 2 minutes only.
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight, color }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: highlight ? '12px' : '8px 0',
      background: highlight ? 'white' : 'transparent',
      borderRadius: highlight ? '8px' : '0',
      border: highlight ? '2px solid #10b981' : 'none'
    }}>
      <span style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginLeft: highlight ? '12px' : '0'
      }}>{label}:</span>
      <span style={{
        fontSize: highlight ? '18px' : '16px',
        fontWeight: '700',
        color: color || (highlight ? '#059669' : '#1f2937'),
        marginRight: highlight ? '12px' : '0'
      }}>{value}</span>
    </div>
  );
}
