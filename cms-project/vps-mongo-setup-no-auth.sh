#!/bin/bash

# VPS MongoDB Setup without Authentication
# This script sets up MongoDB on Ubuntu/Debian VPS without authentication

echo "Setting up MongoDB without authentication on VPS..."

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Configure MongoDB without authentication
sudo tee /etc/mongod.conf > /dev/null <<EOF
# mongod.conf - MongoDB configuration file

# Where to store data
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Where to write logging data
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Security (authentication disabled)
# security:
#   authorization: disabled
EOF

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

echo "MongoDB setup completed without authentication!"
echo "MongoDB is accessible at: mongodb://localhost:27017"
echo "Status check: sudo systemctl status mongod"
echo "MongoDB logs: sudo tail -f /var/log/mongodb/mongod.log"
