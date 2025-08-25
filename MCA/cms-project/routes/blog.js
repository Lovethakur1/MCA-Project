const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Blog listing page
router.get('/', blogController.getBlogPage);

// Individual blog post
router.get('/:slug', blogController.getBlogPost);

module.exports = router;
