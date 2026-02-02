/**
 * Utility to generate responsive image sources with WebP support
 * This helps browsers load the most appropriate image format and size
 */

/**
 * Generates srcSet for responsive images with WebP fallback
 * @param {string} imagePath - Base path to the image (without extension)
 * @param {string} extension - Original extension (e.g., 'jpg', 'png')
 * @param {number[]} widths - Array of widths to generate (e.g., [320, 640, 1024])
 * @returns {object} - Object with srcSet and sizes for img tag
 */
export function getResponsiveImageSources(imagePath, extension = 'jpg', widths = [320, 640, 1024]) {
  // Remove extension if already in path
  const basePath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  
  // Check if browser supports WebP
  const supportsWebP = checkWebPSupport();
  
  // Generate srcSet entries
  const srcSetEntries = widths.map(width => {
    const ext = supportsWebP ? 'webp' : extension;
    return `${basePath}-${width}w.${ext} ${width}w`;
  });
  
  // Default src (smallest size for fallback)
  const defaultSrc = `${basePath}-${widths[0]}w.${supportsWebP ? 'webp' : extension}`;
  
  return {
    src: defaultSrc,
    srcSet: srcSetEntries.join(', '),
    sizes: generateSizes(widths),
  };
}

/**
 * Check if browser supports WebP (cached result)
 */
let webpSupported = null;
function checkWebPSupport() {
  if (webpSupported !== null) return webpSupported;
  
  // Check using canvas if available
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      return webpSupported;
    }
  }
  
  // Default to true for modern browsers
  webpSupported = true;
  return webpSupported;
}

/**
 * Generate sizes attribute based on viewport widths
 * @param {number[]} widths - Array of widths
 * @returns {string} - Sizes attribute value
 */
function generateSizes(widths) {
  if (widths.length === 1) return `${widths[0]}px`;
  
  // Create responsive sizes based on breakpoints
  const sizes = [
    `(max-width: 480px) ${widths[0]}px`,
    widths.length > 1 ? `(max-width: 768px) ${widths[1]}px` : null,
    widths.length > 2 ? `${widths[widths.length - 1]}px` : null,
  ].filter(Boolean);
  
  return sizes.join(', ');
}

/**
 * Get optimized image path with WebP support
 * Automatically uses .webp if available, falls back to original
 * @param {string} imagePath - Original image path
 * @returns {string} - Optimized image path
 */
export function getOptimizedImagePath(imagePath) {
  if (!imagePath) return '';
  
  const supportsWebP = checkWebPSupport();
  if (!supportsWebP) return imagePath;
  
  // Try WebP version
  const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  return webpPath;
}

/**
 * Preload critical images for better performance
 * Call this in your main component for above-the-fold images
 * @param {string[]} imagePaths - Array of critical image paths
 */
export function preloadCriticalImages(imagePaths) {
  if (typeof document === 'undefined') return;
  
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getOptimizedImagePath(path);
    link.type = path.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    document.head.appendChild(link);
  });
}

/**
 * Generate picture element with WebP and fallback
 * @param {string} imagePath - Base image path
 * @param {string} alt - Alt text
 * @param {object} options - Additional options
 * @returns {string} - HTML string for picture element
 */
export function generatePictureHTML(imagePath, alt = '', options = {}) {
  const { className = '', style = '', loading = 'lazy' } = options;
  const basePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
  const extension = imagePath.match(/\.(jpg|jpeg|png)$/i)?.[0] || '.jpg';
  
  return `
    <picture>
      <source srcset="${basePath}.webp" type="image/webp">
      <source srcset="${basePath}${extension}" type="image/jpeg">
      <img 
        src="${basePath}${extension}" 
        alt="${alt}" 
        loading="${loading}"
        decoding="async"
        class="${className}"
        style="${style}"
      >
    </picture>
  `.trim();
}

/**
 * Image preloader hook for React components
 * Returns loading state and preloaded image
 */
export function useImagePreload(src) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  
  React.useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.onload = () => setLoading(false);
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = getOptimizedImagePath(src);
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return { loading, error };
}

// Example usage:
/*
import { getOptimizedImagePath, preloadCriticalImages } from './utils/imageOptimization';

// In your component:
const optimizedSrc = getOptimizedImagePath('/images/students/IMG_1030.JPG');

// Preload hero images on app mount:
useEffect(() => {
  preloadCriticalImages([
    '/images/background-hero.jpg',
    '/images/logo.png'
  ]);
}, []);

// In LazyImage component:
<img src={getOptimizedImagePath(src)} alt={alt} loading="lazy" />
*/
