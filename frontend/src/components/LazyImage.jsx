import React, { useState } from "react";
import useInView from "../hooks/useInView";

export default function LazyImage({ 
  src, 
  srcSet, 
  sizes, 
  alt = "", 
  className, 
  style, 
  placeholder,
  lowResSrc, // Optional low-res placeholder for faster initial load
  ...props 
}) {
  const [ref, inView] = useInView({ rootMargin: "300px" }); // Increased margin for earlier loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Auto-generate responsive srcSet if not provided
  const getResponsiveSrc = () => {
    if (srcSet) return { srcSet, sizes };
    
    // Generate sizes attribute for responsive loading
    const defaultSizes = sizes || "(max-width: 420px) 180px, (max-width: 767px) 240px, 300px";
    
    return { 
      srcSet: undefined, 
      sizes: defaultSizes 
    };
  };

  const { srcSet: responsiveSrcSet, sizes: responsiveSizes } = getResponsiveSrc();

  return (
    <div ref={ref} className={className} style={{ display: "block", position: "relative", ...style }}>
      {inView ? (
        <>
          {/* Low-res placeholder shown while main image loads */}
          {lowResSrc && !imageLoaded && !imageError && (
            <img
              src={lowResSrc}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                filter: "blur(10px)",
                transform: "scale(1.1)",
              }}
              aria-hidden="true"
            />
          )}
          
          {/* Main image */}
          <img
            src={src}
            srcSet={responsiveSrcSet}
            sizes={responsiveSizes}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
              position: "relative",
            }}
            {...props}
          />
          
          {/* Error fallback */}
          {imageError && (
            <div style={{
              width: "100%",
              height: "100%",
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "12px",
            }}>
              Image unavailable
            </div>
          )}
        </>
      ) : placeholder ? (
        placeholder
      ) : (
        <div style={{ 
          width: "100%", 
          height: "100%", 
          background: "linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }} />
      )}
    </div>
  );
}
