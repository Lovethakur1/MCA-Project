const mongoose = require('mongoose');
require('dotenv').config();

const BlogPost = require('./models/BlogPost');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function publishBlogs() {
  try {
    console.log('Publishing all blog posts...');
    
    // Update all blog posts to be published
    const result = await BlogPost.updateMany(
      { published: false },
      { 
        $set: { 
          published: true,
          status: 'published'
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} blog posts to published status`);
    
    // Show all blog posts with their current status
    const blogs = await BlogPost.find({}).sort({ createdAt: -1 });
    
    console.log('\n=== ALL BLOG POSTS ===');
    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Published: ${blog.published}`);
      console.log(`   Created: ${blog.createdAt}`);
      console.log('   ---');
    });
    
    // Filter for diet category
    const dietBlogs = blogs.filter(blog => blog.category === 'diet' && (blog.status === 'published' || blog.published === true));
    console.log(`\n=== PUBLISHED DIET & NUTRITION BLOGS (${dietBlogs.length}) ===`);
    dietBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Excerpt: ${blog.excerpt}`);
    });
    
  } catch (error) {
    console.error('Error publishing blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

publishBlogs();
