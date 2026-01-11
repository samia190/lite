import { useEffect, useState } from "react";
import LazyImage from "../components/LazyImage";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import EditableText from "../components/EditableText";
import EditableFileList from "../components/EditableFileList";
import { safePath } from "../utils/paths";
import StudentAdmissionsGuide from "./subpages/StudentAdmissionsGuide.jsx";
import StudentFees from "./subpages/StudentFees.jsx";
import StudentExams from "./subpages/StudentExams.jsx";
import StudentClubs from "./subpages/StudentClubs.jsx";
import StudentSupportServices from "./subpages/StudentSupportServices.jsx";

export default function Student({ user, subRoute }) {
  const route = window.__route;
  const [mainRoute, routeSub] = route.split("/");
  const currentSub = subRoute || routeSub || null;

  const switchTab = (key) => {
    if (typeof window.setRoute === "function") window.setRoute(`student/${key}`);
    else window.setRoute && window.setRoute(`student/${key}`);
  };

  const subpageMap = {
    "admissions-guide": StudentAdmissionsGuide,
    fees: StudentFees,
    exams: StudentExams,
    clubs: StudentClubs,
    "support-services": StudentSupportServices,
  };

  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  // Load page content
  useEffect(() => {
    get("/api/content/students")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load student resources."));
  }, []);

  // Admin update handler
  function updateSection(section, value) {
    patch(`/api/content/students/${section}`, { value })
      .then(() => {
        setContent((prev) => ({ ...prev, [section]: value }));
      })
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  const isAdmin = user?.role === "admin";

  // Default gallery groups (for first load / non-configured state)
  const defaultAcademicGallery = [
    {
      name: "",
      url: "/images/students/IMG_0778.JPG",
    },
    {
      name: "",
      url:"/images/students/IMG_1030.JPG",
    },
    {
      name: "",
      url: "/images/students/IMG_1043.JPG",
       
    },
    {
      name: "",
      url: "/images/students/IMG_1056.JPG",
    },
    {
      name: "",
      url: "/images/students/IMG_1067.JPG",
    },
    {
      name: "",
      url: "/images/students/IMG_1086.JPG",
    },
    {
      name: "",
      url: "/images/students/IMG_1329.JPG",
    },
    {
      name: "",
      url: "/images/students/IMG_1447.JPG",
    },
    {
      name: "",
      url: "/images/students/student life 1.JPG",
    },
    {
      name: "",
      url: "/images/students/life (2).JPG",
    },
    {
      name: "",
      url: "/images/students/life 5.JPG",
    },
    {
      name: "",
      url: "/images/students/life.JPG",
    },
    {
      name: "",
      url: "/images/students/sc (3).JPG",
    },
    {
      name: "",
      url: "/images/students/sc (2).JPG",
    },
    {
      name: "",
      url: "/images/students/sc.JPG",
    },
    {
      name: "",
      url: "/images/students/std 7.JPG",
    },
    {
      name: "",
      url: "/images/students/std 4.JPG",
    },
    {
      name: "",
      url: "/images/students/std 2.JPG",
    },
    {
      name: "",
      url: "/images/students/std 0.JPG",
    }
    
  ];

  const defaultCocurricularGallery = [
    { name: "", url: "/images/students/IMG_1257.JPG" },
    { name: "", url: "/images/students/IMG_1221.JPG" },
    { name: "", url: "/images/students/IMG_1194.JPG" },
    { name: "", url: "/images/students/IMG_1329.JPG" },
    { name: "", url: "/images/students/IMG_1332.JPG" },
    { name: "", url: "/images/students/IMG_1413.JPG" },
    { name: "", url: "/images/students/IMG_1415.JPG" },
    { name: "", url: "/images/students/IMG_1424.JPG" },
    { name: "", url: "/images/students/IMG_1443.JPG" },
    { name: "", url: "/images/students/IMG_1444.JPG" },
    { name: "", url: "/images/students/IMG_1447.JPG" },
    { name: "", url: "/images/students/IMG_1449.JPG" },
    { name: "", url: "/images/students/IMG_1458.JPG" },
    { name: "", url: "/images/students/IMG_1459.JPG" },
    { name: "", url: "/images/students/IMG_1475.JPG" },
    { name: "", url: "/images/students/IMG_1528.JPG" },
    { name: "", url: "/images/students/IMG_1641.JPG" },
    { name: "", url: "/images/students/IMG_1644.JPG" },
    { name: "", url: "/images/students/IMG_1649.JPG" },
    { name: "", url: "/images/students/IMG_1650.JPG" },
    { name: "", url: "/images/students/IMG_1651.JPG" },
    { name: "", url: "/images/students/IMG_1653.JPG" },
    { name: "", url: "/images/students/IMG_1655.JPG" },
    { name: "", url: "/images/students/IMG_1659.JPG" },
    { name: "", url: "/images/students/IMG_1667.JPG" },
    { name: "", url: "/images/students/IMG_1669.JPG" },
    { name: "", url: "/images/students/IMG_1671.JPG" },
    { name: "", url: "/images/students/IMG_1672.JPG" },
    { name: "", url: "/images/students/IMG_1673.JPG" },
    { name: "", url: "/images/students/IMG_1674.JPG" },
    { name: "", url: "/images/students/IMG_1675.JPG" },
    { name: "", url: "/images/students/IMG_1676.JPG" },
    { name: "", url: "/images/students/IMG_1677.JPG" },
    { name: "", url: "/images/students/IMG_1680.JPG" },
    { name: "", url: "/images/students/IMG_1681.JPG" },
    { name: "", url: "/images/students/IMG_1682.JPG" },
    { name: "", url: "/images/students/IMG_1683.JPG" },
    { name: "", url: "/images/students/IMG_1684.JPG" },
    { name: "", url: "/images/students/IMG_1685.JPG" },
    { name: "", url: "/images/students/IMG_1686.JPG" },
    { name: "", url: "/images/students/IMG_1687.JPG" },
    { name: "", url: "/images/students/IMG_1688.JPG" },
    { name: "", url: "/images/students/IMG_1689.JPG" },
    { name: "", url: "/images/students/IMG_1690.JPG" },
    { name: "", url: "/images/students/IMG_1691.JPG" },
    { name: "", url: "/images/students/IMG_1692.JPG" },
    { name: "", url: "/images/students/IMG_1693.JPG" },
    { name: "", url: "/images/students/IMG_1745.JPG" },
    { name: "", url: "/images/students/IMG_1741.JPG" },
  ];

  const academicGalleryFiles =
    content.academicGalleryFiles ||defaultAcademicGallery
  const cocurricularGalleryFiles =
    content.cocurricularGalleryFiles  ||defaultCocurricularGallery

  // Lightbox / viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerList, setViewerList] = useState([]);

  // Gallery carousel state
  const [academicStartIndex, setAcademicStartIndex] = useState(0);
  const [cocurricularStartIndex, setCocurricularStartIndex] = useState(0);
  const imagesPerPage = 4; // 2 rows x 2 columns

  function openViewer(list, index) {
    setViewerList(list || []);
    setViewerIndex(index || 0);
    setViewerOpen(true);
  }

  function closeViewer() {
    setViewerOpen(false);
  }

  function nextImage() {
    setViewerIndex((i) => (viewerList.length ? (i + 1) % viewerList.length : i));
  }

  function prevImage() {
    setViewerIndex((i) => (viewerList.length ? (i - 1 + viewerList.length) % viewerList.length : i));
  }

  function nextAcademicPage() {
    setAcademicStartIndex((prev) => 
      Math.min(prev + imagesPerPage, academicGalleryFiles.length - imagesPerPage)
    );
  }

  function prevAcademicPage() {
    setAcademicStartIndex((prev) => Math.max(0, prev - imagesPerPage));
  }

  function nextCocurricularPage() {
    setCocurricularStartIndex((prev) => 
      Math.min(prev + imagesPerPage, cocurricularGalleryFiles.length - imagesPerPage)
    );
  }

  function prevCocurricularPage() {
    setCocurricularStartIndex((prev) => Math.max(0, prev - imagesPerPage));
  }

  useEffect(() => {
    if (!viewerOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, viewerList]);

  return (
    <div className="student-page">
      {/* ================= HERO VIDEO SECTION ================= */}
      {/* ================= HERO VIDEO SECTION ================= */}
<div
  className="student-hero"
  style={{
    position: "relative",
    width: "100vw",
    marginLeft: "50%",
    transform: "translateX(-50%)",
    maxHeight: 420,
    overflow: "hidden",
  }}
>
  <video
    width="100%"
    height="100%"
    autoPlay
    preload="none"
    playsInline
    loop
    muted
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  >
    <source
      src={safePath(content.heroVideoUrl || "/images/students/life 1.mp4")}
      type="video/mp4"
    />
    Your browser does not support the video tag.
  </video>

  {/* Dark overlay */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65))",
    }}
  />

  {/* Text container */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        maxWidth: 720,
        width: "100%",
        padding: "16px 20px",
        borderRadius: 10,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <EditableHeading
        value={content.heroTitle || "Welcome to the Student Portal"}
        onSave={(val) => updateSection("heroTitle", val)}
        isAdmin={isAdmin}
        level={2}
      />

      <EditableText
        value={
          content.heroSubtitle ||
          "Access your resources, schedules, activities, and support — all in one place."
        }
        onSave={(val) => updateSection("heroSubtitle", val)}
        isAdmin={isAdmin}
      />
    </div>
  </div>
</div>

      <h1>Student Portal</h1>

      {/* ---------- TABS ---------- */}
      <div
        className="student-tabs"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid #ccc",
          paddingBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => switchTab("admissions-guide")}>
          Admissions Guide
        </button>
        <button onClick={() => switchTab("students")}>Students</button>
        <button onClick={() => switchTab("FeeStructure")}>
          Fee Structure
        </button>
        <button onClick={() => switchTab("exams")}>Exams</button>
        <button onClick={() => switchTab("clubs")}>Clubs</button>
        <button onClick={() => switchTab("support-services")}>
          Support Services
        </button>
        {user?.role === "student" && (
          <button 
            onClick={() => window.setRoute("student-results")}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            📄 My Results
          </button>
        )}
      </div>

      {/* ---------- CONTENT ---------- */}
      {(() => {
        const Sub = subpageMap[currentSub];
        if (Sub) {
          return (
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <button
                    onClick={() => {
                      if (window && typeof window.__goBack === "function") window.__goBack();
                      else window.setRoute && window.setRoute("student");
                    }}
                    style={{ padding: "6px 8px", borderRadius: 6, border: "none", cursor: "pointer" }}
                  >
                    ← Back
                  </button>
                </div>
                <div style={{ fontWeight: "bold" }}>{currentSub.replace(/-/g, " ")}</div>
                <div />
              </div>

              <div>
                <Sub user={user} />
              </div>
            </div>
          );
        }

        return (
          <section style={{ padding: 20 }}>
            {/* TITLE */}
            <EditableHeading
              value={content.title || "Student Resources"}
              onSave={(val) => updateSection("title", val)}
              isAdmin={isAdmin}
              level={2}
            />

            {/* INTRO */}
            <EditableText
              value={
                content.intro ||
                "Welcome, students! Here you'll find everything you need to stay organized, involved, and informed."
              }
              onSave={(val) => updateSection("intro", val)}
              isAdmin={isAdmin}
            />

            {/* TIMETABLES */}
            <EditableSubheading
              value={content.timetableHeading || "Class Timetables"}
              onSave={(val) => updateSection("timetableHeading", val)}
              isAdmin={isAdmin}
              level={3}
            />

            <EditableFileList
              files={
                content.timetableFiles || [
                  { name: "Form 1 Timetable", url: "/files/timetable-form1.pdf" },
                  { name: "Form 2 Timetable", url: "/files/timetable-form2.pdf" },
                  { name: "Form 3 Timetable", url: "/files/timetable-form3.pdf" },
                  { name: "Form 4 Timetable", url: "/files/timetable-form4.pdf" },
                ]
              }
              onSave={(files) => updateSection("timetableFiles", files)}
              isAdmin={isAdmin}
            />

            {/* HOMEWORK */}
            <EditableSubheading
              value={content.homeworkHeading || "Homework Portal"}
              onSave={(val) => updateSection("homeworkHeading", val)}
              isAdmin={isAdmin}
              level={3}
            />

            <EditableText
              value={
                content.homeworkIntro ||
                "Access assignments and submit your work online. Use the portal link below and follow the guide."
              }
              onSave={(val) => updateSection("homeworkIntro", val)}
              isAdmin={isAdmin}
            />

            <EditableFileList
              files={
                content.homeworkFiles || [
                  {
                    name: "Homework Submission Guide",
                    url: "/files/homework-guide.pdf",
                  },
                ]
              }
              onSave={(files) => updateSection("homeworkFiles", files)}
              isAdmin={isAdmin}
            />

            <p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.setRoute) {
                    window.setRoute("portal/homework");
                  }
                }}
              >
                Go to Homework Portal
              </a>
            </p>

            {/* CLUBS */}
            <EditableSubheading
              value={content.clubsHeading || "Clubs & Extracurriculars"}
              onSave={(val) => updateSection("clubsHeading", val)}
              isAdmin={isAdmin}
              level={3}
            />

            <EditableText
              value={
                content.clubs ||
                "• Science Club – Thursdays at 3:30 PM\n" +
                  "• Drama Club – Wednesdays at 4:00 PM\n" +
                  "• Football Team – Practice on Mondays & Fridays\n" +
                  "• Debate Society – Tuesdays at 3:45 PM"
              }
              onSave={(val) => updateSection("clubs", val)}
              isAdmin={isAdmin}
            />

            {/* STUDENT COUNCIL */}
            <EditableSubheading
              value={content.councilHeading || "Student Council"}
              onSave={(val) => updateSection("councilHeading", val)}
              isAdmin={isAdmin}
              level={3}
            />

            <EditableText
              value={
                content.councilIntro ||
                "Our student leaders represent your voice. Elections are held every January. Download the charter and candidate form below."
              }
              onSave={(val) => updateSection("councilIntro", val)}
              isAdmin={isAdmin}
            />

            <EditableFileList
              files={
                content.councilFiles || [
                  {
                    name: "Student Council Charter",
                    url: "/files/student-council-charter.pdf",
                  },
                  { name: "Candidate Form", url: "/files/candidate-form.pdf" },
                ]
              }
              onSave={(files) => updateSection("councilFiles", files)}
              isAdmin={isAdmin}
            />

            {/* CODE OF CONDUCT */}
            <EditableSubheading
              value={content.conductHeading || "Code of Conduct"}
              onSave={(val) => updateSection("conductHeading", val)}
              isAdmin={isAdmin}
              level={3}
            />

            <EditableText
              value={
                content.conductIntro ||
                "All students are expected to uphold our values of respect, responsibility, and excellence."
              }
              onSave={(val) => updateSection("conductIntro", val)}
              isAdmin={isAdmin}
            />

            <EditableFileList
              files={
                content.conductFiles || [
                  {
                    name: "Code of Conduct",
                    url: "/files/code-of-conduct.pdf",
                  },
                ]
              }
              onSave={(files) => updateSection("conductFiles", files)}
              isAdmin={isAdmin}
            />

            {/* ================= STUDENT LIFE GALLERY ================= */}
            <EditableSubheading
              value={content.galleryHeading || "Student Life Gallery"}
              onSave={(val) => updateSection("galleryHeading", val)}
              isAdmin={isAdmin}
              level={3}
            />

            <EditableText
              value={
                content.galleryIntro ||
                "Explore moments from academic life and co-curricular activities at Nguviu Girls School."
              }
              onSave={(val) => updateSection("galleryIntro", val)}
              isAdmin={isAdmin}
            />

            {/* Academic Life Group */}
            <EditableSubheading
              value={content.academicGalleryHeading || "Academic Life"}
              onSave={(val) => updateSection("academicGalleryHeading", val)}
              isAdmin={isAdmin}
              level={4}
            />

            <EditableFileList
              files={academicGalleryFiles}
              onSave={(files) => updateSection("academicGalleryFiles", files)}
              isAdmin={isAdmin}
            />

            <div style={{ position: "relative", marginTop: 12 }}>
              {academicStartIndex > 0 && (
                <button
                  onClick={prevAcademicPage}
                  className="gallery-nav gallery-nav-prev"
                  aria-label="Previous images"
                >
                  ‹
                </button>
              )}
              
              <div className="gallery-grid gallery-grid-optimized">
                {academicGalleryFiles
                  .slice(academicStartIndex, academicStartIndex + imagesPerPage)
                  .map((file, idx) => {
                    const actualIndex = academicStartIndex + idx;
                    return (
                      <div key={file.url} className="gallery-item">
                        <button
                          className="gallery-thumb"
                          onClick={() => openViewer(academicGalleryFiles, actualIndex)}
                          aria-label={`Open image ${actualIndex + 1}`}
                          style={{
                            border: "none",
                            padding: 0,
                            background: "none",
                            cursor: "pointer",
                            width: "100%",
                            display: "block",
                          }}
                        >
                          <LazyImage 
                            src={safePath(file.url)} 
                            alt={file.name || `Academic life ${actualIndex + 1}`}
                            style={{
                              width: "100%",
                              height: "180px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </button>
                        {file.name && <div className="gallery-caption">{file.name}</div>}
                      </div>
                    );
                  })}
              </div>

              {academicStartIndex + imagesPerPage < academicGalleryFiles.length && (
                <button
                  onClick={nextAcademicPage}
                  className="gallery-nav gallery-nav-next"
                  aria-label="Next images"
                >
                  ›
                </button>
              )}
            </div>

            {/* Co-curricular Group */}
            <EditableSubheading
              value={content.cocurricularGalleryHeading || "Co-curricular & Clubs"}
              onSave={(val) => updateSection("cocurricularGalleryHeading", val)}
              isAdmin={isAdmin}
              level={4}
            />

            <EditableFileList
              files={cocurricularGalleryFiles}
              onSave={(files) =>
                updateSection("cocurricularGalleryFiles", files)
              }
              isAdmin={isAdmin}
            />

            <div style={{ position: "relative", marginTop: 12 }}>
              {cocurricularStartIndex > 0 && (
                <button
                  onClick={prevCocurricularPage}
                  className="gallery-nav gallery-nav-prev"
                  aria-label="Previous images"
                >
                  ‹
                </button>
              )}
              
              <div className="gallery-grid gallery-grid-optimized">
                {cocurricularGalleryFiles
                  .slice(cocurricularStartIndex, cocurricularStartIndex + imagesPerPage)
                  .map((file, idx) => {
                    const actualIndex = cocurricularStartIndex + idx;
                    return (
                      <div key={file.url} className="gallery-item">
                        <button
                          className="gallery-thumb"
                          onClick={() => openViewer(cocurricularGalleryFiles, actualIndex)}
                          aria-label={`Open image ${actualIndex + 1}`}
                          style={{
                            border: "none",
                            padding: 0,
                            background: "none",
                            cursor: "pointer",
                            width: "100%",
                            display: "block",
                          }}
                        >
                          <LazyImage 
                            src={safePath(file.url)} 
                            alt={file.name || `Co-curricular activity ${actualIndex + 1}`}
                            style={{
                              width: "100%",
                              height: "180px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </button>
                        {file.name && <div className="gallery-caption">{file.name}</div>}
                      </div>
                    );
                  })}
              </div>

              {cocurricularStartIndex + imagesPerPage < cocurricularGalleryFiles.length && (
                <button
                  onClick={nextCocurricularPage}
                  className="gallery-nav gallery-nav-next"
                  aria-label="Next images"
                >
                  ›
                </button>
              )}
            </div>

            {/* Lightbox viewer */}
            {viewerOpen && viewerList && viewerList.length > 0 && (
              <div className="lightbox-overlay" onClick={closeViewer}>
                <button
                  className="lightbox-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeViewer();
                  }}
                  aria-label="Close viewer"
                >
                  ×
                </button>

                <button
                  className="lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>

                <div
                  className="lightbox-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={safePath(viewerList[viewerIndex].url)}
                    alt={viewerList[viewerIndex].name}
                    className="lightbox-image"
                    loading="eager"
                  />
                </div>

                <button
                  className="lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </div>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
          </section>
        );
      })()}
    </div>
  );
}
