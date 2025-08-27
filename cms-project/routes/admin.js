const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const pageController = require('../controllers/pageController');
const bootcampController = require('../controllers/bootcampController');
const coachController = require('../controllers/coachController');
const blogPageController = require('../controllers/blogPageController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Simple upload middleware for other routes
const upload = multer({
  dest: './public/media/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Admin login
router.get('/login', adminController.getLoginPage);
router.post('/login', adminController.postLogin);
router.post('/logout', adminController.postLogout);

// Protected admin routes
router.use(authMiddleware.requireAuth);

// Admin dashboard
router.get('/', adminController.getDashboard);
router.get('/dashboard', adminController.getDashboard);

// Home page management
router.get('/home', adminController.getHomeManager);
router.post('/home/update', adminController.updateHomeContent);

// Bootcamp page management
router.get('/bootcamp', bootcampController.getBootcampAdmin);
router.post('/bootcamp', bootcampController.uploadMiddleware, bootcampController.updateBootcampContent);
router.post('/bootcamp/faq', bootcampController.addFaqItem);
router.delete('/bootcamp/faq/:index', bootcampController.deleteFaqItem);

// Coach Mary Carmen management
router.get('/coach', coachController.getCoachAdmin);
router.post('/coach', coachController.uploadMiddleware, coachController.updateCoachContent);

// Blog management (separate from main blog management)
router.get('/blog-manager', coachController.getBlogAdmin);
router.post('/blog-manager', coachController.uploadMiddleware, coachController.createBlog);
router.post('/blog-manager/:id', coachController.uploadMiddleware, coachController.updateBlog);
router.delete('/blog-manager/:id', coachController.deleteBlog);

// FAQ management for Coach Mary Carmen page
router.get('/faq-manager', coachController.getFAQAdmin);
router.post('/faq/create', coachController.createFAQ);
router.post('/faq/:id/update', coachController.updateFAQ);
router.post('/faq/:id/delete', coachController.deleteFAQ);

// Blog page management
router.get('/blog-page', blogPageController.getBlogPageAdmin);
router.post('/blog-page/update', blogPageController.uploadMiddleware, blogPageController.updateBlogPageContent);

// Blog FAQ management
router.get('/blog-faq-manager', blogPageController.getBlogFAQAdmin);
router.post('/blog-faq/create', blogPageController.createBlogFAQ);
router.post('/blog-faq/:id/update', blogPageController.updateBlogFAQ);
router.post('/blog-faq/:id/delete', blogPageController.deleteBlogFAQ);

// Redirect old blog route to new blog manager (preserve query parameters)
router.get('/blog', (req, res) => {
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
  const redirectUrl = queryString ? `/admin/blog-manager?${queryString}` : '/admin/blog-manager';
  res.redirect(redirectUrl);
});

// Content management
router.post('/video/update', adminController.updateVideoSection);
router.post('/services/update', adminController.updateServicesSection);
router.post('/services/update-single', adminController.updateSingleService);
router.post('/team/update', adminController.updateTeamSection);
router.post('/team/update-single', adminController.updateSingleTeamMember);
router.delete('/team/delete-member/:memberIndex', adminController.deleteTeamMember);
router.post('/concept/update', adminController.updateConceptSection);
router.post('/testimonials/update', adminController.updateTestimonialsSection);
router.post('/contact/update', adminController.updateContactSection);
router.post('/benefits/update', adminController.updateBenefitsSection);
router.post('/faq/update', adminController.updateFAQSection);
router.post('/newsletter/update', adminController.updateNewsletterSection);

// Contact submissions management
router.get('/contacts', adminController.getContactSubmissions);
router.get('/api/contacts', adminController.getContactsAPI);
router.get('/contacts/:id', adminController.getContactSubmission);
router.post('/contacts/:id/reply', adminController.replyToContact);
router.post('/contacts/:id/status', adminController.updateContactStatus);
router.delete('/contacts/:id', adminController.deleteContactSubmission);

// Content management
router.get('/content', adminController.getContentManager);
router.post('/content', adminController.updateContent);

// Old Blog management (commented out - using new coach blog manager instead)
// router.get('/blog', adminController.getBlogManager);
// router.get('/blog/new', adminController.getNewBlogPost);
// router.post('/blog', adminController.createBlogPost);
// router.get('/blog/:id/edit', adminController.getEditBlogPost);
// router.post('/blog/:id', adminController.updateBlogPost);
// router.delete('/blog/:id', adminController.deleteBlogPost);

// Testimonial management
router.get('/testimonials', adminController.getTestimonialManager);
router.get('/testimonials/new', adminController.getNewTestimonial);
router.post('/testimonials', adminController.createTestimonial);
router.get('/testimonials/:id/edit', adminController.getEditTestimonial);
router.post('/testimonials/:id', adminController.updateTestimonial);
router.delete('/testimonials/:id', adminController.deleteTestimonial);

// Media management
router.get('/media', adminController.getMediaManager);
router.post('/media/upload', adminController.uploadMedia);

// Page management
router.get('/pages', adminController.getPageManager);
router.get('/pages/api', pageController.getAllPages);
router.get('/pages/new', adminController.getNewPage);
router.post('/pages', upload.any(), pageController.createPage);
router.get('/pages/:id/edit', adminController.getEditPage);
router.post('/pages/:id', upload.any(), pageController.updatePage);
router.delete('/pages/:id', pageController.deletePage);
router.get('/pages/api/:id', pageController.getPage);

module.exports = router;
