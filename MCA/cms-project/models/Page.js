const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'draft', 'archived'],
        default: 'active'
    },
    showInNav: {
        type: Boolean,
        default: true
    },
    navOrder: {
        type: Number,
        default: 0
    },
    metaDescription: {
        type: String,
        default: ''
    },
    
    // Hero Section
    hero: {
        title: String,
        subtitle: String,
        description: String,
        backgroundImage: String,
        backgroundVideo: String,
        ctaText: String,
        ctaLink: String,
        showCTA: {
            type: Boolean,
            default: true
        }
    },

    // Services Section
    services: {
        sectionTitle: String,
        sectionDescription: String,
        items: [{
            title: String,
            description: String,
            icon: String,
            link: String
        }]
    },

    // About/Concept Section
    concept: {
        sectionTitle: String,
        sectionDescription: String,
        mainTitle: String,
        mainDescription: String,
        image: String,
        features: [{
            title: String,
            description: String,
            icon: String
        }]
    },

    // Team Section
    team: {
        sectionTitle: String,
        sectionDescription: String,
        members: [{
            name: String,
            position: String,
            image: String,
            bio: String,
            social: {
                facebook: String,
                instagram: String,
                linkedin: String,
                twitter: String
            }
        }]
    },

    // Benefits Section
    benefits: {
        sectionTitle: String,
        items: [{
            title: String,
            description: String,
            icon: String
        }]
    },

    // FAQ Section
    faq: {
        sectionTitle: String,
        items: [{
            question: String,
            answer: String
        }]
    },

    // Testimonials Section
    testimonials: {
        sectionTitle: String,
        showDatabaseTestimonials: {
            type: Boolean,
            default: true
        },
        customTestimonials: [{
            name: String,
            position: String,
            content: String,
            image: String,
            rating: {
                type: Number,
                min: 1,
                max: 5,
                default: 5
            }
        }]
    },

    // Contact Section
    contact: {
        sectionTitle: String,
        sectionDescription: String,
        showContactForm: {
            type: Boolean,
            default: true
        },
        contactInfo: {
            address: String,
            phone: String,
            email: String,
            hours: String
        }
    },

    // Newsletter Section
    newsletter: {
        show: {
            type: Boolean,
            default: false
        },
        title: String,
        description: String,
        buttonText: String,
        termsText: String
    },

    // Custom Sections (for additional flexibility)
    customSections: [{
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'gallery', 'pricing', 'features', 'stats']
        },
        title: String,
        content: String,
        data: mongoose.Schema.Types.Mixed, // Flexible data structure
        order: Number
    }],

    // Page Settings
    settings: {
        showHeader: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: true
        },
        customCSS: String,
        customJS: String
    }

}, {
    timestamps: true
});

// Index for better performance
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1, showInNav: 1 });

module.exports = mongoose.model('Page', pageSchema);
