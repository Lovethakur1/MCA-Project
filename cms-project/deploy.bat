@echo off
REM Build and deploy script for MCA CMS (Windows)

echo 🚀 Building and deploying MCA CMS...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Remove old images (optional)
echo 🧹 Cleaning up old images...
docker system prune -f

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service health...
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Some services failed to start. Check logs with: docker-compose logs
    exit /b 1
) else (
    echo ✅ Services are running successfully!
    echo.
    echo 🌐 Application URL: http://localhost:3000
    echo 🗄️  MongoDB URL: mongodb://localhost:27017
    echo.
    echo 📋 To view logs: docker-compose logs -f
    echo 🛑 To stop: docker-compose down
)
