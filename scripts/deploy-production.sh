#!/bin/bash

# Bagmane Asset Management - Production Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Bagmane AMS - Production Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/var/www/bagmane-ams"
BACKUP_DIR="$APP_DIR/backups"
DEPLOY_USER="bagmane"

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo ""

# 1. Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo "   Create it from .env.production.template"
    exit 1
fi
echo -e "${GREEN}✅ Environment file exists${NC}"

# 2. Check if all required environment variables are set
required_vars=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.production; then
        echo -e "${RED}❌ Missing required variable: $var${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ Required environment variables set${NC}"

# 3. Run tests
echo ""
echo -e "${BLUE}🧪 Running tests...${NC}"
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test || {
        echo -e "${RED}❌ Tests failed!${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  No tests configured${NC}"
fi

# 4. Build application
echo ""
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

# 5. Create backup of current deployment
echo ""
echo -e "${BLUE}💾 Creating backup...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -d "$APP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" . 2>/dev/null || true
    echo -e "${GREEN}✅ Backup created: backup_$TIMESTAMP.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠️  No existing deployment to backup${NC}"
fi

# 6. Database migration
echo ""
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations complete${NC}"

# 7. Copy files to production directory
echo ""
echo -e "${BLUE}📦 Deploying files...${NC}"
# This would typically be done via rsync or scp
# rsync -avz --delete dist/ $DEPLOY_USER@server:$APP_DIR/dist/
echo -e "${YELLOW}⚠️  Manual step: Copy files to production server${NC}"
echo "   rsync -avz --delete dist/ $DEPLOY_USER@server:$APP_DIR/dist/"
echo "   rsync -avz server.js $DEPLOY_USER@server:$APP_DIR/"
echo "   rsync -avz package*.json $DEPLOY_USER@server:$APP_DIR/"

# 8. Install production dependencies
echo ""
echo -e "${BLUE}📚 Installing production dependencies...${NC}"
npm ci --only=production
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 9. Restart application
echo ""
echo -e "${BLUE}🔄 Restarting application...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js --env production
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Install with: npm install -g pm2${NC}"
fi

# 10. Health check
echo ""
echo -e "${BLUE}🏥 Running health check...${NC}"
sleep 5  # Wait for app to start
if ./scripts/health-check.sh; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo "   Check logs: pm2 logs bagmane-ams"
    echo "   Rollback: tar -xzf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $APP_DIR"
    exit 1
fi

# 11. Post-deployment tasks
echo ""
echo -e "${BLUE}📊 Post-deployment tasks${NC}"
echo ""
echo "1. Monitor logs:"
echo "   pm2 logs bagmane-ams"
echo ""
echo "2. Monitor metrics:"
echo "   pm2 monit"
echo ""
echo "3. Check application:"
echo "   curl https://your-domain.com/health"
echo ""
echo "4. Rollback if needed:"
echo "   tar -xzf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $APP_DIR"
echo "   pm2 restart bagmane-ams"
echo ""

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
