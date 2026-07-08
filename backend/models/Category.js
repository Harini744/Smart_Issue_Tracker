const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  icon: String,
  color: { type: String, default: '#6366f1' },
  isActive: { type: Boolean, default: true },
  keywords: [String]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
