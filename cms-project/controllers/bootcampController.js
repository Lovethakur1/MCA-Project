const Content = require('../models/Content');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create media directory if it doesn't exist
const mediaDir = path.join(__dirname, '../public/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const uniqueName = `${timestamp}-${randomNum}${extension}`;
    cb(null, uniqueName);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  console.log('Processing file:', file.originalname, 'Type:', file.mimetype);
  
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files at once
  }
});

// Export upload middleware function for use in routes
exports.uploadMiddleware = (req, res, next) => {
  upload.any()(req, res, next);
};

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

// Update bootcamp content with image upload handling
exports.updateBootcampContent = async (req, res) => {
  try {
    console.log('=== BOOTCAMP UPDATE START ===');
    console.log('Form data received:', req.body);
    console.log('Files received:', req.files);
    
    const updates = { ...req.body };
    
    // Process uploaded images
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files...');
      
      req.files.forEach(file => {
        const fieldName = file.fieldname;
        const fileName = file.filename;
        const imageUrl = `/media/${fileName}`;
        
        // Replace form data with image URL
        updates[fieldName] = imageUrl;
        
        console.log(`✓ Image uploaded: ${fieldName} -> ${imageUrl}`);
        console.log(`  Original file: ${file.originalname}`);
        console.log(`  Saved as: ${fileName}`);
        console.log(`  File size: ${file.size} bytes`);
      });
    }
    
    // Update database with all content
    console.log('Updating database...');
    
    for (const [key, value] of Object.entries(updates)) {
      if (value && value.toString().trim() !== '') {
        const parts = key.split('_');
        const section = parts[0];
        const field = parts.slice(1).join('_');
        
        if (section && field) {
          // Determine content type
          const isImage = value.toString().startsWith('/media/');
          const contentType = isImage ? 'image' : 'text';
          
          await Content.findOneAndUpdate(
            { page: 'bootcamp', section: section, key: field },
            { 
              page: 'bootcamp',
              section: section,
              key: field,
              value: value,
              type: contentType
            },
            { upsert: true, new: true }
          );
          
          console.log(`✓ Updated: ${section}.${field} = ${value} (${contentType})`);
        }
      }
    }
    
    console.log('=== BOOTCAMP UPDATE COMPLETE ===');
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
  uploadMiddleware: exports.uploadMiddleware,
  getBootcampAdmin: exports.getBootcampAdmin,
  updateBootcampContent: exports.updateBootcampContent,
  addFaqItem: exports.addFaqItem,
  deleteFaqItem: exports.deleteFaqItem
};
