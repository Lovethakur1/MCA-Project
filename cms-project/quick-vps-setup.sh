#!/bin/bash

# Quick VPS Setup Script for MCA CMS Project
# For Ubuntu 24.04.3 LTS (AWS EC2)
# Run this script after connecting to your VPS

set -e  # Exit on any error

echo "🚀 Starting Quick VPS Setup for MCA CMS Project..."
echo "===================================================="
echo "Target OS: Ubuntu 24.04.3 LTS"
echo "Architecture: x86-64"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root (we'll use sudo for most commands)
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider creating a non-root user for better security."
   USER_HOME="/root"
   CURRENT_USER="root"
else
   USER_HOME="/home/$USER"
   CURRENT_USER="$USER"
fi

print_status "Current user: $CURRENT_USER"
print_status "Home directory: $USER_HOME"

# Step 1: System Update
print_step "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated successfully!"

# Step 2: Install Essential Packages
print_step "2. Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    nano \
    vim \
    htop \
    unzip \
    zip \
    tree \
    net-tools \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    build-essential \
    certbot \
    python3-certbot-nginx

print_success "Essential packages installed!"

# Step 3: Install Node.js 18.x LTS
print_step "3. Installing Node.js 18.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION and npm $NPM_VERSION installed!"

# Step 4: Install PM2 Process Manager
print_step "4. Installing PM2 process manager..."
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup | grep "sudo.*pm2" | bash
print_success "PM2 installed and configured for startup!"

# Step 5: Install MongoDB 7.0 (latest stable for Ubuntu 24.04)
print_step "5. Installing MongoDB 7.0..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB installation
if sudo systemctl is-active --quiet mongod; then
    print_success "MongoDB installed and running!"
else
    print_error "MongoDB installation failed!"
    exit 1
fi

# Step 6: Install Nginx
print_step "6. Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx installation
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx installed and running!"
else
    print_error "Nginx installation failed!"
    exit 1
fi

# Step 7: Configure Firewall
print_step "7. Configuring UFW firewall..."

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important!)
sudo ufw allow ssh
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Node.js app port temporarily
sudo ufw allow 3000

# Enable firewall
sudo ufw --force enable

print_success "Firewall configured successfully!"

# Step 8: Configure Fail2Ban
print_step "8. Configuring Fail2Ban..."
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
print_success "Fail2Ban configured and started!"

# Step 9: Create application directory
print_step "9. Creating application directory..."
APP_DIR="$USER_HOME/cms-app"
sudo mkdir -p $APP_DIR
sudo chown $CURRENT_USER:$CURRENT_USER $APP_DIR
print_success "Application directory created at $APP_DIR"

# Step 10: Display system information
print_step "10. System Setup Complete - Summary:"
echo "=============================================="
echo "🖥️  Server Information:"
echo "   - OS: $(lsb_release -d | cut -f2)"
echo "   - Architecture: $(uname -m)"
echo "   - Kernel: $(uname -r)"
echo ""
echo "📦 Installed Software:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - PM2: $(pm2 --version)"
echo "   - MongoDB: $(mongod --version | head -1)"
echo "   - Nginx: $(nginx -v 2>&1)"
echo ""
echo "🔥 Active Services:"
sudo systemctl is-active mongod && echo "   ✓ MongoDB: Running" || echo "   ✗ MongoDB: Not running"
sudo systemctl is-active nginx && echo "   ✓ Nginx: Running" || echo "   ✗ Nginx: Not running"
sudo systemctl is-active fail2ban && echo "   ✓ Fail2Ban: Running" || echo "   ✗ Fail2Ban: Not running"
echo ""
echo "🌐 Network Ports:"
echo "   - SSH: 22 (open)"
echo "   - HTTP: 80 (open)"
echo "   - HTTPS: 443 (open)"
echo "   - App: 3000 (open, temporary)"
echo ""
echo "📁 Application Directory: $APP_DIR"
echo "=============================================="

print_success "VPS setup completed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Clone your CMS project to $APP_DIR"
echo "2. Install project dependencies with 'npm install'"
echo "3. Configure environment variables"
echo "4. Set up Nginx reverse proxy"
echo "5. Configure SSL with Let's Encrypt"
echo "6. Deploy with PM2"
echo ""
echo "📖 For detailed deployment instructions, check:"
echo "   - VPS_DEPLOYMENT_GUIDE.md"
echo "   - Use vps-deploy-no-docker.sh for deployment"
