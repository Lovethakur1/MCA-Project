// MongoDB initialization script
// This script creates indexes for better performance (no authentication)

db = db.getSiblingDB('mca-cms');

// Create indexes for better performance
db.blogposts.createIndex({ "title": "text", "content": "text" });
db.blogposts.createIndex({ "category": 1 });
db.blogposts.createIndex({ "createdAt": -1 });
db.testimonials.createIndex({ "featured": 1 });
db.users.createIndex({ "email": 1 }, { unique: true });

print('Database initialized successfully without authentication!');
