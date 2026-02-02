import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import EditableText from "../components/EditableText";
import EditableFileList from "../components/EditableFileList";

export default function Staff({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    get("/api/content/staff")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load staff content."));
  }, []);

  function updateSection(section, value) {
    patch(`/api/content/staff/${section}`, { value })
      .then(() => setContent((prev) => ({ ...prev, [section]: value })))
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  return (
    <section style={{ padding: 20 }}>
      <EditableHeading
        value={content.title || "Staff Resources & Opportunities"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={2}
      />

      <EditableText
        value={
          content.intro ||
          "Welcome to the staff portal. Here you’ll find key documents, job openings, and development resources."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.directoryHeading || "Staff Directory"}
        onSave={(val) => updateSection("directoryHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.directory ||
          `• Mr. James Mwangi – Headteacher\n• Ms. Grace Wanjiru – Deputy Head\n• Mr. Daniel Otieno – Mathematics\n• Ms. Amina Yusuf – English & Literature\n• Mr. Peter Kimani – Science Department`
        }
        onSave={(val) => updateSection("directory", val)}
        isAdmin={user?.role === "admin"}
      />
      <EditableFileList
        files={
          content.directoryFiles || [
            { name: "Full Staff Directory", url: "/files/full-staff-directory.pdf" }
          ]
        }
        onSave={(files) => updateSection("directoryFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.vacanciesHeading || "Job Vacancies"}
        onSave={(val) => updateSection("vacanciesHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.vacancies ||
          `• ICT Teacher (Deadline: Jan 15, 2026)\n• School Nurse (Deadline: Jan 22, 2026)`
        }
        onSave={(val) => updateSection("vacancies", val)}
        isAdmin={user?.role === "admin"}
      />
      <EditableFileList
        files={
          content.vacancyFiles || [
            { name: "Job Application Form", url: "/files/job-application-form.pdf" },
            { name: "Vacancy Details", url: "/files/vacancy-details.pdf" }
          ]
        }
        onSave={(files) => updateSection("vacancyFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.policiesHeading || "Staff Policies"}
        onSave={(val) => updateSection("policiesHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableFileList
        files={
          content.policyFiles || [
            { name: "Staff Handbook", url: "/files/staff-handbook.pdf" },
            { name: "Code of Conduct", url: "/files/code-of-conduct-staff.pdf" },
            { name: "Leave Policy", url: "/files/leave-policy.pdf" }
          ]
        }
        onSave={(files) => updateSection("policyFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.developmentHeading || "Professional Development"}
        onSave={(val) => updateSection("developmentHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.development ||
          `• CPD Workshop: “Inclusive Classrooms” – Feb 10, 2026\n• Online Training: “Digital Tools for Teaching” – Ongoing`
        }
        onSave={(val) => updateSection("development", val)}
        isAdmin={user?.role === "admin"}
      />
      <EditableFileList
        files={
          content.developmentFiles || [
            { name: "CPD Calendar", url: "/files/cpd-calendar.pdf" }
          ]
        }
        onSave={(files) => updateSection("developmentFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
