#!/bin/bash

# MCA CMS - VPS Deployment Script (No Docker)
# Run this script on your Ubuntu VPS

set -e

echo "🚀 MCA CMS VPS Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

print_status "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Step 2: Installing essential packages..."
sudo apt install -y curl wget git nano vim htop unzip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban tree \
    net-tools build-essential

print_status "Step 3: Installing Node.js 18.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

print_status "Step 4: Installing PM2 process manager..."
sudo npm install -g pm2

print_status "Step 5: Installing MongoDB 6.0..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

print_status "Step 6: Starting and enabling MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

print_status "Step 7: Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

print_status "Step 8: Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable

print_status "Step 9: Starting Fail2Ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

print_status "Step 10: Creating application directory..."
sudo mkdir -p /opt/mca-cms
sudo chown -R $USER:$USER /opt/mca-cms

print_status "Step 11: Setting up MongoDB database..."
sleep 5  # Wait for MongoDB to fully start

# Create MongoDB user
mongosh --eval "
use mca-cms
db.createUser({
  user: 'cms_user',
  pwd: 'cms_password',
  roles: [
    { role: 'readWrite', db: 'mca-cms' }
  ]
})
"

print_status "✅ Base system setup completed!"
echo
echo "📋 Next Steps:"
echo "1. Upload your application files to /opt/mca-cms/"
echo "2. Navigate to your app directory: cd /opt/mca-cms/cms-project"
echo "3. Install dependencies: npm install --production"
echo "4. Create .env file with your configuration"
echo "5. Create admin user: node scripts/create-admin.js"
echo "6. Start with PM2: pm2 start ecosystem.config.js"
echo "7. Configure Nginx reverse proxy"
echo
echo "🔗 Access your app at: http://$(curl -s ifconfig.me):3000"
echo "🔗 Admin panel: http://$(curl -s ifconfig.me):3000/admin"
echo
print_status "Deployment script completed successfully!"

# Display installed versions
echo
echo "📦 Installed Software Versions:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "MongoDB: $(mongod --version | head -1)"
echo "Nginx: $(nginx -v 2>&1)"
