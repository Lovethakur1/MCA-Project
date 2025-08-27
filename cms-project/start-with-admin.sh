#!/bin/sh

echo "Starting application..."

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 10

# Create admin user if it doesn't exist
echo "Creating admin user..."
node scripts/create-admin.js

# Start the main application
echo "Starting main application..."
exec npm start
