// index.js (ESM)
import dotenv from "dotenv";
// Load .env early so index.js can access MONGO_URI and other settings
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import compression from "compression";
import helmet from "helmet";

// Import route files
import footerLinksRoutes from "./routes/footerLinks.js";
import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import homeRoutes from "./routes/contentHome.js";
import aboutRoutes from "./routes/contentAbout.js";
import filesRoutes from "./routes/files.js";
import downloadRoutes from "./routes/downloads.js";
import galleryRoutes from "./routes/galleryAttachments.js";
import adminRoutes from "./routes/admin.js";
import submissionsRoutes from "./routes/submissions.js";
import submitFormRoutes from "./routes/submitForm.js";
import studentVerificationRoutes from "./routes/studentVerification.js";
import resultsRoutes from "./routes/results.js";
import performanceRoutes from "./routes/performance.js";
import schoolMagazineRoutes from "./routes/schoolMagazine.js";

// Initialize the Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable if causing issues, configure properly for production
}));

// Compression middleware (Gzip/Brotli)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9, 6 is balanced)
}));

// Railway (and other PaaS) often run behind a proxy/load balancer.
// Trusting the proxy ensures req.protocol/secure are set correctly.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, server-to-server)
      if (!origin) return callback(null, true);

      // If no allowed origins provided, allow all origins
      if (allowedOrigins.length === 0) return callback(null, true);

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS for origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

console.log("CORS allowed origins:", allowedOrigins.length ? allowedOrigins : "(all)");

// Body parser with larger limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure static folders exist and are ready for use
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const downloadsDir = path.join(process.cwd(), "downloads");
const imagesDir = path.join(process.cwd(), "public", "images");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Cache control middleware for static assets
const setStaticCacheHeaders = (res, path) => {
  if (path.match(/\\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
    // Images - cache for 1 year with immutable
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Vary', 'Accept-Encoding');
  } else if (path.match(/\.(css|js)$/)) {
    // CSS/JS - cache for 1 year (with hash in filename)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Vary', 'Accept-Encoding');
  } else if (path.match(/\.(mp4|webm|ogg)$/)) {
    // Videos - cache for 1 month
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    res.setHeader('Accept-Ranges', 'bytes');
  } else if (path.match(/\\.(pdf|doc|docx)$/)) {
    // Documents - cache for 1 week
    res.setHeader('Cache-Control', 'public, max-age=604800');
  } else {
    // Other files - cache for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
};

// Serve static folders with caching
app.use("/uploads", express.static(uploadsDir, { 
  setHeaders: setStaticCacheHeaders,
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
app.use("/downloads", express.static(downloadsDir, { 
  setHeaders: setStaticCacheHeaders,
  maxAge: '1w',
  etag: true,
  lastModified: true
}));
app.use("/images", express.static(imagesDir, { 
  setHeaders: setStaticCacheHeaders,
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Mount routes
app.use("/api/auth", authRoutes);
// Mount dedicated home route BEFORE the generic content router so it takes precedence
app.use("/api/content/home", homeRoutes);
app.use("/api/content/about", aboutRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/content/gallery", galleryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionsRoutes);
// Public submit form and admin helpers
app.use("/api/submit-form", submitFormRoutes);
app.use("/api/footer-links", footerLinksRoutes);
app.use("/api/student-verification", studentVerificationRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/school-magazine", schoolMagazineRoutes);

// MongoDB connection setup — attempt to connect but don't crash the server
const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.DATABASE_URL;
let dbConnected = false;
if (!mongoUri) {
  console.warn(
    "⚠️ Mongo connection string not set (MONGO_URI/MONGO_URL/MONGODB_URI/DATABASE_URL) — running in degraded mode without DB"
  );
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      dbConnected = true;
      console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
      dbConnected = false;
      console.warn("⚠️ MongoDB connect error — continuing without DB:", err.message || err);
    });
}

// Export dbConnected flag so routes can optionally check it (not required)
export { dbConnected };

// Health check route
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);
