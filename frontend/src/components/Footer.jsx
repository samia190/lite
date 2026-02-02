import React, { useEffect, useState } from "react";
import { safePath } from "../utils/paths";
import { get } from "../utils/api";
import OptimizedImage from "./OptimizedImage";

const defaultLinks = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Admissions", href: "/admissions" },
    { label: "Curriculum", href: "/curriculum" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
  portals: [
    { label: "Student Portal", href: "/portal/students" },
    { label: "Staff Portal", href: "/portal/staff" },
    { label: "Homework Portal", href: "/portal/homework" },
    { label: "Application Portal", href: "/portal/applications" },
  ],
  academics: [
    { label: "Curriculum Overview", href: "/curriculum" },
    { label: "Subjects", href: "/subjects" },
    { label: "Examinations", href: "/exams" },
    { label: "Clubs & Societies", href: "/clubs" },
    { label: "Guidance & Counseling", href: "/guidance" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [links, setLinks] = useState(defaultLinks);
  const [magazine, setMagazine] = useState(null);

  const safeList = (list, fallback = []) => (Array.isArray(list) ? list : fallback);

  // Make links dynamic from API, but keep safe fallbacks
  useEffect(() => {
    get("/api/footer-links")
      .then((data) => {
        if (!data) return;
        setLinks({
          quickLinks: data.quickLinks || defaultLinks.quickLinks,
          portals: data.portals || defaultLinks.portals,
          academics: data.academics || defaultLinks.academics,
        });
      })
      .catch(() => {
        // Silent fail – keep defaultLinks
      });

    // Fetch latest magazine for cover preview
    get("/api/school-magazine")
      .then((data) => {
        if (data && data.pdfUrl) {
          setMagazine(data);
        }
      })
      .catch(() => {
        // Silent fail
      });
  }, []);

  return (
    <>
      {/* Simple local styles for hover + responsiveness */}
      <style>
        {`
          .footer-link {
            color: #e0ef0aff;
            text-decoration: none;
            transition: color 0.2s ease, transform 0.2s ease;
          }
          .footer-link:hover {
            color: #1b0bfbff;
            transform: translateX(2px);
          }
          .footer-column-title {
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .footer-columns {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .footer-column {
            flex: 1 1 150px;
            min-width: 100px;
          }
          
          /* Mobile footer optimization */
          @media (max-width: 480px) {
            .footer-top {
              flex-direction: column !important;
              gap: 16px !important;
            }
            .footer-brand {
              width: 100%;
            }
            .footer-partnerships {
              min-width: 100% !important;
              flex: none !important;
            }
            .footer-partnerships h4 {
              font-size: 14px !important;
            }
            .footer-partnerships img {
              width: 60px !important;
              height: 30px !important;
            }
            .footer-credits {
              min-width: 100% !important;
              font-size: 12px !important;
            }
            .footer-columns {
              gap: 16px !important;
            }
            .footer-column {
              flex: 1 1 45% !important;
              min-width: 45% !important;
            }
            .footer-column h4 {
              font-size: 14px !important;
            }
            .footer-column ul {
              font-size: 13px !important;
              margin: 0 !important;
            }
            .footer-contact-info {
              font-size: 13px !important;
            }
          }
        `}
      </style>

      <footer
        style={{
          background: "#7506065d",
          padding: window.innerWidth <= 480 ? "16px 12px" : "20px 40px",
          borderTop: "1px solid #5a3fd2ff",
        }}
      >
        <div
          className="footer-top"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {/* ================= SCHOOL BRANDING ================= */}
          <div
            className="brand footer-brand"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <OptimizedImage
              alt="KANGARU GIRLSlogo"
              src="/header/logo.PNG"
              priority={true}
              style={{ width: 60, height: 60 }}
            />
            <div>
              <strong style={{ fontSize: 18 }}>KANGARU GIRLS' SCHOOL</strong>
              <div className="meta" style={{ fontSize: 14, color: "#666" }}>
                © {year}
              </div>
            </div>
          </div>

          {/* ================= COLLABORATORS ================= */}
          <div className="footer-partnerships" style={{ flex: 1, minWidth: 500 }}>
            <h4 style={{ marginBottom: 8 }}>KENYAN CURRUCULUM PATNERSHIP</h4>
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <a
                href="https://www.knec.ac.ke"
                target="_blank"
                rel="noopener noreferrer"
              >
                <OptimizedImage
                  src="/header/knec.PNG"
                  alt="KNEC"
                  loading="lazy"
                  style={{ width: 80, height: 40, objectFit: "contain" }}
                />
              </a>
              <a
                href="https://www.tsc.go.ke"
                target="_blank"
                rel="noopener noreferrer"
              >
                <OptimizedImage
                  src="/header/tsc.PNG"
                  alt="TSC"
                  loading="lazy"
                  style={{ width: 80, height: 40, objectFit: "contain" }}
                />
              </a>
              <a
                href="https://www.education.go.ke"
                target="_blank"
                rel="noopener noreferrer"
              >
                <OptimizedImage
                  src="/header/MOF E.PNG"
                  alt="Ministry of Education"
                  loading="lazy"
                  style={{ width: 80, height: 40, objectFit: "contain" }}
                />
              </a>
              <a
                href="https://www.kicd.ac.ke"
                target="_blank"
                rel="noopener noreferrer"
              >
                <OptimizedImage
                  src="/header/kicd.PNG"
                  alt="KICD"
                  loading="lazy"
                  style={{ width: 80, height: 40, objectFit: "contain" }}
                />
              </a>
              <a
                href="https://www.cbc.go.ke"
                target="_blank"
                rel="noopener noreferrer"
              >
                <OptimizedImage
                  src="/header/CBE.PNG"
                  alt="CBE"
                  loading="lazy"
                  style={{ width: 80, height: 40, objectFit: "contain" }}
                />
              </a>
            </div>
          </div>

          {/* ================= CREDITS ================= */}
          <div className="footer-credits" style={{ fontSize: 14, color: "#555", minWidth: 160 }}>
            Built <br />
            Designed and developed by Samia
          </div>
        </div>

        {/* ================= NAV / INFO COLUMNS ================= */}
        <div
          className="footer-columns"
          style={{
            marginTop: 24,
            borderTop: "1px solid #5d0c0c32",
            paddingTop: 16,
          }}
        >
          {/* CONTACT */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <span role="img" aria-label="contact">
                📞
              </span>
              <span>Contact</span>
            </h4>
            <div className="footer-contact-info" style={{ fontSize: 16, color: "#4812deff", lineHeight: 1.7 }}>
              KANGARU GIRLS' Senior School <br />
              P.O Box 12,60100 EMBU—  <br />
              Phone: 0113688538<br />
              Email:kangarugirls@yahoo.com.<br />
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <span role="img" aria-label="links">
                🔗
              </span>
              <span>Quick Links</span>
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 29,
                lineHeight: 1.8,
                fontSize: 18,
                fontWeight: "bold",
                marginleft:23
              }}
            >
              {safeList(links.quickLinks, defaultLinks.quickLinks).map((item) => (
                <li key={item.href || item.label}>
                  <a href={item.href || "#"} className="footer-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* PORTALS */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <span role="img" aria-label="portals">
                🔐
              </span>
              <span>Portals</span>
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                lineHeight: 1.8,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {safeList(links.portals, defaultLinks.portals).map((item) => (
                <li key={item.href || item.label}>
                  <a href={item.href || "#"} className="footer-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ACADEMICS */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <span role="img" aria-label="academics">
                🎓
              </span>
              <span>Academics</span>
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                lineHeight: 1.8,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {safeList(links.academics, defaultLinks.academics).map((item) => (
                <li key={item.href || item.label}>
                  <a href={item.href || "#"} className="footer-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SCHOOL MAGAZINE */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <span role="img" aria-label="magazine">
                📰
              </span>
              <span>School Magazine</span>
            </h4>
            {magazine && magazine.coverImage && (
              <div style={{
                marginBottom: 12,
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                maxWidth: 120,
              }}>
                <img
                  src={magazine.coverImage}
                  alt="Latest Magazine Cover"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "3/4",
                    objectFit: "cover"
                  }}
                />
              </div>
            )}
            <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              {magazine ? 
                (magazine.issue ? `${magazine.issue} - ${new Date(magazine.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : "Read our latest magazine") 
                : "Read our school magazine"}
            </p>
            <a
              href="#newsletter"
              onClick={(e) => {
                e.preventDefault();
                if (window.setRoute) {
                  window.setRoute("newsletter");
                }
              }}
              className="footer-link"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#481010ff",
                color: "#fff",
                borderRadius: 6,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: "bold",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#6b1515";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#481010ff";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              View Magazine 📖
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
