#!/bin/bash

# Ubuntu VPS Setup Script for MCA CMS Project
# Run this script as root or with sudo privileges

set -e  # Exit on any error

echo "🚀 Starting Ubuntu VPS Setup for MCA CMS Project..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    nano \
    vim \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    tree \
    net-tools

# Install Node.js (LTS version)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js installed: $node_version"
print_status "NPM installed: $npm_version"

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add current user to docker group
if [ "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    print_status "Added $SUDO_USER to docker group"
else
    print_warning "Running as root. Consider creating a non-root user."
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify Docker installation
docker_version=$(docker --version)
compose_version=$(docker-compose --version)
print_status "Docker installed: $docker_version"
print_status "Docker Compose installed: $compose_version"

# Configure firewall
print_status "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000  # For Node.js app
# ufw allow 27017  # MongoDB - only if you need external access
ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
print_status "Creating application directory..."
mkdir -p /opt/mca-cms
chown -R ${SUDO_USER:-root}:${SUDO_USER:-root} /opt/mca-cms

# Install PM2 (Process Manager for Node.js) - Alternative to Docker
print_status "Installing PM2..."
npm install -g pm2

# Create swap file (if not exists and RAM < 2GB)
MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ $MEMORY -lt 2048 ] && [ ! -f /swapfile ]; then
    print_status "Creating swap file (1GB)..."
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
fi

# Configure automatic updates
print_status "Configuring automatic security updates..."
apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# Install Nginx (optional)
read -p "Do you want to install Nginx? (y/n): " install_nginx
if [[ $install_nginx =~ ^[Yy]$ ]]; then
    print_status "Installing Nginx..."
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    ufw allow 'Nginx Full'
fi

# Install Certbot for SSL (optional)
if [[ $install_nginx =~ ^[Yy]$ ]]; then
    read -p "Do you want to install Certbot for SSL certificates? (y/n): " install_certbot
    if [[ $install_certbot =~ ^[Yy]$ ]]; then
        print_status "Installing Certbot..."
        snap install core; snap refresh core
        snap install --classic certbot
        ln -sf /snap/bin/certbot /usr/bin/certbot
    fi
fi

# Set timezone
print_status "Setting timezone..."
timedatectl set-timezone UTC

# Configure Git (optional)
read -p "Configure Git? Enter your name (or press enter to skip): " git_name
if [ ! -z "$git_name" ]; then
    read -p "Enter your email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    print_status "Git configured for user: $git_name"
fi

# Create deployment user (optional)
read -p "Create a deployment user 'deploy'? (y/n): " create_deploy_user
if [[ $create_deploy_user =~ ^[Yy]$ ]]; then
    if ! id "deploy" &>/dev/null; then
        adduser --gecos "" deploy
        usermod -aG sudo deploy
        usermod -aG docker deploy
        print_status "Created user 'deploy' with sudo and docker privileges"
    else
        print_warning "User 'deploy' already exists"
    fi
fi

# Clean up
print_status "Cleaning up..."
apt autoremove -y
apt autoclean
rm -f get-docker.sh

# Final status
print_status "=== VPS Setup Complete! ==="
echo ""
echo -e "${GREEN}✅ System updated and secured${NC}"
echo -e "${GREEN}✅ Docker and Docker Compose installed${NC}"
echo -e "${GREEN}✅ Node.js and NPM installed${NC}"
echo -e "${GREEN}✅ Firewall configured${NC}"
echo -e "${GREEN}✅ Fail2ban configured${NC}"
echo -e "${GREEN}✅ PM2 installed${NC}"
if [[ $install_nginx =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Nginx installed${NC}"
fi
echo ""
print_warning "IMPORTANT: Please reboot the server to ensure all changes take effect:"
print_warning "sudo reboot"
echo ""
print_status "After reboot, you can deploy your application to: /opt/mca-cms"
echo ""
print_status "Next steps:"
echo "1. Reboot the server: sudo reboot"
echo "2. Clone your repository: git clone <your-repo> /opt/mca-cms"
echo "3. Navigate to project: cd /opt/mca-cms/cms-project"
echo "4. Deploy with Docker: ./deploy.sh"
echo ""
print_status "Server Information:"
echo "IP Address: $(curl -s ifconfig.me)"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Memory: $(free -h | awk 'NR==2{print $2}')"
echo "Storage: $(df -h / | awk 'NR==2{print $4" available"}')"
