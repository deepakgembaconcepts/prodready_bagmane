#!/bin/bash

# Database Backup Script
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="bagmane_production"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# PostgreSQL backup
if command -v pg_dump &> /dev/null; then
    echo "Creating PostgreSQL backup..."
    pg_dump $DB_NAME > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    echo "Backup created: db_backup_$TIMESTAMP.sql.gz"
fi

# SQLite backup (if using SQLite)
if [ -f "prisma/dev.db" ]; then
    echo "Creating SQLite backup..."
    cp prisma/dev.db "$BACKUP_DIR/dev_db_backup_$TIMESTAMP.db"
    gzip "$BACKUP_DIR/dev_db_backup_$TIMESTAMP.db"
    echo "Backup created: dev_db_backup_$TIMESTAMP.db.gz"
fi

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
echo "Cleaned up backups older than 30 days"

# Upload to S3 (if configured)
if command -v aws &> /dev/null && [ ! -z "$AWS_BUCKET_NAME" ]; then
    echo "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz" "s3://$AWS_BUCKET_NAME/backups/"
    echo "Uploaded to S3"
fi
