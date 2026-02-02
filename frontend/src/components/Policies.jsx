import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import EditableText from "../components/EditableText";
import EditableFileList from "../components/EditableFileList";

export default function Policies({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    get("/api/content/policies")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load policy content."));
  }, []);

  function updateSection(section, value) {
    patch(`/api/content/policies/${section}`, { value })
      .then(() => setContent((prev) => ({ ...prev, [section]: value })))
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  return (
    <section style={{ padding: "20px 8px" }}>
      <EditableHeading
        value={content.title || "School Policies"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={2}
      />

      <EditableText
        value={
          content.intro ||
          "We are committed to transparency, safety, and inclusive education. Below are our key policies available for download."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.safeguardingHeading || "Safeguarding & Child Protection"}
        onSave={(val) => updateSection("safeguardingHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableFileList
        files={
          content.safeguardingFiles || [
            { name: "Safeguarding Policy", url: "/files/safeguarding-policy.pdf" },
            { name: "Child Protection Guidelines", url: "/files/child-protection-guidelines.pdf" }
          ]
        }
        onSave={(files) => updateSection("safeguardingFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.senHeading || "Special Educational Needs (SEN)"}
        onSave={(val) => updateSection("senHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableFileList
        files={
          content.senFiles || [
            { name: "SEN Policy", url: "/files/sen-policy.pdf" },
            { name: "Inclusive Education Framework", url: "/files/inclusive-education-framework.pdf" }
          ]
        }
        onSave={(files) => updateSection("senFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.behaviourHeading || "Behaviour & Anti-Bullying"}
        onSave={(val) => updateSection("behaviourHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableFileList
        files={
          content.behaviourFiles || [
            { name: "Behaviour Policy", url: "/files/behaviour-policy.pdf" },
            { name: "Anti-Bullying Policy", url: "/files/anti-bullying-policy.pdf" }
          ]
        }
        onSave={(files) => updateSection("behaviourFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.complaintsHeading || "Complaints Procedure"}
        onSave={(val) => updateSection("complaintsHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableFileList
        files={
          content.complaintsFiles || [
            { name: "Complaints Procedure", url: "/files/complaints-procedure.pdf" },
            { name: "Parent Complaints Form", url: "/files/parent-complaints-form.pdf" }
          ]
        }
        onSave={(files) => updateSection("complaintsFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
