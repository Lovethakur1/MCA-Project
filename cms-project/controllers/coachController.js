const Content = require('../models/Content');
const BlogPost = require('../models/BlogPost');
const FAQ = require('../models/FAQ');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create media directory if it doesn't exist
const mediaDir = path.join(__dirname, '../public/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Configure multer storage for file uploads (images and videos)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const uniqueName = `${timestamp}-${randomNum}${extension}`;
    cb(null, uniqueName);
  }
});

// File filter - allow images and videos
const fileFilter = (req, file, cb) => {
  console.log('Processing file:', file.originalname, 'Type:', file.mimetype);
  
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 10 // Max 10 files at once
  }
});

// Export upload middleware function for use in routes
exports.uploadMiddleware = (req, res, next) => {
  upload.any()(req, res, next);
};

// Get coach admin page
exports.getCoachAdmin = async (req, res) => {
  try {
    // Get all coach content organized by sections
    const coachContent = await Content.find({ page: 'coach' }).lean();
    
    const contentData = {
      hero: {},
      intro: {},
      wave: {},
      faq: {}
    };
    
    coachContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    res.render('admin/coach', {
      title: 'Coach Mary Carmen Admin',
      content: contentData,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading coach admin:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load coach admin page' 
    });
  }
};

// Update coach content with file upload handling
exports.updateCoachContent = async (req, res) => {
  try {
    console.log('=== COACH UPDATE START ===');
    console.log('Form data received:', req.body);
    console.log('Files received:', req.files);
    
    const updatePromises = [];
    
    // Process regular form fields first
    for (const [key, value] of Object.entries(req.body)) {
      if (!key.includes('_upload') && value && value.trim() !== '') {
        const [section, field] = key.split('_');
        
        updatePromises.push(
          Content.findOneAndUpdate(
            { page: 'coach', section: section, key: field },
            { value: value.trim(), type: 'text' },
            { upsert: true, new: true }
          )
        );
        
        console.log(`Updating ${section}.${field}:`, value.trim());
      }
    }
    
    // Process file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const [section, field] = file.fieldname.split('_');
        console.log(`Processing file upload for ${section}.${field}:`, file.filename);
        
        // Determine file type
        const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        
        updatePromises.push(
          Content.findOneAndUpdate(
            { page: 'coach', section: section, key: field },
            { value: file.filename, type: fileType },
            { upsert: true, new: true }
          )
        );
      }
    }
    
    // Execute all updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Successfully updated ${updatePromises.length} content items`);
    }
    
    console.log('=== COACH UPDATE COMPLETE ===');
    res.redirect('/admin/coach?success=Coach content updated successfully');
    
  } catch (error) {
    console.error('Error updating coach content:', error);
    res.redirect('/admin/coach?error=Failed to update coach content');
  }
};

// Get coach page with dynamic content
exports.getCoachPage = async (req, res) => {
  try {
    // Get coach content
    const coachContent = await Content.find({ page: 'coach' }).lean();
    
    const contentData = {
      hero: {},
      intro: {},
      wave: {},
      faq: {}
    };
    console.log('Coach content fetched:', contentData );
    
    coachContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get blog posts for coach page (filter by category if needed)
    const blogPosts = await BlogPost.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.render('coachmarycarmen', {
      title: 'Coach Mary Carmen',
      content: contentData,
      blogPosts: blogPosts
    });
  } catch (error) {
    console.error('Error loading coach page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load coach page' 
    });
  }
};

// Get blog admin page
exports.getBlogAdmin = async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    
    res.render('admin/blog-manager', {
      title: 'Blog Manager',
      blogs: blogs,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading blog admin:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog admin page' 
    });
  }
};

// Create new blog post
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, status } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    let featuredImage = '';
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find(file => file.fieldname === 'featured_image');
      if (imageFile) {
        featuredImage = imageFile.filename;
      }
    }
    
    const newBlog = new BlogPost({
      title,
      slug,
      excerpt,
      description: excerpt || content.substring(0, 200), // Use excerpt or first 200 chars of content
      content,
      category: category || 'general',
      status: status || 'published',
      featuredImage,
      author: 'Admin' // You can get this from session
    });
    
    await newBlog.save();
    
    res.redirect('/admin/blog-manager?success=Blog post created successfully');
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.redirect('/admin/blog-manager?error=Failed to create blog post');
  }
};

// Update blog post
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, status } = req.body;
    
    // Generate slug from title if title is being updated
    const slug = title.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    const updateData = {
      title,
      slug,
      excerpt,
      description: excerpt || content.substring(0, 200), // Use excerpt or first 200 chars of content
      content,
      category: category || 'general',
      status: status || 'published'
    };
    
    // Handle featured image upload
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find(file => file.fieldname === 'featured_image');
      if (imageFile) {
        updateData.featuredImage = imageFile.filename;
      }
    }
    
    await BlogPost.findByIdAndUpdate(id, updateData);
    
    res.redirect('/admin/blog-manager?success=Blog post updated successfully');
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.redirect('/admin/blog-manager?error=Failed to update blog post');
  }
};

// Delete blog post
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await BlogPost.findByIdAndDelete(id);
    
    res.redirect('/admin/blog-manager?success=Blog post deleted successfully');
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.redirect('/admin/blog-manager?error=Failed to delete blog post');
  }
};

// FAQ Management
exports.getFAQAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.find({ page: 'coach' }).sort({ order: 1 });

      console.log('FAQs fetched for Coach page:', faqs);

    res.render('admin/faq-manager', {
      title: 'FAQ Manager - Coach Mary Carmen',
      faqs: faqs,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading FAQ admin:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load FAQ admin page' 
    });
  }
};

// Create FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    
    const newFAQ = new FAQ({
      question,
      answer,
      category: category || 'general',
      page: 'coach',
      order: parseInt(order) || 0,
      status: 'published'
    });
    
    await newFAQ.save();
    res.redirect('/admin/faq-manager?success=FAQ created successfully');
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.redirect('/admin/faq-manager?error=Failed to create FAQ');
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, status } = req.body;
    
    await FAQ.findByIdAndUpdate(id, {
      question,
      answer,
      category: category || 'general',
      order: parseInt(order) || 0,
      status: status || 'published',
      updatedAt: Date.now()
    });
    
    res.redirect('/admin/faq-manager?success=FAQ updated successfully');
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.redirect('/admin/faq-manager?error=Failed to update FAQ');
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    
    res.redirect('/admin/faq-manager?success=FAQ deleted successfully');
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.redirect('/admin/faq-manager?error=Failed to delete FAQ');
  }
};
