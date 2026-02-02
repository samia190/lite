import React from "react";

function backToCurriculum() {
  if (typeof window !== "undefined" && typeof window.setRoute === "function") {
    window.setRoute("curriculum");
  }
}

export default function CurriculumCareers() {
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

      <h2>Curriculum – Careers & Pathways</h2>
      <p>
        This page can describe subject choices, career pathways, CBC pathways,
        and guidance on how learners can prepare for their future studies and work.
      </p>
    </section>
  );
}
