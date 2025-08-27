const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Testimonial = require('./models/Testimonial');

const featuredTestimonials = [
  {
    name: 'Rodrigo Maciel',
    location: 'London - City',
    rating: 5,
    content: 'Joining MCA is the best investment I have ever made. I\'ve achieved results which, after years of hard training and healthy eating, I never thought my body was capable of. I\'ve gained so much from this process, I\'m more educated about nutrition and fitness.',
    featured: true,
    published: true,
    source: 'Google Reviews'
  },
  {
    name: 'Sarah Johnson',
    location: 'New York',
    rating: 5,
    content: 'The personalized approach at MCA has transformed my life. The trainers are incredibly knowledgeable and supportive. I\'ve never felt stronger or more confident in my body.',
    featured: true,
    published: true,
    source: 'Google Reviews'
  },
  {
    name: 'Michael Chen',
    location: 'Los Angeles',
    rating: 5,
    content: 'Outstanding results in just 3 months! The team at MCA created a perfect program for my goals. Their expertise and dedication are unmatched. Highly recommend their professional approach.',
    featured: true,
    published: true,
    source: 'Google Reviews'
  },
  {
    name: 'Emma Rodriguez',
    location: 'Miami',
    rating: 5,
    content: 'MCA changed my relationship with fitness completely. The coaches are patient, knowledgeable, and truly care about your success. I feel stronger and healthier than ever before.',
    featured: true,
    published: true,
    source: 'Google Reviews'
  },
  {
    name: 'James Wilson',
    location: 'Chicago',
    rating: 5,
    content: 'After struggling with consistency for years, MCA gave me the structure and motivation I needed. The results speak for themselves - I\'ve never been in better shape.',
    featured: true,
    published: true,
    source: 'Google Reviews'
  }
];

async function createFeaturedTestimonials() {
  try {
    console.log('Checking existing testimonials...');
    
    // Check existing testimonials
    const existing = await Testimonial.find({});
    console.log(`Found ${existing.length} existing testimonials`);
    
    if (existing.length > 0) {
      console.log('Existing testimonials:');
      existing.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} - Featured: ${t.featured}, Published: ${t.published}`);
      });
    }
    
    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log('Cleared all existing testimonials');
    
    // Create new featured testimonials
    const created = await Testimonial.insertMany(featuredTestimonials);
    console.log(`Successfully created ${created.length} featured testimonials!`);
    
    // Verify the data
    const featured = await Testimonial.find({ featured: true, published: true });
    console.log(`\n✅ Found ${featured.length} featured testimonials in database:`);
    
    featured.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.name} (${testimonial.location})`);
      console.log(`   Rating: ${testimonial.rating}/5`);
      console.log(`   Content: ${testimonial.content.substring(0, 80)}...`);
      console.log(`   Featured: ${testimonial.featured}, Published: ${testimonial.published}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error creating testimonials:', error);
  } finally {
    mongoose.connection.close();
  }
}

createFeaturedTestimonials();
