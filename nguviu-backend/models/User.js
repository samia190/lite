// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, index: true, sparse: true },

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: { unique: true } },
    passwordHash: { type: String, required: true },

    role: { type: String, default: "pending", enum: ["pending","admin","teacher","student","staff","parent","user"] },
    requestedRole: { type: String, default: "user" },

    // Student-specific fields
    admissionNumber: { type: String, index: true, sparse: true },
    dateOfBirth: { type: String }, // Format: YYYY-MM-DD
    phone: { type: String },
    stream: { type: String },
    isActive: { type: Boolean, default: true },

    resetTokenHash: { type: String },
    resetTokenExpires: { type: Date },

    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export default mongoose.models?.User || mongoose.model("User", UserSchema);
