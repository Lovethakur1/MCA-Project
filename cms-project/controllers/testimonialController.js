const Testimonial = require('../models/Testimonial');
const Content = require('../models/Content');
const { getNavigationPages } = require('./pageController');

exports.getTestimonialsPage = async (req, res) => {
  try {
    // Get published testimonials
    const testimonials = await Testimonial.find({ published: true })
      .sort({ createdAt: -1 })
      .lean();

    // Get featured testimonials for hero section
    const featuredTestimonials = await Testimonial.find({ 
      featured: true, 
      published: true 
    })
    .limit(2)
    .lean();

    // Get navigation pages for header
    const navigationPages = await getNavigationPages();

    // Get testimonial page content
    const testimonialContent = await Content.find({ page: 'testimonial' }).lean();
    const contentData = {};
    testimonialContent.forEach(item => {
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

    res.render('testimonial', {
      title: 'Testimonials',
      testimonials,
      featuredTestimonials,
      heroSection: contentData.hero || {},
      testimonialsSection: contentData.section || {},
      ctaSection: contentData.cta || {},
      navbar,
      footer,
      siteSettings: site,
      navigationPages: navigationPages
    });
  } catch (error) {
    console.error('Error loading testimonials page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load testimonials page' 
    });
  }
};
