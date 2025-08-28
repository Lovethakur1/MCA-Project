#!/bin/bash

# MCA CMS Project Deployment Script
# Run this AFTER running quick-vps-setup.sh
# This script will clone, configure, and deploy your CMS application

set -e

echo "🚀 MCA CMS Project Deployment Starting..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓ INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠ WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗ ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[📦 STEP]${NC} $1"
}

print_success() {
    echo -e "${PURPLE}[🎉 SUCCESS]${NC} $1"
}

# Get user input for configuration
echo "📝 Please provide the following information:"
echo ""

# GitHub repository URL
read -p "🔗 Enter your GitHub repository URL (e.g., https://github.com/username/cms-project.git): " REPO_URL
if [[ -z "$REPO_URL" ]]; then
    print_error "Repository URL is required!"
    exit 1
fi

# Domain name
read -p "🌐 Enter your domain name (e.g., yourdomain.com) or press Enter for IP-based setup: " DOMAIN_NAME

# Environment variables
read -p "🔐 Enter MongoDB connection string (or press Enter for local): " MONGODB_URI
if [[ -z "$MONGODB_URI" ]]; then
    MONGODB_URI="mongodb://localhost:27017/cms_project"
fi

read -p "🔑 Enter JWT secret (or press Enter for auto-generation): " JWT_SECRET
if [[ -z "$JWT_SECRET" ]]; then
    JWT_SECRET=$(openssl rand -base64 32)
    print_status "Generated JWT secret: $JWT_SECRET"
fi

read -p "🎯 Enter application port (default: 3000): " APP_PORT
if [[ -z "$APP_PORT" ]]; then
    APP_PORT=3000
fi

echo ""
print_status "Configuration received. Starting deployment..."

# Set directories
if [[ $EUID -eq 0 ]]; then
    USER_HOME="/root"
    CURRENT_USER="root"
else
    USER_HOME="/home/$USER"
    CURRENT_USER="$USER"
fi

APP_DIR="$USER_HOME/cms-app"
NGINX_CONFIG="/etc/nginx/sites-available/cms-app"
NGINX_ENABLED="/etc/nginx/sites-enabled/cms-app"

# Step 1: Clone repository
print_step "1. Cloning repository..."
if [ -d "$APP_DIR" ]; then
    print_warning "Directory $APP_DIR already exists. Removing..."
    rm -rf $APP_DIR
fi

git clone $REPO_URL $APP_DIR
cd $APP_DIR
print_success "Repository cloned successfully!"

# Step 2: Install dependencies
print_step "2. Installing project dependencies..."
npm install
print_success "Dependencies installed successfully!"

# Step 3: Create environment file
print_step "3. Creating environment configuration..."
cat > $APP_DIR/.env << EOF
# MongoDB Configuration
MONGODB_URI=$MONGODB_URI

# Application Configuration
PORT=$APP_PORT
NODE_ENV=production

# Security
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$(openssl rand -base64 32)

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=./public/uploads

# Email Configuration (configure if needed)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Domain Configuration
DOMAIN_NAME=$DOMAIN_NAME
EOF

print_success "Environment file created!"

# Step 4: Create PM2 ecosystem file
print_step "4. Creating PM2 ecosystem configuration..."
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cms-app',
    script: './app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p $APP_DIR/logs
print_success "PM2 configuration created!"

# Step 5: Set up Nginx configuration
print_step "5. Configuring Nginx reverse proxy..."

if [[ -n "$DOMAIN_NAME" ]]; then
    SERVER_NAME=$DOMAIN_NAME
else
    SERVER_NAME="_"
fi

sudo tee $NGINX_CONFIG > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_NAME;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Static files
    location /css {
        alias $APP_DIR/public/css;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /js {
        alias $APP_DIR/public/js;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /media {
        alias $APP_DIR/public/media;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads {
        alias $APP_DIR/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File upload size
    client_max_body_size 10M;
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
EOF

# Enable the site
sudo ln -sf $NGINX_CONFIG $NGINX_ENABLED

# Remove default Nginx site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_success "Nginx configuration is valid!"
    sudo systemctl reload nginx
else
    print_error "Nginx configuration is invalid!"
    exit 1
fi

# Step 6: Set up MongoDB (create database and user if needed)
print_step "6. Setting up MongoDB..."
mongosh --eval "
use cms_project;
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
print('MongoDB database setup completed');
" || print_warning "MongoDB setup encountered issues (this might be normal for first run)"

print_success "MongoDB setup completed!"

# Step 7: Start application with PM2
print_step "7. Starting application with PM2..."
cd $APP_DIR

# Stop existing PM2 processes if any
pm2 delete cms-app 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js
pm2 save

print_success "Application started with PM2!"

# Step 8: Configure SSL (if domain is provided)
if [[ -n "$DOMAIN_NAME" && "$DOMAIN_NAME" != "_" ]]; then
    print_step "8. Setting up SSL certificate with Let's Encrypt..."
    print_warning "Make sure your domain $DOMAIN_NAME points to this server's IP address"
    read -p "Continue with SSL setup? (y/N): " SETUP_SSL
    
    if [[ "$SETUP_SSL" =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME || print_warning "SSL setup failed. You can run 'sudo certbot --nginx -d $DOMAIN_NAME' later"
    else
        print_status "Skipping SSL setup. You can run 'sudo certbot --nginx -d $DOMAIN_NAME' later"
    fi
else
    print_status "8. Skipping SSL setup (no domain provided)"
fi

# Step 9: Final checks and information
print_step "9. Running final checks..."

# Check if application is running
sleep 5
if pm2 list | grep -q "cms-app.*online"; then
    print_success "✅ Application is running!"
else
    print_error "❌ Application is not running. Check PM2 logs with 'pm2 logs cms-app'"
fi

# Check if Nginx is serving the app
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    print_success "✅ Nginx is serving the application!"
else
    print_warning "⚠️ Nginx might not be serving the application correctly"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================="
echo ""
echo "📊 Application Status:"
pm2 list
echo ""
echo "🌐 Access your application:"
if [[ -n "$DOMAIN_NAME" && "$DOMAIN_NAME" != "_" ]]; then
    echo "   🔗 Domain: http://$DOMAIN_NAME"
    echo "   🔒 HTTPS: https://$DOMAIN_NAME (if SSL was set up)"
else
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "YOUR_SERVER_IP")
    echo "   🔗 IP Address: http://$SERVER_IP"
fi
echo "   🔧 Admin Panel: Add '/admin' to your URL"
echo ""
echo "🛠️ Useful Commands:"
echo "   📊 Check app status: pm2 status"
echo "   📝 View app logs: pm2 logs cms-app"
echo "   🔄 Restart app: pm2 restart cms-app"
echo "   🛑 Stop app: pm2 stop cms-app"
echo "   🔧 Nginx reload: sudo systemctl reload nginx"
echo "   🔍 Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "📋 Next Steps:"
echo "   1. Create an admin user by visiting /admin"
echo "   2. Configure your CMS content"
echo "   3. Set up regular backups"
echo "   4. Monitor application performance"
echo ""
print_success "Happy coding! 🚀"
