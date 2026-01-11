// models/SchoolPerformance.js
import mongoose from 'mongoose';

const schoolPerformanceSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Annual'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic Excellence', 'KCSE Results', 'National Rankings', 'Co-curricular', 'Competitions', 'University Admissions', 'Other']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metric: {
    type: String,
    // e.g., "95%", "Top 10", "1st Place", "85 students"
  },
  ranking: {
    type: String,
    // e.g., "National", "County", "Regional"
  },
  published: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
schoolPerformanceSchema.index({ year: -1, term: 1, category: 1 });
schoolPerformanceSchema.index({ published: 1, displayOrder: 1 });

const SchoolPerformance = mongoose.model('SchoolPerformance', schoolPerformanceSchema);

export default SchoolPerformance;
