import React, { useState, useEffect } from "react";
import { post, saveToken } from "../utils/api";
import PageBackground from "../components/PageBackground"; // ✅ ADDED
import OptimizedImage from "./OptimizedImage";


export default function SignUp({ onAuth }) {
  const [status, setStatus] = useState("");
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

  // Preload images immediately
  useEffect(() => {
    const images = [
      '/images/students/IMG_1641.JPG',
      '/images/students/IMG_1651.JPG',
      '/images/students/IMG_1424.JPG',
      '/images/students/std 7.JPG'
    ];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    setStatus("Creating...");
    try {
      const payload = {
        name: f.name,
        email: f.email,
        password: f.password,
        role: f.role || "user"
      };
      const data = await post("/api/auth/register", payload);

      if (data && data.token) {
        saveToken(data.token);
        onAuth && onAuth(data.user);
        setStatus("Created");
        e.target.reset();
      } else {
        setStatus("Failed to create account");
      }
    } catch (err) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
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
        right: '-5%',
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
        top: '12%',
        right: '7%',
        width: '170px',
        height: '170px',
        borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 17s infinite',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out'
      }}>
        <OptimizedImage 
          src="/images/students/IMG_1641.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Student Image Shapes - Bottom Right */}
      <div className="auth-shape" style={{
        position: 'absolute',
        bottom: '18%',
        right: '8%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 19s infinite 3s',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 1.8s ease-in-out 0.3s'
      }}>
        <OptimizedImage 
          src="/images/students/IMG_1651.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Student Image Shapes - Top Left */}
      <div className="auth-shape" style={{
        position: 'absolute',
        top: '18%',
        left: '5%',
        width: '145px',
        height: '145px',
        borderRadius: '25px',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transform: 'rotate(-12deg)',
        animation: 'slideIn 21s infinite 5s',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 2s ease-in-out 0.6s'
      }}>
        <OptimizedImage 
          src="/images/students/IMG_1424.JPG" 
          alt="Student" 
          priority={true}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Student Image Shapes - Bottom Left */}
      <div className="auth-shape" style={{
        position: 'absolute',
        bottom: '22%',
        left: '8%',
        width: '130px',
        height: '130px',
        borderRadius: '30% 70% 70% 30% / 40% 40% 60% 60%',
        overflow: 'hidden',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 15s infinite 7s',
        opacity: imagesLoaded ? 1 : 0,
        transition: 'opacity 2.2s ease-in-out 0.9s'
      }}>
        <OptimizedImage 
          src="/images/students/std 7.JPG" 
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
          border-color: #f5576c;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.1);
        }
        .classic-btn-signup {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        }
        .classic-btn-signup:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 87, 108, 0.6);
        }
        .classic-btn-signup:active {
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>Create Account</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Join us today and get started</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            name="name"
            placeholder="Full name"
            required
            className="classic-input"
          />

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
            placeholder="Create password"
            required
            className="classic-input"
          />

          <select
            name="role"
            required
            className="classic-input"
            defaultValue="user"
            style={{ cursor: 'pointer' }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>

          <button className="classic-btn-signup" type="submit">
            Create Account
          </button>
        </form>

        {status && (
          <p style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: status.includes('Failed') || status.includes('Error') 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(34, 197, 94, 0.1)',
            color: status.includes('Failed') || status.includes('Error') 
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
          Already have an account? <a href="#/login" style={{
            color: '#f5576c',
            fontWeight: '600',
            textDecoration: 'none'
          }}>Sign in</a>
        </p>
      </section>
    </div>
  );
}
