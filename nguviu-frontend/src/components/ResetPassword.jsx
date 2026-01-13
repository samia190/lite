import React, { useState, useEffect } from "react";
import { post } from "../utils/api";
import OptimizedImage from "./OptimizedImage";

export default function ResetPassword({ navigate }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const totalImages = 4;

  // Track image loading
  const handleImageLoad = () => {
    setLoadedCount(prev => {
      const newCount = prev + 1;
      if (newCount === totalImages) {
        setTimeout(() => setImagesLoaded(true), 100);
      }
      return newCount;
    });
  };

  // Preload images immediately with WebP support
  useEffect(() => {
    const images = [
      '/images/students/IMG_0778.JPG',
      '/images/students/IMG_1194.JPG',
      '/images/students/IMG_1221.JPG',
      '/images/students/std 2.JPG'
    ];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
      // Also preload WebP version
      const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
      const webpImg = new Image();
      webpImg.src = webpSrc;
    });
  }, []);

  // Extract token and email from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
    } else {
      setStatus("Invalid reset link");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters");
      return;
    }

    setStatus("Resetting password...");

    try {
      const response = await post("/api/auth/reset-password", {
        email,
        token,
        newPassword: password
      });

      setStatus(response.message || "Password reset successfully!");
      
      setTimeout(() => {
        if (navigate) {
          navigate("login");
        } else {
          window.location.hash = "#/login";
        }
      }, 2000);
    } catch (err) {
      setStatus(err.message || "Failed to reset password");
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(60px)',
        animation: 'float 6s ease-in-out infinite reverse'
      }} />

      {/* Student Image Shapes - Top Right */}
      <div className="auth-shape" style={{
        position: 'absolute',
        top: '10%',
        right: '8%',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 15s infinite',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out'
      }}>
        <OptimizedImage 
          src="/images/students/IMG_0778.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Student Image Shapes - Bottom Right */}
      <div className="auth-shape" style={{
        position: 'absolute',
        bottom: '15%',
        right: '5%',
        width: '140px',
        height: '140px',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 18s infinite 2s',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 1.8s ease-in-out 0.3s'
      }}>
        <OptimizedImage 
          src="/images/students/IMG_1194.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Student Image Shapes - Top Left */}
      <div className="auth-shape" style={{
        position: 'absolute',
        top: '20%',
        left: '6%',
        width: '160px',
        height: '160px',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transform: 'rotate(15deg)',
        animation: 'slideIn 20s infinite 4s',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 2s ease-in-out 0.6s'
      }}>
        <OptimizedImage 
          src="/images/students/IMG_1221.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Student Image Shapes - Middle Left */}
      <div className="auth-shape" style={{
        position: 'absolute',
        bottom: '25%',
        left: '10%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 16s infinite 6s',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 2.2s ease-in-out 0.9s'
      }}>
        <OptimizedImage 
          src="/images/students/std 2.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(20px); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: scale(0.8) rotate(0deg); }
          10% { opacity: 1; transform: scale(1) rotate(5deg); }
          90% { opacity: 1; transform: scale(1) rotate(-5deg); }
          100% { opacity: 0; transform: scale(0.8) rotate(0deg); }
        }
        .classic-input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.95);
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
        }
        .classic-input:focus {
          border-color: #667eea;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        .classic-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .classic-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .classic-btn:active {
          transform: translateY(0);
        }
        .classic-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <section style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '440px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>Reset Password</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Enter your new password</p>
          {email && (
            <p style={{ color: '#667eea', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
              for {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="classic-input"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            className="classic-input"
          />

          <button className="classic-btn" type="submit" disabled={!token || !email}>
            Reset Password
          </button>
        </form>

        {status && (
          <p style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: status.includes('Failed') || status.includes('Invalid') || status.includes('do not match') || status.includes('expired')
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(34, 197, 94, 0.1)',
            color: status.includes('Failed') || status.includes('Invalid') || status.includes('do not match') || status.includes('expired')
              ? '#dc2626' 
              : '#16a34a',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {status}
          </p>
        )}

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          Remember your password? <a href="#/login" style={{
            color: '#667eea',
            fontWeight: '600',
            textDecoration: 'none'
          }}>Back to login</a>
        </p>
      </section>
    </div>
  );
}
