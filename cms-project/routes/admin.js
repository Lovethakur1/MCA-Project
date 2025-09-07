const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const pageController = require('../controllers/pageController');
const bootcampController = require('../controllers/bootcampController');
const coachController = require('../controllers/coachController');
const blogPageController = require('../controllers/blogPageController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/media/'); // Store files in public/media directory
  },
  filename: function (req, file, cb) {
    // Keep original name with timestamp to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// Upload middleware with file filtering
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Accept video and image files
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

// API endpoints
router.get('/api/stats', adminController.getStatsAPI);
router.get('/api/recent', adminController.getRecentDataAPI);

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

// Pricing page management
router.get('/price', adminController.getPricingPageContent);
router.post('/price/update', upload.single('hero_image_file'), adminController.updatePricingPageContent);

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
router.post('/video/update', upload.single('video'), adminController.updateVideoSection);
router.post('/services/update', upload.fields([
  { name: 'service1_icon', maxCount: 1 },
  { name: 'service2_icon', maxCount: 1 },
  { name: 'service3_icon', maxCount: 1 },
  { name: 'service4_icon', maxCount: 1 },
  { name: 'service5_icon', maxCount: 1 },
  { name: 'service6_icon', maxCount: 1 }
]), adminController.updateServicesSection);
router.post('/services/update-single', upload.single('icon'), adminController.updateSingleService);
router.post('/team/update', upload.fields([
  { name: 'member1_photo', maxCount: 1 },
  { name: 'member2_photo', maxCount: 1 },
  { name: 'member3_photo', maxCount: 1 },
  { name: 'member4_photo', maxCount: 1 },
  { name: 'member5_photo', maxCount: 1 },
  { name: 'member6_photo', maxCount: 1 }
]), adminController.updateTeamSection);
router.post('/team/update-single', upload.single('photo'), adminController.updateSingleTeamMember);
router.delete('/team/delete-member/:memberIndex', adminController.deleteTeamMember);
router.post('/concept/update', upload.fields([
  { name: 'feature1_icon', maxCount: 1 },
  { name: 'feature2_icon', maxCount: 1 },
  { name: 'feature3_icon', maxCount: 1 },
  { name: 'feature4_icon', maxCount: 1 }
]), adminController.updateConceptSection);
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
router.get('/testimonials/page-content', adminController.getTestimonialPageContent);
router.post('/testimonials/page-content', adminController.updateTestimonialPageContent);

// Pricing management
router.get('/pricing', adminController.getPricingManager);
router.get('/pricing/page-content', adminController.getPricingPageContent);
router.post('/pricing/page-content', adminController.updatePricingPageContent);
router.get('/pricing/plans/new', adminController.getNewPricingPlan);
router.post('/pricing/plans', adminController.createPricingPlan);
router.get('/pricing/plans/:id/edit', adminController.getEditPricingPlan);
router.post('/pricing/plans/:id', adminController.updatePricingPlan);
router.delete('/pricing/plans/:id', adminController.deletePricingPlan);

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

// Newsletter management
router.get('/newsletter', adminController.getNewsletterManager);
router.get('/newsletter/subscribers', adminController.getNewsletterSubscribers);
router.get('/newsletter/campaigns', adminController.getNewsletterCampaigns);
router.post('/newsletter/campaigns', adminController.createCampaign);
router.get('/newsletter/campaigns/:id', adminController.getCampaign);
router.post('/newsletter/campaigns/:id', adminController.updateCampaign);
router.delete('/newsletter/campaigns/:id', adminController.deleteCampaign);
router.post('/newsletter/subscribers', adminController.addSubscriber);
router.delete('/newsletter/subscribers/:id', adminController.removeSubscriber);

// FAQ management
router.get('/faq', adminController.getFaqManager);
router.get('/faq/categories', adminController.getFaqCategories);
router.post('/faq', adminController.createFaq);
router.get('/faq/:id/edit', adminController.getEditFaq);
router.post('/faq/:id', adminController.updateFaq);
router.delete('/faq/:id', adminController.deleteFaq);
router.post('/faq/categories', adminController.createFaqCategory);
router.delete('/faq/categories/:id', adminController.deleteFaqCategory);

module.exports = router;
