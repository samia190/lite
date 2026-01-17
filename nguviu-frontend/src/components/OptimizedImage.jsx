// Enhanced Image Component with WebP support and responsive images
import React, { useState } from "react";
import useInView from "../hooks/useInView";

/**
 * OptimizedImage - Enhanced image component with:
 * - Lazy loading
 * - WebP support with fallback
 * - Responsive srcset
 * - Loading states
 * - Error handling
 */
export default function OptimizedImage({ 
  src, 
  alt = "", 
  className = "", 
  style = {},
  width,
  height,
  sizes,
  priority = false,
  onLoad,
  onError,
  ...props 
}) {
  const [ref, inView] = useInView({ rootMargin: "200px" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP version if image is JPG/PNG
  const getWebPSrc = (originalSrc) => {
    if (!originalSrc || originalSrc.endsWith('.webp') || originalSrc.endsWith('.svg')) {
      return null;
    }
    return originalSrc.replace(/\\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc) return undefined;
    
    // Only generate srcset for valid image paths
    if (!originalSrc.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return undefined;
    }
    
    const base = originalSrc.replace(/\.[^.]+$/, '');
    const ext = originalSrc.match(/\.[^.]+$/)?.[0] || '';
    
    // Create srcset for 1x, 2x displays - properly formatted
    return `${originalSrc} 1x, ${base}@2x${ext} 2x`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  const webpSrc = getWebPSrc(src);
  const shouldLoad = priority || inView;

  // Placeholder while loading
  const placeholder = (
    <div 
      style={{ 
        width: '100%', 
        height: height || '100%', 
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} 
    />
  );

  return (
    <div ref={ref} className={className} style={{ display: "block", position: "relative", ...style }}>
      {shouldLoad ? (
        <picture>
          {/* WebP source for modern browsers */}
          {webpSrc && !hasError && (
            <source srcSet={webpSrc} type="image/webp" />
          )}
          
          {/* Original format as fallback */}
          <img 
            src={src} 
            srcSet={generateSrcSet(src)}
            sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={{ 
              width: "100%", 
              height: "100%", 
              display: "block",
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }} 
            {...props} 
          />
        </picture>
      ) : (
        placeholder
      )}
      
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * Background Image with lazy loading
 */
export function OptimizedBackgroundImage({ 
  src, 
  children, 
  className = "",
  style = {},
  ...props
}) {
  const [ref, inView] = useInView({ rootMargin: "100px" });
  const [bgLoaded, setBgLoaded] = useState(false);

  React.useEffect(() => {
    if (inView && src && !bgLoaded) {
      const img = new Image();
      img.onload = () => setBgLoaded(true);
      img.src = src;
    }
  }, [inView, src, bgLoaded]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        backgroundImage: bgLoaded ? `url(${src})` : 'none',
        backgroundColor: bgLoaded ? 'transparent' : '#f0f0f0',
        transition: 'opacity 0.3s ease-in-out',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
