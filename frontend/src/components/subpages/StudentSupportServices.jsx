import { useEffect, useState } from "react";
import { get, patch } from "../../utils/api";
import EditableHeading from "../EditableHeading";
import EditableSubheading from "../EditableSubheading";
import EditableText from "../EditableText";
import EditableFileList from "../EditableFileList";
import Loader from "../Loader";


export default function StudentSupportServices({ user }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await get("/pages/student-support-services");
      setContent(res || {});
    } catch (err) {
      setError("Failed to load student support services content.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field, value) => {
    try {
      const updated = { ...content, [field]: value };
      setContent(updated);
      await patch("/pages/student-support-services", { [field]: value });
    } catch (err) {
      setError("Failed to save changes.");
    }
  };

  if (loading) return <Loader message="Loading student support services…" size={100} />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section className="page-section">
      <EditableHeading
        value={content?.title || "Student Support Services"}
        editable={user?.role === "admin"}
        onSave={(v) => updateField("title", v)}
      />

      <EditableText
        value={content?.intro || ""}
        placeholder="Intro text about student support services"
        editable={user?.role === "admin"}
        onSave={(v) => updateField("intro", v)}
      />

      <EditableSubheading
        value={content?.academicSupportTitle || "Academic Support"}
        editable={user?.role === "admin"}
        onSave={(v) => updateField("academicSupportTitle", v)}
      />

      <EditableText
        value={content?.academicSupportText || ""}
        placeholder="Details about academic support"
        editable={user?.role === "admin"}
        onSave={(v) => updateField("academicSupportText", v)}
      />

      <EditableSubheading
        value={content?.counsellingTitle || "Counselling & Wellness"}
        editable={user?.role === "admin"}
        onSave={(v) => updateField("counsellingTitle", v)}
      />

      <EditableText
        value={content?.counsellingText || ""}
        placeholder="Details about counselling and wellness"
        editable={user?.role === "admin"}
        onSave={(v) => updateField("counsellingText", v)}
      />

      <EditableSubheading
        value={content?.careerSupportTitle || "Career Guidance"}
        editable={user?.role === "admin"}
        onSave={(v) => updateField("careerSupportTitle", v)}
      />

      <EditableText
        value={content?.careerSupportText || ""}
        placeholder="Details about career guidance"
        editable={user?.role === "admin"}
        onSave={(v) => updateField("careerSupportText", v)}
      />

      <EditableSubheading
        value={content?.resourcesTitle || "Resources & Downloads"}
        editable={user?.role === "admin"}
        onSave={(v) => updateField("resourcesTitle", v)}
      />

      <EditableFileList
        files={content?.resources || []}
        editable={user?.role === "admin"}
        onChange={(v) => updateField("resources", v)}
      />
    </section>
  );
}
