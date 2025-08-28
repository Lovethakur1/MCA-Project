const Content = require('../models/Content');
const Contact = require('../models/Contact');
const Page = require('../models/Page');
const Testimonial = require('../models/Testimonial');
const { PricingPlan } = require('../models/Pricing');

exports.getBootcampPage = async (req, res) => {
  try {
    // Get bootcamp page content
    const bootcampContent = await Content.find({ page: 'bootcamp' }).lean();
    const contentData = {};
    bootcampContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('bootcamp', {
      title: 'Bootcamp',
      content: contentData,
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading bootcamp page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load bootcamp page' 
    });
  }
};

exports.getCoachPage = async (req, res) => {
  try {
    // Get coach page content
    const coachContent = await Content.find({ page: 'coach' }).lean();
    const contentData = {};
    coachContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get blog posts for coach page (filter by Diet & Nutrition category)
    const BlogPost = require('../models/BlogPost');
    const blogPosts = await BlogPost.find({ 
      status: 'published',
      category: 'diet' // Filter for Diet & Nutrition category
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Get testimonials (reuse from home page CMS content)
    const homeTestimonialContent = await Content.find({ page: 'home', section: 'testimonials' }).lean();
    const testimonialContentData = {};
    homeTestimonialContent.forEach(item => {
      testimonialContentData[item.key] = item.value;
    });

    // Also get database testimonials as fallback
    const Testimonial = require('../models/Testimonial');
    const dbTestimonials = await Testimonial.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean();

    // Get FAQs for coach page
    const FAQ = require('../models/FAQ');
    const faqs = await FAQ.find({ 
      page: 'coach', 
      status: 'published' 
    })
      .sort({ order: 1 })
      .lean();

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('coachmarycarmen', {
      title: 'Coach Mary Carmen',
      content: contentData,
      blogPosts: blogPosts,
      testimonialContentData: testimonialContentData,
      dbTestimonials: dbTestimonials,
      faqs: faqs,
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading coach page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load coach page' 
    });
  }
};

exports.getPricePage = async (req, res) => {
  try {
    // Get price page content
    const priceContent = await Content.find({ page: 'price' }).lean();
    const contentData = {};
    priceContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get pricing plans organized by category
    const pricingPlans = await PricingPlan.find({ published: true })
      .sort({ category: 1, sortOrder: 1 })
      .lean();

    // Organize plans by category
    const plansByCategory = {};
    pricingPlans.forEach(plan => {
      if (!plansByCategory[plan.category]) {
        plansByCategory[plan.category] = [];
      }
      plansByCategory[plan.category].push(plan);
    });

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('price', {
      title: 'Pricing',
      content: contentData,
      pricingPlans: plansByCategory,
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading price page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load price page' 
    });
  }
};

exports.getContactPage = async (req, res) => {
  try {
    // Get contact page content
    const contactContent = await Content.find({ page: 'contact' }).lean();
    const contentData = {};
    contactContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('contact', {
      title: 'Contact',
      content: contentData,
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading contact page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load contact page' 
    });
  }
};

exports.submitContactForm = async (req, res) => {
  try {
    // Handle contact form submission
    const { name, email, phone, service, message } = req.body;
    
    // Get client IP and User Agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const userAgent = req.headers['user-agent'] || '';
    
    // Debug logging
    console.log('Contact form submission:', { 
      name, 
      email, 
      phone, 
      service, 
      message,
      submittedAt: new Date().toISOString()
    });
    
    console.log('Request headers:', {
      'content-type': req.headers['content-type'],
      'accept': req.headers['accept'],
      'x-requested-with': req.headers['x-requested-with']
    });
    
    // Save to database
    const contactSubmission = new Contact({
      name,
      email,
      phone,
      service,
      message,
      ipAddress,
      userAgent
    });
    
    const savedContact = await contactSubmission.save();
    console.log('Contact saved to database with ID:', savedContact._id);
    
    // Check if it's an AJAX request (multiple methods)
    const isAjax = req.headers['content-type'] === 'application/json' || 
                   (req.headers['accept'] && req.headers['accept'].includes('application/json')) ||
                   req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    console.log('Is AJAX request:', isAjax);
    
    if (isAjax) {
      // Return JSON response for AJAX requests
      return res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
        contactId: savedContact._id
      });
    }
    
    // For regular form submissions, redirect as before
    res.redirect('/?contact=success#contact');
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    // Check if it's an AJAX request
    const isAjax = req.headers['content-type'] === 'application/json' || 
                   (req.headers['accept'] && req.headers['accept'].includes('application/json')) ||
                   req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    if (isAjax) {
      // Return JSON error response for AJAX requests
      return res.status(500).json({
        success: false,
        message: 'Sorry, there was an error sending your message. Please try again.',
        error: error.message
      });
    }
    
    // For regular form submissions, redirect as before
    res.redirect('/?contact=error#contact');
  }
};

// DYNAMIC PAGE MANAGEMENT SYSTEM

// Get all pages for navigation
const getNavigationPages = async () => {
  try {
    return await Page.find({ 
      status: 'active', 
      showInNav: true 
    }).sort({ navOrder: 1, createdAt: 1 });
  } catch (error) {
    console.error('Error fetching navigation pages:', error);
    return [];
  }
};

// Render dynamic page
exports.renderDynamicPage = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find the page by slug
    const page = await Page.findOne({ slug, status: 'active' });
    
    if (!page) {
      return res.status(404).render('404', {
        title: 'Page Not Found',
        message: 'The requested page could not be found.'
      });
    }

    // Get navigation pages for header
    const navigationPages = await getNavigationPages();

    // Get global CMS content for navbar/footer
    const content = await Content.findOne();
    
    // Get testimonials if needed
    let testimonials = [];
    if (page.testimonials && page.testimonials.showDatabaseTestimonials) {
      testimonials = await Testimonial.find({ status: 'approved' }).sort({ createdAt: -1 });
    }

    // Prepare content data
    const contentData = {
      hero: page.hero || {},
      services: page.services || {},
      concept: page.concept || {},
      team: page.team || {},
      benefits: page.benefits || {},
      faq: page.faq || {},
      testimonials: page.testimonials || {},
      contact: page.contact || {},
      newsletter: page.newsletter || {},
      customSections: page.customSections || []
    };

    res.render('dynamic-page', {
      title: page.title,
      page: page,
      contentData: contentData,
      testimonials: testimonials,
      navigationPages: navigationPages,
      navbar: content ? content.navbar : {},
      siteSettings: content ? content.siteSettings : {}
    });

  } catch (error) {
    console.error('Error rendering dynamic page:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the page.'
    });
  }
};

// Admin: Get all pages
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      pages: pages
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages'
    });
  }
};

// Admin: Create new page
exports.createPage = async (req, res) => {
  try {
    const {
      title,
      slug,
      status = 'active',
      showInNav = true,
      navOrder = 0,
      metaDescription = '',
      ...pageData
    } = req.body;

    // Check if slug already exists
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: 'A page with this slug already exists'
      });
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        console.log('Uploaded file:', file.fieldname, file.filename);
        
        // Handle hero background video
        if (file.fieldname === 'heroBackgroundVideo') {
          if (!pageData.hero) pageData.hero = {};
          pageData.hero.backgroundVideo = file.filename;
        }
        
        // Handle hero background image
        if (file.fieldname === 'heroBackgroundImage') {
          if (!pageData.hero) pageData.hero = {};
          pageData.hero.backgroundImage = file.filename;
        }
        
        // Handle concept image
        if (file.fieldname === 'conceptImage') {
          if (!pageData.concept) pageData.concept = {};
          pageData.concept.image = file.filename;
        }
        
        // Handle service icons
        const serviceIconMatch = file.fieldname.match(/^services\[items\]\[(\d+)\]\[iconFile\]$/);
        if (serviceIconMatch) {
          const serviceIndex = serviceIconMatch[1];
          if (!pageData.services) pageData.services = {};
          if (!pageData.services.items) pageData.services.items = {};
          if (!pageData.services.items[serviceIndex]) pageData.services.items[serviceIndex] = {};
          pageData.services.items[serviceIndex].icon = file.filename;
        }
        
        // Handle benefit icons
        const benefitIconMatch = file.fieldname.match(/^benefits\[items\]\[(\d+)\]\[iconFile\]$/);
        if (benefitIconMatch) {
          const benefitIndex = benefitIconMatch[1];
          if (!pageData.benefits) pageData.benefits = {};
          if (!pageData.benefits.items) pageData.benefits.items = {};
          if (!pageData.benefits.items[benefitIndex]) pageData.benefits.items[benefitIndex] = {};
          pageData.benefits.items[benefitIndex].icon = file.filename;
        }
        
        // Handle concept feature icons
        const conceptFeatureIconMatch = file.fieldname.match(/^concept\[features\]\[(\d+)\]\[iconFile\]$/);
        if (conceptFeatureIconMatch) {
          const featureIndex = conceptFeatureIconMatch[1];
          if (!pageData.concept) pageData.concept = {};
          if (!pageData.concept.features) pageData.concept.features = {};
          if (!pageData.concept.features[featureIndex]) pageData.concept.features[featureIndex] = {};
          pageData.concept.features[featureIndex].icon = file.filename;
        }
      });
    }

    const page = new Page({
      title,
      slug,
      status,
      showInNav,
      navOrder,
      metaDescription,
      ...pageData
    });

    await page.save();

    // Redirect to pages list instead of JSON response
    res.redirect('/admin/pages?success=Page created successfully');

  } catch (error) {
    console.error('Error creating page:', error);
    res.redirect('/admin/pages?error=Error creating page');
  }
};

// Admin: Update page
exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const page = await Page.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    res.json({
      success: true,
      message: 'Page updated successfully',
      page: page
    });

  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating page'
    });
  }
};

// Admin: Delete page
exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await Page.findByIdAndDelete(id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting page'
    });
  }
};

// Admin: Get single page
exports.getPage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    res.json({
      success: true,
      page: page
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page'
    });
  }
};

// Export the navigation function for use in other controllers
exports.getNavigationPages = getNavigationPages;

// Get blog page
exports.getBlogPage = async (req, res) => {
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
    const BlogPost = require('../models/BlogPost');
    const blogPosts = await BlogPost.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean();
      // console.log('Blog Posts:', blogPosts);

    // Get blog FAQs
    const FAQ = require('../models/FAQ');
    const faqs = await FAQ.find({ page: 'coach' }).sort({ order: 1 });
   

      console.log('Blog FAQs:', faqs);

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();
    

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('blog', {
      title: 'Blog',
      content: contentData,
      blogPosts: blogPosts,
      faqs: faqs,
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading blog page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog page' 
    });
  }
};
