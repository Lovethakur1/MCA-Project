// MongoDB initialization script
// This script creates a user for the CMS application

db = db.getSiblingDB('mca-cms');

db.createUser({
  user: 'cms_user',
  pwd: 'cms_password',
  roles: [
    {
      role: 'readWrite',
      db: 'mca-cms'
    }
  ]
});

// Create indexes for better performance
db.blogposts.createIndex({ "title": "text", "content": "text" });
db.blogposts.createIndex({ "category": 1 });
db.blogposts.createIndex({ "createdAt": -1 });
db.testimonials.createIndex({ "featured": 1 });
db.users.createIndex({ "email": 1 }, { unique: true });

print('Database initialized successfully!');
