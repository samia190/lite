import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import EditableText from "../components/EditableText";
import EditableHeading from "../components/EditableHeading";
import EditableSubheading from "../components/EditableSubheading";
import { safePath } from "../utils/paths";
import LazyImage from "./LazyImage";
import OptimizedImage from "./OptimizedImage";

export default function About({ user }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    get("/api/content/about")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load about page content."));
  }, []);

  function updateSection(section, value) {
    patch(`/api/content/about/${section}`, { value })
      .then(() =>
        setContent((prev) => ({
          ...prev,
          [section]: value
        }))
      )
      .catch((err) => {
        console.error("Failed to save:", err);
        alert("Failed to save content.");
      });
  }

  // ✅ Convert core values (entered one per line) into a list
  const coreValues = (content.coreValues || "")
    .split("\n")
    .filter(Boolean);

  // Normalize image paths coming from content or defaults.
  const resolvePath = (p) => {
    if (!p) return p;
    // If someone saved a `public/...` path, convert to root-served path
    if (p.startsWith("public/")) return "/" + p.slice("public/".length);
    // If already an absolute path, return as-is
    if (p.startsWith("/")) return p;
    // Otherwise prefix with leading slash
    return "/" + p;
  };

  return (
    <section style={{ padding: 20 }} className="about-page">
      {/* ================= HERO / TOP BACKGROUND SECTION ================= */}
      <div
        className="about-hero"
        style={{
            position: "relative",
    width: "100vw",
    marginLeft: "50%",
    transform: "translateX(-50%)",
    maxHeight: 1000,
    overflow: "hidden",
    height: window.innerWidth <= 480 ? 300 : 500,
          backgroundImage: `url(${encodeURI(
            resolvePath(content.heroBackgroundUrl || "images/background images/hero.JPG")
          )})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay so text is readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65))"
          }}
        />

        {/* Text container on top of hero (with transparent / semi-transparent box) */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              maxWidth: 700,
              width: "100%",
              padding: "16px 20px",
              borderRadius: 10,
              backgroundColor: "rgba(0, 0, 0, 0.45)", // transparent container
              color: "#ffffff",
              textAlign: "center"
            }}
          >
            <EditableHeading
              value={content.heroTitle || "Welcome to Nguviu Girls' School"}
              onSave={(val) => updateSection("heroTitle", val)}
              isAdmin={user?.role === "admin"}
              level={2}
            />

            <EditableText
              value={content.heroSubtitle || "A nurturing environment where young girls grow into confident, responsible leaders."}
              onSave={(val) => updateSection("heroSubtitle", val)}
              isAdmin={user?.role === "admin"}
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN ABOUT CONTENT ================= */}

      <div className="about-content">
      {/* TITLE */}
      <EditableHeading
        value={content.title || "About Nguviu Girls' School"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={2}
      />

      {/* INTRO */}
      <EditableText
        value={
          content.intro ||
          "Nguviu Girls' School is a center of excellence dedicated to nurturing young girls' into confident, capable leaders."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      {/* MOTTO */}
      <div style={{ marginTop: "30px", marginBottom: "20px", textAlign: "left" }}>
        <EditableSubheading
          value={content.mottoHeading || "MOTTO"}
          onSave={(val) => updateSection("mottoHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
          style={{ color: "#2c3e50", fontWeight: "bold", textAlign: "left" }}
        />
        <div style={{ color: "#34495e", fontSize: "1.1rem", marginTop: "8px", textAlign: "left" }}>
          <EditableText
            value={content.motto || "Strive for Excellence"}
            onSave={(val) => updateSection("motto", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>

      {/* VISION */}
      <div style={{ marginTop: "30px", marginBottom: "20px", textAlign: "left" }}>
        <EditableSubheading
          value={content.visionHeading || "VISION"}
          onSave={(val) => updateSection("visionHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
          style={{ color: "#2c3e50", fontWeight: "bold", textAlign: "left" }}
        />
        <div style={{ color: "#34495e", fontSize: "1.1rem", marginTop: "8px", textAlign: "left" }}>
          <EditableText
            value={
              content.vision ||
              "Holistically Developed Person"
            }
            onSave={(val) => updateSection("vision", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>

      {/* MISSION */}
      <div style={{ marginTop: "30px", marginBottom: "20px", textAlign: "left" }}>
        <EditableSubheading
          value={content.missionHeading || "MISSION"}
          onSave={(val) => updateSection("missionHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
          style={{ color: "#2c3e50", fontWeight: "bold", textAlign: "left" }}
        />
        <div style={{ color: "#34495e", fontSize: "1.1rem", marginTop: "8px", textAlign: "left" }}>
          <EditableText
            value={
              content.mission ||
              "Nurture excellence in a well-integrated person in line with Vision 2030"
            }
            onSave={(val) => updateSection("mission", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>

      {/* CORE VALUES */}
      <div style={{ marginTop: "30px", marginBottom: "20px", textAlign: "left" }}>
        <h3 style={{ color: "#2c3e50", fontWeight: "bold", fontSize: "1.3rem", marginBottom: "15px", textAlign: "left" }}>
          CORE VALUES
        </h3>
        <ul className="about-core-values" style={{
          listStyleType: "disc",
          paddingLeft: "40px",
          color: "#34495e",
          fontSize: "1.05rem",
          lineHeight: "2",
          textAlign: "left"
        }}>
          <li>Responsibility</li>
          <li>Accountability & Transparency</li>
          <li>Honesty</li>
          <li>Integrity</li>
          <li>Respect</li>
          <li>Team Work</li>
          <li>Humility</li>
          <li>Professionalism</li>
          <li>Self & Emotional Awareness</li>
          <li>Creativity & Innovation</li>
        </ul>
      </div>

      {/* PROMISE */}
      <div style={{ marginTop: "30px", marginBottom: "20px", textAlign: "left" }}>
        <EditableSubheading
          value={content.promiseHeading || "Our Promise"}
          onSave={(val) => updateSection("promiseHeading", val)}
          isAdmin={user?.role === "admin"}
          level={3}
          style={{ color: "#2c3e50", fontWeight: "bold", textAlign: "left" }}
        />
        <div style={{ color: "#34495e", fontSize: "1.1rem", marginTop: "8px", textAlign: "left" }}>
          <EditableText
            value={content.promise || "Excellence, Our Choice"}
            onSave={(val) => updateSection("promise", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>
      </div>

      {/* ================= PRINCIPAL AND DEPUTY SECTION ================= */}
      <div
        className="about-leadership"
        style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid #eee",
        }}
      >
        {/* PRINCIPAL SECTION - CENTERED AT TOP */}
        <div
          className="about-leader-card about-principal"
          style={{
            textAlign: "center",
            margin: "0 auto 30px auto",
            maxWidth: 500,
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              overflow: "hidden",
              marginBottom: 16,
              margin: "0 auto 16px auto",
              border: "3px solid #ddd",
            }}
          >
            <OptimizedImage
              src={content.principalImageUrl || "/images/background images/principle.jpeg"}
              alt="Principal"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>

          <h3>Chief Principal's Remarks</h3>
          <p style={{ fontWeight: "bold" }}>Dr. Elizabeth Musili</p>

          <EditableText
            value={
              content.principalMessage ||
              "At Nguviu Girls School, we believe that every girl has a unique potential. Our commitment is to provide a supportive environment where she can discover her strengths, grow in character, and pursue academic excellence with confidence."
            }
            onSave={(val) => updateSection("principalMessage", val)}
            isAdmin={user?.role === "admin"}
          />
        </div>

        {/* DEPUTY PRINCIPALS - TWO COLUMNS BELOW */}
        <div
          className="about-deputies"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* DEPUTY PRINCIPAL 1 - LEFT */}
          <div
            className="about-leader-card"
            style={{
              flex: 1,
              textAlign: "center",
              maxWidth: 500,
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                overflow: "hidden",
                marginBottom: 16,
                margin: "0 auto 16px auto",
                border: "3px solid #ddd",
              }}
            >
              <OptimizedImage
                src={content.deputyImageUrl || "/images/background images/deputy.jpeg"}
                alt="Deputy Principal"
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>

            <h3>Deputy Principal (Administration)</h3>
            <p style={{ fontWeight: "bold" }}>Ms. Magret Kariuki</p>
            <EditableText
              value={
                content.deputyMessage ||
                "As the Deputy Principal, I am committed to ensuring that each student receives the guidance and support necessary for their personal and academic growth."
              }
              onSave={(val) => updateSection("deputyMessage", val)}
              isAdmin={user?.role === "admin"}
            />
          </div>

          {/* DEPUTY PRINCIPAL 2 - RIGHT */}
          <div
            className="about-leader-card"
            style={{
              flex: 1,
              textAlign: "center",
              maxWidth: 500,
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                overflow: "hidden",
                marginBottom: 16,
                margin: "0 auto 16px auto",
                border: "3px solid #ddd",
              }}
            >
              <LazyImage
                src={safePath(content.deputy2ImageUrl || "/images/background images/miss.png")}
                alt="Deputy Principal 2"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>

            <h3>Deputy Principal (Academics)</h3>
            <p style={{ fontWeight: "bold" }}>Ms. Joyce Ngina Nyingi</p>
            <EditableText
              value={
                content.deputy2Message ||
                "Our academic programs are designed to challenge and inspire students to reach their full potential and excel in all areas of learning."
              }
              onSave={(val) => updateSection("deputy2Message", val)}
              isAdmin={user?.role === "admin"}
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
