// Lazy Loading Wrapper for React Components
import { Suspense, lazy } from "react";
import Loader from "../components/Loader";

/**
 * Loading fallback component
 */
function LoadingFallback({ message = "Loading..." }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      padding: "2rem",
    }}>
      <div style={{
        textAlign: "center",
      }}>
        <Loader size={40} />
      </div>
    </div>
  );
}

/**
 * Lazy load a component with Suspense
 * Usage: const MyComponent = lazyLoad(() => import('./MyComponent'))
 */
export function lazyLoad(importFunc, fallback = <LoadingFallback />) {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Preload a lazy component before it's needed
 * Usage: preloadComponent(() => import('./MyComponent'))
 */
export function preloadComponent(importFunc) {
  importFunc();
}

/**
 * Lazy load multiple components
 * Usage:
 * const components = lazyLoadMultiple({
 *   About: () => import('./About'),
 *   Contact: () => import('./Contact'),
 * });
 */
export function lazyLoadMultiple(components) {
  const result = {};
  Object.keys(components).forEach((key) => {
    result[key] = lazyLoad(components[key]);
  });
  return result;
}

export { LoadingFallback };
