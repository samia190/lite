import React, { useEffect, useState } from "react";
import { get } from "../../utils/api";

function backToCurriculum() {
  if (typeof window !== "undefined" && typeof window.setRoute === "function") {
    window.setRoute("curriculum");
  }
}

export default function CurriculumDynamicSection({ slug }) {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSection() {
      setLoading(true);
      setError("");
      try {
        const data = await get("/api/content/curriculum");

        const sections = data.sections || (data.data && data.data.sections) || [];
        const found =
          sections.find(
            (s) =>
              s.slug === slug ||
              (s.slug || "").toLowerCase() === (slug || "").toLowerCase()
          ) || null;

        if (!found) {
          setError("Subpage not found.");
          setSection(null);
        } else {
          setSection(found);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading subpage.");
        setLoading(false);
      }
    }

    fetchSection();
  }, [slug]);

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

      {loading && <p>Loading subpage…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {section && !loading && (
        <>
          <h2>{section.title || "Curriculum Section"}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{section.body || ""}</p>
        </>
      )}
    </section>
  );
}
