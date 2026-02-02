import React, { useState } from "react";
import { safePath } from "../utils/paths";
import OptimizedImage from "./OptimizedImage";

export default function Header({ route, setRoute, setLoading, user, logout }) {
  const go = (r) => {
    if (typeof setLoading === "function") setLoading(true);
    setRoute && setRoute(r);
  };

  const navButtonStyle = (active) => ({
    background: active ? "#fff" : "transparent",
    color: active ? "#b80000" : "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: active ? "bold" : "normal",
  });

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const subLinks = {
    curriculum: [
      { key: "curriculum/overview", label: "Overview" },
      { key: "curriculum/primary", label: "Primary" },
      { key: "curriculum/secondary", label: "Secondary" },
      { key: "curriculum/syllabus", label: "Syllabus" },
      { key: "curriculum/extracurricular", label: "Extracurricular" },
      { key: "curriculum/assessment", label: "Assessment" },
      { key: "curriculum/careers", label: "Careers" },
    ],
    student: [
      { key: "student/admissions-guide", label: "Admissions Guide" },
      { key: "student/fees", label: "Fees" },
      { key: "student/exams", label: "Exams" },
      { key: "student/clubs", label: "Clubs" },
      { key: "student/support-services", label: "Support Services" },
    ],
    staff: [
      { key: "staff/leadership", label: "Leadership" },
      { key: "staff/teaching", label: "Teaching" },
      { key: "staff/support", label: "Support" },
    ],
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        paddingRight: 80,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "#38060695",
        position: "sticky",
        top: 0,
        zIndex: 500,
      }}
      className="main-header"
    >
      {/* Logo + School Name + Tagline */}
      <div
        onClick={() => go("home")}
        style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}
      >
        {/* Top: Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Back button: appears when not on home */}
          {route && route !== "home" && (
            <button
              onClick={() => {
                if (window && typeof window.__goBack === "function") window.__goBack();
                else go("home");
              }}
              aria-label="Go back"
              style={{
                marginRight: 8,
                padding: "6px 8px",
                borderRadius: 6,
                border: "none",
                background: "rgba(255,255,255,0.9)",
                cursor: "pointer",
              }}
            >
              ←
            </button>
          )}
          <OptimizedImage
            alt="KANGARU GIRLS Logo"
            src="/header/logo.PNG"
            priority={true}
            style={{
              width: 70,
              height: 70,
              objectFit: "contain",
              borderRadius: 4,
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "";
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <strong style={{ fontSize: 14, color: "#fff" }}>kangaru-girls KANGARU GIRLS'</strong>
            <strong style={{ fontSize: 14, color: "#fff" }}>SENIOR SCHOOL</strong>
          </div>
        </div>
        
        {/* Below: Tagline and Route */}
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: route && route !== "home" ? 90 : 80 }}>
          <small
            style={{
              color: "#0b0b0bf5",
              fontSize: 16,
              fontStyle: "italic",
              fontWeight: "bold",
            }}
          >
            strive for excellence
          </small>
          <small style={{ color: "#ddd", fontSize: 10, marginTop: 4 }}>
            {route ? route.charAt(0).toUpperCase() + route.slice(1) : "Welcome"}
          </small>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", alignItems: "center", gap: 15 }}>
        {/* Quick access buttons */}
        <button onClick={() => go("home")} style={navButtonStyle(route === "home")}>
          Home
        </button>
        <button onClick={() => go("about")} style={navButtonStyle(route === "about")}>
          About
        </button>

        {/* Curriculum parent + submenu */}
        <div
          onMouseEnter={() => setOpenSubmenu("curriculum")}
          onMouseLeave={() => setOpenSubmenu(null)}
          style={{ position: "relative" }}
        >
          <button onClick={() => go("curriculum") } style={navButtonStyle(route && route.split("/")[0] === "curriculum")}>
            Curriculum
          </button>
          {openSubmenu === "curriculum" && (
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 0,
                background: "#fff",
                color: "#111",
                padding: 8,
                borderRadius: 6,
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                zIndex: 600,
              }}
            >
              {subLinks.curriculum.map((s) => (
                <div key={s.key} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => go(s.key)}
                    style={{ padding: "6px 8px", border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    {s.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student parent + submenu */}
        <div
          onMouseEnter={() => setOpenSubmenu("student")}
          onMouseLeave={() => setOpenSubmenu(null)}
          style={{ position: "relative" }}
        >
          <button onClick={() => go("student")} style={navButtonStyle(route && route.split("/")[0] === "student") }>
            Student
          </button>
          {openSubmenu === "student" && (
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 0,
                background: "#fff",
                color: "#111",
                padding: 8,
                borderRadius: 6,
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                zIndex: 600,
              }}
            >
              {subLinks.student.map((s) => (
                <div key={s.key} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => go(s.key)}
                    style={{ padding: "6px 8px", border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    {s.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => go("contact")} style={navButtonStyle(route === "contact")}>
          Contact
        </button>
        <button
          onClick={() => go("performance")}
          style={navButtonStyle(route === "performance")}
        >
          Performance
        </button>
        <button
          onClick={() => go("feestructure")}
          style={navButtonStyle(route === "feestructure")}
        >
          FeeStructure
        </button>

        {/* Staff parent + submenu */}
        <div
          onMouseEnter={() => setOpenSubmenu("staff")}
          onMouseLeave={() => setOpenSubmenu(null)}
          style={{ position: "relative" }}
        >
          <button onClick={() => go("staff")} style={navButtonStyle(route && route.split("/")[0] === "staff") }>
            Staff
          </button>
          {openSubmenu === "staff" && (
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 0,
                background: "#fff",
                color: "#111",
                padding: 8,
                borderRadius: 6,
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                zIndex: 600,
              }}
            >
              {subLinks.staff.map((s) => (
                <div key={s.key} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => go(s.key)}
                    style={{ padding: "6px 8px", border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    {s.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply Now Button - Highlighted */}
        <button 
          onClick={() => go("admission")} 
          style={{
            ...navButtonStyle(route === "admission"),
            background: route === "admission" ? "#fff" : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            color: route === "admission" ? "#28a745" : "#fff",
            fontWeight: "bold",
            padding: "8px 16px",
            boxShadow: "0 4px 8px rgba(40, 167, 69, 0.3)",
            border: route === "admission" ? "2px solid #28a745" : "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (route !== "admission") {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 12px rgba(40, 167, 69, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.3)";
          }}
        >
          📝 Apply Now
        </button>

        {/* Auth buttons or user info */}
        {!user ? (
          <>
            <button onClick={() => go("login")} style={{ ...buttonStyle, background: "#eb1026ef" }}>
              Log in
            </button>
            <button onClick={() => go("signup")} style={{ ...buttonStyle, background: "#ba4409ef" }}>
              Sign up
            </button>
          </>
        ) : (
          <>
            <span style={{ padding: "0 8px", fontSize: 14, color: "#fff" }}>
              {user.email} ({user.role})
            </span>
            {user.role === "admin" && (
              <button onClick={() => go("admin")} style={{ ...buttonStyle, background: "#740505ef" }}>
                Admin
              </button>
            )}
            <button
              onClick={() => {
                logout && logout();
                go("home");
              }}
              style={buttonStyle}
            >
              Log out
            </button>
          </>
        )}
      </nav>
      
      {/* Responsive styles */}
      <style>{`
        /* Tablet and laptop: logo + name on single line, nav below */
        @media (min-width: 481px) and (max-width: 1200px) {
          .main-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 12px !important;
            gap: 12px;
          }
          
          .main-header > div:first-child {
            flex-direction: row !important;
            gap: 10px !important;
          }
          
          .main-header > div:first-child > div:first-child {
            flex-direction: row !important;
            align-items: center !important;
            gap: 10px;
          }
          
          .main-header > div:first-child > div:first-child > div {
            flex-direction: row !important;
            gap: 5px !important;
            line-height: 1 !important;
          }
          
          .main-header > div:first-child > div:first-child > div strong {
            display: inline !important;
            font-size: 16px !important;
          }
          
          .main-header > div:first-child > div:last-child {
            display: none !important;
          }
          
          .main-header nav {
            width: 100%;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          
          .main-header nav button,
          .main-header nav > div {
            margin: 0 !important;
          }
        }
        
        /* Mobile: logo + name (2 lines), nav in 2 horizontal rows */
        @media (max-width: 480px) {
          .main-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 12px !important;
            gap: 12px;
          }
          
          .main-header nav {
            width: 100%;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          
          .main-header nav > * {
            flex: 1 1 auto !important;
            min-width: fit-content !important;
          }
          
          .main-header nav button {
            text-align: center !important;
            padding: 10px 12px !important;
            font-size: 0.85rem !important;
            white-space: nowrap !important;
          }
          
          .main-header nav > div {
            flex: 1 1 auto !important;
            min-width: fit-content !important;
          }
          
          .main-header nav > div button {
            text-align: center !important;
            padding: 10px 12px !important;
            font-size: 0.85rem !important;
            white-space: nowrap !important;
          }
        }
      `}</style>
    </header>
  );
}

const buttonStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#cf0a0aff",
  color: "#fff",
  cursor: "pointer",
};
