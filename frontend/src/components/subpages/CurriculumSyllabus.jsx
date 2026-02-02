import React from "react";

function backToCurriculum() {
  if (typeof window !== "undefined" && typeof window.setRoute === "function") {
    window.setRoute("curriculum");
  }
}

export default function CurriculumSyllabus() {
  return (
    <section style={{ padding: 20 }}>
      <button
        type="button"
        onClick={backToCurriculum}
        style={{
          marginBottom: "1rem",
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #9ca3af",
          background: "#f3f4f6",
          cursor: "pointer",
        }}
      >
        ← Back to Curriculum
      </button>

      <h2>Curriculum – Syllabus</h2>
      <p>
        This page can describe syllabus details and link to downloadable term
        outlines or schemes of work.
      </p>
    </section>
  );
}
