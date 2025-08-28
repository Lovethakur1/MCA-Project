const User = require('../models/User');
const Content = require('../models/Content');
const BlogPost = require('../models/BlogPost');
const Testimonial = require('../models/Testimonial');
const Contact = require('../models/Contact');
const Page = require('../models/Page');
const { PricingPlan, PricingTab } = require('../models/Pricing');
const bcrypt = require('bcryptjs');
const qs = require('qs');

exports.getLoginPage = (req, res) => {
  res.render('admin/login', { 
    title: 'Admin Login',
    error: req.query.error 
  });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.redirect('/admin/login?error=Invalid credentials');
    }

    req.session.userId = user._id;
    req.session.userRole = user.role;
    
    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=Login failed');
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
};

exports.getDashboard = async (req, res) => {
  try {
    // Get counts for dashboard
    const blogCount = await BlogPost.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    const contentCount = await Content.countDocuments();
    const contactCount = await Contact.countDocuments();
    const newContactCount = await Contact.countDocuments({ status: 'new' });
    
    // Get recent blog posts
    const recentPosts = await BlogPost.find().sort({ createdAt: -1 }).limit(5);
    
    // Get recent contact submissions
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);
    
    // Get content data for admin sections
    const contentData = await Content.find({ page: 'home' });
    
    // Organize content data by section
    const content = {};
    contentData.forEach(item => {
      if (!content[item.section]) {
        content[item.section] = {};
      }
      content[item.section][item.key] = item.value;
    });
    
    // Ensure all sections exist with empty objects to prevent undefined errors
    const defaultContent = {
      hero: {},
      services: {},
      about: {},
      contact: {},
      benefits: {},
      newsletter: {},
      faq: {},
      testimonials: {},
      concept: {}
    };
    
    // Merge with actual content data
    const finalContent = { ...defaultContent, ...content };
    
    // console.log('Admin dashboard - Services content:', finalContent.services);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        blogPosts: blogCount,
        testimonials: testimonialCount,
        contentItems: contentCount,
        contacts: contactCount,
        newContacts: newContactCount
      },
      recentPosts: recentPosts,
      recentContacts: recentContacts,
      content: finalContent
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      error: 'Failed to load dashboard data',
      stats: {
        blogPosts: 0,
        testimonials: 0,
        contentItems: 0,
        contacts: 0,
        newContacts: 0
      },
      recentPosts: [],
      recentContacts: [],
      content: {
        hero: {},
        services: {},
        about: {},
        contact: {},
        benefits: {},
        newsletter: {},
        faq: {},
        testimonials: {},
        concept: {}
      }
    });
  }
};

// API endpoint for live stats updates
exports.getStatsAPI = async (req, res) => {
  try {
    const blogCount = await BlogPost.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    const contentCount = await Content.countDocuments();
    const contactCount = await Contact.countDocuments();
    const newContactCount = await Contact.countDocuments({ status: 'new' });
    
    res.json({
      blogPosts: blogCount,
      testimonials: testimonialCount,
      contentItems: contentCount,
      contacts: contactCount,
      newContacts: newContactCount,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// API endpoint for recent data
exports.getRecentDataAPI = async (req, res) => {
  try {
    const recentPosts = await BlogPost.find().sort({ createdAt: -1 }).limit(5);
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      recentPosts: recentPosts,
      recentContacts: recentContacts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recent data API error:', error);
    res.status(500).json({ error: 'Failed to fetch recent data' });
  }
};

exports.getContentManager = async (req, res) => {
  try {
    const contents = await Content.find().sort({ page: 1, section: 1, key: 1 });
    
    res.render('admin/content', {
      layout: 'admin/layout',
      title: 'Content Manager',
      contents,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Content manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load content manager' 
    });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { page, section, key, value, type } = req.body;
    
    await Content.findOneAndUpdate(
      { page, section, key },
      { value, type },
      { upsert: true, new: true }
    );
    
    res.redirect('/admin/content?success=Content updated');
  } catch (error) {
    console.error('Content update error:', error);
    res.redirect('/admin/content?error=Failed to update content');
  }
};

exports.getBlogManager = async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    
    res.render('admin/blog-manager', {
      title: 'Blog Manager',
      blogs: posts,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Blog manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog manager' 
    });
  }
};

exports.getNewBlogPost = (req, res) => {
  res.render('admin/blog-form', {
    layout: 'admin/layout',
    title: 'New Blog Post',
    post: null,
    action: '/admin/blog'
  });
};

exports.createBlogPost = async (req, res) => {
  try {
    const { title, description, content, featuredImage, published } = req.body;
    
    const post = new BlogPost({
      title,
      description,
      content,
      featuredImage,
      published: published === 'on',
      publishedAt: published === 'on' ? new Date() : null
    });
    
    await post.save();
    
    res.redirect('/admin/blog?success=Blog post created');
  } catch (error) {
    console.error('Blog creation error:', error);
    res.redirect('/admin/blog?error=Failed to create blog post');
  }
};

exports.getEditBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).render('404', { title: 'Post Not Found' });
    }
    
    res.render('admin/blog-form', {
      layout: 'admin/layout',
      title: 'Edit Blog Post',
      post,
      action: `/admin/blog/${post._id}`
    });
  } catch (error) {
    console.error('Blog edit error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog post' 
    });
  }
};

exports.updateBlogPost = async (req, res) => {
  try {
    const { title, description, content, featuredImage, published } = req.body;
    
    const updateData = {
      title,
      description,
      content,
      featuredImage,
      published: published === 'on'
    };
    
    if (published === 'on' && !await BlogPost.findById(req.params.id).published) {
      updateData.publishedAt = new Date();
    }
    
    await BlogPost.findByIdAndUpdate(req.params.id, updateData);
    
    res.redirect('/admin/blog?success=Blog post updated');
  } catch (error) {
    console.error('Blog update error:', error);
    res.redirect('/admin/blog?error=Failed to update blog post');
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Blog delete error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

exports.getTestimonialManager = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    
    res.render('admin/testimonials', {
      title: 'Testimonial Manager',
      testimonials,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Testimonial manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load testimonial manager' 
    });
  }
};

exports.getNewTestimonial = (req, res) => {
  res.render('admin/testimonial-form', {
    title: 'New Testimonial',
    testimonial: null,
    action: '/admin/testimonials'
  });
};

exports.createTestimonial = async (req, res) => {
  try {
    const { name, title, content, image, video, videoThumbnail, rating, featured, published } = req.body;
    
    const testimonial = new Testimonial({
      name,
      title,
      content,
      image,
      video,
      videoThumbnail,
      rating: parseInt(rating),
      featured: featured === 'on',
      published: published === 'on'
    });
    
    await testimonial.save();
    
    res.redirect('/admin/testimonials?success=Testimonial created');
  } catch (error) {
    console.error('Testimonial creation error:', error);
    res.redirect('/admin/testimonials?error=Failed to create testimonial');
  }
};

exports.getEditTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).render('404', { title: 'Testimonial Not Found' });
    }
    
    res.render('admin/testimonial-form', {
      title: 'Edit Testimonial',
      testimonial,
      action: `/admin/testimonials/${testimonial._id}`
    });
  } catch (error) {
    console.error('Testimonial edit error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load testimonial' 
    });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { name, title, content, image, video, videoThumbnail, rating, featured, published } = req.body;
    
    await Testimonial.findByIdAndUpdate(req.params.id, {
      name,
      title,
      content,
      image,
      video,
      videoThumbnail,
      rating: parseInt(rating),
      featured: featured === 'on',
      published: published === 'on'
    });
    
    res.redirect('/admin/testimonials?success=Testimonial updated');
  } catch (error) {
    console.error('Testimonial update error:', error);
    res.redirect('/admin/testimonials?error=Failed to update testimonial');
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
};

exports.getTestimonialPageContent = async (req, res) => {
  try {
    // Get content data for testimonial page
    const contentData = await Content.find({ page: 'testimonial' });
    
    // Organize content data by section
    const content = {};
    contentData.forEach(item => {
      if (!content[item.section]) {
        content[item.section] = {};
      }
      content[item.section][item.key] = item.value;
    });

    res.render('admin/testimonial-page-content', {
      title: 'Testimonial Page Content',
      content,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Testimonial page content error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load testimonial page content' 
    });
  }
};

exports.updateTestimonialPageContent = async (req, res) => {
  try {
    const { hero, section } = req.body;
    
    // Update hero section content
    if (hero) {
      for (const [key, value] of Object.entries(hero)) {
        await Content.findOneAndUpdate(
          { page: 'testimonial', section: 'hero', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update main section content
    if (section) {
      for (const [key, value] of Object.entries(section)) {
        await Content.findOneAndUpdate(
          { page: 'testimonial', section: 'section', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/testimonials/page-content?success=Testimonial page content updated');
  } catch (error) {
    console.error('Testimonial page content update error:', error);
    res.redirect('/admin/testimonials/page-content?error=Failed to update testimonial page content');
  }
};

// Pricing Management
exports.getPricingManager = async (req, res) => {
  try {
    const pricingPlans = await PricingPlan.find().sort({ category: 1, sortOrder: 1 });
    const pricingTabs = await PricingTab.find().sort({ sortOrder: 1 });
    
    res.render('admin/pricing-manager', {
      title: 'Pricing Manager',
      pricingPlans,
      pricingTabs,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Pricing manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load pricing manager' 
    });
  }
};

exports.getPricingPageContent = async (req, res) => {
  try {
    // Get content data for pricing page
    const contentData = await Content.find({ page: 'price' });
    
    // Organize content data by section
    const content = {};
    contentData.forEach(item => {
      if (!content[item.section]) {
        content[item.section] = {};
      }
      content[item.section][item.key] = item.value;
    });

    res.render('admin/pricing-page-content', {
      title: 'Pricing Page Content',
      content,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Pricing page content error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load pricing page content' 
    });
  }
};

exports.updatePricingPageContent = async (req, res) => {
  try {
    const { hero, pricing } = req.body;
    
    // Update hero section content
    if (hero) {
      for (const [key, value] of Object.entries(hero)) {
        await Content.findOneAndUpdate(
          { page: 'price', section: 'hero', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update pricing section content
    if (pricing) {
      for (const [key, value] of Object.entries(pricing)) {
        await Content.findOneAndUpdate(
          { page: 'price', section: 'pricing', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/pricing/page-content?success=Pricing page content updated');
  } catch (error) {
    console.error('Pricing page content update error:', error);
    res.redirect('/admin/pricing/page-content?error=Failed to update pricing page content');
  }
};

exports.getNewPricingPlan = (req, res) => {
  res.render('admin/pricing-plan-form', {
    title: 'New Pricing Plan',
    plan: null,
    action: '/admin/pricing/plans'
  });
};

exports.createPricingPlan = async (req, res) => {
  try {
    const { 
      category, title, description, duration, price, location, 
      icon, buttonText, buttonLink, features, popular, sortOrder, published 
    } = req.body;
    
    const plan = new PricingPlan({
      category,
      title,
      description,
      duration,
      price,
      location,
      icon: icon || 'fas fa-clock',
      buttonText: buttonText || 'Book Now',
      buttonLink: buttonLink || '#',
      features: features ? features.split('\n').filter(f => f.trim()) : [],
      popular: popular === 'on',
      sortOrder: parseInt(sortOrder) || 0,
      published: published === 'on'
    });
    
    await plan.save();
    
    res.redirect('/admin/pricing?success=Pricing plan created');
  } catch (error) {
    console.error('Pricing plan creation error:', error);
    res.redirect('/admin/pricing?error=Failed to create pricing plan');
  }
};

exports.getEditPricingPlan = async (req, res) => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).render('404', { title: 'Pricing Plan Not Found' });
    }
    
    res.render('admin/pricing-plan-form', {
      title: 'Edit Pricing Plan',
      plan,
      action: `/admin/pricing/plans/${plan._id}`
    });
  } catch (error) {
    console.error('Pricing plan edit error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load pricing plan' 
    });
  }
};

exports.updatePricingPlan = async (req, res) => {
  try {
    const { 
      category, title, description, duration, price, location, 
      icon, buttonText, buttonLink, features, popular, sortOrder, published 
    } = req.body;
    
    await PricingPlan.findByIdAndUpdate(req.params.id, {
      category,
      title,
      description,
      duration,
      price,
      location,
      icon: icon || 'fas fa-clock',
      buttonText: buttonText || 'Book Now',
      buttonLink: buttonLink || '#',
      features: features ? features.split('\n').filter(f => f.trim()) : [],
      popular: popular === 'on',
      sortOrder: parseInt(sortOrder) || 0,
      published: published === 'on'
    });
    
    res.redirect('/admin/pricing?success=Pricing plan updated');
  } catch (error) {
    console.error('Pricing plan update error:', error);
    res.redirect('/admin/pricing?error=Failed to update pricing plan');
  }
};

exports.deletePricingPlan = async (req, res) => {
  try {
    await PricingPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Pricing plan delete error:', error);
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
};

exports.getMediaManager = (req, res) => {
  res.render('admin/media', {
    title: 'Media Manager'
  });
};

exports.uploadMedia = (req, res) => {
  // This would handle file uploads using multer
  res.json({ success: true, url: '/media/uploaded-file.jpg' });
};

// Home page management
exports.getHomeManager = async (req, res) => {
  try {
    // Get content data for home page
    const contentData = await Content.find({ page: 'home' });
    
    // Organize content data by section
    const content = {};
    contentData.forEach(item => {
      if (!content[item.section]) {
        content[item.section] = {};
      }
      content[item.section][item.key] = item.value;
    });
    
    // Ensure all sections exist with empty objects to prevent undefined errors
    const defaultContent = {
      hero: {},
      services: {},
      about: {},
      contact: {},
      benefits: {},
      newsletter: {},
      faq: {},
      testimonials: {},
      concept: {}
    };
    
    // Merge with actual content data
    const finalContent = { ...defaultContent, ...content };
    
    res.render('admin/index', {
      title: 'Home Page Manager',
      content: finalContent,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Home manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load home manager' 
    });
  }
};

exports.updateHomeContent = async (req, res) => {
  try {
    const { hero, services, about, contact, benefits, newsletter, faq } = req.body;
    
    // Update hero section
    if (hero) {
      for (const [key, value] of Object.entries(hero)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'hero', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update services section
    if (services) {
      for (const [key, value] of Object.entries(services)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'services', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update about section
    if (about) {
      for (const [key, value] of Object.entries(about)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'about', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update contact section
    if (contact) {
      for (const [key, value] of Object.entries(contact)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'contact', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update benefits section
    if (benefits) {
      for (const [key, value] of Object.entries(benefits)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'benefits', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update newsletter section
    if (newsletter) {
      for (const [key, value] of Object.entries(newsletter)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'newsletter', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Update FAQ section
    if (faq) {
      for (const [key, value] of Object.entries(faq)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'faq', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/home?success=Content updated successfully');
  } catch (error) {
    console.error('Home content update error:', error);
    res.redirect('/admin/home?error=Failed to update content');
  }
};

// Individual section update methods
exports.updateVideoSection = async (req, res) => {
  try {
    const { hero } = req.body;
    
    // Handle file upload for video if present
    if (req.files && req.files.length > 0) {
      const videoFile = req.files.find(file => file.fieldname === 'video');
      if (videoFile) {
        // Update hero backgroundVideo in database with new filename
        await Content.findOneAndUpdate(
          { page: 'home', section: 'hero', key: 'backgroundVideo' },
          { value: videoFile.filename, type: 'text' },
          { upsert: true, new: true }
        );
        // console.log('Video uploaded:', videoFile.filename);
      }
    }
    
    // Update other hero fields if provided
    if (hero) {
      for (const [key, value] of Object.entries(hero)) {
        if (value && value.trim() !== '') {  // Only update non-empty values
          await Content.findOneAndUpdate(
            { page: 'home', section: 'hero', key },
            { value, type: 'text' },
            { upsert: true, new: true }
          );
        }
      }
    }
    
    // console.log('Video section updated successfully');
    res.redirect('/admin/dashboard?success=Video section updated successfully');
  } catch (error) {
    console.error('Video section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update video section');
  }
};

exports.updateServicesSection = async (req, res) => {
  try {
    // console.log('=== Services Update Request ===');
    // console.log('Request body:', req.body);
    // console.log('Request files:', req.files);
    // console.log('Files count:', req.files ? req.files.length : 0);
    
    const { services } = req.body;
    
    // Handle icon file uploads first
    if (req.files && req.files.length > 0) {
      // console.log('Processing file uploads...');
      for (const file of req.files) {
        // console.log('File details:'
        //   ,
        //    {
        //   fieldname: file.fieldname,
        //   filename: file.filename,
        //   originalname: file.originalname,
        //   size: file.size,
        //   mimetype: file.mimetype
        // });
        
        if (file.fieldname.includes('_icon')) {
          // Extract the exact key (e.g., "service1_icon")
          const iconKey = file.fieldname;
          
          // console.log(`Processing icon upload for ${iconKey}:`, file.filename);
          
          // Save to database
          const result = await Content.findOneAndUpdate(
            { page: 'home', section: 'services', key: iconKey },
            { value: file.filename, type: 'text' },
            { upsert: true, new: true }
          );
          
          // console.log(`Icon saved to database for ${iconKey}:`, result);
        }
      }
    } else {
      // console.log('No files received in request');
    }
    
    // Handle other services data
    if (services) {
      console.log('Processing services data...');
      for (const [key, value] of Object.entries(services)) {
        if (value && value.trim() !== '' && !key.includes('_icon')) { // Skip icon fields as they're handled above
          const result = await Content.findOneAndUpdate(
            { page: 'home', section: 'services', key },
            { value, type: 'text' },
            { upsert: true, new: true }
          );
          console.log(`Updated ${key}:`, value, 'Result:', result);
        }
      }
    }
    
    console.log('Services section updated successfully');
    res.redirect('/admin/dashboard?success=Services section updated successfully');
  } catch (error) {
    console.error('Services section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update services section');
  }
};



exports.updateSingleService = async (req, res) => {
  try {
    console.log('=== Single Service Update Request ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Service index:', req.body.serviceIndex);
    
    const { services, serviceIndex } = req.body;
    
    // Handle icon file upload for this specific service
    if (req.files && req.files.length > 0) {
      console.log('Processing icon upload for service', serviceIndex);
      const iconFile = req.files.find(file => file.fieldname === `service${serviceIndex}_icon`);
      
      if (iconFile) {
        console.log('Icon file found:', {
          fieldname: iconFile.fieldname,
          filename: iconFile.filename,
          originalname: iconFile.originalname,
          size: iconFile.size
        });
        
        // Save icon filename to database
        const iconKey = `service${serviceIndex}_icon`;
        const result = await Content.findOneAndUpdate(
          { page: 'home', section: 'services', key: iconKey },
          { value: iconFile.filename, type: 'text' },
          { upsert: true, new: true }
        );
        console.log(`Updated ${iconKey}:`, iconFile.filename, 'Database result:', result);
      } else {
        console.log('No icon file found for service', serviceIndex);
      }
    }
    
    // Update other service fields
    if (services) {
      console.log('Processing text fields for service', serviceIndex);
      for (const [key, value] of Object.entries(services)) {
        if (value && value.trim() !== '' && key.includes(`service${serviceIndex}_`)) {
          console.log(`Updating field: ${key} = ${value}`);
          const result = await Content.findOneAndUpdate(
            { page: 'home', section: 'services', key },
            { value, type: 'text' },
            { upsert: true, new: true }
          );
          console.log(`Database update result for ${key}:`, result);
        }
      }
    }
    
    console.log(`Service ${serviceIndex} updated successfully`);
    res.redirect('/admin/dashboard?success=Service updated successfully');
  } catch (error) {
    console.error('Single service update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update service');
  }
};




exports.updateTeamSection = async (req, res) => {
  try {
    const { about, team } = req.body;
    
    if (about) {
      for (const [key, value] of Object.entries(about)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'about', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    if (team) {
      for (const [key, value] of Object.entries(team)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'team', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=Team section updated');
  } catch (error) {
    console.error('Team section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update team section');
  }
};














exports.updateSingleTeamMember = async (req, res) => {
  try {
    // Parse nested form data properly
    const parsedBody = qs.parse(req.body);
    console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));
    
    const memberIndex = parsedBody.memberIndex || req.body.memberIndex;
    console.log('Updating member:', memberIndex);
    
    if (!memberIndex) {
      return res.status(400).json({ success: false, message: 'Member index is required' });
    }
    
    // Handle req.files (could be array or object depending on multer middleware)
    let filesArray = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        filesArray = req.files;
      } else if (typeof req.files === 'object') {
        // Convert object to array
        filesArray = Object.values(req.files).flat();
      }
    }
    console.log('Files found:', filesArray.length);
    
    // Step 1: Handle photo upload
    let photoUploaded = false;
    let uploadedFileName = null;
    
    if (filesArray.length > 0) {
      const photoFile = filesArray.find(f => 
        f.fieldname && f.fieldname.includes(`member${memberIndex}_photo`)
      );
      
      if (photoFile) {
        // Delete old photo if it exists and is not a placeholder
        const existingPhoto = await Content.findOne({ 
          page: 'home', section: 'team', key: `member${memberIndex}_photo` 
        });
        
        if (existingPhoto && existingPhoto.value && 
            existingPhoto.value !== 'Placeholder Image.png' &&
            existingPhoto.value !== 'img_pic.png') {
          try {
            const fs = require('fs');
            const path = require('path');
            const oldPhotoPath = path.join(__dirname, '../public/media', existingPhoto.value);
            if (fs.existsSync(oldPhotoPath)) {
              fs.unlinkSync(oldPhotoPath);
              console.log('Deleted old photo:', existingPhoto.value);
            }
          } catch (deleteError) {
            console.log('Could not delete old photo:', deleteError.message);
          }
        }
        
        // Save new photo
        await Content.findOneAndUpdate(
          { page: 'home', section: 'team', key: `member${memberIndex}_photo` },
          { value: photoFile.filename, type: 'text' },
          { upsert: true, new: true }
        );
        photoUploaded = true;
        uploadedFileName = photoFile.filename;
        console.log('Photo saved:', photoFile.filename);
      }
    }
    
    // Step 2: Save text fields from parsed nested data
    const teamData = parsedBody.team || {};
    const fieldUpdates = [];
    
    for (const [key, value] of Object.entries(teamData)) {
      if (!key.includes('_photo') && 
          key.includes(`member${memberIndex}_`) && 
          value && 
          value.toString().trim()) {
        
        fieldUpdates.push(
          Content.findOneAndUpdate(
            { page: 'home', section: 'team', key },
            { value: value.toString().trim(), type: 'text' },
            { upsert: true, new: true }
          )
        );
      }
    }
    
    // Execute all field updates in parallel
    if (fieldUpdates.length > 0) {
      await Promise.all(fieldUpdates);
      console.log(`Updated ${fieldUpdates.length} text fields`);
    }
    
    // Step 3: Assign placeholder if new member has no photo
    if (!photoUploaded) {
      const existingPhoto = await Content.findOne({ 
        page: 'home', section: 'team', key: `member${memberIndex}_photo` 
      });
      
      if (!existingPhoto || !existingPhoto.value) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'team', key: `member${memberIndex}_photo` },
          { value: 'img_pic.png', type: 'text' },
          { upsert: true, new: true }
        );
        console.log('Assigned default placeholder image');
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Team member saved successfully',
      photoUploaded,
      uploadedFileName,
      fieldsUpdated: fieldUpdates.length
    });
    
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Save failed: ' + error.message 
    });
  }
};











exports.deleteTeamMember = async (req, res) => {
  try {
    const { memberIndex } = req.params;
    console.log(`=== Delete Team Member Request ===`);
    console.log('Member index to delete:', memberIndex);
    
    // Define all the keys for this team member
    const memberKeys = [
      `member${memberIndex}_name`,
      `member${memberIndex}_position`,
      `member${memberIndex}_email`,
      `member${memberIndex}_phone`,
      `member${memberIndex}_bio`,
      `member${memberIndex}_photo`,
      `member${memberIndex}_social_linkedin`,
      `member${memberIndex}_social_instagram`
    ];
    
    // Delete all records for this team member
    for (const key of memberKeys) {
      const result = await Content.findOneAndDelete({
        page: 'home',
        section: 'team',
        key: key
      });
      if (result) {
        console.log(`Deleted: ${key} = ${result.value}`);
      }
    }
    
    console.log(`Team member ${memberIndex} deleted successfully`);
    
    // Return JSON response for AJAX
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json({ success: true, message: 'Team member deleted successfully' });
    } else {
      res.redirect('/admin/dashboard?success=Team member deleted successfully');
    }
  } catch (error) {
    console.error('Delete team member error:', error);
    
    // Return JSON error response for AJAX
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.redirect('/admin/dashboard?error=Failed to delete team member');
    }
  }
};







exports.updateConceptSection = async (req, res) => {
  try {
    const { concept } = req.body;
    
    // Handle uploaded files
    const uploadedFiles = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fieldName = file.fieldname;
        uploadedFiles[fieldName] = file.filename;
      });
    }
    
    if (concept) {
      for (const [key, value] of Object.entries(concept)) {
        // Check if there's an uploaded file for this field
        let finalValue = value;
        if (uploadedFiles[key]) {
          finalValue = uploadedFiles[key];
        }
        
        await Content.findOneAndUpdate(
          { page: 'home', section: 'concept', key },
          { value: finalValue, type: key.includes('icon') ? 'image' : 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    // Handle uploaded icons separately if they don't have corresponding concept fields
    for (const [fieldName, filename] of Object.entries(uploadedFiles)) {
      if (fieldName.includes('icon')) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'concept', key: fieldName },
          { value: filename, type: 'image' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=Concept section updated');
  } catch (error) {
    console.error('Concept section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update concept section');
  }
};

exports.updateTestimonialsSection = async (req, res) => {
  try {
    const { testimonials } = req.body;
    
    if (testimonials) {
      for (const [key, value] of Object.entries(testimonials)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'testimonials', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=Testimonials section updated');
  } catch (error) {
    console.error('Testimonials section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update testimonials section');
  }
};

exports.updateContactSection = async (req, res) => {
  try {
    const { contact } = req.body;
    
    if (contact) {
      for (const [key, value] of Object.entries(contact)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'contact', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=Contact section updated');
  } catch (error) {
    console.error('Contact section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update contact section');
  }
};

exports.updateBenefitsSection = async (req, res) => {
  try {
    const { benefits } = req.body;
    
    if (benefits) {
      for (const [key, value] of Object.entries(benefits)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'benefits', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=Benefits section updated');
  } catch (error) {
    console.error('Benefits section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update benefits section');
  }
};

exports.updateFAQSection = async (req, res) => {
  try {
    const { faq } = req.body;
    
    if (faq) {
      for (const [key, value] of Object.entries(faq)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'faq', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=FAQ section updated');
  } catch (error) {
    console.error('FAQ section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update FAQ section');
  }
};

exports.updateNewsletterSection = async (req, res) => {
  try {
    const { newsletter } = req.body;
    
    if (newsletter) {
      for (const [key, value] of Object.entries(newsletter)) {
        await Content.findOneAndUpdate(
          { page: 'home', section: 'newsletter', key },
          { value, type: 'text' },
          { upsert: true, new: true }
        );
      }
    }
    
    res.redirect('/admin/dashboard?success=Newsletter section updated');
  } catch (error) {
    console.error('Newsletter section update error:', error);
    res.redirect('/admin/dashboard?error=Failed to update newsletter section');
  }
};

// Contact Submissions Management
exports.getContactSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    // Build query
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Get contacts with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Contact.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get stats
    const stats = {
      total: await Contact.countDocuments(),
      new: await Contact.countDocuments({ status: 'new' }),
      read: await Contact.countDocuments({ status: 'read' }),
      replied: await Contact.countDocuments({ status: 'replied' }),
      archived: await Contact.countDocuments({ status: 'archived' })
    };

    res.render('admin/contacts', {
      title: 'Contact Submissions',
      contacts,
      stats,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        total
      },
      filters: { status, search, limit }
    });
  } catch (error) {
    console.error('Error loading contact submissions:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load contact submissions' 
    });
  }
};

exports.getContactsAPI = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';

    // Build query
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    // Get contacts with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Contact.countDocuments(query);
    const hasMore = page * limit < total;

    // Get stats
    const stats = {
      total: await Contact.countDocuments(),
      new: await Contact.countDocuments({ status: 'new' }),
      read: await Contact.countDocuments({ status: 'read' }),
      replied: await Contact.countDocuments({ status: 'replied' }),
      archived: await Contact.countDocuments({ status: 'archived' })
    };

    res.json({
      success: true,
      contacts,
      stats,
      hasMore,
      page,
      total
    });
  } catch (error) {
    console.error('Error loading contacts API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load contacts'
    });
  }
};

exports.getContactSubmission = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: 'Contact submission not found'
      });
    }

    // Mark as read if it's new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.render('admin/contact-detail', {
      title: 'Contact Details',
      contact
    });
  } catch (error) {
    console.error('Error loading contact submission:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load contact submission' 
    });
  }
};

exports.replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    contact.replyMessage = replyMessage;
    contact.replied = true;
    contact.status = 'replied';
    await contact.save();

    // Here you would typically send an email to the user
    console.log(`Reply sent to ${contact.email}:`, replyMessage);

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error replying to contact:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    contact.status = status;
    await contact.save();

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

exports.deleteContactSubmission = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact submission' });
  }
};

// PAGE MANAGEMENT

// Get page manager
exports.getPageManager = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    
    // Handle success/error messages from query params
    let message = null;
    if (req.query.success) {
      message = { type: 'success', text: req.query.success };
    } else if (req.query.error) {
      message = { type: 'error', text: req.query.error };
    }
    
    res.render('admin/pages', {
      title: 'Page Management',
      pages: pages,
      message: message
    });
  } catch (error) {
    console.error('Error loading page manager:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load page manager' 
    });
  }
};

// Get new page form
exports.getNewPage = (req, res) => {
  res.render('admin/page-form', {
    title: 'Create New Page',
    page: null,
    isEdit: false
  });
};

// Get page manager
exports.getPageManager = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    
    res.render('admin/page-manager', {
      title: 'Page Management',
      pages: pages
    });
  } catch (error) {
    console.error('Error loading page manager:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load page manager' 
    });
  }
};

// Get edit page form
exports.getEditPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).render('404', {
        title: 'Page Not Found',
        message: 'The page you are looking for could not be found.'
      });
    }

    res.render('admin/page-form', {
      title: 'Edit Page',
      page: page,
      isEdit: true
    });
  } catch (error) {
    console.error('Error loading page for editing:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load page for editing' 
    });
  }
};

// Newsletter Management
exports.getNewsletterManager = async (req, res) => {
  try {
    // For now, return mock data. In a real app, you'd fetch from a Newsletter model
    const stats = {
      totalSubscribers: 1234,
      activeCampaigns: 3,
      openRate: 24.5,
      clickRate: 3.2
    };

    res.render('admin/newsletter', {
      title: 'Newsletter Management',
      stats,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Newsletter manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load newsletter manager' 
    });
  }
};

exports.getNewsletterSubscribers = async (req, res) => {
  try {
    // Mock data for subscribers
    const subscribers = [
      {
        id: 1,
        email: 'john.doe@email.com',
        name: 'John Doe',
        subscribed_at: new Date(),
        status: 'active'
      },
      {
        id: 2,
        email: 'sarah.miller@email.com',
        name: 'Sarah Miller',
        subscribed_at: new Date(),
        status: 'active'
      },
      {
        id: 3,
        email: 'mike.johnson@email.com',
        name: 'Mike Johnson',
        subscribed_at: new Date(),
        status: 'pending'
      }
    ];

    res.render('admin/newsletter-subscribers', {
      title: 'Newsletter Subscribers',
      subscribers,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Newsletter subscribers error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load newsletter subscribers' 
    });
  }
};

exports.getNewsletterCampaigns = async (req, res) => {
  try {
    // Mock data for campaigns
    const campaigns = [
      {
        id: 1,
        name: 'Weekly Fitness Tips',
        subject: 'Your Weekly Dose of Fitness Motivation',
        status: 'active',
        sent_at: new Date(),
        open_rate: 25.3,
        click_rate: 3.8
      },
      {
        id: 2,
        name: 'New Blog Post Alert',
        subject: 'Check out our latest fitness insights',
        status: 'draft',
        created_at: new Date()
      }
    ];

    res.render('admin/newsletter-campaigns', {
      title: 'Newsletter Campaigns',
      campaigns,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Newsletter campaigns error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load newsletter campaigns' 
    });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { name, subject, content, type } = req.body;
    
    // In a real app, save to database
    console.log('Creating campaign:', { name, subject, type });
    
    res.redirect('/admin/newsletter/campaigns?success=Campaign created successfully');
  } catch (error) {
    console.error('Create campaign error:', error);
    res.redirect('/admin/newsletter/campaigns?error=Failed to create campaign');
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock campaign data
    const campaign = {
      id: id,
      name: 'Weekly Fitness Tips',
      subject: 'Your Weekly Dose of Fitness Motivation',
      content: '<p>Hello fitness enthusiasts!</p><p>Here are your weekly tips...</p>',
      status: 'active'
    };

    res.render('admin/edit-campaign', {
      title: 'Edit Campaign',
      campaign,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load campaign' 
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, content } = req.body;
    
    // In a real app, update in database
    console.log('Updating campaign:', id, { name, subject });
    
    res.redirect('/admin/newsletter/campaigns?success=Campaign updated successfully');
  } catch (error) {
    console.error('Update campaign error:', error);
    res.redirect('/admin/newsletter/campaigns?error=Failed to update campaign');
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, delete from database
    console.log('Deleting campaign:', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};

exports.addSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // In a real app, save to database
    console.log('Adding subscriber:', { email, name });
    
    res.redirect('/admin/newsletter/subscribers?success=Subscriber added successfully');
  } catch (error) {
    console.error('Add subscriber error:', error);
    res.redirect('/admin/newsletter/subscribers?error=Failed to add subscriber');
  }
};

exports.removeSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, remove from database
    console.log('Removing subscriber:', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove subscriber error:', error);
    res.status(500).json({ error: 'Failed to remove subscriber' });
  }
};

// FAQ Management
exports.getFaqManager = async (req, res) => {
  try {
    // Mock FAQ data
    const faqs = [
      {
        id: 1,
        question: 'What equipment do I need to get started?',
        answer: 'You don\'t need much to get started! Basic equipment includes comfortable workout clothes, a yoga mat, and some water.',
        category: 'Equipment',
        priority: 'high',
        views: 342,
        helpful_votes: 28,
        updated_at: new Date()
      },
      {
        id: 2,
        question: 'How much do personal training sessions cost?',
        answer: 'Our personal training sessions start at $75 per session. We offer package deals and monthly memberships.',
        category: 'Pricing',
        priority: 'high',
        views: 1200,
        helpful_votes: 89,
        updated_at: new Date()
      },
      {
        id: 3,
        question: 'Can I cancel my membership anytime?',
        answer: 'Yes! We believe in flexible memberships. You can cancel anytime with a 30-day notice.',
        category: 'General',
        priority: 'medium',
        views: 876,
        helpful_votes: 67,
        updated_at: new Date()
      }
    ];

    const categories = [
      { id: 1, name: 'General', count: 8 },
      { id: 2, name: 'Pricing', count: 6 },
      { id: 3, name: 'Training', count: 5 },
      { id: 4, name: 'Nutrition', count: 3 },
      { id: 5, name: 'Equipment', count: 2 }
    ];

    const stats = {
      totalFaqs: 24,
      categories: 5,
      mostPopular: 'Pricing FAQ'
    };

    res.render('admin/faq', {
      title: 'FAQ Management',
      faqs,
      categories,
      stats,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('FAQ manager error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load FAQ manager' 
    });
  }
};

exports.getFaqCategories = async (req, res) => {
  try {
    const categories = [
      { id: 1, name: 'General', count: 8 },
      { id: 2, name: 'Pricing', count: 6 },
      { id: 3, name: 'Training', count: 5 },
      { id: 4, name: 'Nutrition', count: 3 },
      { id: 5, name: 'Equipment', count: 2 }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
};

exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category, priority } = req.body;
    
    // In a real app, save to database
    console.log('Creating FAQ:', { question, answer, category, priority });
    
    res.redirect('/admin/faq?success=FAQ created successfully');
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.redirect('/admin/faq?error=Failed to create FAQ');
  }
};

exports.getEditFaq = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock FAQ data
    const faq = {
      id: id,
      question: 'What equipment do I need to get started?',
      answer: 'You don\'t need much to get started! Basic equipment includes comfortable workout clothes, a yoga mat, and some water.',
      category: 'Equipment',
      priority: 'high'
    };

    const categories = ['General', 'Pricing', 'Training', 'Nutrition', 'Equipment'];

    res.render('admin/edit-faq', {
      title: 'Edit FAQ',
      faq,
      categories,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Get edit FAQ error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load FAQ for editing' 
    });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, priority } = req.body;
    
    // In a real app, update in database
    console.log('Updating FAQ:', id, { question, answer, category, priority });
    
    res.redirect('/admin/faq?success=FAQ updated successfully');
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.redirect('/admin/faq?error=Failed to update FAQ');
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, delete from database
    console.log('Deleting FAQ:', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
};

exports.createFaqCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // In a real app, save to database
    console.log('Creating FAQ category:', { name });
    
    res.redirect('/admin/faq?success=Category created successfully');
  } catch (error) {
    console.error('Create FAQ category error:', error);
    res.redirect('/admin/faq?error=Failed to create category');
  }
};

exports.deleteFaqCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, delete from database
    console.log('Deleting FAQ category:', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
