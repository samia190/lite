import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./responsive.css";
import { BrowserRouter } from "react-router-dom";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { initPerformanceMonitoring } from "./utils/performance";

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Register service worker for offline support and caching (production only)
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Initialize performance monitoring (development only)
if (import.meta.env.DEV) {
  initPerformanceMonitoring();
}
