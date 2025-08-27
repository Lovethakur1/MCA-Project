# VPS Deployment Guide (Without Docker) - MCA CMS

## 🚀 Prerequisites & System Requirements

### VPS Specifications (Minimum)
- **RAM:** 1GB (2GB recommended)
- **Storage:** 20GB SSD
- **OS:** Ubuntu 20.04/22.04 LTS or CentOS 8/9
- **CPU:** 1 vCPU (2 vCPU recommended)

## 📦 Step 1: Install Required Software

### 1.1 Connect to Your VPS
```bash
ssh root@your-vps-ip
# or if you have a user account:
ssh your-username@your-vps-ip
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Essential Packages
```bash
sudo apt install -y curl wget git nano vim htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban tree net-tools build-essential
```

### 1.4 Install Node.js (LTS - v18.x)
```bash
# Download and install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.5 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

### 1.6 Install MongoDB
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Reload package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 1.7 Install Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

## 🔐 Step 2: Security Setup

### 2.1 Configure Firewall
```bash
# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Node.js app port (3000) temporarily
sudo ufw allow 3000

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### 2.2 Setup Fail2Ban (Brute Force Protection)
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📁 Step 3: Deploy Your Application

### 3.1 Create Application Directory
```bash
sudo mkdir -p /opt/mca-cms
sudo chown -R $USER:$USER /opt/mca-cms
cd /opt/mca-cms
```

### 3.2 Clone Your Repository
```bash
# Clone your project
git clone https://github.com/your-username/MCA-Project.git .
cd cms-project

# Or upload your files via SCP
# scp -r ./cms-project your-username@your-vps-ip:/opt/mca-cms/
```

### 3.3 Install Dependencies
```bash
npm install --production
```

### 3.4 Setup Environment Variables
```bash
# Create production environment file
cp .env.example .env
nano .env
```

Add the following to your `.env` file:
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mca-cms
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-palindrome#9943
ADMIN_EMAIL=admin@palindrome.com
ADMIN_PASSWORD=palindrome#9943
```

### 3.5 Setup MongoDB Database and User
```bash
# Connect to MongoDB
mongosh

# Create database and user
use mca-cms

db.createUser({
  user: "cms_user",
  pwd: "cms_password",
  roles: [
    { role: "readWrite", db: "mca-cms" }
  ]
})

# Exit MongoDB shell
exit
```

### 3.6 Create Admin User
```bash
# Run the admin creation script
node scripts/create-admin.js
```

## 🔄 Step 4: Process Management with PM2

### 4.1 Create PM2 Configuration
```bash
nano ecosystem.config.js
```

Add the following content:
```javascript
module.exports = {
  apps: [{
    name: 'mca-cms',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 4.2 Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check application status
pm2 status
pm2 logs mca-cms
```

## 🌐 Step 5: Configure Nginx Reverse Proxy

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/mca-cms
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

    # Serve static files directly
    location /css/ {
        alias /opt/mca-cms/cms-project/public/css/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /js/ {
        alias /opt/mca-cms/cms-project/public/js/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /opt/mca-cms/cms-project/public/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Enable Nginx Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mca-cms /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 Step 6: SSL Certificate (Optional but Recommended)

### 6.1 Install Certbot
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 6.2 Obtain SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## ✅ Step 7: Verification and Testing

### 7.1 Check All Services
```bash
# Check PM2 status
pm2 status

# Check MongoDB status
sudo systemctl status mongod

# Check Nginx status
sudo systemctl status nginx

# Check application logs
pm2 logs mca-cms

# Check system resources
htop
```

### 7.2 Test Your Application
```bash
# Test locally
curl http://localhost:3000

# Test via domain (if configured)
curl http://your-domain.com
```

## 🔧 Step 8: Maintenance Commands

### 8.1 Update Application
```bash
cd /opt/mca-cms/cms-project
git pull origin main
npm install --production
pm2 restart mca-cms
```

### 8.2 View Logs
```bash
# PM2 logs
pm2 logs mca-cms

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### 8.3 Backup Database
```bash
# Create backup
mongodump --db mca-cms --out /opt/backups/$(date +%Y%m%d_%H%M%S)

# Restore backup
mongorestore --db mca-cms /path/to/backup/mca-cms
```

## 🎯 Final Checklist

✅ Node.js 18.x installed
✅ MongoDB 6.0 installed and running
✅ PM2 process manager installed
✅ Nginx reverse proxy configured
✅ Firewall configured
✅ Application deployed and running
✅ Admin user created
✅ SSL certificate installed (optional)

## 🌍 Access Your Application

- **Main Site:** http://your-domain.com (or http://your-vps-ip)
- **Admin Panel:** http://your-domain.com/admin
- **Login Credentials:**
  - Email: admin@palindrome.com
  - Password: palindrome#9943

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs mca-cms

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Restart application
pm2 restart mca-cms
```

### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```
