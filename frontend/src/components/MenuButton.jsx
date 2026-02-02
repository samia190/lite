import React from "react";
import SmartLink from "./SmartLink";

export default function MenuButton({ route, setRoute, setLoading, links = [] }) {
  const [open, setOpen] = React.useState(false);
  const HIDDEN = ["login", "signup"];
  if (HIDDEN.includes((route || "").toLowerCase())) return null;

  const defaultLinks = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "about", label: "About", icon: "ℹ️" },
    { key: "admissions", label: "Admissions", icon: "📝" },
    { key: "curriculum", label: "Curriculum", icon: "📚" },
    { key: "performance", label: "Performance", icon: "📊" },
    { key: "policies", label: "Policies", icon: "📋" },
    { key: "parents", label: "Parents", icon: "👨‍👩‍👧‍👦" },
    { key: "student", label: "Student", icon: "👨‍🎓" },
    { key: "staff", label: "Staff", icon: "👥" },
    { key: "gallery", label: "Gallery", icon: "🖼️" },
    { key: "legal", label: "Legal", icon: "⚖️" },
    { key: "newsletter", label: "Newsletter", icon: "📰" },
    { key: "events", label: "Events", icon: "📅" },
    { key: "contact", label: "Contact", icon: "📞" },
  ];

  const items = links.length ? links : defaultLinks;

  React.useEffect(() => {
    const body = document.body;
    if (open) {
      body.style.overflow = "hidden";
      body.style.height = "100vh";
    } else {
      body.style.overflow = "";
      body.style.height = "";
    }
    return () => {
      body.style.overflow = "";
      body.style.height = "";
    };
  }, [open]);

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((s) => !s)}
        style={{
          position: "fixed",
          right: 12,
          top: 12,
          marginTop: 90,
          zIndex: 1002,
          width: 60,
          height: 44,
          borderRadius: 8,
          border: "1px solid rgba(29, 11, 221, 0.93)",
          background: "brown",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "inline-block", width: 20 }}>{open ? "✕" : "☰"}</span>
      </button>

      {/* Overlay and Menu */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 1000,
            }}
            aria-hidden
          />
          <nav
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: 12,
              top: 64,
              bottom: 12,
              zIndex: 1001,
              width: "80vw",
              maxWidth: 320,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#d60a0a8a",
              borderRadius: 8,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              {items.map((l) => (
                <button
                  key={l.key}
                  onClick={() => {
                    setRoute(l.key);
                    setLoading && setLoading(true);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px 8px",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    color: "#333",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  <span style={{ fontSize: "2rem", marginBottom: "8px" }}>{l.icon}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}