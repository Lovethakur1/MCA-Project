const Content = require('../models/Content');
const BlogPost = require('../models/BlogPost');
const FAQ = require('../models/FAQ');
const Contact = require('../models/Contact');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create media directory if it doesn't exist
const mediaDir = path.join(__dirname, '../public/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const uniqueName = `${timestamp}-${randomNum}${extension}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

exports.uploadMiddleware = upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'healthy_salts_image', maxCount: 1 },
  { name: 'golden_rules_image', maxCount: 1 }
]);

// Get blog page admin interface
exports.getBlogPageAdmin = async (req, res) => {
  try {
    // Get blog page content
    const blogContent = await Content.find({ page: 'blog' }).lean();
    const contentData = {};
    blogContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get all blog posts
    const blogPosts = await BlogPost.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean();

    // Get blog FAQs
    const faqs = await FAQ.find({ page: 'blog', status: 'published' })
      .sort({ order: 1 })
      .lean();

    res.render('admin/blog-page', {
      title: 'Blog Page Management',
      content: contentData,
      blogPosts: blogPosts,
      faqs: faqs,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading blog page admin:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog page admin' 
    });
  }
};

// Update blog page content
exports.updateBlogPageContent = async (req, res) => {
  try {
    console.log('Updating blog page content...');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      hero_title,
      hero_subtitle,
      healthy_salts_title,
      healthy_salts_subtitle,
      golden_rules_title,
      golden_rules_subtitle
    } = req.body;

    // Update hero section
    if (hero_title) {
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'hero', key: 'title' },
        { page: 'blog', section: 'hero', key: 'title', value: hero_title },
        { upsert: true }
      );
    }

    if (hero_subtitle) {
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'hero', key: 'subtitle' },
        { page: 'blog', section: 'hero', key: 'subtitle', value: hero_subtitle },
        { upsert: true }
      );
    }

    // Handle hero image upload
    if (req.files && req.files.hero_image && req.files.hero_image[0]) {
      const heroImagePath = `/media/${req.files.hero_image[0].filename}`;
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'hero', key: 'image' },
        { page: 'blog', section: 'hero', key: 'image', value: heroImagePath },
        { upsert: true }
      );
    }

    // Update healthy salts section
    if (healthy_salts_title) {
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'healthy_salts', key: 'title' },
        { page: 'blog', section: 'healthy_salts', key: 'title', value: healthy_salts_title },
        { upsert: true }
      );
    }

    if (healthy_salts_subtitle) {
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'healthy_salts', key: 'subtitle' },
        { page: 'blog', section: 'healthy_salts', key: 'subtitle', value: healthy_salts_subtitle },
        { upsert: true }
      );
    }

    // Handle healthy salts image upload
    if (req.files && req.files.healthy_salts_image && req.files.healthy_salts_image[0]) {
      const healthySaltsImagePath = `/media/${req.files.healthy_salts_image[0].filename}`;
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'healthy_salts', key: 'image' },
        { page: 'blog', section: 'healthy_salts', key: 'image', value: healthySaltsImagePath },
        { upsert: true }
      );
    }

    // Update golden rules section
    if (golden_rules_title) {
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'golden_rules', key: 'title' },
        { page: 'blog', section: 'golden_rules', key: 'title', value: golden_rules_title },
        { upsert: true }
      );
    }

    if (golden_rules_subtitle) {
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'golden_rules', key: 'subtitle' },
        { page: 'blog', section: 'golden_rules', key: 'subtitle', value: golden_rules_subtitle },
        { upsert: true }
      );
    }

    // Handle golden rules image upload
    if (req.files && req.files.golden_rules_image && req.files.golden_rules_image[0]) {
      const goldenRulesImagePath = `/media/${req.files.golden_rules_image[0].filename}`;
      await Content.findOneAndUpdate(
        { page: 'blog', section: 'golden_rules', key: 'image' },
        { page: 'blog', section: 'golden_rules', key: 'image', value: goldenRulesImagePath },
        { upsert: true }
      );
    }

    console.log('Blog page content updated successfully');
    res.redirect('/admin/blog-page?success=Blog page content updated successfully');
  } catch (error) {
    console.error('Error updating blog page content:', error);
    res.redirect('/admin/blog-page?error=Failed to update blog page content');
  }
};

// Blog FAQ Management
exports.getBlogFAQAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.find({ page: 'blog' }).sort({ order: 1 });
    
    res.render('admin/blog-faq-manager', {
      title: 'Blog FAQ Manager',
      faqs: faqs,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading blog FAQ admin:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog FAQ admin page' 
    });
  }
};

// Create blog FAQ
exports.createBlogFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    
    const newFAQ = new FAQ({
      question,
      answer,
      category: category || 'general',
      page: 'blog',
      order: parseInt(order) || 0,
      status: 'published'
    });
    
    await newFAQ.save();
    res.redirect('/admin/blog-faq-manager?success=Blog FAQ created successfully');
  } catch (error) {
    console.error('Error creating blog FAQ:', error);
    res.redirect('/admin/blog-faq-manager?error=Failed to create blog FAQ');
  }
};

// Update blog FAQ
exports.updateBlogFAQ = async (req, res) => {
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
    
    res.redirect('/admin/blog-faq-manager?success=Blog FAQ updated successfully');
  } catch (error) {
    console.error('Error updating blog FAQ:', error);
    res.redirect('/admin/blog-faq-manager?error=Failed to update blog FAQ');
  }
};

// Delete blog FAQ
exports.deleteBlogFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    
    res.redirect('/admin/blog-faq-manager?success=Blog FAQ deleted successfully');
  } catch (error) {
    console.error('Error deleting blog FAQ:', error);
    res.redirect('/admin/blog-faq-manager?error=Failed to delete blog FAQ');
  }
};
