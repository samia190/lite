import React from "react";

function backToCurriculum() {
  if (typeof window !== "undefined" && typeof window.setRoute === "function") {
    window.setRoute("curriculum");
  }
}

export default function CurriculumOverview() {
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

      <h2>Curriculum – Overview</h2>
      <p>
        This page gives a general overview of the school curriculum, its
        philosophy, goals, and structure. You can customise this text directly
        in the code for now.
      </p>
    </section>
  );
}
