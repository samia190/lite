import { useEffect, useState } from "react";
import { get } from "../utils/api";
import useInView from "../hooks/useInView";

export default function PageBackground({ page, children }) {
  const [bg, setBg] = useState(null);
  const [overlay, setOverlay] = useState(0.55);
  const [ref, inView] = useInView({ rootMargin: "300px" });

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    try {
      const res = await get("/api/content/page-backgrounds");
      const data = res?.data?.[page];
      const file = data?.file || data?.attachments?.[0];

      setBg(file?.downloadUrl || file?.url || null);
      setOverlay(data?.overlay ?? 0.55);
    } catch (err) {
      console.error("Failed to load background");
    }
  }

  // Only apply the heavy background-image once the container is near viewport
  const backgroundStyle = inView && bg
    ? `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), url(${bg})`
    : "none";

  return (
    <div
      ref={ref}
      style={{
        minHeight: "100vh",
        backgroundImage: backgroundStyle,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {children}
    </div>
  );
}
