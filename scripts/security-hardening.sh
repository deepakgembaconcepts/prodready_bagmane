#!/bin/bash

# Bagmane Asset Management - Security Hardening Script
# This script implements security best practices for production deployment

set -e

echo "🔐 Bagmane AMS - Security Hardening Script"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root (for some operations)
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}⚠️  Running as root. Some operations will be skipped.${NC}"
fi

echo "📋 Security Checklist:"
echo ""

# 1. Generate strong secrets
echo "1️⃣  Generating strong secrets..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo -e "${GREEN}✅ Generated JWT_SECRET (128 chars)${NC}"
echo -e "${GREEN}✅ Generated SESSION_SECRET (64 chars)${NC}"
echo ""
echo "Add these to your .env.production file:"
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

# 2. Check npm vulnerabilities
echo "2️⃣  Checking for npm vulnerabilities..."
npm audit --production || echo -e "${YELLOW}⚠️  Vulnerabilities found. Run 'npm audit fix' to resolve.${NC}"
echo ""

# 3. Create necessary directories
echo "3️⃣  Creating secure directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p backups

# Set proper permissions
chmod 750 logs
chmod 750 uploads
chmod 750 backups

echo -e "${GREEN}✅ Created and secured directories${NC}"
echo ""

# 4. Create .gitignore entries for sensitive files
echo "4️⃣  Updating .gitignore for sensitive files..."
cat >> .gitignore << 'EOF'

# Environment files
.env.production
.env.local
.env.*.local

# Logs
logs/
*.log

# Uploads
uploads/

# Backups
backups/

# Database
*.db
*.db-journal

# Secrets
secrets/
*.pem
*.key
*.crt
EOF

echo -e "${GREEN}✅ Updated .gitignore${NC}"
echo ""

# 5. Create security headers configuration for Nginx
echo "5️⃣  Creating Nginx security configuration..."
cat > nginx-security.conf << 'EOF'
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://aistudiocdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://aistudiocdn.com;" always;

# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# Hide Nginx version
server_tokens off;
EOF

echo -e "${GREEN}✅ Created nginx-security.conf${NC}"
echo "   Copy this to /etc/nginx/conf.d/ on your production server"
echo ""

# 6. Create PM2 ecosystem file with security settings
echo "6️⃣  Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bagmane-ams',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};
EOF

echo -e "${GREEN}✅ Created ecosystem.config.js${NC}"
echo ""

# 7. Create database backup script
echo "7️⃣  Creating automated backup script..."
cat > scripts/backup-database.sh << 'EOF'
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
EOF

chmod +x scripts/backup-database.sh
echo -e "${GREEN}✅ Created backup script${NC}"
echo ""

# 8. Create health check script
echo "8️⃣  Creating health check script..."
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health Check Script
API_URL="${API_URL:-http://localhost:3001}"

# Check if server is responding
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Server is healthy (HTTP $HTTP_CODE)"
    exit 0
else
    echo "❌ Server is unhealthy (HTTP $HTTP_CODE)"
    exit 1
fi
EOF

chmod +x scripts/health-check.sh
echo -e "${GREEN}✅ Created health check script${NC}"
echo ""

# 9. Security recommendations
echo "9️⃣  Security Recommendations:"
echo ""
echo -e "${BLUE}📌 Immediate Actions:${NC}"
echo "   1. Update .env.production with generated secrets above"
echo "   2. Run: npm audit fix --force"
echo "   3. Enable HTTPS with SSL certificate (Let's Encrypt)"
echo "   4. Configure firewall (UFW/iptables)"
echo "   5. Set up fail2ban for SSH protection"
echo ""
echo -e "${BLUE}📌 Database Security:${NC}"
echo "   1. Use strong database password"
echo "   2. Restrict database access to localhost only"
echo "   3. Enable database SSL connections"
echo "   4. Regular automated backups (use scripts/backup-database.sh)"
echo ""
echo -e "${BLUE}📌 Application Security:${NC}"
echo "   1. Keep dependencies updated (npm update)"
echo "   2. Use Helmet.js (already installed)"
echo "   3. Implement rate limiting (already installed)"
echo "   4. Enable CORS only for your domain"
echo "   5. Use secure session cookies"
echo ""
echo -e "${BLUE}📌 Server Security:${NC}"
echo "   1. Disable root SSH login"
echo "   2. Use SSH keys instead of passwords"
echo "   3. Keep system updated (apt update && apt upgrade)"
echo "   4. Configure firewall (allow only 80, 443, 22)"
echo "   5. Set up monitoring (Sentry, New Relic, etc.)"
echo ""

echo -e "${GREEN}✅ Security hardening complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and update .env.production"
echo "  2. Test in staging environment"
echo "  3. Deploy to production"
echo ""
