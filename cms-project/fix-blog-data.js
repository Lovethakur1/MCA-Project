const mongoose = require('mongoose');
require('dotenv').config();

const BlogPost = require('./models/BlogPost');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixBlogData() {
  try {
    console.log('Fixing blog post data...');
    
    // Update all existing blog posts with correct category and status
    const updateOperations = [
      {
        updateOne: {
          filter: { slug: 'top-10-superfoods-for-athletes' },
          update: {
            $set: {
              category: 'diet',
              status: 'published',
              published: true,
              excerpt: 'Discover the most nutrient-dense foods that will fuel your workouts, speed recovery, and optimize your athletic performance naturally.'
            }
          }
        }
      },
      {
        updateOne: {
          filter: { slug: 'pre-workout-nutrition-guide' },
          update: {
            $set: {
              category: 'diet',
              status: 'published',
              published: true,
              excerpt: 'Learn what to eat before your workout to maximize energy, endurance, and performance. Complete guide with timing and food suggestions.'
            }
          }
        }
      },
      {
        updateOne: {
          filter: { slug: 'healthy-fats-for-weight-loss' },
          update: {
            $set: {
              category: 'diet',
              status: 'published',
              published: true,
              excerpt: 'Not all fats are created equal. Discover which healthy fats can actually help you lose weight and improve your overall health.'
            }
          }
        }
      },
      {
        updateOne: {
          filter: { slug: 'post-workout-recovery-foods' },
          update: {
            $set: {
              category: 'diet',
              status: 'published',
              published: true,
              excerpt: 'Optimize your recovery with these science-backed nutrition strategies. Learn what to eat after your workout for maximum results.'
            }
          }
        }
      },
      {
        updateOne: {
          filter: { slug: 'meal-prep-for-busy-athletes' },
          update: {
            $set: {
              category: 'diet',
              status: 'published',
              published: true,
              excerpt: 'Master the art of meal preparation with these time-saving strategies and nutritious recipes perfect for your busy lifestyle.'
            }
          }
        }
      }
    ];
    
    const result = await BlogPost.bulkWrite(updateOperations);
    console.log(`Updated ${result.modifiedCount} blog posts with correct data`);
    
    // Verify the updates
    const blogs = await BlogPost.find({}).sort({ createdAt: -1 });
    
    console.log('\n=== UPDATED BLOG POSTS ===');
    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Published: ${blog.published}`);
      console.log(`   Excerpt: ${blog.excerpt ? blog.excerpt.substring(0, 80) + '...' : 'No excerpt'}`);
      console.log('   ---');
    });
    
    // Test the filter that the website uses
    const dietBlogs = await BlogPost.find({ 
      status: 'published',
      category: 'diet' 
    }).sort({ createdAt: -1 }).limit(6);
    
    console.log(`\n=== DIET BLOGS FOR WEBSITE (${dietBlogs.length}) ===`);
    dietBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Will show on Coach Mary Carmen page: YES`);
    });
    
  } catch (error) {
    console.error('Error fixing blog data:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixBlogData();
