const mongoose = require('mongoose');
const Content = require('./models/Content');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mca-cms')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    console.log('Seeding database with default content...');

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin@mca.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        email: 'admin@mca.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Admin user created (email: admin@mca.com, password: admin123)');
    }

    // Default content data
    const defaultContent = [
      // Hero Section
      { page: 'home', section: 'hero', key: 'title', value: 'Personal Trainer in Basel' },
      { page: 'home', section: 'hero', key: 'hashtag', value: 'MakeTheMost' },
      { page: 'home', section: 'hero', key: 'description', value: 'With me as your personal trainer, you will achieve a strong body and a happy mind.' },
      { page: 'home', section: 'hero', key: 'buttonText', value: 'Arrange Initial Consultation' },
      { page: 'home', section: 'hero', key: 'buttonLink', value: '/contact' },
      { page: 'home', section: 'hero', key: 'backgroundVideo', value: 'homebackground.mp4' },

      // Services Section
      { page: 'home', section: 'services', key: 'sectionTitle', value: 'Our Services' },
      { page: 'home', section: 'services', key: 'sectionSubtitle', value: 'Choose the perfect training program for your goals' },
      { page: 'home', section: 'services', key: 'service1_title', value: 'Personal Training' },
      { page: 'home', section: 'services', key: 'service1_description', value: 'Train exclusively, benefit optimally: Your personal 1:1 coaching with a clear focus on your goals. Our holistic approach promotes the harmony of body and mind – for greater well-being and sustainable success.' },
      { page: 'home', section: 'services', key: 'service1_price', value: 'CHF 150.– per hour' },
      { page: 'home', section: 'services', key: 'service1_icon', value: '/media/Symbol.png' },
      { page: 'home', section: 'services', key: 'service1_link', value: '/services/personal-training' },

      { page: 'home', section: 'services', key: 'service2_title', value: 'Partner Personal Training' },
      { page: 'home', section: 'services', key: 'service2_description', value: 'Train together with your partner – your individual goals take center stage. Even during joint training, personalized guidance remains top-tier.' },
      { page: 'home', section: 'services', key: 'service2_price', value: 'CHF 250.– per hour' },
      { page: 'home', section: 'services', key: 'service2_icon', value: '/media/myimage.png.png' },
      { page: 'home', section: 'services', key: 'service2_link', value: '/services/partner-training' },

      { page: 'home', section: 'services', key: 'service3_title', value: 'Senior Personal Training' },
      { page: 'home', section: 'services', key: 'service3_description', value: 'Targeted personal training for seniors – so you can remain independent and self-reliant as long as possible. Our goal: Preserve and strategically enhance your quality of life.' },
      { page: 'home', section: 'services', key: 'service3_price', value: 'CHF 150.– per hour' },
      { page: 'home', section: 'services', key: 'service3_icon', value: '/media/Symbol (1).png' },
      { page: 'home', section: 'services', key: 'service3_link', value: '/services/senior-training' },

      { page: 'home', section: 'services', key: 'service4_title', value: 'Domicile Personal Training' },
      { page: 'home', section: 'services', key: 'service4_description', value: 'Domizil Personal Training is designed for those who prefer to train in a nature or their own home gym, as well as seniors for whom visiting a private studio isn\'t an option.' },
      { page: 'home', section: 'services', key: 'service4_price', value: 'CHF 180.– per hour' },
      { page: 'home', section: 'services', key: 'service4_icon', value: '/media/home-1_svgrepo.com.png' },
      { page: 'home', section: 'services', key: 'service4_link', value: '/services/domicile-training' },

      { page: 'home', section: 'services', key: 'service5_title', value: 'Health-Coaching' },
      { page: 'home', section: 'services', key: 'service5_description', value: 'Here, we address sleep, nutrition, recovery, and training, set clear goals, analyze your health status, and create your personalized plan – for sustainable success.' },
      { page: 'home', section: 'services', key: 'service5_price', value: 'CHF 200.– per hour' },
      { page: 'home', section: 'services', key: 'service5_icon', value: '/media/Symbol (2).png' },
      { page: 'home', section: 'services', key: 'service5_link', value: '/services/health-coaching' },

      // About/Team Section
      { page: 'home', section: 'about', key: 'subtitle', value: 'THIS IS US' },
      { page: 'home', section: 'about', key: 'title', value: 'THIS TEAM HAS ONE GOAL: YOUR SUCCESS' },
      { page: 'home', section: 'about', key: 'primaryButtonText', value: 'Free Initial Consultation' },
      { page: 'home', section: 'about', key: 'primaryButtonLink', value: '/contact' },
      { page: 'home', section: 'about', key: 'secondaryButtonText', value: 'Explore Careers' },
      { page: 'home', section: 'about', key: 'secondaryButtonLink', value: '/careers' },

      // Global Navbar
      { page: 'global', section: 'navbar', key: 'logo', value: '/media/mca-logo-300x80.webp' },
      { page: 'global', section: 'navbar', key: 'logoAlt', value: 'MCA Logo' },
      { page: 'global', section: 'navbar', key: 'phone', value: '+41 79 123 45 67' },
      { page: 'global', section: 'navbar', key: 'email', value: 'info@mca-fitness.ch' },

      // Global Footer
      { page: 'global', section: 'footer', key: 'companyName', value: 'MCA Fitness' },
      { page: 'global', section: 'footer', key: 'description', value: 'Transform your life with our comprehensive fitness programs designed to help you achieve your goals.' },
      { page: 'global', section: 'footer', key: 'address', value: 'Musterstrasse 123, 4000 Basel, Switzerland' },
      { page: 'global', section: 'footer', key: 'phone', value: '+41 79 123 45 67' },
      { page: 'global', section: 'footer', key: 'email', value: 'info@mca-fitness.ch' },
      { page: 'global', section: 'footer', key: 'copyright', value: '© 2024 MCA Fitness. All rights reserved.' },

      // Global Site Settings
      { page: 'global', section: 'site', key: 'title', value: 'MCA Fitness - Personal Training in Basel' },
      { page: 'global', section: 'site', key: 'description', value: 'Professional personal training services in Basel. Transform your body and mind with our expert coaches.' },
      { page: 'global', section: 'site', key: 'keywords', value: 'personal training, fitness, Basel, health coaching, gym' }
    ];

    // Check if content already exists
    const existingContent = await Content.countDocuments();
    if (existingContent === 0) {
      await Content.insertMany(defaultContent);
      console.log(`✅ Added ${defaultContent.length} default content items`);
    } else {
      console.log('📝 Content already exists, skipping seed');
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@mca.com');
    console.log('   Password: admin123');
    console.log('\n🔗 URLs:');
    console.log('   Website: http://localhost:3000');
    console.log('   Admin Panel: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
