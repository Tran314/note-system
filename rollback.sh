#!/bin/bash
# Note System Rollback Script
# Usage: ./rollback.sh [backup-name]

set -e

BACKUP_DIR="/opt/note-system-backups"
PROJECT_DIR="/opt/note-system"

BACKUP_NAME=${1:-}

# Find latest backup if not specified
if [ -z "$BACKUP_NAME" ]; then
    BACKUP_NAME=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz | head -1 | xargs basename)
    echo "🔍 Using latest backup: $BACKUP_NAME"
fi

BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup not found: $BACKUP_FILE"
    echo "📋 Available backups:"
    ls -lt "$BACKUP_DIR"/backup-*.tar.gz | head -10
    exit 1
fi

echo "🔄 Rolling back to $BACKUP_NAME..."

# Stop containers
echo "🛑 Stopping containers..."
cd "$PROJECT_DIR"
docker-compose down

# Restore backup
echo "📦 Restoring backup..."
rm -rf "$PROJECT_DIR"/*
tar -xzf "$BACKUP_FILE" -C "$PROJECT_DIR"

# Start containers
echo "🟢 Starting containers..."
docker-compose up -d

# Health check
echo "⏳ Waiting for services..."
sleep 10

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Rollback completed successfully!"
else
    echo "❌ Health check failed after rollback"
    exit 1
fi