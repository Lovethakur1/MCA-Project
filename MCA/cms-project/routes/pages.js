const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Dynamic page routes
router.get('/:slug', pageController.renderDynamicPage);

module.exports = router;
