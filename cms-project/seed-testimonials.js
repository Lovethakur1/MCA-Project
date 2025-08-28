const mongoose = require('mongoose');
const Testimonial = require('./models/Testimonial');
const Content = require('./models/Content');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mca-cms')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedTestimonials() {
  try {
    console.log('Seeding testimonials and page content...');

    // Check if testimonials already exist
    const existingTestimonials = await Testimonial.find();
    if (existingTestimonials.length > 0) {
      console.log('❌ Testimonials already exist. Skipping testimonial seeding.');
    } else {
      // Sample testimonials
      const testimonials = [
        {
          name: 'Sarah Johnson',
          title: 'Marketing Manager',
          content: 'Working with this team has been absolutely transformative for my fitness journey. Their personalized approach and dedication to my goals helped me achieve results I never thought possible. The support and motivation were exceptional!',
          image: 'media/blog1.jpg',
          rating: 5,
          featured: true,
          published: true
        },
        {
          name: 'Michael Chen',
          title: 'Software Developer',
          content: 'As someone who sits at a desk all day, I was struggling with back pain and low energy. The training program designed for me not only eliminated my pain but also boosted my energy levels significantly. Highly recommended!',
          image: 'media/blog2.jpg',
          rating: 5,
          featured: true,
          published: true
        },
        {
          name: 'Emma Rodriguez',
          title: 'Business Owner',
          content: 'The holistic approach to fitness and wellness here is outstanding. They don\'t just focus on the physical aspect but also mental well-being. I feel stronger, more confident, and healthier than ever before.',
          image: 'media/blog3.jpg',
          rating: 5,
          featured: false,
          published: true
        },
        {
          name: 'James Wilson',
          title: 'Teacher',
          content: 'I\'ve tried many gyms and trainers before, but none matched the professionalism and expertise I found here. The customized workout plans and nutritional guidance made all the difference in achieving my fitness goals.',
          image: 'media/blog1.jpg',
          rating: 4,
          featured: false,
          published: true
        },
        {
          name: 'Lisa Thompson',
          title: 'Nurse',
          content: 'After struggling with weight loss for years, I finally found a program that works. The trainers are knowledgeable, supportive, and truly care about your success. I\'ve lost 30 pounds and gained so much confidence!',
          image: 'media/blog2.jpg',
          rating: 5,
          featured: false,
          published: true
        },
        {
          name: 'David Kumar',
          title: 'Financial Analyst',
          content: 'The partner training sessions with my wife have been amazing. We\'ve both achieved our individual goals while strengthening our relationship. The trainers expertly balanced both our needs in each session.',
          image: 'media/blog3.jpg',
          rating: 5,
          featured: false,
          published: true
        }
      ];

      // Insert testimonials
      for (const testimonialData of testimonials) {
        const testimonial = new Testimonial(testimonialData);
        await testimonial.save();
      }

      console.log('✅ Sample testimonials created successfully!');
    }

    // Check if testimonial page content exists
    const existingContent = await Content.find({ page: 'testimonial' });
    if (existingContent.length > 0) {
      console.log('❌ Testimonial page content already exists. Skipping content seeding.');
    } else {
      // Default testimonial page content
      const testimonialContent = [
        // Hero Section
        { page: 'testimonial', section: 'hero', key: 'title', value: 'WHAT ARE OUR CUSTOMERS SAYING?', type: 'text' },
        { page: 'testimonial', section: 'hero', key: 'subtitle', value: 'Real stories from real people who transformed their lives', type: 'text' },
        { page: 'testimonial', section: 'hero', key: 'bg_color', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'text' },

        // Main Section
        { page: 'testimonial', section: 'section', key: 'intro', value: 'In Their Own Words', type: 'text' },
        { page: 'testimonial', section: 'section', key: 'title', value: 'Unveiling the True Customer Experience', type: 'text' },
        { page: 'testimonial', section: 'section', key: 'highlight', value: 'True Customer', type: 'text' },
        { page: 'testimonial', section: 'section', key: 'description', value: 'Customers provide testimonials with descriptions of satisfaction.', type: 'text' },
        { page: 'testimonial', section: 'section', key: 'cta_text', value: 'Share Your Story', type: 'text' },
        { page: 'testimonial', section: 'section', key: 'cta_link', value: '/contact', type: 'text' }
      ];

      // Insert content
      for (const contentData of testimonialContent) {
        const content = new Content(contentData);
        await content.save();
      }

      console.log('✅ Testimonial page content created successfully!');
    }

    console.log('🎉 Testimonial seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding testimonials:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding
seedTestimonials();
