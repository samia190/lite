import React from "react";
import useInView from "../hooks/useInView";

export default function LazyVideo({ src, poster, className, children, ...props }) {
  const [ref, inView] = useInView({ rootMargin: "200px" });

  // Mount the <video> element only when near viewport to avoid network requests
  return (
    <div ref={ref} className={className} style={{ width: "100%", height: "100%" }}>
      {inView ? (
        <video poster={poster} preload="metadata" playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} {...props}>
          {children}
          {/* If a src prop is provided, include it as a source fallback */}
          {src && <source src={src} />}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#000" }} />
      )}
    </div>
  );
}
