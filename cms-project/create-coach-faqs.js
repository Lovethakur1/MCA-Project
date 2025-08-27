const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const FAQ = require('./models/FAQ');

const coachFAQs = [
  {
    question: "I need consultation about the prices of StrongX's services?",
    answer: "Our prices depend on your goals. Contact us for a personalized quote and free consultation.",
    category: "pricing",
    page: "coach",
    order: 1,
    status: "published"
  },
  {
    question: "As a beginner, how can I find out which workout program is right for me?",
    answer: "Our trainers offer an initial assessment to design a program tailored to your needs and experience level.",
    category: "training",
    page: "coach",
    order: 2,
    status: "published"
  },
  {
    question: "Is my membership card valid for use at all StrongX facilities?",
    answer: "Yes! StrongX memberships give you access to all our nationwide facilities.",
    category: "membership",
    page: "coach",
    order: 3,
    status: "published"
  },
  {
    question: "What are StrongX's operating hours?",
    answer: "Most StrongX locations are open 6AM-10PM Monday to Saturday, and 8AM-8PM on Sunday.",
    category: "general",
    page: "coach",
    order: 4,
    status: "published"
  },
  {
    question: "Does StrongX offer childcare services?",
    answer: "Yes, select locations have childcare available during peak hours. Please check with your local gym.",
    category: "general",
    page: "coach",
    order: 5,
    status: "published"
  },
  {
    question: "What nutrition coaching services does Coach Mary Carmen offer?",
    answer: "Coach Mary Carmen provides personalized nutrition plans, meal prep guidance, supplement recommendations, and ongoing support to help you achieve your health and fitness goals.",
    category: "nutrition",
    page: "coach",
    order: 6,
    status: "published"
  },
  {
    question: "How often should I meet with Coach Mary Carmen for nutrition coaching?",
    answer: "The frequency depends on your goals and needs. Most clients start with weekly sessions and gradually move to bi-weekly or monthly check-ins as they become more confident with their nutrition plan.",
    category: "coaching",
    page: "coach",
    order: 7,
    status: "published"
  },
  {
    question: "Can Coach Mary Carmen help with specific dietary requirements or restrictions?",
    answer: "Absolutely! Coach Mary Carmen has experience working with various dietary needs including vegetarian, vegan, gluten-free, and other specific requirements. All plans are customized to fit your lifestyle and preferences.",
    category: "nutrition",
    page: "coach",
    order: 8,
    status: "published"
  }
];

async function createCoachFAQs() {
  try {
    console.log('Creating Coach Mary Carmen FAQ entries...');
    
    // Clear existing coach FAQs
    await FAQ.deleteMany({ page: 'coach' });
    console.log('Cleared existing coach FAQs');
    
    // Create new FAQ entries
    const createdFAQs = await FAQ.insertMany(coachFAQs);
    console.log(`Successfully created ${createdFAQs.length} FAQ entries for Coach Mary Carmen page!`);
    
    // Display created FAQs
    console.log('\n=== CREATED FAQ ENTRIES ===');
    createdFAQs.forEach((faq, index) => {
      console.log(`${index + 1}. Question: ${faq.question}`);
      console.log(`   Answer: ${faq.answer.substring(0, 100)}...`);
      console.log(`   Category: ${faq.category}`);
      console.log(`   Page: ${faq.page}`);
      console.log(`   Order: ${faq.order}`);
      console.log(`   Status: ${faq.status}`);
      console.log('   ---');
    });
    
    // Verify the data
    const coachFAQsVerify = await FAQ.find({ page: 'coach', status: 'published' })
      .sort({ order: 1 });
    console.log(`\n✅ Found ${coachFAQsVerify.length} published FAQs for Coach Mary Carmen page in database`);
    
  } catch (error) {
    console.error('Error creating coach FAQs:', error);
  } finally {
    mongoose.connection.close();
  }
}

createCoachFAQs();
