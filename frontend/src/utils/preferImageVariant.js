import { safePath } from './paths';

const DEFAULT_VARIANTS = ['.png', '.svg', '.webp', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];

// Simple in-memory cache to avoid repeated network probes for the same base path
const _variantCache = new Map();

export default function preferImageVariant(basePath, variants = DEFAULT_VARIANTS) {
  if (!basePath) return Promise.resolve(basePath);

  // If blob/data URLs or already a full data URL, return as-is
  if (String(basePath).startsWith('blob:') || String(basePath).startsWith('data:')) {
    return Promise.resolve(basePath);
  }

  // Return cached result when available
  if (_variantCache.has(basePath)) {
    return Promise.resolve(_variantCache.get(basePath));
  }

  const hasExt = /\.[a-zA-Z0-9]+$/.test(basePath);
  const baseNoExt = hasExt ? basePath.replace(/\.[a-zA-Z0-9]+$/, '') : basePath;

  const candidates = hasExt
    ? [basePath, ...variants.map((v) => baseNoExt + v)]
    : variants.map((v) => baseNoExt + v);

  return new Promise((resolve) => {
    let i = 0;
    const tryNext = () => {
      if (i >= candidates.length) {
        const fallback = safePath(basePath);
        _variantCache.set(basePath, fallback);
        resolve(fallback);
        return;
      }
      const candidate = candidates[i++];
      const img = new Image();
      img.onload = () => {
        const resolved = safePath(candidate);
        _variantCache.set(basePath, resolved);
        resolve(resolved);
      };
      img.onerror = () => tryNext();
      img.src = safePath(candidate);
    };
    tryNext();
  });
}
