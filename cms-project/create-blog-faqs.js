const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const FAQ = require('./models/FAQ');

const blogFAQs = [
  {
    question: "What types of blog content do you publish?",
    answer: "We publish a variety of content including nutrition guides, workout tips, healthy recipes, lifestyle advice, and expert interviews to help you achieve your health and fitness goals.",
    category: "general",
    page: "blog",
    order: 1,
    status: "published"
  },
  {
    question: "How often do you publish new blog posts?",
    answer: "We publish new blog posts regularly, typically 2-3 times per week, covering different aspects of health, fitness, and nutrition.",
    category: "general",
    page: "blog",
    order: 2,
    status: "published"
  },
  {
    question: "Are the nutrition tips backed by science?",
    answer: "Yes, all our nutrition advice is based on current scientific research and is reviewed by certified nutritionists and health professionals.",
    category: "nutrition",
    page: "blog",
    order: 3,
    status: "published"
  },
  {
    question: "Can I suggest topics for future blog posts?",
    answer: "Absolutely! We welcome topic suggestions from our readers. Please contact us with your ideas and we'll consider them for future content.",
    category: "general",
    page: "blog",
    order: 4,
    status: "published"
  },
  {
    question: "Do you provide personalized nutrition advice?",
    answer: "While our blog provides general guidance, for personalized nutrition advice, we recommend consulting with our certified nutritionists through our coaching services.",
    category: "nutrition",
    page: "blog",
    order: 5,
    status: "published"
  },
  {
    question: "Can I subscribe to get notified of new blog posts?",
    answer: "Yes, you can subscribe to our newsletter to receive notifications about new blog posts and exclusive health tips directly to your inbox.",
    category: "general",
    page: "blog",
    order: 6,
    status: "published"
  },
  {
    question: "Are your workout recommendations suitable for beginners?",
    answer: "Yes, we provide content suitable for all fitness levels, from beginners to advanced athletes. Each post clearly indicates the difficulty level and any modifications.",
    category: "fitness",
    page: "blog",
    order: 7,
    status: "published"
  },
  {
    question: "How can I track my progress using your blog content?",
    answer: "Many of our posts include tracking templates and progress indicators. We also recommend keeping a fitness and nutrition journal to monitor your improvements.",
    category: "fitness",
    page: "blog",
    order: 8,
    status: "published"
  }
];

async function createBlogFAQs() {
  try {
    console.log('Creating Blog FAQ entries...');
    
    // Clear existing blog FAQs
    await FAQ.deleteMany({ page: 'blog' });
    console.log('Cleared existing blog FAQs');
    
    // Create new FAQ entries
    const createdFAQs = await FAQ.insertMany(blogFAQs);
    console.log(`Successfully created ${createdFAQs.length} FAQ entries for Blog page!`);
    
    // Display created FAQs
    console.log('\n=== CREATED BLOG FAQ ENTRIES ===');
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
    const blogFAQsVerify = await FAQ.find({ page: 'blog', status: 'published' })
      .sort({ order: 1 });
    console.log(`\n✅ Found ${blogFAQsVerify.length} published FAQs for Blog page in database`);
    
  } catch (error) {
    console.error('Error creating blog FAQs:', error);
  } finally {
    mongoose.connection.close();
  }
}

createBlogFAQs();
