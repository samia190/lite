import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import EditableText from "../components/EditableText";
import EditableFileList from "../components/EditableFileList";

export default function Legal({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    get("/api/content/legal")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load legal content."));
  }, []);

  function updateSection(section, value) {
    patch(`/api/content/legal/${section}`, { value })
      .then(() => setContent((prev) => ({ ...prev, [section]: value })))
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  return (
    <section style={{ padding: "20px 8px" }}>
      <EditableHeading
        value={content.title || "Legal Information"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={2}
      />

      <EditableText
        value={
          content.intro ||
          "We are committed to protecting your privacy and ensuring transparency in how our website operates."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.privacyHeading || "Privacy Policy"}
        onSave={(val) => updateSection("privacyHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.privacy ||
          "We collect minimal personal data for contact forms and login purposes. All data is stored securely and never shared with third parties. You may request deletion of your data at any time."
        }
        onSave={(val) => updateSection("privacy", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.cookieHeading || "Cookie Notice"}
        onSave={(val) => updateSection("cookieHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.cookie ||
          "This site uses cookies to enhance user experience and track anonymous usage statistics. You can disable cookies in your browser settings."
        }
        onSave={(val) => updateSection("cookie", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.termsHeading || "Terms of Use"}
        onSave={(val) => updateSection("termsHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.terms ||
          "By using this website, you agree to abide by our terms of use, including respectful behavior and proper use of school resources."
        }
        onSave={(val) => updateSection("terms", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableFileList
        files={
          content.legalFiles || [
            { name: "Privacy Policy", url: "/files/privacy-policy.pdf" },
            { name: "Cookie Policy", url: "/files/cookie-policy.pdf" },
            { name: "Terms of Use", url: "/files/terms-of-use.pdf" },
          ]
        }
        onSave={(files) => updateSection("legalFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
