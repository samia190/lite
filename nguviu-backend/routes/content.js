// routes/content.js
import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Content from "../models/Content.js";

const router = express.Router();

function makeDownloadUrl(req, relPath) {
  if (!relPath) return relPath;
  if (String(relPath).startsWith("http")) return relPath;
  const origin = process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get("host")}`;
  const p = String(relPath).startsWith("/") ? relPath : `/${relPath}`;
  return `${origin}${p}`;
}

/**
 * ✅ GET /api/content
 * Returns a list of all content documents (for AdminPanel list)
 */
router.get("/", async (req, res) => {
  try {
    // If DB is not connected, return empty list to avoid 500s
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const items = await Content.find({}).sort({ createdAt: -1 });
    const normalized = items.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      obj.attachments = (obj.attachments || []).map((a) => ({
        ...a,
        downloadUrl: a.downloadUrl || makeDownloadUrl(req, a.url),
      }));
      return obj;
    });
    return res.json(normalized);
  } catch (err) {
    console.error("Error listing content:", err);
    return res.status(500).json({ error: "Server error listing content" });
  }
});

/**
 * ✅ GET /api/content/summary/:type
 * Returns a summary (title, body) for a specific content type
 * Used for lightweight loading of content sections
 */
router.get("/summary/:type", async (req, res) => {
  const { type } = req.params;
  
  try {
    // If DB is not connected, return safe default
    if (mongoose.connection.readyState !== 1) {
      return res.json({ type, title: "", body: "" });
    }

    const content = await Content.findOne({ type }).select('type title body intro');
    
    // Return safe default if not found
    if (!content) {
      return res.json({ type, title: "", body: "" });
    }

    return res.json({
      type: content.type,
      title: content.title || "",
      body: content.body || "",
      intro: content.intro || "",
    });
  } catch (err) {
    console.error("Error fetching content summary:", err);
    // Return safe default on error
    return res.json({ type, title: "", body: "" });
  }
});

/**
 * ✅ GET /api/content/:idOrType
 *
 * - If :idOrType is a valid MongoDB ObjectId → look up by _id.
 *   - If not found → 404 (this is a genuine error when you ask by id).
 * - Otherwise → treat :idOrType as a "type" (e.g. "home", "about", "admin").
 *   - If no content exists yet for that type → return a SAFE DEFAULT object
 *     with status 200 so the frontend does NOT break.
 */
router.get("/:idOrType", async (req, res) => {
  const { idOrType } = req.params;

  // Provide a download proxy for attachments when requested as
  // /api/content/:id/attachments/:attId/download
  // NOTE: This must be above the ObjectId/type handling below, but
  // Express will only reach here for the route defined further down.

  try {
    // If the caller requested an attachments download route like
    // /api/content/<id>/attachments/<attId>/download, handle it first.
    if (req.path && req.path.match(/^\/[^/]+\/attachments\/[^/]+\/download$/)) {
      const parts = req.path.split("/").filter(Boolean);
      // parts: [ <id>, "attachments", <attId>, "download" ]
      const contentId = parts[0];
      const attId = parts[2];
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({ error: "Invalid content id" });
      }
      const doc = await Content.findById(contentId);
      if (!doc) return res.status(404).json({ error: "Content not found" });

      const att = (doc.attachments || []).find((a) => String(a._id) === String(attId));
      if (!att) return res.status(404).json({ error: "Attachment not found" });
          // If DB disconnected, return a clear error rather than throwing
          if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "DB unavailable for attachment download" });
          }

      // If attachment URL is absolute (S3), redirect to it. For local files, stream as download.
      const url = att.url || att.downloadUrl;
      if (!url) return res.status(404).json({ error: "Attachment has no URL" });
      if (String(url).startsWith("http")) return res.redirect(url);

      // Local file path under public folder
      const filePath = path.join(process.cwd(), String(url).replace(/^\//, ""));
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found on server" });
      return res.download(filePath, att.originalName || path.basename(filePath));
    }

    // If it's a valid ObjectId, treat it as an _id lookup
    if (mongoose.Types.ObjectId.isValid(idOrType)) {
      const content = await Content.findById(idOrType);
      if (!content) return res.status(404).json({ error: "Content not found" });
      return res.json(content);
    }

    // Otherwise treat it as a "type" lookup (e.g., "home", "about", "admin")
    const contentByType = await Content.findOne({ type: idOrType });

    // IMPORTANT CHANGE:
    // If nothing is found for this type, DO NOT return 404.
    // Return a safe default object instead so pages can still load.
    if (!contentByType) {
      return res.json({
        type: idOrType,
        title: "",
        body: "",
        attachments: [],
      });
    }

    const obj = contentByType.toObject ? contentByType.toObject() : contentByType;
    obj.attachments = (obj.attachments || []).map((a) => ({
      ...a,
      downloadUrl: a.downloadUrl || makeDownloadUrl(req, a.url),
    }));

    return res.json(obj);
  } catch (err) {
    console.error("Error fetching content:", err);
    return res.status(500).json({ error: "Server error fetching content" });
  }
});

/**
 * PATCH /api/content/:type/:field
 * Update a single named field (e.g. title, body, formHeading) on the content document
 * identified by its `type` (not by _id). This supports the admin UI which edits
 * per-field values. If the document does not exist, a new one will be created
 * with the provided field value.
 */
router.patch("/:type/:field", async (req, res) => {
  const { type, field } = req.params;
  const value = req.body?.value;

  // Only allow a small set of editable fields to avoid accidental writes
  const ALLOWED = new Set(["title", "body", "intro", "formHeading", "listHeading", "pageBackground"]);
  if (!ALLOWED.has(field)) {
    return res.status(400).json({ error: "Field not editable" });
  }

  try {
    // If DB is not connected, respond with a transient object so frontend doesn't break
    if (mongoose.connection.readyState !== 1) {
      const transient = { type, [field]: value };
      return res.json(transient);
    }

    let doc = await Content.findOne({ type });
    if (!doc) {
      const payload = { type, [field]: value };
      doc = await Content.create(payload);
    } else {
      doc[field] = value;
      await doc.save();
    }

    const obj = doc.toObject ? doc.toObject() : doc;
    obj.attachments = (obj.attachments || []).map((a) => ({ ...a, downloadUrl: a.downloadUrl || makeDownloadUrl(req, a.url) }));

    return res.json(obj);
  } catch (err) {
    console.error("Error patching content by type/field:", err);
    return res.status(500).json({ error: "Server error updating content" });
  }
});

/**
 * PATCH /api/content/:type/*
 * Support nested keys stored inside the `data` field of the content document.
 * Example: PATCH /api/content/admin/staff/leadership with { value: '...' }
 */
// Note: nested updates for admin are handled by the file-based `/routes/contentRoutes.js`.

/**
 * ✅ POST /api/content
 * Create a new content document (not heavily used by the current frontend,
 * but kept for completeness).
 */
router.post("/", async (req, res) => {
  try {
    const newContent = await Content.create(req.body);
    return res.status(201).json(newContent);
  } catch (err) {
    console.error("Error creating content:", err);
    return res.status(400).json({ error: "Invalid content data" });
  }
});

/**
 * ✅ PUT /api/content/:id
 * Replace an existing content document by ID.
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    return res.json(updatedContent);
  } catch (err) {
    console.error("Error updating content:", err);
    return res.status(400).json({ error: "Invalid content data" });
  }
});

/**
 * ✅ DELETE /api/content/:id
 * Delete a content document by ID.
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedContent = await Content.findByIdAndDelete(req.params.id);
    if (!deletedContent) {
      return res.status(404).json({ error: "Content not found" });
    }
    return res.json({ message: "Content deleted successfully" });
  } catch (err) {
    console.error("Error deleting content:", err);
    return res.status(500).json({ error: "Server error deleting content" });
  }
});

export default router;
