const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const pageController = require('../controllers/pageController');

// Home page
router.get('/', homeController.getHomePage);

// Other pages
router.get('/bootcamp', pageController.getBootcampPage);
router.get('/coach', pageController.getCoachPage);
router.get('/price', pageController.getPricePage);
router.get('/contact', pageController.getContactPage);

// Contact form submission
router.post('/contact', pageController.submitContactForm);

// Test route to check stored contacts (temporary)
router.get('/test-contacts', async (req, res) => {
  try {
    const Contact = require('../models/Contact');
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      success: true,
      count: contacts.length,
      contacts: contacts
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
