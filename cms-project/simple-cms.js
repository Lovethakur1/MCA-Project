const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3002; // Different port to avoid conflicts

// Database connection
mongoose.connect('mongodb://localhost:27017/mca-simple-cms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Simple Footer Content Schema
const FooterContentSchema = new mongoose.Schema({
  section: { type: String, required: true }, // 'business-hours', 'studio-info', 'contact', etc.
  key: { type: String, required: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const FooterContent = mongoose.model('FooterContent', FooterContentSchema);

// Simple User Schema for admin
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'simple-cms-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Routes

// Home page (shows current footer)
app.get('/', async (req, res) => {
  try {
    const footerContent = await FooterContent.find();
    console.log('Footer content found:', footerContent.length, 'items');
    console.log('Sample items:', footerContent.slice(0, 3));
    res.render('home', { footerContent });
  } catch (error) {
    console.error('Error loading footer content:', error);
    res.render('home', { footerContent: [] });
  }
});

// Admin login page
app.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: req.query.error });
});

// Admin login POST
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.redirect('/admin/login?error=Invalid credentials');
    }
    
    req.session.userId = user._id;
    res.redirect('/admin/footer');
  } catch (error) {
    res.redirect('/admin/login?error=Login failed');
  }
});

// Admin footer editor
app.get('/admin/footer', requireAuth, async (req, res) => {
  try {
    const footerContent = await FooterContent.find().sort({ section: 1, key: 1 });
    res.render('footer-editor', { 
      footerContent,
      success: req.query.success,
      error: req.query.error 
    });
  } catch (error) {
    res.render('footer-editor', { 
      footerContent: [],
      error: 'Failed to load footer content' 
    });
  }
});

// Update footer content
app.post('/admin/footer', requireAuth, async (req, res) => {
  try {
    const { section, key, value } = req.body;
    console.log('Updating:', { section, key, value });
    
    const result = await FooterContent.findOneAndUpdate(
      { section, key },
      { value, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    console.log('Update result:', result);
    res.redirect('/admin/footer?success=Footer content updated successfully');
  } catch (error) {
    console.error('Update error:', error);
    res.redirect('/admin/footer?error=Failed to update footer content');
  }
});

// Logout
app.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Initialize default data
async function initializeData() {
  try {
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@mca.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@mca.com',
        password: hashedPassword
      });
      console.log('Admin user created: admin@mca.com / admin123');
    }

    // Create default footer content if doesn't exist
    const contentExists = await FooterContent.findOne();
    if (!contentExists) {
      const defaultFooterContent = [
        { section: 'business-hours', key: 'title', value: 'Business Hours' },
        { section: 'business-hours', key: 'monday', value: 'Monday 8:00am - 8:30pm' },
        { section: 'business-hours', key: 'tuesday', value: 'Tuesday 8:00am - 8:30pm' },
        { section: 'business-hours', key: 'wednesday', value: 'Wednesday 8:00am - 8:30pm' },
        { section: 'business-hours', key: 'thursday', value: 'Thursday 8:00am - 8:30pm' },
        { section: 'business-hours', key: 'friday', value: 'Friday 8:00am - 8:30pm' },
        { section: 'business-hours', key: 'saturday', value: 'Saturday 9:00am - 7:30pm' },
        { section: 'business-hours', key: 'sunday', value: 'Sunday CLOSED' },
        
        { section: 'studio-info', key: 'title', value: 'Private Studio' },
        { section: 'studio-info', key: 'company', value: 'Personal Trainer Basel GmbH' },
        { section: 'studio-info', key: 'address', value: 'Ruchfeldstrasse 24' },
        { section: 'studio-info', key: 'city', value: '4142 Münchenstein' },
        
        { section: 'contact', key: 'phone-title', value: 'TELEPHONE NUMBER' },
        { section: 'contact', key: 'phone', value: '+41795217192' },
        { section: 'contact', key: 'email-title', value: 'EMAIL' },
        { section: 'contact', key: 'email', value: 'info@personaltrainerbasel.ch' },
        { section: 'contact', key: 'main-title', value: 'Get in touch with us' },
        
        { section: 'copyright', key: 'text', value: '©2023 All Rights Reserved' }
      ];

      await FooterContent.insertMany(defaultFooterContent);
      console.log('Default footer content created');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Simple CMS running on http://localhost:${PORT}`);
  console.log('Admin login: admin@mca.com / admin123');
  initializeData();
});
