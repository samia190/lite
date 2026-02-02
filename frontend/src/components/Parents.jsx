import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import EditableText from "../components/EditableText";
import EditableFileList from "../components/EditableFileList";

export default function Parents({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    get("/api/content/parents")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load parent resources."));
  }, []);

  function updateSection(section, value) {
    patch(`/api/content/parents/${section}`, { value })
      .then(() => setContent((prev) => ({ ...prev, [section]: value })))
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  return (
    <section style={{ padding: "20px 8px" }}>
      <EditableHeading
        value={content.title || "Information for Parents"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={2}
      />

      <EditableText
        value={
          content.intro ||
          "We value strong partnerships with parents and guardians. Below are key resources to support your child’s journey."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.termHeading || "Term Dates"}
        onSave={(val) => updateSection("termHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.termDates ||
          `Term 1: January 8 – April 5\nTerm 2: May 6 – August 2\nTerm 3: September 2 – November 29`
        }
        onSave={(val) => updateSection("termDates", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.uniformHeading || "Uniform Guidelines"}
        onSave={(val) => updateSection("uniformHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.uniform ||
          `Boys: Navy trousers, white shirt, school tie\nGirls: Navy skirt, white blouse, school tie\nPE Kit: White t-shirt, navy shorts`
        }
        onSave={(val) => updateSection("uniform", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.ptaHeading || "Parent-Teacher Association (PTA)"}
        onSave={(val) => updateSection("ptaHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.pta ||
          "Our PTA meets once per term to discuss school development and parent engagement. All parents are welcome.\nNext meeting: February 10, 2026"
        }
        onSave={(val) => updateSection("pta", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.transportHeading || "Transport & Lunch"}
        onSave={(val) => updateSection("transportHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.transport ||
          "School buses available for Embu, Runyenjes, and Kiritiri routes.\nLunch provided daily — vegetarian and non-vegetarian options."
        }
        onSave={(val) => updateSection("transport", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableSubheading
        value={content.paymentHeading || "Payments & Forms"}
        onSave={(val) => updateSection("paymentHeading", val)}
        isAdmin={user?.role === "admin"}
        level={3}
      />
      <EditableText
        value={
          content.payment ||
          "School fees payable via M-Pesa or bank transfer. All forms and fee structures are downloadable below."
        }
        onSave={(val) => updateSection("payment", val)}
        isAdmin={user?.role === "admin"}
      />

      <EditableFileList
        files={
          content.parentFiles || [
            { name: "Full School Calendar", url: "/files/full-calendar.pdf" },
            { name: "Uniform Guide", url: "/files/uniform-guide.pdf" },
            { name: "PTA Agenda", url: "/files/pta-agenda.pdf" },
            { name: "Lunch Menu", url: "/files/lunch-menu.pdf" },
            { name: "Fee Structure", url: "/files/fee-structure.pdf" },
            { name: "Payment Form", url: "/files/payment-form.pdf" }
          ]
        }
        onSave={(files) => updateSection("parentFiles", files)}
        isAdmin={user?.role === "admin"}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
