#!/bin/bash

# DrawDB PostgreSQL Backup Script
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-drawdb}"
POSTGRES_USER="${POSTGRES_USER:-drawdb}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/drawdb_backup_$TIMESTAMP.sql"

echo "Starting backup at $(date)"
echo "Backup file: $BACKUP_FILE"

# Create database backup
export PGPASSWORD="$POSTGRES_PASSWORD"
pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_FILE.custom"

# Also create a plain SQL backup for easier inspection
pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --format=plain \
  --file="$BACKUP_FILE"

echo "Backup completed successfully"

# Compress the plain SQL backup
gzip "$BACKUP_FILE"
echo "Backup compressed: $BACKUP_FILE.gz"

# Clean up old backups (keep only files newer than RETENTION_DAYS)
if [ "$RETENTION_DAYS" -gt 0 ]; then
  echo "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "drawdb_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
  find "$BACKUP_DIR" -name "drawdb_backup_*.sql.custom" -type f -mtime +$RETENTION_DAYS -delete
  echo "Cleanup completed"
fi

# List current backups
echo "Current backups:"
ls -la "$BACKUP_DIR"/drawdb_backup_*

echo "Backup process finished at $(date)"