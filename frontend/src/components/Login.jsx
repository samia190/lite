import React, { useState, useEffect } from "react";
import { post, get } from "../utils/api";
import PageBackground from "../components/PageBackground";
import OptimizedImage from "./OptimizedImage";

export default function Login({ onAuth, navigate }) {
  const [status, setStatus] = useState("");
  const [remember, setRemember] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const totalImages = 4;
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");

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
    
    // Preload both WebP and original formats
    images.forEach(src => {
      const img = new Image();
      img.src = src;
      
      // Also try WebP version
      const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
      const webpImg = new Image();
      webpImg.src = webpSrc;
    });
  }, []);

  /**
   * Handle form submit
   */
  async function submit(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.target));
    setStatus("Logging in...");

    try {
      const data = await post("/api/auth/login", formData);

      if (data && data.token) {
        /**
         * REMEMBER ME LOGIC
         * ------------------
         * If remember is checked → keep token in localStorage
         * Else → keep token in sessionStorage (clears on browser close)
         */
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("token", data.token);

        // Notify app that user is authenticated
        onAuth && onAuth(data.user);

        setStatus("Logged in");

        // Redirect user based on role
        redirectByRole(data.user.role);

        e.target.reset();
      } else {
        setStatus("Login failed");
      }
    } catch (err) {
      setStatus(err.message || "Error occurred");
    }
  }

  /**
   * ROLE-BASED REDIRECTION
   */
  function redirectByRole(role) {
    if (!navigate) return;

    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "teacher":
        navigate("/teacher/dashboard");
        break;
      case "student":
        navigate("/student/dashboard");
        break;
      case "staff":
        navigate("/staff/dashboard");
        break;
      default:
        navigate("/");
    }
  }

  /**
   * Handle forgot password request
   */
  async function handleForgotPassword(e) {
    e.preventDefault();
    setResetStatus("Sending reset link...");

    try {
      const response = await post("/api/auth/forgot-password", { email: resetEmail });
      setResetStatus(response.message || "Password reset link sent to your email!");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setResetStatus("");
      }, 3000);
    } catch (err) {
      setResetStatus(err.message || "Failed to send reset link");
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
          }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Sign in to continue to your account</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            className="classic-input"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="classic-input"
          />

          <select name="role" required className="classic-input" style={{ cursor: 'pointer' }}>
            <option value="">Select your role</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              fontSize: '14px',
              color: '#64748b',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Remember me
            </label>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}
              style={{
                fontSize: '14px',
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button className="classic-btn" type="submit">
            Sign In
          </button>
        </form>

        {status && (
          <p style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: status.includes('failed') || status.includes('Error') 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(34, 197, 94, 0.1)',
            color: status.includes('failed') || status.includes('Error') 
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
          Don't have an account? <a href="#/signup" style={{
            color: '#667eea',
            fontWeight: '600',
            textDecoration: 'none'
          }}>Sign up</a>
        </p>
      </section>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowForgotPassword(false)}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '12px',
              textAlign: 'center'
            }}>Reset Password</h3>
            <p style={{ 
              color: '#64748b', 
              fontSize: '14px', 
              textAlign: 'center', 
              marginBottom: '24px' 
            }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="classic-input"
              />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowForgotPassword(false); setResetEmail(""); setResetStatus(""); }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="classic-btn"
                  style={{ flex: 1 }}
                >
                  Send Reset Link
                </button>
              </div>
            </form>

            {resetStatus && (
              <p style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                background: resetStatus.includes('Failed') || resetStatus.includes('Error') 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'rgba(34, 197, 94, 0.1)',
                color: resetStatus.includes('Failed') || resetStatus.includes('Error') 
                  ? '#dc2626' 
                  : '#16a34a',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {resetStatus}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
