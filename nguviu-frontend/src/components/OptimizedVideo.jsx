import { useState, useEffect, useRef } from 'react';
import { safePath } from '../utils/paths';

/**
 * OptimizedVideo - Ultra-fast video loading component
 * Features:
 * - Intersection Observer lazy loading
 * - Preload metadata only
 * - Auto-pause when out of view
 * - Compressed video formats
 */
export default function OptimizedVideo({
  src,
  poster,
  className = '',
  style = {},
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  priority = false,
  onLoad,
  ...props
}) {
  const [isInView, setIsInView] = useState(priority);
  const [shouldPlay, setShouldPlay] = useState(false);
  const videoRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (priority || !videoRef.current) return;

    // Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (autoPlay) {
              setShouldPlay(true);
              videoRef.current?.play().catch(() => {
                // Auto-play was prevented
              });
            }
          } else {
            // Pause when out of view to save resources
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
            }
            setShouldPlay(false);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.25
      }
    );

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, autoPlay]);

  useEffect(() => {
    if (shouldPlay && videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {});
    }
  }, [shouldPlay, autoPlay]);

  const handleLoadedMetadata = (e) => {
    onLoad?.(e);
  };

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      poster={poster ? safePath(poster) : undefined}
      autoPlay={priority && autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
      preload={priority ? 'auto' : 'metadata'}
      onLoadedMetadata={handleLoadedMetadata}
      {...props}
    >
      {(isInView || priority) && (
        <>
          <source src={safePath(src)} type="video/mp4" />
          Your browser does not support the video tag.
        </>
      )}
    </video>
  );
}
