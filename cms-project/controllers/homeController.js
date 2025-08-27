const Content = require('../models/Content');
const BlogPost = require('../models/BlogPost');
const Testimonial = require('../models/Testimonial');
const { getNavigationPages } = require('./pageController');

exports.getHomePage = async (req, res) => {
  try {
    // Get content for home page (no caching to ensure fresh data)
    const homeContent = await Content.find({ page: 'home' }).lean().exec();
    
    // Debug log to check video content
    const videoContent = homeContent.filter(item => item.section === 'hero');
    console.log('Hero content from database:', videoContent);
    
    // Get featured blog posts
    const featuredPosts = await BlogPost.find({ published: true })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    // Get featured testimonials
    const featuredTestimonials = await Testimonial.find({ 
      featured: true, 
      published: true 
    })
    .limit(3)
    .lean();

    // Organize content by sections
    const contentData = {};
    homeContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Debug log for hero data
    // console.log('Hero data being passed to view:', contentData.hero);
    
    // Debug log for services data
    // console.log('Services data being passed to view:', contentData.services);
    
    // Debug log for services data
    // console.log('Services data being passed to view:', contentData.services);

    // Get navbar and footer content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    // Get navigation pages for header
    const navigationPages = await getNavigationPages();

    // Organize global content
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

    res.render('index', {
      title: 'Home',
      hero: contentData.hero || {},
      services: contentData.services || {},
      about: contentData.about || {},
      team: contentData.team || {},
      concept: contentData.concept || {},
      contact: contentData.contact || {},
      testimonials: contentData.testimonials || {},
      testimonialSection: contentData.testimonialSection || {},
      benefits: contentData.benefits || {},
      faq: contentData.faq || {},
      featuredTestimonials,
      featuredPosts,
      navbar,
      footer,
      siteSettings: site,
      contentData: contentData,  // Pass the entire content data object
      navigationPages: navigationPages, // Pass dynamic pages
      query: req.query // Pass query parameters for message display
    });
    
    // Debug log team datas
    // console.log('Team data being passed to view:', contentData.team);
    // console.log('About data being passed to view:', contentData.about);
    
    // console.log('Rendered index page with services:', contentData.services || {});
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load home page' 
    });
  }
};
