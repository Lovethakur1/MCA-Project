# MCA CMS Docker Deployment Guide

## Overview
This Docker setup provides a complete containerized environment for the MCA CMS application with MongoDB database.

## Prerequisites
- Docker installed on your VPS
- Docker Compose installed
- Git (to clone the repository)

## Files Structure
```
cms-project/
├── Dockerfile              # Node.js application container
├── docker-compose.yml      # Multi-container orchestration
├── mongo-init.js           # MongoDB initialization script
├── nginx.conf              # Nginx reverse proxy configuration
├── .dockerignore           # Files to ignore during Docker build
├── .env.production         # Production environment variables
├── deploy.sh               # Linux deployment script
├── deploy.bat              # Windows deployment script
└── DOCKER_README.md        # This file
```

## Quick Start

### 1. Clone and prepare the application
```bash
git clone <your-repo-url>
cd cms-project
```

### 2. Configure environment variables
Edit `.env.production` and update:
- `SESSION_SECRET` - Use a strong, random secret
- `MONGO_INITDB_ROOT_PASSWORD` - Change the MongoDB admin password
- Update database credentials in `mongo-init.js`

### 3. Deploy

#### On Linux/macOS:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### On Windows:
```cmd
deploy.bat
```

#### Manual deployment:
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Services

### 1. MongoDB (mongodb)
- **Port**: 27017
- **Database**: mca-cms
- **Admin User**: admin / adminpassword
- **App User**: cms_user / cms_password
- **Data Volume**: Persistent storage in `mongodb_data` volume

### 2. Node.js Application (mca-cms-app)
- **Port**: 3000
- **Environment**: Production
- **Dependencies**: Connects to MongoDB container

### 3. Nginx Reverse Proxy (nginx)
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Purpose**: Load balancing, static file serving, SSL termination
- **Configuration**: See `nginx.conf`

## Production Deployment on VPS

### 1. Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- 2GB+ RAM
- 20GB+ storage
- Docker and Docker Compose installed

### 2. Install Docker (Ubuntu)
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 3. Deploy on VPS
```bash
# Clone repository
git clone <your-repo-url>
cd cms-project

# Make deployment script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

### 4. Configure Domain (Optional)
Update `nginx.conf` with your domain name:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 5. SSL Certificate (Production)
For HTTPS in production, use Let's Encrypt:
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

### Required Variables (.env.production)
- `NODE_ENV=production`
- `PORT=3000`
- `MONGODB_URI=mongodb://cms_user:cms_password@mongodb:27017/mca-cms`
- `SESSION_SECRET=your-secret-key`

### MongoDB Variables
- `MONGO_INITDB_ROOT_USERNAME=admin`
- `MONGO_INITDB_ROOT_PASSWORD=adminpassword`
- `MONGO_INITDB_DATABASE=mca-cms`

## Data Persistence

### MongoDB Data
Data is stored in a Docker volume named `mongodb_data`. To backup:
```bash
# Create backup
docker exec mca-cms-mongodb mongodump --uri="mongodb://admin:adminpassword@localhost:27017/mca-cms" --out=/backup

# Copy backup from container
docker cp mca-cms-mongodb:/backup ./backup
```

### Uploaded Files
The `/public/uploads` directory is mounted as a volume to persist user uploads.

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mca-cms-app
docker-compose logs -f mongodb
```

### Check Status
```bash
# Service status
docker-compose ps

# Resource usage
docker stats
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   
   # Stop the service or change port in docker-compose.yml
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Verify connection string in app logs
   docker-compose logs mca-cms-app
   ```

3. **Permission issues**
   ```bash
   # Fix ownership of volumes
   sudo chown -R 1001:1001 ./public/uploads
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -a

# Restart
docker-compose up --build -d
```

## Security Considerations

1. **Change default passwords** in `.env.production` and `mongo-init.js`
2. **Use strong session secrets**
3. **Enable HTTPS** with SSL certificates
4. **Regular updates** of Docker images
5. **Firewall configuration** to restrict access
6. **Regular backups** of database and uploads

## Scaling

For high traffic, consider:
- Multiple app instances behind load balancer
- MongoDB replica set
- Separate uploads to cloud storage (AWS S3, etc.)
- Redis for session storage

## Support

For issues:
1. Check application logs: `docker-compose logs mca-cms-app`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify environment variables
4. Check Docker and system resources
