const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'diet', 'fitness', 'lifestyle', 'training', 'health', 'tips'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    alt: String
  }],
  published: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-generate slug from title
BlogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
