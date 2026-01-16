# Bagmane Asset Management - Deployment Runbook

## Quick Reference

**Production URL:** https://bagmane-ams.yourdomain.com  
**Server:** Production Server IP/Hostname  
**Database:** PostgreSQL 15  
**Process Manager:** PM2  
**Web Server:** Nginx

---

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] `.env.production` file created and configured
- [ ] All secrets generated (JWT_SECRET, SESSION_SECRET)
- [ ] Database credentials configured
- [ ] AWS S3 credentials configured (if using)
- [ ] SMTP credentials configured
- [ ] SSL certificates obtained

### 2. Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Code reviewed and approved
- [ ] Documentation updated

### 3. Infrastructure
- [ ] Production server provisioned
- [ ] PostgreSQL installed and configured
- [ ] Nginx installed and configured
- [ ] PM2 installed globally
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] SSL certificate installed

---

## Deployment Steps

### Step 1: Prepare Local Environment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run tests
npm test

# 4. Build application
npm run build

# 5. Run security audit
npm audit --production
```

### Step 2: Database Migration

```bash
# 1. Backup current database
./scripts/backup-database.sh

# 2. Run migrations
DATABASE_URL="postgresql://user:pass@host:5432/bagmane_production" \
npx prisma migrate deploy

# 3. Verify migration
DATABASE_URL="postgresql://user:pass@host:5432/bagmane_production" \
npx prisma db pull
```

### Step 3: Deploy to Server

```bash
# 1. Copy files to server
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude 'uploads' \
  ./ user@server:/var/www/bagmane-ams/

# 2. SSH into server
ssh user@server

# 3. Navigate to app directory
cd /var/www/bagmane-ams

# 4. Install production dependencies
npm ci --only=production

# 5. Generate Prisma Client
npx prisma generate

# 6. Restart application
pm2 restart ecosystem.config.js --env production

# 7. Save PM2 configuration
pm2 save
```

### Step 4: Verify Deployment

```bash
# 1. Check application status
pm2 status

# 2. Check logs
pm2 logs bagmane-ams --lines 50

# 3. Run health check
curl https://bagmane-ams.yourdomain.com/health

# 4. Test critical endpoints
curl https://bagmane-ams.yourdomain.com/api/escalation/stats
```

### Step 5: Post-Deployment Monitoring

```bash
# Monitor for 30 minutes
pm2 monit

# Check error logs
tail -f logs/err.log

# Check access logs
sudo tail -f /var/log/nginx/access.log
```

---

## Rollback Procedure

### Quick Rollback

```bash
# 1. SSH into server
ssh user@server

# 2. Navigate to app directory
cd /var/www/bagmane-ams

# 3. Find latest backup
ls -lt backups/

# 4. Extract backup
tar -xzf backups/backup_TIMESTAMP.tar.gz

# 5. Restart application
pm2 restart bagmane-ams

# 6. Verify
curl http://localhost:3001/health
```

### Database Rollback

```bash
# 1. Stop application
pm2 stop bagmane-ams

# 2. Restore database
gunzip -c backups/db_backup_TIMESTAMP.sql.gz | psql bagmane_production

# 3. Restart application
pm2 start bagmane-ams

# 4. Verify
./scripts/health-check.sh
```

---

## Common Issues & Solutions

### Issue: Application Won't Start

**Symptoms:**
- PM2 shows app as "errored"
- Health check fails

**Solutions:**
```bash
# Check logs
pm2 logs bagmane-ams --err

# Common causes:
# 1. Database connection failed
#    - Verify DATABASE_URL in .env.production
#    - Check PostgreSQL is running: sudo systemctl status postgresql

# 2. Port already in use
#    - Check: lsof -i :3001
#    - Kill process: kill -9 PID

# 3. Missing environment variables
#    - Verify .env.production exists
#    - Check all required vars are set
```

### Issue: Database Migration Failed

**Symptoms:**
- Migration errors in logs
- Database schema mismatch

**Solutions:**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. Reset migrations (CAUTION: Data loss!)
npx prisma migrate reset

# 3. Apply migrations manually
npx prisma migrate deploy --force

# 4. Verify schema
npx prisma db pull
```

### Issue: High Memory Usage

**Symptoms:**
- PM2 shows high memory
- Application crashes

**Solutions:**
```bash
# 1. Check memory usage
pm2 monit

# 2. Restart with memory limit
pm2 restart bagmane-ams --max-memory-restart 500M

# 3. Check for memory leaks
pm2 logs bagmane-ams | grep "memory"

# 4. Scale down instances
pm2 scale bagmane-ams 1
```

### Issue: SSL Certificate Expired

**Symptoms:**
- Browser shows security warning
- HTTPS not working

**Solutions:**
```bash
# 1. Check certificate expiry
sudo certbot certificates

# 2. Renew certificate
sudo certbot renew

# 3. Reload Nginx
sudo systemctl reload nginx

# 4. Verify
curl -I https://bagmane-ams.yourdomain.com
```

---

## Monitoring & Maintenance

### Daily Tasks

```bash
# 1. Check application status
pm2 status

# 2. Check error logs
tail -n 100 logs/err.log

# 3. Check disk space
df -h

# 4. Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('bagmane_production'));"
```

### Weekly Tasks

```bash
# 1. Review error logs
grep -i error logs/*.log | wc -l

# 2. Check backup status
ls -lh backups/ | tail -10

# 3. Update dependencies
npm outdated
npm update

# 4. Security audit
npm audit
```

### Monthly Tasks

```bash
# 1. System updates
sudo apt update && sudo apt upgrade

# 2. Database optimization
psql bagmane_production -c "VACUUM ANALYZE;"

# 3. Clean old logs
find logs/ -name "*.log" -mtime +30 -delete

# 4. Clean old backups
find backups/ -name "*.gz" -mtime +30 -delete
```

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Project Manager | [Name] | [Email/Phone] |
| Backend Lead | [Name] | [Email/Phone] |
| DevOps Engineer | [Name] | [Email/Phone] |
| Database Admin | [Name] | [Email/Phone] |
| On-Call Support | [Name] | [Email/Phone] |

---

## Useful Commands

### PM2 Commands
```bash
pm2 start ecosystem.config.js --env production
pm2 stop bagmane-ams
pm2 restart bagmane-ams
pm2 reload bagmane-ams  # Zero-downtime restart
pm2 logs bagmane-ams
pm2 monit
pm2 save
pm2 resurrect
```

### Database Commands
```bash
# Connect to database
psql bagmane_production

# List tables
\dt

# Check table size
SELECT pg_size_pretty(pg_total_relation_size('Ticket'));

# Backup database
pg_dump bagmane_production > backup.sql

# Restore database
psql bagmane_production < backup.sql
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_tickets_status ON "Ticket"(status);
CREATE INDEX idx_tickets_priority ON "Ticket"(priority);
CREATE INDEX idx_tickets_created ON "Ticket"("createdAt");
CREATE INDEX idx_assets_status ON "Asset"(status);
CREATE INDEX idx_assets_category ON "Asset"(category);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Ticket" WHERE status = 'Open';
```

### Application Optimization
```bash
# Enable gzip compression in Nginx
# Add to nginx.conf:
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# Enable caching
# Add to nginx server block:
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Backup & Disaster Recovery

### Automated Backups

```bash
# Set up cron job for daily backups
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /var/www/bagmane-ams/scripts/backup-database.sh
```

### Disaster Recovery Plan

1. **Data Loss Scenario**
   - Restore from latest backup
   - Verify data integrity
   - Notify stakeholders

2. **Server Failure Scenario**
   - Provision new server
   - Deploy from backup
   - Update DNS if needed

3. **Security Breach Scenario**
   - Isolate affected systems
   - Change all credentials
   - Audit access logs
   - Notify users

---

## Version History

| Version | Date | Changes | Deployed By |
|---------|------|---------|-------------|
| 1.0.0 | 2026-01-13 | Initial production deployment | [Name] |

---

**Last Updated:** 2026-01-13  
**Next Review:** 2026-02-13
