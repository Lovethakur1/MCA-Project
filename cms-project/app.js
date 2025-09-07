const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mca-cms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'mca-cms-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  },
  name: 'mca.admin.session' // Custom session name
}));

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', false); // Disable default layout

// Routes
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const blogRouter = require('./routes/blog');
const testimonialRouter = require('./routes/testimonial');
const pageRouter = require('./routes/pages');

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/blog', blogRouter);
app.use('/testimonial', testimonialRouter);
app.use('/page', pageRouter); // Dynamic pages

// Fallback route for direct slug access (without /page/ prefix)
app.get('/:slug', async (req, res, next) => {
  const Page = require('./models/Page');
  const Testimonial = require('./models/Testimonial');
  const { getNavigationPages } = require('./controllers/pageController');
  
  try {
    const page = await Page.findOne({ 
      slug: req.params.slug, 
      status: 'active' 
    });
    
    if (page) {
      // Get navigation pages for header
      const navigationPages = await getNavigationPages();
      
      // Get featured testimonials for the page
      const featuredTestimonials = await Testimonial.find({ 
        featured: true, 
        status: 'approved' 
      }).limit(6);
      
      res.render('dynamic-page', {
        title: page.title,
        contentData: page,
        featuredTestimonials,
        navigationPages: navigationPages
      });
    } else {
      next(); // Continue to 404 handler
    }
  } catch (error) {
    console.error('Error rendering dynamic page:', error);
    next(error);
  }
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Server Error', error: err });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
