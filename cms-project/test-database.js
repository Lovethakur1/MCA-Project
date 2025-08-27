const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const BlogPost = require('./models/BlogPost');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const connection = mongoose.connection;
    console.log('Connection state:', connection.readyState);
    console.log('Database name:', connection.name);
    
    // Count documents
    const count = await BlogPost.countDocuments();
    console.log('Blog posts count:', count);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Try to find all blog posts with more details
    const blogs = await BlogPost.find({});
    console.log('Found blogs:', blogs.length);
    
    if (blogs.length > 0) {
      console.log('First blog:', {
        title: blogs[0].title,
        category: blogs[0].category,
        status: blogs[0].status
      });
    }
    
    // Try creating a simple test blog
    console.log('Creating test blog...');
    const testBlog = new BlogPost({
      title: 'Test Blog Post',
      slug: 'test-blog-post-' + Date.now(),
      excerpt: 'This is a test excerpt',
      content: 'This is test content',
      description: 'Test description',
      category: 'diet',
      status: 'published',
      author: 'Test Author'
    });
    
    const savedBlog = await testBlog.save();
    console.log('Test blog created:', savedBlog._id);
    
    // Count again
    const newCount = await BlogPost.countDocuments();
    console.log('New blog posts count:', newCount);
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDatabase();
