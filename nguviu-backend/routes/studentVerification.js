// routes/studentVerification.js
import express from "express";
import Student from "../models/Student.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = express.Router();

// Verify student ID card token (PUBLIC - anyone can scan)
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        valid: false, 
        error: "No verification token provided" 
      });
    }
    
    // Verify token and get student
    const student = await Student.verifyToken(token);
    
    // Return only safe information
    return res.json({
      valid: true,
      student: {
        admissionNumber: student.admissionNumber,
        fullName: student.fullName,
        firstName: student.firstName,
        lastName: student.lastName,
        otherNames: student.otherNames,
        class: student.class,
        stream: student.stream,
        photoUrl: student.photoUrl,
        status: student.status,
        yearOfAdmission: student.yearOfAdmission,
        idCardIssueDate: student.idCardIssueDate,
        idCardExpiryDate: student.idCardExpiryDate,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("Verification error:", err.message);
    return res.status(400).json({ 
      valid: false, 
      error: err.message || "Verification failed" 
    });
  }
});

// Generate new verification token (ADMIN only - for generating QR codes)
router.post("/generate-token/:studentId", requireRole('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    // Generate fresh token (valid for 2 minutes)
    const token = student.generateVerificationToken();
    
    return res.json({
      token,
      student: {
        admissionNumber: student.admissionNumber,
        fullName: student.fullName,
        class: student.class
      },
      expiresIn: "2 minutes"
    });
  } catch (err) {
    console.error("Token generation error:", err);
    return res.status(500).json({ error: "Failed to generate token" });
  }
});

// Issue new ID card (generates new secret, invalidates old cards)
router.post("/issue-card/:studentId", requireRole('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    // Generate new secret (invalidates all old QR codes)
    student.generateIdCardSecret();
    student.idCardActive = true;
    await student.save();
    
    return res.json({
      message: "New ID card issued successfully",
      student: {
        admissionNumber: student.admissionNumber,
        fullName: student.fullName,
        idCardVersion: student.idCardVersion,
        idCardIssueDate: student.idCardIssueDate,
        idCardExpiryDate: student.idCardExpiryDate
      }
    });
  } catch (err) {
    console.error("Card issue error:", err);
    return res.status(500).json({ error: "Failed to issue card" });
  }
});

// Deactivate ID card (security measure)
router.post("/deactivate-card/:studentId", requireRole('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    student.idCardActive = false;
    await student.save();
    
    return res.json({
      message: "ID card deactivated successfully",
      student: {
        admissionNumber: student.admissionNumber,
        fullName: student.fullName
      }
    });
  } catch (err) {
    console.error("Card deactivation error:", err);
    return res.status(500).json({ error: "Failed to deactivate card" });
  }
});

// Get all students (ADMIN only - for management)
router.get("/students", requireRole('admin'), async (req, res) => {
  try {
    const students = await Student.find()
      .select("-idCardSecret") // Never expose the secret
      .sort({ lastName: 1, firstName: 1 });
    
    return res.json({ students });
  } catch (err) {
    console.error("Get students error:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Create new student (ADMIN only)
router.post("/students", requireRole('admin'), async (req, res) => {
  try {
    const studentData = req.body;
    
    // Check if admission number already exists
    const existing = await Student.findOne({ admissionNumber: studentData.admissionNumber });
    if (existing) {
      return res.status(409).json({ error: "Admission number already exists" });
    }
    
    // Create student
    const student = new Student(studentData);
    
    // Generate ID card secret
    student.generateIdCardSecret();
    
    await student.save();
    
    return res.status(201).json({
      message: "Student created successfully",
      student: {
        id: student._id,
        admissionNumber: student.admissionNumber,
        fullName: student.fullName,
        class: student.class,
        idCardVersion: student.idCardVersion
      }
    });
  } catch (err) {
    console.error("Create student error:", err);
    return res.status(500).json({ error: "Failed to create student" });
  }
});

// Update student (ADMIN only)
router.put("/students/:studentId", requireRole('admin'), async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating sensitive fields
    delete updates.idCardSecret;
    delete updates.idCardVersion;
    delete updates.verificationCount;
    
    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-idCardSecret");
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    return res.json({
      message: "Student updated successfully",
      student
    });
  } catch (err) {
    console.error("Update student error:", err);
    return res.status(500).json({ error: "Failed to update student" });
  }
});

export default router;
