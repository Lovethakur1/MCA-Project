const mongoose = require('mongoose');
require('dotenv').config();

const BlogPost = require('./models/BlogPost');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addCategoryToBlogs() {
  try {
    console.log('Adding category field to existing blog posts...');
    
    // Update all blog posts to have category "diet" and status "published"
    const result = await BlogPost.updateMany(
      {}, // Update all blog posts
      { 
        $set: { 
          category: 'diet',
          status: 'published'
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} blog posts with category and status`);
    
    // Show the updated blog posts
    const blogs = await BlogPost.find({});
    console.log('\n=== UPDATED BLOG POSTS ===');
    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. Title: ${blog.title}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log('   ---');
    });
    
    // Test the Diet & Nutrition filter
    const dietBlogs = await BlogPost.find({ 
      category: 'diet', 
      status: 'published' 
    });
    console.log(`\nFound ${dietBlogs.length} published Diet & Nutrition blog posts`);
    
  } catch (error) {
    console.error('Error updating blog posts:', error);
  } finally {
    mongoose.connection.close();
  }
}

addCategoryToBlogs();
