// routes/schoolMagazine.js
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Simple schema for storing magazine metadata
const magazineSchema = new mongoose.Schema({
  title: { type: String, default: "School Magazine" },
  issue: String,
  date: { type: Date, default: Date.now },
  description: String,
  pdfUrl: { type: String, required: true },
  coverImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SchoolMagazine = mongoose.models.SchoolMagazine || 
  mongoose.model("SchoolMagazine", magazineSchema);

/**
 * GET /api/school-magazine
 * Returns the latest school magazine
 */
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ pdfUrl: null });
    }

    // Get the most recent magazine
    const magazine = await SchoolMagazine.findOne().sort({ date: -1 });
    
    if (!magazine) {
      return res.json({ pdfUrl: null });
    }

    return res.json(magazine);
  } catch (err) {
    console.error("Error fetching school magazine:", err);
    return res.status(500).json({ error: "Failed to fetch magazine" });
  }
});

/**
 * GET /api/school-magazine/all
 * Returns all magazines (for admin)
 */
router.get("/all", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const magazines = await SchoolMagazine.find().sort({ date: -1 });
    return res.json(magazines);
  } catch (err) {
    console.error("Error fetching all magazines:", err);
    return res.status(500).json({ error: "Failed to fetch magazines" });
  }
});

/**
 * POST /api/school-magazine
 * Create or update school magazine
 */
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { title, issue, date, description, pdfUrl, coverImage, _id } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ error: "PDF URL is required" });
    }

    let magazine;
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      // Update existing
      magazine = await SchoolMagazine.findByIdAndUpdate(
        _id,
        {
          title,
          issue,
          date: date || new Date(),
          description,
          pdfUrl,
          coverImage,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
    } else {
      // Create new
      magazine = await SchoolMagazine.create({
        title: title || "School Magazine",
        issue,
        date: date || new Date(),
        description,
        pdfUrl,
        coverImage
      });
    }

    return res.json(magazine);
  } catch (err) {
    console.error("Error saving school magazine:", err);
    return res.status(500).json({ error: "Failed to save magazine" });
  }
});

/**
 * DELETE /api/school-magazine/:id
 * Delete a magazine
 */
router.delete("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid magazine ID" });
    }

    await SchoolMagazine.findByIdAndDelete(id);
    return res.json({ success: true, message: "Magazine deleted" });
  } catch (err) {
    console.error("Error deleting magazine:", err);
    return res.status(500).json({ error: "Failed to delete magazine" });
  }
});

export default router;
