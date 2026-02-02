import React, { useState, useEffect } from "react";

import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Admissions from "./components/Admissions";
import Student from "./components/Student";
import Newsletter from "./components/Newsletter";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import AdminDashboard from "./components/AdminDashboard";
import Curriculum from "./components/Curriculum";
import Performance from "./components/Performance";
import Policies from "./components/Policies";
import Parents from "./components/Parents";
import Staff from "./components/Staff";
import Legal from "./components/Legal";
import SearchResults from "./components/SearchResults";
import FeeStructure from "./components/FeeStructure";

// Curriculum subpages
import CurriculumOverview from './components/subpages/CurriculumOverview.jsx';
import CurriculumPrimary from './components/subpages/CurriculumPrimary.jsx';
import CurriculumSecondary from './components/subpages/CurriculumSecondary.jsx';
import CurriculumSyllabus from './components/subpages/CurriculumSyllabus.jsx';
import CurriculumExtracurricular from './components/subpages/CurriculumExtracurricular.jsx';
import CurriculumAssessment from './components/subpages/CurriculumAssessment.jsx';

// Staff subpages
import StaffLeadership from './components/subpages/StaffLeadership.jsx';
import StaffTeaching from './components/subpages/StaffTeaching.jsx';
import StaffSupport from './components/subpages/StaffSupport.jsx';

// Student subpages
import StudentAdmissionsGuide from './components/subpages/StudentAdmissionsGuide.jsx';
import StudentFees from './components/subpages/StudentFees.jsx';
import StudentExams from './components/subpages/StudentExams.jsx';
import StudentClubs from './components/subpages/StudentClubs.jsx';
import StudentSupportServices from './components/subpages/StudentSupportServices.jsx';


// =============================
// Mobile Menu Button Component
// =============================
function MenuButton({ route, setRoute, setLoading }) {
  const [open, setOpen] = useState(false);

  // Hide menu on login & signup
  const HIDDEN = ["login", "signup"];
  if (HIDDEN.includes((route || "").toLowerCase())) return null;

  const links = [
    { key: "home", label: "Home" },
    { key: "about", label: "About" },
    { key: "admissions", label: "Admissions" },

    // Curriculum subpages
    { key: "curriculum/overview", label: "Curriculum Overview" },
    { key: "curriculum/primary", label: "Curriculum Primary" },
    { key: "curriculum/secondary", label: "Curriculum Secondary" },
    { key: "curriculum/syllabus", label: "Curriculum Syllabus" },
    { key: "curriculum/extracurricular", label: "Curriculum Extracurricular" },
    { key: "curriculum/assessment", label: "Curriculum Assessment" },

    { key: "performance", label: "Performance" },
    { key: "policies", label: "Policies" },
    { key: "parents", label: "Parents" },

    { key: "student", label: "Students" },
    // Student subpages
    { key: "student/admissions-guide", label: "Student Admissions Guide" },
    { key: "student/fees", label: "Student Fees" },
    { key: "student/exams", label: "Student Exams" },
    { key: "student/clubs", label: "Student Clubs" },
    { key: "student/support-services", label: "Student Support Services" },

    { key: "staff", label: "Staff" },

    // Staff subpages
    { key: "staff/leadership", label: "Staff Leadership" },
    { key: "staff/teaching", label: "Staff Teaching" },
    { key: "staff/support", label: "Staff Support" },

    { key: "gallery", label: "Gallery" },
    { key: "legal", label: "Legal" },
    { key: "feestructure", label: "Fee Structure" },
    { key: "newsletter", label: "Newsletter" },
    { key: "admin", label: "Admin" },
    { key: "contact", label: "Contact" },
    { key: "login", label: "Login" },
    { key: "signup", label: "Sign Up" },
  ];

  const handleClick = (key) => {
    setOpen(false);
    setLoading(true);

    setTimeout(() => {
      setRoute(key);
    }, 120);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((s) => !s)}
        style={{
          position: "fixed",
          left: 5,
          top: 90,
          zIndex: 1000,
          width: 44,
          height: 44,
          borderRadius: 8,
          border: "1px solid rgba(231, 21, 21, 0.93)",
          background: "brown",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span style={{ width: 20 }}>{open ? "✕" : "☰"}</span>
      </button>

      {/* Menu */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 900,
            }}
          />

          <nav
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: 12,
              top: 64,
              zIndex: 1001,
              minWidth: 220,
              maxWidth: "80vw",
              background: "#ffffff",
              borderRadius: 8,
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              padding: 12,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {links.map(({ key, label }) => (
                <li key={key} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => handleClick(key)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: 6,
                      color: "#111",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}



// =============================
// MAIN APP COMPONENT
// =============================
export default function App() {
  const [route, setRoute] = useState("home");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Decode JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ email: payload.email, role: payload.role });
    } catch {
      // ignore invalid token
    }
  }, []);

  // Auth handler
  function handleAuth(u) {
    setUser(u);

    if (u?.role === "admin") setRoute("admin");
    else setRoute("home");
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setRoute("home");
  }

  return (
    <>
      {/* Loader Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#fff",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? "auto" : "none",
          transition: "opacity 0.5s ease",
        }}
      >
        <Loader />
      </div>

      <MenuButton route={route} setRoute={setRoute} setLoading={setLoading} />

      <Header
        route={route}
        setRoute={setRoute}
        setLoading={setLoading}
        user={user}
        logout={logout}
      />

      <main
        style={{
          padding: 20,
          minHeight: "60vh",
          opacity: loading ? 0.6 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {(() => {
          const [mainRoute, subRoute] = route.split("/");

          switch (mainRoute) {
            case "home":
              return <Home user={user} />;

            case "about":
              return <About user={user} />;

            case "contact":
              return <Contact user={user} />;

            case "admissions":
              return <Admissions user={user} />;

            case "curriculum":
              switch (subRoute) {
                case "overview":
                  return <CurriculumOverview user={user} />;
                case "primary":
                  return <CurriculumPrimary user={user} />;
                case "secondary":
                  return <CurriculumSecondary user={user} />;
                case "syllabus":
                  return <CurriculumSyllabus user={user} />;
                case "extracurricular":
                  return <CurriculumExtracurricular user={user} />;
                case "assessment":
                  return <CurriculumAssessment user={user} />;
                default:
                  return <Curriculum user={user} />;
              }

            case "performance":
              return <Performance user={user} />;

            case "policies":
              return <Policies user={user} />;

            case "parents":
              return <Parents user={user} />;

            case "gallery":
              return <Gallery user={user} />;

            case "legal":
              return <Legal user={user} />;

            case "feestructure":
              return <FeeStructure user={user} />;

            case "staff":
              switch (subRoute) {
                case "leadership":
                  return <StaffLeadership user={user} />;
                case "teaching":
                  return <StaffTeaching user={user} />;
                case "support":
                  return <StaffSupport user={user} />;
                default:
                  return <Staff user={user} />;
              }

            case "student":
              switch (subRoute) {
                case "admissions-guide":
                  return <StudentAdmissionsGuide user={user} />;
                case "fees":
                  return <StudentFees user={user} />;
                case "exams":
                  return <StudentExams user={user} />;
                case "clubs":
                  return <StudentClubs user={user} />;
                case "support-services":
                  return <StudentSupportServices user={user} />;
                default:
                  return <Student user={user} />;
              }

            case "newsletter":
              return <Newsletter user={user} />;

            case "search":
              return <SearchResults user={user} />;

            case "login":
              return <Login onAuth={handleAuth} user={user} />;

            case "signup":
              return <SignUp onAuth={handleAuth} user={user} />;

            case "admin":
              if (user?.role === "admin")
                return <AdminDashboard user={user} />;
              return <div>Access denied — admin only</div>;

            default:
              return <Home user={user} />;
          }
        })()}
      </main>

      <Footer />
    </>
  );
}

