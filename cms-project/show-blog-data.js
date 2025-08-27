const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function showBlogData() {
  try {
    console.log('=== BLOG POSTS IN DATABASE ===\n');
    
    const blogs = await BlogPost.find({}).sort({ createdAt: -1 });
    
    if (blogs.length === 0) {
      console.log('No blog posts found in database.');
      return;
    }
    
    console.log(`Total blog posts: ${blogs.length}\n`);
    
    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. TITLE: ${blog.title}`);
      console.log(`   SLUG: ${blog.slug}`);
      console.log(`   CATEGORY: ${blog.category}`);
      console.log(`   STATUS: ${blog.status}`);
      console.log(`   AUTHOR: ${blog.author}`);
      console.log(`   CREATED: ${blog.createdAt}`);
      console.log(`   FEATURED IMAGE: ${blog.featuredImage || 'None'}`);
      console.log(`   EXCERPT: ${blog.excerpt}`);
      console.log(`   CONTENT LENGTH: ${blog.content ? blog.content.length : 0} characters`);
      console.log('   ' + '='.repeat(80));
    });
    
    // Show category breakdown
    const categoryCount = {};
    blogs.forEach(blog => {
      categoryCount[blog.category] = (categoryCount[blog.category] || 0) + 1;
    });
    
    console.log('\n=== CATEGORY BREAKDOWN ===');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`${category}: ${count} posts`);
    });
    
    // Show Diet & Nutrition posts specifically
    const dietPosts = blogs.filter(blog => blog.category === 'diet');
    console.log(`\n=== DIET & NUTRITION POSTS (${dietPosts.length}) ===`);
    dietPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Created: ${post.createdAt.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Error fetching blog data:', error);
  } finally {
    mongoose.connection.close();
  }
}

showBlogData();
