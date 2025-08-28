const mongoose = require('mongoose');
const { PricingPlan, PricingTab } = require('./models/Pricing');
const Content = require('./models/Content');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cms', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const seedPricingData = async () => {
    try {
        console.log('🌱 Starting pricing data seeding...');

        // Clear existing pricing data
        await PricingPlan.deleteMany({});
        await PricingTab.deleteMany({});
        console.log('🗑️ Cleared existing pricing data');

        // Create pricing tabs
        const pricingTabs = [
            {
                tabId: 'personal-training',
                title: 'Personal Training',
                description: 'Individual training sessions for optimal results',
                sortOrder: 1,
                published: true
            },
            {
                tabId: 'partner-personal-training',
                title: 'Partner Training',
                description: 'Train together with your partner',
                sortOrder: 2,
                published: true
            },
            {
                tabId: 'senior-personal-training',
                title: 'Senior Training',
                description: 'Gentle training designed for seniors',
                sortOrder: 3,
                published: true
            },
            {
                tabId: 'domizil-personal-training',
                title: 'Home Training',
                description: 'Training at your location',
                sortOrder: 4,
                published: true
            },
            {
                tabId: 'gesundheits-coaching',
                title: 'Health Coaching',
                description: 'Comprehensive health and lifestyle coaching',
                sortOrder: 5,
                published: true
            }
        ];

        const createdTabs = await PricingTab.insertMany(pricingTabs);
        console.log('✅ Created pricing tabs');

        // Create pricing plans
        const pricingPlans = [
            // Personal Training Plans
            {
                title: 'Single Session',
                category: 'personal-training',
                description: 'Perfect for trying out personal training',
                duration: '60 min',
                price: 'CHF 150.-',
                location: 'Private Studio',
                features: ['Professional trainer', 'Personalized workout', 'Progress tracking'],
                popular: false,
                sortOrder: 1,
                published: true
            },
            {
                title: '10 Session Package',
                category: 'personal-training',
                description: 'Most popular training package',
                duration: '60 min',
                price: 'CHF 1400.-',
                location: 'Private Studio',
                features: ['Professional trainer', 'Personalized program', 'Nutrition guidance', 'Progress tracking'],
                popular: true,
                sortOrder: 2,
                published: true
            },
            {
                title: '20 Session Package',
                category: 'personal-training',
                description: 'Best value for serious training',
                duration: '60 min',
                price: 'CHF 2700.-',
                location: 'Private Studio',
                features: ['Professional trainer', 'Comprehensive program', 'Nutrition plan', 'Body composition analysis'],
                popular: false,
                sortOrder: 3,
                published: true
            },

            // Partner Training Plans
            {
                title: 'Partner Session',
                category: 'partner-personal-training',
                description: 'Train together with your partner',
                duration: '60 min',
                price: 'CHF 200.-',
                location: 'Private Studio',
                features: ['Shared workout', 'Partner motivation', 'Cost effective'],
                popular: false,
                sortOrder: 1,
                published: true
            },
            {
                title: 'Partner 10 Pack',
                category: 'partner-personal-training',
                description: 'Partner training package',
                duration: '60 min',
                price: 'CHF 1800.-',
                location: 'Private Studio',
                features: ['Shared program', 'Couple motivation', 'Progress tracking for both'],
                popular: true,
                sortOrder: 2,
                published: true
            },

            // Senior Training Plans
            {
                title: 'Senior Session',
                category: 'senior-personal-training',
                description: 'Gentle training for seniors',
                duration: '45 min',
                price: 'CHF 120.-',
                location: 'Private Studio',
                features: ['Age-appropriate exercises', 'Mobility focus', 'Safety first'],
                popular: false,
                sortOrder: 1,
                published: true
            },
            {
                title: 'Senior 8 Pack',
                category: 'senior-personal-training',
                description: 'Senior-friendly training package',
                duration: '45 min',
                price: 'CHF 900.-',
                location: 'Private Studio',
                features: ['Tailored program', 'Health monitoring', 'Flexibility focus'],
                popular: true,
                sortOrder: 2,
                published: true
            },

            // Home Training Plans
            {
                title: 'Home Session',
                category: 'domizil-personal-training',
                description: 'Training at your location',
                duration: '60 min',
                price: 'CHF 200.-',
                location: 'Your Home',
                features: ['Convenience', 'No travel required', 'Comfortable environment'],
                popular: false,
                sortOrder: 1,
                published: true
            },
            {
                title: 'Home 5 Pack',
                category: 'domizil-personal-training',
                description: 'Home training package',
                duration: '60 min',
                price: 'CHF 950.-',
                location: 'Your Home',
                features: ['Equipment provided', 'Home gym setup', 'Family friendly'],
                popular: true,
                sortOrder: 2,
                published: true
            },

            // Health Coaching Plans
            {
                title: 'Coaching Session',
                category: 'gesundheits-coaching',
                description: 'Comprehensive health coaching',
                duration: '90 min',
                price: 'CHF 180.-',
                location: 'Online/Studio',
                features: ['Nutrition guidance', 'Lifestyle coaching', 'Goal setting'],
                popular: false,
                sortOrder: 1,
                published: true
            },
            {
                title: 'Coaching 3 Pack',
                category: 'gesundheits-coaching',
                description: 'Health transformation program',
                duration: '90 min',
                price: 'CHF 500.-',
                location: 'Online/Studio',
                features: ['Complete health assessment', 'Custom meal plans', 'Lifestyle optimization'],
                popular: true,
                sortOrder: 2,
                published: true
            }
        ];

        const createdPlans = await PricingPlan.insertMany(pricingPlans);
        console.log('✅ Created pricing plans');

        // Create or update pricing page content
        const pricingContent = {
            title: 'Transform Your Health with Professional Training',
            subtitle: 'Choose the perfect training plan that fits your lifestyle and goals',
            description: 'Our experienced trainers provide personalized training programs designed to help you achieve your fitness and health goals.'
        };

        // Update the Content collection for pricing page
        await Content.findOneAndUpdate(
            { page: 'pricing' },
            {
                page: 'pricing',
                sections: {
                    hero: {
                        title: 'Professional Personal Training in Basel',
                        subtitle: 'Transform your health with personalized training programs',
                        description: 'Our certified trainers provide expert guidance to help you achieve your fitness goals safely and effectively.',
                        buttonText: 'Start Your Journey',
                        buttonLink: '#pricing-section'
                    },
                    pricing: pricingContent
                }
            },
            { upsert: true, new: true }
        );

        console.log('✅ Updated pricing page content');
        
        console.log(`
🎉 Pricing data seeding completed successfully!

Created:
- ${createdTabs.length} pricing tabs
- ${createdPlans.length} pricing plans
- Updated pricing page content

You can now:
1. Visit /admin/pricing-manager to manage pricing plans
2. Visit /admin/pricing-content to edit page content
3. Visit /price to see the live pricing page
        `);

    } catch (error) {
        console.error('❌ Error seeding pricing data:', error);
    } finally {
        mongoose.connection.close();
        console.log('📝 Database connection closed');
    }
};

// Run the seeding
seedPricingData();
