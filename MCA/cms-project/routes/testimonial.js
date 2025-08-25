const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

// Testimonials page
router.get('/', testimonialController.getTestimonialsPage);

module.exports = router;
