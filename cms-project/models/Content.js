const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    enum: ['home', 'blog', 'testimonial', 'bootcamp', 'coach', 'price', 'contact', 'global']
  },
  section: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'html', 'image', 'video', 'url'],
    default: 'text'
  }
}, {
  timestamps: true
});

// Create a compound index for faster queries
ContentSchema.index({ page: 1, section: 1, key: 1 });

module.exports = mongoose.model('Content', ContentSchema);
