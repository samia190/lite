import React, { useState, useEffect } from "react";
import './App.css'; 
import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Admissions from "./components/Admissions";
import Student from "./components/Student";
import Newsletter from "./components/Newsletter";
import Gallery from "./components/Gallery";
import Events from "./components/Events";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/AdminDashboard";
import DevLogin from "./components/DevLogin";
import Curriculum from "./components/Curriculum";
import Performance from "./components/Performance";
import Policies from "./components/Policies";
import Parents from "./components/Parents";
import Staff from "./components/Staff";
import Legal from "./components/Legal";
import SearchResults from "./components/SearchResults";
import FeeStructure from "./components/FeeStructure";
import HomeworkPortal from "./components/HomeworkPortal"; // ✅ keep this one
import StudentVerification from "./components/StudentVerification";
import StudentIDManagement from "./components/StudentIDManagement";
import StudentResults from "./components/StudentResults";
import ResultsManagement from "./components/ResultsManagement";
import SchoolPerformance from "./components/SchoolPerformance";
import SchoolPerformanceAdmin from "./components/SchoolPerformanceAdmin";

import CurriculumOverview from "./components/subpages/CurriculumOverview.jsx";
import CurriculumPrimary from "./components/subpages/CurriculumPrimary.jsx";
import CurriculumSecondary from "./components/subpages/CurriculumSecondary.jsx";
import CurriculumSyllabus from "./components/subpages/CurriculumSyllabus.jsx";
import CurriculumExtracurricular from "./components/subpages/CurriculumExtracurricular.jsx";
import CurriculumAssessment from "./components/subpages/CurriculumAssessment.jsx";

import StaffLeadership from "./components/subpages/StaffLeadership.jsx";
import StaffTeaching from "./components/subpages/StaffTeaching.jsx";
import StaffSupport from "./components/subpages/StaffSupport.jsx";
import CurriculumDynamicSection from "./components/subpages/CurriculumDynamicSection.jsx";


import StudentAdmissionsGuide from "./components/subpages/StudentAdmissionsGuide.jsx";
import StudentFees from "./components/subpages/StudentFees.jsx";
import StudentExams from "./components/subpages/StudentExams.jsx";
import StudentClubs from "./components/subpages/StudentClubs.jsx";
import StudentSupportServices from "./components/subpages/StudentSupportServices.jsx";
import CurriculumCareers from "./components/subpages/CurriculumCareers.jsx";
import PageBackgroundManagement from "./components/PageBackgroundManagement";



// ❌ REMOVE this duplicate import (pages version)
// import HomeworkPortal from "./pages/HomeworkPortal";

function MenuButton({ route, setRoute, setLoading, user }) {
  const [open, setOpen] = useState(false);
  const HIDDEN = ["login", "signup"];

  if (HIDDEN.includes((route || "").toLowerCase())) return null;

  const links = [
    // admin quick link visible only when logged in as admin
    ...(user && user.role === "admin" ? [
      { key: "admin", label: "Admin", icon: "👤" },
      { key: "student-id-management", label: "Student ID Cards", icon: "🪪" },
      { key: "results-management", label: "Results Management", icon: "📊" },
      { key: "performance-management", label: "School Performance", icon: "🏆" }
    ] : []),
    { key: "home", label: "Home", icon: "🏠" },
    { key: "about", label: "About", icon: "ℹ️" },
    { key: "admissions", label: "Admissions", icon: "📝" },
    { key: "events", label: "Events", icon: "📅" },
    { key: "feestructure", label: "Fee Structure", icon: "💰" },
    { key: "curriculum", label: "Curriculum", icon: "📖" },
    { key: "curriculum/careers", label: "Curriculum Careers", icon: "💼" },
    { key: "performance", label: "Performance", icon: "📊" },
    { key: "policies", label: "Policies", icon: "📋" },
    { key: "parents", label: "Parents", icon: "👨‍👩‍👧" },
    { key: "student", label: "Student", icon: "🎓" },
    { key: "staff", label: "Staff", icon: "👥" },
    { key: "gallery", label: "Gallery", icon: "🖼️" },
    { key: "legal", label: "Legal", icon: "⚖️" },
    { key: "newsletter", label: "Newsletter", icon: "📰" },
    { key: "contact", label: "Contact", icon: "📞" },
    { key: "portal/homework", label: "Homework Portal", icon: "📚" },
  ];

  const handleClick = (key) => {
    setOpen(false);
    if (typeof setLoading === "function") setLoading(true);
    setRoute(key);
  };

  return (
    <>
      {/* Toggle Button */}
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
          border: "1px solid rgba(13, 236, 39, 0.93)",
          background: "brown",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f60f0fe3",
          fontSize: 20,
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(65, 15, 231, 0.25)",
        }}
      >
        {open ? "×" : "≡"}
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          />
          {/* Drawer */}
          <nav
            aria-label="Sidebar menu"
            style={{
              position: "fixed",
              left: 0,
              top: 70,
              bottom: 0,
              width: 280,
              background: "#f7081cb9",
              zIndex: 1000,
              boxShadow: "2px 0 8px rgba(116, 221, 17, 0.43)",
              padding: "16px 12px",
              overflowY: "auto",
            }}
          >
            <h3 style={{ margin: "00 0 00px 0px", textAlign: "right" }}></h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "8px",
              padding: 0
            }}>
              {links.map((item) => {
                const isActive = route === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleClick(item.key)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 8px",
                      borderRadius: 8,
                      border: "1px solid rgba(13, 236, 39, 0.3)",
                      background: isActive ? "#10e929ff" : "rgba(255, 255, 255, 0.1)",
                      color: isActive ? "#210202ff" : "#d0f408ff",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: isActive ? "bold" : "normal",
                      textAlign: "center",
                      minHeight: "70px",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "24px", marginBottom: "4px" }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState("home");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Loader + expose global router
  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
    }

    // make router globally available and maintain a simple in-memory route stack
    window.__routeStack = window.__routeStack || [];
    window.setRoute = (r) => {
      setRoute((prev) => {
        try {
          window.__routeStack.push(prev);
        } catch (err) {}
        return r;
      });
    };
    window.__goBack = () => {
      try {
        const last = window.__routeStack.pop();
        if (last) setRoute(last);
        else setRoute("home");
      } catch (err) {
        setRoute("home");
      }
    };
    window.__route = route;

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, [route]);

  // Decode user from token (if any)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const [header, payload] = token.split(".");
        if (payload) {
          const data = JSON.parse(atob(payload));
          setUser({ email: data.email, role: data.role, id: data.id });
        }
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  // Listen for dev auto-login events (dev helper)
  useEffect(() => {
    function onDevLogin(e) {
      try {
        const token = e?.detail?.token;
        if (!token) return;
        localStorage.setItem("token", token);
        const payload = JSON.parse(atob(token.split(".")[1]));
        const u = { email: payload.email, role: payload.role, id: payload.id };
        setUser(u);
        if (u?.role === "admin") setRoute("admin");
        else if (u?.role === "teacher") setRoute("teacher");
        else if (u?.role === "student") setRoute("student");
        else setRoute("staff");
      } catch (err) {
        console.error("Dev login failed", err);
      }
    }

    window.addEventListener("nguviu:dev-login", onDevLogin);
    return () => window.removeEventListener("nguviu:dev-login", onDevLogin);
  }, []);

  function handleAuth(u) {
    setUser(u);
    if (u?.role === "admin") setRoute("admin");
    else if (u?.role === "teacher") setRoute("teacher");
    else if (u?.role === "student") setRoute("student");
    else setRoute("staff");
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setRoute("home");
  }

  // Soft fade loader
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, route]);

  return (
    <>
      {/* Loader overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#481010ff",
          zIndex: 9999,
          display: loading ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.5s ease",
        }}
      >
        <Loader />
      </div>

      {/* Page content */}
      <Header
        route={route}
        setRoute={setRoute}
        setLoading={setLoading}
        user={user}
        logout={logout}
      />
      <MenuButton route={route} setRoute={setRoute} setLoading={setLoading} user={user} />

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
              return <Home user={user} setRoute={setRoute} />;

            case "about":
              return <About user={user} />;

            case "contact":
              return <Contact user={user} />;

            case "admissions":
              return <Admissions user={user} />;

            case "curriculum": {
            const parts = route.split("/");
            const subRoute = parts[1]; // "overview", "primary", "careers", etc.

  switch (subRoute) {
    case undefined:
      return <Curriculum user={user} />;
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
    case "careers":
      // if you want the static Careers component:
      return <CurriculumCareers user={user} />;

    default:
      // any other slug -> dynamic admin-created subpage
      return <CurriculumDynamicSection slug={subRoute} />;
  }
}

            case "performance":
              return <Performance user={user} />;

            case "policies":
              return <Policies user={user} />;

            case "parents":
              return <Parents user={user} />;

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

            case "gallery":
              return <Gallery user={user} />;

            case "legal":
              return <Legal user={user} />;

            case "student":
              // Always render the Student page as the parent container and let it
              // mount its subpages when `subRoute` is present. This preserves the
              // student page layout while keeping routing behaviour.
              return <Student user={user} subRoute={subRoute} setRoute={setRoute} />;

            case "portal":
              // ✅ Homework portal route handled here
              if (subRoute === "homework") {
                return <HomeworkPortal user={user} />;
              }
              // fallback if someone navigates to just "portal"
              return <Home user={user} setRoute={setRoute} />;

            case "events":
              return <Events user={user} />;

            case "newsletter":
              return <Newsletter user={user} />;

            case "search":
              return <SearchResults user={user} />;

            case "login":
              return <Login onAuth={handleAuth} navigate={setRoute} user={user} />;

            case "reset-password":
              return <ResetPassword navigate={setRoute} user={user} />;

            case "dev-login":
              return <DevLogin />;

            case "signup":
              return <SignUp onAuth={handleAuth} user={user} />;

            case "verify-student":
              // Hidden route - only accessible via QR code scan
              return <StudentVerification />;

            case "student-id-management":
              // Admin-only route for managing student IDs
              if (user?.role === "admin")
                return <StudentIDManagement user={user} />;
              return <div>Access denied — admin only</div>;

            case "student-results":
              // Student-only route for viewing and downloading results
              if (user?.role === "student")
                return <StudentResults user={user} />;
              return <div>Access denied — student only</div>;

            case "results-management":
              // Admin-only route for managing student results
              if (user?.role === "admin")
                return <ResultsManagement user={user} />;
              return <div>Access denied — admin only</div>;

            case "performance-management":
              // Admin-only route for managing school performance
              if (user?.role === "admin")
                return <SchoolPerformanceAdmin user={user} />;
              return <div>Access denied — admin only</div>;

            case "admin":
              if (user?.role === "admin")
                return <AdminDashboard user={user} />;
              return <div>Access denied — admin only</div>;

            default:
              return <Home user={user} setRoute={setRoute} />;
            
            
               
               

               case "page-backgrounds":
              if (user?.role === "admin")
                return <PageBackgroundManagement user={user} />;
              return <div>Access denied — admin only</div>;

          }
        })()}
      </main>

      <Footer />
    </>
  );
}
