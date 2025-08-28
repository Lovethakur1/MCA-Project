const mongoose = require('mongoose');

const PricingPlanSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'personal-training',
      'partner-personal-training', 
      'senior-personal-training',
      'domizil-personal-training',
      'gesundheits-coaching'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true // e.g., "60 min", "90 min"
  },
  price: {
    type: String,
    required: true // e.g., "CHF 150.-"
  },
  location: {
    type: String,
    required: true // e.g., "Private Studio", "Online/Studio"
  },
  icon: {
    type: String,
    default: 'fas fa-clock' // Font Awesome icon class
  },
  buttonText: {
    type: String,
    default: 'Book Now'
  },
  buttonLink: {
    type: String,
    default: '#'
  },
  features: [{
    type: String
  }],
  popular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const PricingTabSchema = new mongoose.Schema({
  tabId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const PricingPlan = mongoose.model('PricingPlan', PricingPlanSchema);
const PricingTab = mongoose.model('PricingTab', PricingTabSchema);

module.exports = {
  PricingPlan,
  PricingTab
};
