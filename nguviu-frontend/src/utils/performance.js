// Performance monitoring utilities
// Measure and log Core Web Vitals and other performance metrics

/**
 * Measure First Contentful Paint (FCP)
 */
export function measureFCP() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`⚡ FCP: ${entry.startTime.toFixed(2)}ms`);
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  }
}

/**
 * Measure Largest Contentful Paint (LCP)
 */
export function measureLCP() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`⚡ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
}

/**
 * Measure First Input Delay (FID)
 */
export function measureFID() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const delay = entry.processingStart - entry.startTime;
        console.log(`⚡ FID: ${delay.toFixed(2)}ms`);
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  }
}

/**
 * Measure Cumulative Layout Shift (CLS)
 */
export function measureCLS() {
  if ('PerformanceObserver' in window) {
    let clsScore = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          console.log(`⚡ CLS: ${clsScore.toFixed(4)}`);
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }
}

/**
 * Measure Time to First Byte (TTFB)
 */
export function measureTTFB() {
  if ('performance' in window && 'timing' in performance) {
    const { responseStart, requestStart } = performance.timing;
    const ttfb = responseStart - requestStart;
    console.log(`⚡ TTFB: ${ttfb}ms`);
  }
}

/**
 * Measure total page load time
 */
export function measurePageLoad() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      console.log('📊 Performance Metrics:');
      console.log(`  Page Load Time: ${pageLoadTime}ms`);
      console.log(`  Connect Time: ${connectTime}ms`);
      console.log(`  Render Time: ${renderTime}ms`);
      
      // Report to analytics if needed
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'page_load',
          value: pageLoadTime,
          event_category: 'Performance',
        });
      }
    }, 0);
  });
}

/**
 * Measure resource timing
 */
export function measureResources() {
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource');
    
    const breakdown = {
      scripts: [],
      stylesheets: [],
      images: [],
      other: [],
    };
    
    resources.forEach((resource) => {
      const timing = {
        name: resource.name.split('/').pop(),
        duration: resource.duration.toFixed(2),
        size: resource.transferSize,
      };
      
      if (resource.name.endsWith('.js')) {
        breakdown.scripts.push(timing);
      } else if (resource.name.endsWith('.css')) {
        breakdown.stylesheets.push(timing);
      } else if (/\\.(jpg|jpeg|png|gif|webp|svg)$/.test(resource.name)) {
        breakdown.images.push(timing);
      } else {
        breakdown.other.push(timing);
      }
    });
    
    console.log('📦 Resource Breakdown:', breakdown);
    return breakdown;
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();
    measurePageLoad();
    
    // Log resources after page load
    window.addEventListener('load', () => {
      setTimeout(measureResources, 1000);
    });
  }
}

/**
 * Report Web Vitals (for production monitoring)
 * Note: Install web-vitals package if needed: npm install web-vitals
 */
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Optional: Uncomment if web-vitals package is installed
    // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    //   getCLS(onPerfEntry);
    //   getFID(onPerfEntry);
    //   getFCP(onPerfEntry);
    //   getLCP(onPerfEntry);
    //   getTTFB(onPerfEntry);
    // });
    console.log('Web Vitals reporting available - install web-vitals package to enable');
  }
}
