const Content = require('../models/Content');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/media/');
  },
  filename: function (req, file, cb) {
    // Keep original filename to match existing pattern
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get bootcamp admin page
exports.getBootcampAdmin = async (req, res) => {
  try {
    // Get all bootcamp content organized by sections
    const bootcampContent = await Content.find({ page: 'bootcamp' }).lean();
    
    const contentData = {
      hero: {},
      basel: {},
      croatia: {},
      faq: {}
    };
    
    bootcampContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    res.render('admin/bootcamp', {
      title: 'Bootcamp Admin',
      content: contentData
    });
  } catch (error) {
    console.error('Error loading bootcamp admin:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load bootcamp admin page' 
    });
  }
};

// Update bootcamp content
exports.updateBootcampContent = async (req, res) => {
  try {
    const updates = req.body;
    const files = req.files || {};

    // Process file uploads and add filenames to updates
    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        updates[fieldName] = file.filename;
      }
    }

    // Update each field
    for (const [key, value] of Object.entries(updates)) {
      if (value && value.trim() !== '') {
        const [section, field] = key.split('_');
        
        if (section && field) {
          await Content.findOneAndUpdate(
            { page: 'bootcamp', section: section, key: field },
            { 
              page: 'bootcamp',
              section: section,
              key: field,
              value: value,
              type: files[key] ? (files[key][0].mimetype.startsWith('image/') ? 'image' : 'video') : 'text'
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    res.redirect('/admin/bootcamp?success=Content updated successfully');
  } catch (error) {
    console.error('Error updating bootcamp content:', error);
    res.redirect('/admin/bootcamp?error=Failed to update content');
  }
};

// Add new FAQ item
exports.addFaqItem = async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.redirect('/admin/bootcamp?error=Question and answer are required');
    }

    // Get current FAQ count to generate new key
    const faqItems = await Content.find({ 
      page: 'bootcamp', 
      section: 'faq',
      key: { $regex: /^question_\d+$/ }
    });
    
    const nextIndex = faqItems.length + 1;

    // Add question
    await Content.findOneAndUpdate(
      { page: 'bootcamp', section: 'faq', key: `question_${nextIndex}` },
      { 
        page: 'bootcamp',
        section: 'faq',
        key: `question_${nextIndex}`,
        value: question,
        type: 'text'
      },
      { upsert: true, new: true }
    );

    // Add answer
    await Content.findOneAndUpdate(
      { page: 'bootcamp', section: 'faq', key: `answer_${nextIndex}` },
      { 
        page: 'bootcamp',
        section: 'faq',
        key: `answer_${nextIndex}`,
        value: answer,
        type: 'text'
      },
      { upsert: true, new: true }
    );

    res.redirect('/admin/bootcamp?success=FAQ item added successfully');
  } catch (error) {
    console.error('Error adding FAQ item:', error);
    res.redirect('/admin/bootcamp?error=Failed to add FAQ item');
  }
};

// Delete FAQ item
exports.deleteFaqItem = async (req, res) => {
  try {
    const { index } = req.params;
    
    // Delete question and answer
    await Content.deleteMany({
      page: 'bootcamp',
      section: 'faq',
      key: { $in: [`question_${index}`, `answer_${index}`] }
    });

    res.redirect('/admin/bootcamp?success=FAQ item deleted successfully');
  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    res.redirect('/admin/bootcamp?error=Failed to delete FAQ item');
  }
};

module.exports = {
  upload,
  getBootcampAdmin: exports.getBootcampAdmin,
  updateBootcampContent: exports.updateBootcampContent,
  addFaqItem: exports.addFaqItem,
  deleteFaqItem: exports.deleteFaqItem
};
