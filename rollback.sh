#!/bin/bash
# Note System Rollback Script
# Usage: ./rollback.sh [backup-name]

set -e

BACKUP_DIR="/opt/note-system-backups"
PROJECT_DIR="/opt/note-system"

BACKUP_NAME=${1:-}

# Find latest backup if not specified
if [ -z "$BACKUP_NAME" ]; then
    BACKUP_NAME=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "")
    if [ -z "$BACKUP_NAME" ]; then
        echo "❌ No backups found in $BACKUP_DIR"
        exit 1
    fi
    echo "🔍 Using latest backup: $BACKUP_NAME"
fi

BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup not found: $BACKUP_FILE"
    echo "📋 Available backups:"
    ls -lt "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -10 || echo "  None"
    exit 1
fi

echo "⚠️  WARNING: This will replace the current project with backup: $BACKUP_NAME"
echo "🔄 Rolling back to $BACKUP_NAME..."

# Stop containers
echo "🛑 Stopping containers..."
cd "$PROJECT_DIR"
docker-compose down || true

# Create a safety backup of current state before restoring
SAFETY_BACKUP="pre-rollback-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "📦 Creating safety backup: $SAFETY_BACKUP"
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/$SAFETY_BACKUP" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    -C "$PROJECT_DIR" . 2>/dev/null || echo "⚠️  Safety backup failed, continuing..."

# Restore backup to a temporary directory first
TEMP_DIR=$(mktemp -d)
echo "📦 Extracting backup to temporary directory..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Verify the backup contains expected files
if [ ! -f "$TEMP_DIR/docker-compose.yml" ] && [ ! -f "$TEMP_DIR/package.json" ]; then
    echo "❌ Backup appears to be invalid (missing key files)"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Move files from temp to project directory
echo "📦 Restoring files..."
rsync -a --delete "$TEMP_DIR/" "$PROJECT_DIR/"
rm -rf "$TEMP_DIR"

# Start containers
echo "🟢 Starting containers..."
cd "$PROJECT_DIR"
docker-compose up -d

# Health check with retry
echo "⏳ Waiting for services..."
MAX_RETRIES=12
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Rollback completed successfully!"
        echo "📦 Safety backup saved as: $BACKUP_DIR/$SAFETY_BACKUP"
        exit 0
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Retry $RETRY_COUNT/$MAX_RETRIES..."
    sleep 5
done

echo "❌ Health check failed after rollback"
echo "📦 Safety backup available at: $BACKUP_DIR/$SAFETY_BACKUP"
exit 1
