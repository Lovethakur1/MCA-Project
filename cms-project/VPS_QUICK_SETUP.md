# MCA CMS Project - VPS Quick Setup Commands

## 🚀 One-Line Setup (Copy and paste these commands on your VPS)

### Option 1: Download and run setup script directly from your local files
```bash
# First, transfer the setup script to your VPS
# You can use scp, git clone, or copy-paste the content

# Make executable and run
chmod +x quick-vps-setup.sh && sudo ./quick-vps-setup.sh
```

### Option 2: Manual setup commands (if you prefer step by step)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# Configure firewall
sudo ufw allow ssh && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw allow 3000
sudo ufw --force enable
```

### Option 3: Complete automated setup
```bash
# Run these commands in sequence on your VPS:

# 1. Create and run setup script
cat > quick-setup.sh << 'EOF'
#!/bin/bash
set -e
echo "🚀 Quick VPS Setup Starting..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nano vim htop unzip tree net-tools software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban build-essential certbot python3-certbot-nginx

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
pm2 startup | grep "sudo.*pm2" | bash

# Install MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable

# Start fail2ban
sudo systemctl start fail2ban && sudo systemctl enable fail2ban

echo "✅ VPS Setup Complete!"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "MongoDB: Running"
echo "Nginx: Running"
EOF

chmod +x quick-setup.sh && ./quick-setup.sh
```

## 📦 After VPS Setup - Deploy Your App

### Step 1: Clone your project
```bash
cd ~
git clone YOUR_GITHUB_REPO_URL cms-app
cd cms-app
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create environment file
```bash
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/cms_project
PORT=3000
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
EOF
```

### Step 4: Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/cms-app > /dev/null << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /css {
        alias $(pwd)/public/css;
        expires 1y;
    }
    
    location /js {
        alias $(pwd)/public/js;
        expires 1y;
    }
    
    location /media {
        alias $(pwd)/public/media;
        expires 1y;
    }
    
    client_max_body_size 10M;
}
EOF

sudo ln -sf /etc/nginx/sites-available/cms-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Step 5: Start with PM2
```bash
pm2 start app.js --name "cms-app"
pm2 save
```

### Step 6: Check everything is working
```bash
pm2 status
curl http://localhost
```

## 🔍 Verification Commands

```bash
# Check all services
sudo systemctl status mongod nginx
pm2 status

# Check ports
sudo netstat -tlnp | grep -E ':(80|443|3000|27017)'

# Check firewall
sudo ufw status

# View logs
pm2 logs cms-app
sudo tail -f /var/log/nginx/error.log
```

## 🌐 Access Your Application

- **Local IP**: http://YOUR_SERVER_IP
- **Admin Panel**: http://YOUR_SERVER_IP/admin
- **If you have a domain**: Point your domain to the server IP and update Nginx config

## 🔧 Troubleshooting

```bash
# Restart services
sudo systemctl restart mongod nginx
pm2 restart cms-app

# Check logs
journalctl -u mongod -f
journalctl -u nginx -f
pm2 logs cms-app

# Check disk space
df -h

# Check memory
free -h
```
