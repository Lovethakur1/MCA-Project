const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const pageController = require('../controllers/pageController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/media/');
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp prefix
    const timestamp = Date.now();
    cb(null, timestamp + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    // Accept videos and images
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed!'), false);
    }
  }
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

// Individual section updates
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

// Blog management
router.get('/blog', adminController.getBlogManager);
router.get('/blog/new', adminController.getNewBlogPost);
router.post('/blog', adminController.createBlogPost);
router.get('/blog/:id/edit', adminController.getEditBlogPost);
router.post('/blog/:id', adminController.updateBlogPost);
router.delete('/blog/:id', adminController.deleteBlogPost);

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
