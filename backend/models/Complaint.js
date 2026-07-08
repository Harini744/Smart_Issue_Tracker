const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Infrastructure', 'Academic', 'Administrative', 'Hostel', 'Library', 'IT Support', 'Safety', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
    default: 'Pending'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    url: String,
    publicId: String,
    aiCategory: String,
    aiConfidence: Number
  }],
  // NLP analysis results
  nlpAnalysis: {
    detectedPriority: String,
    suggestedCategory: String,
    sentimentScore: Number,
    keywords: [String],
    escalationFlag: { type: Boolean, default: false }
  },
  // CNN analysis results
  visionAnalysis: {
    detectedCategory: String,
    confidence: Number,
    labels: [String]
  },
  comments: [commentSchema],
  resolvedAt: Date,
  dueDate: Date,
  tags: [String],
  isAnonymous: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for search
complaintSchema.index({ title: 'text', description: 'text' });
complaintSchema.index({ student: 1, status: 1 });
complaintSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
