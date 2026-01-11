// models/Student.js
import mongoose from "mongoose";
import crypto from "crypto";

const StudentSchema = new mongoose.Schema(
  {
    // Basic Information
    admissionNumber: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherNames: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Female", "Male", "Other"], required: true },
    
    // Academic Information
    class: { type: String, required: true },
    stream: { type: String },
    yearOfAdmission: { type: Number, required: true },
    assessmentNumber: { type: String }, // For CBC students
    
    // Contact Information
    email: { type: String },
    phoneNumber: { type: String },
    
    // Guardian Information
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    guardianEmail: { type: String },
    guardianRelationship: { type: String },
    
    // Address
    county: { type: String },
    subCounty: { type: String },
    ward: { type: String },
    village: { type: String },
    
    // Photo
    photoUrl: { type: String },
    
    // ID Card Security
    idCardSecret: { type: String, required: true }, // Unique secret for this student
    idCardIssueDate: { type: Date },
    idCardExpiryDate: { type: Date },
    idCardActive: { type: Boolean, default: true },
    idCardVersion: { type: Number, default: 1 }, // Increment when reissuing
    
    // Security Tracking
    lastVerified: { type: Date },
    verificationCount: { type: Number, default: 0 },
    
    // Status
    status: { type: String, enum: ["Active", "Suspended", "Graduated", "Transferred"], default: "Active" },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

// Generate unique secret for student ID card
StudentSchema.methods.generateIdCardSecret = function() {
  this.idCardSecret = crypto.randomBytes(32).toString('hex');
  this.idCardVersion = (this.idCardVersion || 0) + 1;
  this.idCardIssueDate = new Date();
  // ID card valid for 1 year
  this.idCardExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  return this.idCardSecret;
};

// Generate secure verification token
StudentSchema.methods.generateVerificationToken = function() {
  if (!this.idCardSecret) {
    throw new Error("ID card secret not generated");
  }
  
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Create payload
  const payload = {
    id: this._id.toString(),
    admissionNumber: this.admissionNumber,
    version: this.idCardVersion,
    timestamp,
    nonce
  };
  
  // Create HMAC signature using student's unique secret + global secret
  const globalSecret = process.env.ID_CARD_SECRET || 'default-secret-change-in-production';
  const combinedSecret = `${this.idCardSecret}:${globalSecret}`;
  const signature = crypto
    .createHmac('sha256', combinedSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  // Combine payload and signature
  const token = Buffer.from(JSON.stringify({ ...payload, signature })).toString('base64url');
  
  return token;
};

// Verify a token
StudentSchema.statics.verifyToken = async function(token) {
  try {
    // Decode token
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
    const { id, admissionNumber, version, timestamp, nonce, signature } = decoded;
    
    // Check token age (valid for 2 minutes to prevent replay attacks)
    const tokenAge = Date.now() - timestamp;
    if (tokenAge > 120000) { // 2 minutes
      throw new Error("Token expired (scanned too long ago)");
    }
    
    // Find student
    const student = await this.findById(id);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Check if ID card is active
    if (!student.idCardActive) {
      throw new Error("ID card has been deactivated");
    }
    
    // Check version (prevents old/cloned cards from working)
    if (version !== student.idCardVersion) {
      throw new Error("ID card version mismatch - card may have been reissued");
    }
    
    // Check expiry
    if (student.idCardExpiryDate && new Date() > student.idCardExpiryDate) {
      throw new Error("ID card has expired");
    }
    
    // Check student status
    if (student.status !== "Active") {
      throw new Error(`Student status: ${student.status}`);
    }
    
    // Verify signature
    const globalSecret = process.env.ID_CARD_SECRET || 'default-secret-change-in-production';
    const combinedSecret = `${student.idCardSecret}:${globalSecret}`;
    const expectedSignature = crypto
      .createHmac('sha256', combinedSecret)
      .update(JSON.stringify({ id, admissionNumber, version, timestamp, nonce }))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature - card may be forged");
    }
    
    // Update verification tracking
    student.lastVerified = new Date();
    student.verificationCount += 1;
    await student.save();
    
    return student;
  } catch (err) {
    throw err;
  }
};

// Get full name
StudentSchema.virtual('fullName').get(function() {
  const names = [this.firstName, this.otherNames, this.lastName].filter(Boolean);
  return names.join(' ');
});

// Ensure virtuals are included in JSON
StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

export default mongoose.models?.Student || mongoose.model("Student", StudentSchema);
