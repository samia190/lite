import React, { useEffect, useState } from "react";
import EditableHeading from "./EditableHeading";
import EditableText from "./EditableText";
import EditableSubheading from "./EditableSubheading";
import AdminContentForm from "./AdminContentForm";

import AdmissionsManagement from "./AdmissionsManagement";
import AdminSubmissions from "./AdminSubmissions";
import FeeStructureManagement from "./FeeStructureManagement";
import NewslettersManagement from "./NewslettersManagement";
import EventsManagement from "./EventsManagement";
import GalleryManagement from "./GalleryManagement";
import LegalManagement from "./LegalManagement";

// Import new content page management components
import AboutManagement from "./AboutManagement";
import ContactManagement from "./ContactManagement";
import CurriculumManagement from "./CurriculumManagement";
import PerformanceManagement from "./PerformanceManagement";
import PoliciesManagement from "./PoliciesManagement";
import ParentsManagement from "./ParentsManagement";
import StudentsManagement from "./StudentsManagement";
import StaffManagement from "./StaffManagement";
import RoleManagement from "./RoleManagement";
import MagazineManagement from "./MagazineManagement";

// Universal subpage management component
import SubpageManagement from "./SubpageManagement";

import { get, patch } from "../utils/api";
import PageBackgroundManagement from "./PageBackgroundManagement";
import Notifications from "./Notifications";
import DashboardWidgets from "./DashboardWidgets";
import DragDropUpload from "./DragDropUpload";
import "../admin.css";

export default function AdminDashboard({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [genericValue, setGenericValue] = useState("");

  function getNested(obj, path) {
    if (!obj || !path) return "";
    const parts = path.split("/");

    // Prefer to look inside obj.data for nested admin keys
    let cur = obj.data ?? obj;
    for (const p of parts) {
      if (cur == null) return "";
      cur = cur[p];
    }
    if (cur == null) {
      // fallback to top-level path
      cur = obj;
      for (const p of parts) {
        if (cur == null) return "";
        cur = cur[p];
      }
    }
    return typeof cur === "string" ? cur : JSON.stringify(cur, null, 2);
  }

  useEffect(() => {
    if (activeSection && activeSection.includes("/")) {
      setGenericValue(getNested(content, activeSection) || "");
    }
  }, [activeSection, content]);

  useEffect(() => {
    get("/api/content/admin")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load admin dashboard content."));
  }, []);

  function updateSection(section, value) {
    setLoading(true);

    setSuccess("");

    patch(`/api/content/admin/${section}`, { value })
      .then(() => {
        // update nested state to reflect saved change (store under data for typed content)
        setContent((prev) => {
          const next = { ...prev };
          const parts = section.split("/");
          if (parts.length === 1) {
            next[section] = value;
          } else {
            if (!next.data || typeof next.data !== "object") next.data = {};
            let cur = next.data;
            for (let i = 0; i < parts.length - 1; i++) {
              const p = parts[i];
              if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
              cur = cur[p];
            }
            cur[parts[parts.length - 1]] = value;
          }
          return next;
        });
        setSuccess("Content saved successfully");
      })
      .catch((err) => {
        console.error("Failed to save:", err);
        setError("Failed to save content.");
      })
      .finally(() => setLoading(false));
  }

  if (user?.role !== "admin") {
    return (
      <section style={{ padding: 20, color: "#a00" }}>
        <h2>Access Denied</h2>
        <p>
          You do not have permission to view this page. Please contact the
          system administrator.
        </p>
      </section>
    );
  }

  const sections = [
    { key: "dashboard", label: "Dashboard", icon: "🏠", color: "#3b82f6" },
    { key: "submissions", label: "Submissions", icon: "📬", color: "#8b5cf6" },
    { key: "roles", label: "Roles", icon: "👥", color: "#ec4899" },
    { key: "admissions", label: "Admissions", icon: "📝", color: "#10b981" },
    { key: "feeStructure", label: "Fee Structure", icon: "💰", color: "#f59e0b" },
    { key: "newsletters", label: "Newsletters", icon: "📰", color: "#06b6d4" },
    { key: "magazine", label: "Magazine", icon: "📖", color: "#6366f1" },
    { key: "events", label: "Events", icon: "📅", color: "#ef4444" },
    { key: "gallery", label: "Gallery", icon: "🖼️", color: "#14b8a6" },
    { key: "legal", label: "Legal", icon: "⚖️", color: "#64748b" },
    { key: "about", label: "About", icon: "ℹ️", color: "#0ea5e9" },
    { key: "contact", label: "Contact", icon: "📞", color: "#22c55e" },
    { key: "curriculum", label: "Curriculum", icon: "📚", color: "#a855f7" },
    { key: "performance", label: "Performance", icon: "📊", color: "#f97316" },
    { key: "policies", label: "Policies", icon: "📋", color: "#84cc16" },
    { key: "parents", label: "Parents", icon: "👨‍👩‍👧", color: "#e11d48" },
    { key: "students", label: "Students", icon: "🎓", color: "#0891b2" },
    { key: "staff", label: "Staff", icon: "👔", color: "#7c3aed" },
    { key: "pagebackground", label: "Backgrounds", icon: "🎨", color: "#db2777" },
  ];

  const subSections = [
    { key: "staff/leadership", label: "Staff Leadership", contentTypes: ["text", "staffList", "images"] },
    { key: "staff/teaching", label: "Staff Teaching", contentTypes: ["text", "staffList", "images"] },
    { key: "staff/support", label: "Staff Support", contentTypes: ["text", "staffList", "images"] },
    { key: "students/admissions-guide", label: "Student Admissions Guide", contentTypes: ["text", "table", "files"] },
    { key: "students/fees", label: "Student Fees", contentTypes: ["text", "table", "files"] },
    { key: "students/exams", label: "Student Exams", contentTypes: ["text", "table", "files"] },
    { key: "students/clubs", label: "Student Clubs", contentTypes: ["text", "images"] },
    { key: "students/support-services", label: "Student Support Services", contentTypes: ["text", "staffList"] },
    { key: "parents/communication", label: "Parents Communication", contentTypes: ["text", "files"] },
    { key: "parents/resources", label: "Parents Resources", contentTypes: ["text", "files"] },
    { key: "parents/calendar", label: "Parents Calendar", contentTypes: ["text", "table"] },
    { key: "curriculum/overview", label: "Curriculum Overview", contentTypes: ["text", "images"] },
    { key: "curriculum/primary", label: "Curriculum Primary", contentTypes: ["text", "table"] },
    { key: "curriculum/secondary", label: "Curriculum Secondary", contentTypes: ["text", "table"] },
    { key: "curriculum/syllabus", label: "Curriculum Syllabus", contentTypes: ["text", "table", "files"] },
    { key: "curriculum/extracurricular", label: "Curriculum Extracurricular", contentTypes: ["text", "images"] },
    { key: "curriculum/assessment", label: "Curriculum Assessment", contentTypes: ["text", "table"] },
    { key: "curriculum/careers", label: "Curriculum Careers", contentTypes: ["text", "files"] },
  ];

  return (
    <section className="admin-dashboard-wrapper">
      <Notifications />
      
      {/* MODERN HORIZONTAL NAVIGATION */}
      <div className="admin-nav-container">
        <div className="admin-nav-header">
          <h1 className="admin-title">🛠️ Admin Dashboard</h1>
          {user && (
            <p className="admin-user-info">
              Welcome, <strong>{user.email}</strong> <span className="role-badge">{user.role}</span>
            </p>
          )}
        </div>
        
        {/* HORIZONTAL GRID OF NAVIGATION CARDS */}
        <div className="admin-nav-grid">
          {sections.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`admin-nav-card ${isActive ? "active" : ""}`}
                style={{ "--card-color": item.color }}
              >
                <span className="nav-card-icon">{item.icon}</span>
                <span className="nav-card-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* SUB-SECTIONS DROPDOWN */}
        {(activeSection.includes("staff") || activeSection.includes("students") || activeSection.includes("parents") || activeSection.includes("curriculum")) && (
          <div className="admin-subsections">
            <label>Sub-section:</label>
            <select 
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="admin-select"
            >
              {subSections
                .filter((s) => s.key.startsWith(activeSection.split("/")[0]))
                .map((sub) => (
                  <option key={sub.key} value={sub.key}>{sub.label}</option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="admin-main-content">
        {/* Subpage Management for nested keys like staff/leadership or curriculum/overview */}
        {activeSection.includes("/") && (() => {
          const subConfig = subSections.find(s => s.key === activeSection);
          if (subConfig) {
            return (
              <SubpageManagement
                key={activeSection}
                pageType={activeSection}
                pageTitle={subConfig.label}
                contentTypes={subConfig.contentTypes || ["text"]}
              />
            );
          }
          return null;
        })()}
        {activeSection === "dashboard" && (
          <>
            <EditableHeading
              value={content.title || "Welcome, Admin"}
              onSave={(val) => updateSection("title", val)}
              isAdmin={true}
              level={2}
            />

            <EditableText
              value={
                content.intro ||
                "You have access to manage school content, upload files, and oversee key settings. Use the form below to post newsletters, gallery items, or admission updates."
              }
              onSave={(val) => updateSection("intro", val)}
              isAdmin={true}
              style={{ marginTop: 20 }}
            />

            <div style={{ marginTop: 30 }}>
              <EditableSubheading
                value={content.formHeading || "Post New Content"}
                onSave={(val) => updateSection("formHeading", val)}
                isAdmin={true}
                level={3}
              />
              <AdminContentForm
                onSaved={() => {
                  setSuccess("Content saved successfully");
                  setTimeout(() => setSuccess(""), 3000);
                }}
              />
            </div>

            <div style={{ marginTop: 28 }}>
              <h3 style={{ marginBottom: 12 }}>Quick Overview</h3>
              <DashboardWidgets onNavigate={setActiveSection} />
            </div>

            <div style={{ marginTop: 22 }}>
              <h3 style={{ marginBottom: 12 }}>Quick Upload</h3>
              <div className="card">
                <DragDropUpload onUploaded={(d) => {
                  setSuccess("File uploaded");
                  setTimeout(() => setSuccess(""), 2500);
                }} />
              </div>
            </div>

            {loading && <p style={{ color: "#00a" }}>Saving...</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        )}

        {activeSection === "admissions" && <AdmissionsManagement />}

        {activeSection === "roles" && <RoleManagement />}

        {activeSection === "submissions" && <AdminSubmissions />}

        {activeSection === "feeStructure" && <FeeStructureManagement />}

        {activeSection === "newsletters" && <NewslettersManagement />}

        {activeSection === "magazine" && <MagazineManagement user={user} />}

        {activeSection === "events" && <EventsManagement />}

        {activeSection === "gallery" && <GalleryManagement />}

        {activeSection === "legal" && <LegalManagement />}

        {activeSection === "about" && <AboutManagement />}

        {activeSection === "contact" && <ContactManagement />}

        {activeSection === "curriculum" && <CurriculumManagement />}

        {activeSection === "performance" && <PerformanceManagement />}

        {activeSection === "policies" && <PoliciesManagement />}

        {activeSection === "parents" && <ParentsManagement />}

        {activeSection === "students" && <StudentsManagement />}

        {activeSection === "staff" && <StaffManagement />}
        {activeSection === "pagebackground" && <PageBackgroundManagement />}
      </main>
    </section>
  );
}
