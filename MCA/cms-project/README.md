# MCA Website CMS

A dynamic Content Management System built with Express.js and EJS templating, converted from the original static HTML website while preserving the exact frontend design.

## Features

- **Dynamic Content Management**: Edit website content through admin interface
- **Blog System**: Create, edit, and publish blog posts
- **Testimonial Management**: Add and manage customer testimonials
- **Media Library**: Upload and organize images and videos
- **User Authentication**: Secure admin login system
- **Responsive Design**: Preserves original mobile-friendly design
- **SEO Friendly**: Clean URLs and meta tags

## Project Structure

```
cms-project/
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── views/                 # EJS templates
│   ├── layout.ejs         # Main layout template
│   ├── index.ejs          # Homepage
│   ├── blog.ejs           # Blog listing page
│   ├── testimonial.ejs    # Testimonials page
│   ├── partials/          # Reusable template parts
│   │   ├── navbar.ejs     # Navigation bar
│   │   └── footer.ejs     # Footer
│   └── admin/             # Admin panel templates
├── public/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── media/             # Images and videos
├── routes/                # Express routes
├── controllers/           # Route handlers
├── models/                # Database schemas
├── middleware/            # Custom middleware
└── config/                # Configuration files
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Step 1: Install Dependencies

```bash
cd cms-project
npm install
```

### Step 2: Configure Environment

Edit the `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/mca-cms
SESSION_SECRET=your-secret-key-change-this-in-production
PORT=3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start manually
mongod
```

### Step 4: Create Admin User

Run this script to create the initial admin user:

```bash
node scripts/create-admin.js
```

### Step 5: Start the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Admin Panel

Access the admin panel at `http://localhost:3000/admin`

Default login credentials:
- Email: admin@example.com
- Password: admin123

### Admin Features

1. **Dashboard**: Overview of content statistics
2. **Content Manager**: Edit dynamic content across all pages
3. **Blog Manager**: Create, edit, and delete blog posts
4. **Testimonial Manager**: Manage customer testimonials
5. **Media Library**: Upload and organize media files

## Database Schema

### Content Model
```javascript
{
  page: String,      // 'home', 'blog', 'testimonial', etc.
  section: String,   // 'hero', 'services', 'navbar', etc.
  key: String,       // 'title', 'description', 'image', etc.
  value: Mixed,      // The actual content value
  type: String       // 'text', 'html', 'image', 'video', 'url'
}
```

### BlogPost Model
```javascript
{
  title: String,
  slug: String,
  description: String,
  content: String,
  featuredImage: String,
  published: Boolean,
  publishedAt: Date
}
```

### Testimonial Model
```javascript
{
  name: String,
  title: String,
  content: String,
  image: String,
  rating: Number,
  featured: Boolean,
  published: Boolean
}
```

## Content Management

### Editing Page Content

1. Go to Admin → Content Manager
2. Find the content you want to edit by page and section
3. Update the value and save

### Adding Blog Posts

1. Go to Admin → Blog Manager
2. Click "New Blog Post"
3. Fill in title, description, and content
4. Upload a featured image
5. Check "Published" to make it live

### Managing Testimonials

1. Go to Admin → Testimonials
2. Click "New Testimonial"
3. Add customer details and review
4. Mark as "Featured" to show on homepage
5. Check "Published" to make it visible

## Customization

### Adding New Content Areas

1. Add content to database through admin panel:
   ```javascript
   {
     page: 'home',
     section: 'new-section',
     key: 'title',
     value: 'New Section Title',
     type: 'text'
   }
   ```

2. Use in EJS template:
   ```ejs
   <h2><%= newSection?.title || 'Default Title' %></h2>
   ```

### Adding New Pages

1. Create new EJS template in `views/`
2. Add route in `routes/index.js`
3. Add controller method in `controllers/pageController.js`
4. Add navigation link in `views/partials/navbar.ejs`

## Deployment

### Environment Variables for Production

```env
MONGODB_URI=your-production-mongodb-uri
SESSION_SECRET=your-secure-random-secret
PORT=3000
NODE_ENV=production
```

### Security Considerations

1. Change default admin credentials
2. Use strong session secret
3. Enable HTTPS in production
4. Set up MongoDB authentication
5. Configure firewall rules

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Ensure MongoDB is running and connection string is correct
2. **Missing Media Files**: Check that files are copied to `public/media/`
3. **CSS Not Loading**: Verify CSS file is in `public/css/` directory
4. **Admin Login Failed**: Check credentials in database

### Support

For issues or questions, please check the documentation or contact the development team.

## License

MIT License - see LICENSE file for details.
