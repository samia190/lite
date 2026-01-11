// models/Result.js
import mongoose from "mongoose";

const SubjectResultSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  marks: { type: Number, required: true },
  grade: { type: String, required: true },
  remarks: { type: String },
  // CBC specific fields
  competencyLevel: { 
    type: String,
    enum: ['Exceeding Expectations', 'Meeting Expectations', 'Approaching Expectations', 'Below Expectations', ''],
    default: ''
  }
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  // Link to student
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Student verification details (for matching)
  admissionNumber: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  class: { type: String, required: true },
  stream: { type: String },
  
  // Assessment number for CBC students
  assessmentNumber: { type: String, index: true },
  
  // Curriculum system
  curriculum: {
    type: String,
    required: true,
    enum: ['8-4-4', 'CBC'],
    default: '8-4-4'
  },
  
  // Academic period
  term: { 
    type: String, 
    required: true,
    enum: ['Term 1', 'Term 2', 'Term 3']
  },
  year: { type: Number, required: true },
  examType: { 
    type: String, 
    default: 'End of Term',
    enum: ['Mid Term', 'End of Term', 'Final Exam', 'Mock Exam']
  },
  
  // Results data
  subjects: [SubjectResultSchema],
  totalMarks: { type: Number, required: true },
  averageMarks: { type: Number, required: true },
  overallGrade: { type: String, required: true },
  position: { type: Number }, // Position in class
  outOf: { type: Number }, // Total students in class
  
  // PDF Upload Option (alternative to manual entry)
  uploadedPdfUrl: { type: String }, // Path to uploaded PDF
  uploadedPdfFilename: { type: String },
  isUploadedPdf: { type: Boolean, default: false }, // True if admin uploaded PDF
  
  // Performance Tracking
  previousTermAverage: { type: Number }, // For comparison
  performanceChange: { type: Number }, // +/- change from previous term
  weakSubjects: [String], // Subjects below average
  strongSubjects: [String], // Subjects above average
  improvementAreas: [String], // Suggested areas to work on
  
  // Additional information
  attendance: {
    daysPresent: { type: Number },
    daysAbsent: { type: Number },
    totalDays: { type: Number }
  },
  
  conduct: {
    grade: { type: String },
    remarks: { type: String }
  },
  
  teacherRemarks: { type: String },
  headTeacherRemarks: { type: String },
  
  // Verification for download access
  dateOfBirth: { type: Date, required: true }, // Used for verification
  
  // Status
  published: { 
    type: Boolean, 
    default: false 
  },
  publishedDate: { type: Date },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
ResultSchema.index({ admissionNumber: 1, term: 1, year: 1 });
ResultSchema.index({ studentId: 1, published: 1 });

// Virtual for full academic period
ResultSchema.virtual('academicPeriod').get(function() {
  return `${this.term} ${this.year}`;
});

// Ensure virtuals are included in JSON
ResultSchema.set('toJSON', { virtuals: true });
ResultSchema.set('toObject', { virtuals: true });

const Result = mongoose.model("Result", ResultSchema);
export default Result;
