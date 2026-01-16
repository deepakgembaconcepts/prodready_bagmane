#!/bin/bash

# Bagmane Asset Management - Database Setup Script
# This script sets up the PostgreSQL database for production deployment

set -e  # Exit on error

echo "🚀 Bagmane AMS - Database Setup Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "📋 Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed${NC}"
    echo ""
    echo "Please install PostgreSQL first:"
    echo ""
    echo "  macOS (Homebrew):"
    echo "    brew install postgresql@15"
    echo "    brew services start postgresql@15"
    echo ""
    echo "  Ubuntu/Debian:"
    echo "    sudo apt update"
    echo "    sudo apt install postgresql postgresql-contrib"
    echo "    sudo systemctl start postgresql"
    echo ""
    echo "  Windows:"
    echo "    Download from: https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
    psql --version
fi

echo ""
echo "📦 Creating databases..."

# Database names
DB_DEV="bagmane_development"
DB_STAGING="bagmane_staging"
DB_PROD="bagmane_production"

# Create databases
for db in $DB_DEV $DB_STAGING $DB_PROD; do
    echo "  Creating database: $db"
    createdb $db 2>/dev/null && echo -e "  ${GREEN}✅ Created $db${NC}" || echo -e "  ${YELLOW}⚠️  $db already exists${NC}"
done

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Running database migrations..."
DATABASE_URL="postgresql://localhost:5432/$DB_DEV" npx prisma migrate deploy

echo ""
echo "🌱 Seeding database with initial data..."
DATABASE_URL="postgresql://localhost:5432/$DB_DEV" npx prisma db seed

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  Development DB:  postgresql://localhost:5432/$DB_DEV"
echo "  Staging DB:      postgresql://localhost:5432/$DB_STAGING"
echo "  Production DB:   postgresql://localhost:5432/$DB_PROD"
echo ""
echo "🔐 Default user credentials:"
echo "  Email: admin@bagmane.com"
echo "  Password: password123"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env.local with DATABASE_URL"
echo "  2. Run: npm run dev"
echo "  3. Test the application"
echo ""
