# Ubuntu VPS Setup Guide for MCA CMS Project

## 🚀 Quick Setup Commands

### 1. Connect to Your VPS
```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### 2. Download and Run Setup Script
```bash
# Download the setup script
wget https://raw.githubusercontent.com/your-username/your-repo/main/cms-project/vps-setup.sh

# Make it executable
chmod +x vps-setup.sh

# Run the setup script
sudo ./vps-setup.sh
```

### 3. Manual Setup Commands (Alternative)

If you prefer to run commands manually:

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Essential Packages
```bash
sudo apt install -y curl wget git nano vim htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban tree net-tools
```

#### Install Node.js (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Configure Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable
```

#### Install Nginx (Optional)
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo ufw allow 'Nginx Full'
```

#### Install Certbot for SSL (Optional)
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## 📋 Step-by-Step Deployment Process

### 1. Initial Server Setup
```bash
# Connect to your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Create a new user (recommended instead of using root)
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Switch to new user
su - deploy
```

### 2. Install Required Software
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 3. Setup Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable
sudo ufw status
```

### 4. Clone and Deploy Your Project
```bash
# Create application directory
sudo mkdir -p /opt/mca-cms
sudo chown -R $USER:$USER /opt/mca-cms

# Clone your repository
git clone https://github.com/your-username/MCA-Project.git /opt/mca-cms
cd /opt/mca-cms/cms-project

# Make deployment script executable
chmod +x deploy.sh

# Update environment variables
nano .env.production
# Update SESSION_SECRET and MongoDB passwords

# Deploy the application
./deploy.sh
```

### 5. Verify Deployment
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs -f mca-cms-app

# Test the application
curl http://localhost:3000
```

## 🔧 Domain Setup (Optional)

### 1. Point Domain to VPS
Add an A record in your domain DNS settings:
- **Type**: A
- **Name**: @ (or subdomain)
- **Value**: Your VPS IP address

### 2. Configure Nginx for Domain
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mca-cms

# Add this configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/mca-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Setup SSL Certificate
```bash
# Install Certbot
sudo snap install --classic certbot

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is automatically configured
sudo certbot renew --dry-run
```

## 🔒 Security Hardening

### 1. SSH Key Authentication (Recommended)
```bash
# On your local machine, generate SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id deploy@your-vps-ip

# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh
```

### 2. Install Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates
```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring Commands

### Check System Status
```bash
# System resources
htop
free -h
df -h

# Docker containers
docker ps
docker stats

# Application logs
docker-compose logs -f mca-cms-app

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Commands
```bash
# Backup MongoDB
docker exec mca-cms-mongodb mongodump --uri="mongodb://admin:adminpassword@localhost:27017/mca-cms" --out=/backup
docker cp mca-cms-mongodb:/backup ./backup-$(date +%Y%m%d)

# Backup uploaded files
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /opt/mca-cms/cms-project/public/uploads
```

## 🚨 Troubleshooting

### Common Issues
```bash
# Check if Docker is running
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check firewall status
sudo ufw status

# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Reset Docker containers
cd /opt/mca-cms/cms-project
docker-compose down
docker-compose up --build -d
```

### Logs to Check
```bash
# System logs
sudo journalctl -f

# Docker logs
docker-compose logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## ✅ Verification Checklist

After setup, verify:
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured and active
- [ ] Application accessible on port 3000
- [ ] MongoDB container running
- [ ] SSL certificate installed (if using domain)
- [ ] Automatic updates configured
- [ ] Backups scheduled

Your MCA CMS should now be accessible at `http://your-vps-ip:3000` or `https://yourdomain.com`!
