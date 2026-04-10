#!/bin/bash
# Note System Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/opt/note-system"
BACKUP_DIR="/opt/note-system-backups"

echo "🚀 Deploying Note System to $ENVIRONMENT..."

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Create backup
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    .

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git checkout main
git pull origin main

# Pull latest Docker images
echo "🐳 Pulling Docker images..."
docker-compose pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Start new containers
echo "🟢 Starting new containers..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check backend health
echo "🔍 Checking backend health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Check frontend health
echo "🔍 Checking frontend health..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

# Cleanup old backups (keep last 7)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete

# Cleanup unused Docker images
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Stop: docker-compose down"