# 🚀 Production Deployment Guide

Complete guide for deploying CineFlask to production with all security and performance enhancements.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Migration](#database-migration)
4. [Environment Configuration](#environment-configuration)
5. [Security Hardening](#security-hardening)
6. [Upload Quota System](#upload-quota-system)
7. [Admin Configuration](#admin-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v18.x or v20.x LTS
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: Depends on your media library size
- **OS**: Linux, macOS, or Windows

### Required Tools
```bash
# Node.js and npm
node --version  # Should be v18+ or v20+
npm --version

# Git (for deployment)
git --version
```

---

## Initial Setup

### 1. Clone or Update Repository
```bash
cd /path/to/CineFlask
git pull origin main
```

### 2. Install Dependencies
```bash
npm install

# Rebuild native modules for your Node.js version
npm rebuild better-sqlite3
```

### 3. Create Environment File
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

---

## Database Migration

### Running the Production Migration

**IMPORTANT**: This migration adds new fields for quota tracking, security monitoring, and admin features.

```bash
# Run the migration
node database/migrate-production.js
```

**Expected Output:**
```
🔄 Running production migration...

✓ Added email column to users
✓ Added is_admin column to users
✓ Added is_active column to users
✓ Added last_login column to users
✓ Added upload_quota_gb column to users
✓ Added daily_upload_limit column to users
✓ Added upload_ip column to movies
✓ Added is_approved column to movies
✓ Upload activity table created
✓ Login attempts table created
✓ API usage table created
✓ System settings table created
✓ Default system settings inserted
✓ New indexes created

✅ Production migration completed successfully!
```

### Database Backup (Recommended)

**Before Migration:**
```bash
# Backup your database
cp cinelocal.db cinelocal.db.backup.$(date +%Y%m%d)
```

**Restore if Needed:**
```bash
cp cinelocal.db.backup.YYYYMMDD cinelocal.db
```

---

## Environment Configuration

### Required Variables

Edit `.env` file with production values:

```env
# Server Configuration
PORT=3000
HOST_IP=192.168.1.100  # Your server's LAN IP

# Security (CRITICAL)
JWT_SECRET=your_super_secure_random_string_at_least_64_characters_long_here

# API Keys
IMDB_API_KEY=your_omdb_api_key_from_omdbapi.com
OPENSUBTITLES_API_KEY=your_opensubtitles_api_key  # Optional

# Upload Limits
MAX_FILE_SIZE_GB=50
CHUNK_SIZE_MB=5

# Node Environment
NODE_ENV=production
```

### Generating Secure JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output to your `JWT_SECRET` in `.env`.

---

## Security Hardening

### 1. Security Headers
Already configured via `helmet` middleware:
- Content Security Policy (CSP)
- XSS Protection
- HTTPS enforcement (in production)
- Frame protection (clickjacking prevention)

### 2. Rate Limiting
Configured limits:
- **General API**: 1000 requests per 15 minutes
- **Authentication**: 10 attempts per 15 minutes
- **Uploads**: 50 per hour
- **Metadata API**: 30 per minute

### 3. Password Requirements
- Minimum 8 characters
- Cannot be common weak passwords
- No maximum length (up to 128 chars)

### 4. Account Lockout
- **5 failed login attempts** = 30-minute lockout
- Tracked by IP address
- Monitored via admin dashboard

---

## Upload Quota System

### Default Quotas

**Per User:**
- **Storage Quota**: 100GB
- **Daily Upload Limit**: 10 files per day

### Adjusting Quotas

#### Via API (Admin Only)
```bash
# Update user quota
curl -X PUT http://localhost:3000/api/admin/quota/user/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quotaGB": 500,
    "dailyLimit": 50
  }'
```

#### Via Database (Advanced)
```bash
# Access database
sqlite3 cinelocal.db

# Update user quota
UPDATE users SET upload_quota_gb = 500, daily_upload_limit = 50 WHERE id = 1;
```

### System-Wide Quota Settings

Edit `system_settings` table:
```sql
-- View current settings
SELECT * FROM system_settings;

-- Update default quota for new users
UPDATE system_settings 
SET setting_value = '200' 
WHERE setting_key = 'default_upload_quota_gb';
```

---

## Admin Configuration

### First User = Admin

The **first registered user** automatically becomes an admin. 

### Making Additional Admins

```bash
sqlite3 cinelocal.db

-- Make user ID 2 an admin
UPDATE users SET is_admin = 1 WHERE id = 2;
```

### Admin Capabilities

Admins can:
- ✅ View all user quotas
- ✅ Adjust individual user limits
- ✅ Monitor upload activity
- ✅ View login attempts (security)
- ✅ Check API health status
- ✅ Deactivate/activate accounts
- ✅ Reset user upload activity

### Admin API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/quota/users` | GET | All users' quota status |
| `/api/admin/quota/user/:id` | PUT | Update user quota |
| `/api/admin/quota/activity` | GET | Upload activity logs |
| `/api/admin/quota/stats` | GET | System-wide statistics |
| `/api/admin/quota/api-health` | GET | API circuit breaker status |
| `/api/admin/quota/login-attempts` | GET | Security monitoring |
| `/api/admin/quota/user/:id/status` | PUT | Activate/deactivate account |

---

## Monitoring & Logging

### 1. Upload Activity Tracking

Monitor daily uploads per user:
```bash
# View today's activity
curl http://localhost:3000/api/admin/quota/activity \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 2. API Usage Monitoring

Track external API calls (OMDB):
```sql
SELECT 
  api_name, 
  COUNT(*) as total_calls,
  SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
  AVG(response_time_ms) as avg_response_time
FROM api_usage
WHERE created_at > datetime('now', '-24 hours')
GROUP BY api_name;
```

### 3. Security Monitoring

View failed login attempts:
```bash
curl http://localhost:3000/api/admin/quota/login-attempts \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 4. Circuit Breaker Status

Monitor API health:
```bash
curl http://localhost:3000/api/admin/quota/api-health \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Performance Optimization

### 1. Database Optimization

```bash
# Optimize database (run monthly)
sqlite3 cinelocal.db "VACUUM;"
sqlite3 cinelocal.db "ANALYZE;"
```

### 2. Clean Old Logs

```bash
# Clean upload activity older than 90 days
sqlite3 cinelocal.db "DELETE FROM upload_activity WHERE upload_date < date('now', '-90 days');"

# Clean old login attempts (older than 30 days)
sqlite3 cinelocal.db "DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-30 days');"

# Clean old API usage logs (older than 30 days)
sqlite3 cinelocal.db "DELETE FROM api_usage WHERE created_at < datetime('now', '-30 days');"
```

### 3. Process Manager (PM2)

**Recommended for production:**

```bash
# Install PM2 globally
npm install -g pm2

# Start CineFlask
pm2 start server.js --name cinelocal

# Auto-restart on system reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs cinelocal

# Restart
pm2 restart cinelocal
```

---

## Troubleshooting

### Issue: "Circuit breaker is OPEN"

**Cause:** Too many failed API calls to OMDB.

**Solution:**
1. Check your OMDB API key is valid
2. Verify you haven't exceeded API limits (1000/day free tier)
3. Wait 1 minute for circuit breaker to reset
4. Check API health: `GET /api/admin/quota/api-health`

### Issue: Upload fails with "quota exceeded"

**Solution:**
```bash
# Check user's quota
curl http://localhost:3000/api/upload/quota \
  -H "Authorization: Bearer USER_TOKEN"

# Increase quota (admin)
curl -X PUT http://localhost:3000/api/admin/quota/user/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"quotaGB": 200, "dailyLimit": 20}'
```

### Issue: Account locked after failed logins

**Solution:**
```bash
# Clear login attempts for specific IP
sqlite3 cinelocal.db "DELETE FROM login_attempts WHERE ip_address = 'IP_ADDRESS';"

# Or wait 30 minutes for automatic unlock
```

### Issue: Migration fails

**Solution:**
```bash
# Rebuild native modules
npm rebuild better-sqlite3

# Verify Node.js version
node --version  # Should be v18 or v20

# Re-run migration
node database/migrate-production.js
```

### Issue: High memory usage

**Solution:**
```bash
# Check for large temp files
du -sh temp/

# Clean temp directory
rm -f temp/*

# Restart server
pm2 restart cinelocal
```

---

## Production Checklist

Before going live, verify:

- [ ] JWT_SECRET is set to a secure random string (64+ chars)
- [ ] Database migration completed successfully
- [ ] OMDB API key configured (optional but recommended)
- [ ] Upload quotas set appropriately
- [ ] First admin user created
- [ ] Rate limiters configured
- [ ] Security headers enabled (helmet)
- [ ] Static IP configured on router (recommended)
- [ ] Firewall allows port 3000
- [ ] PM2 or similar process manager installed
- [ ] Database backup strategy in place
- [ ] Log rotation configured

---

## Maintenance Schedule

### Daily
- Monitor upload activity
- Check for suspicious login attempts

### Weekly
- Review API usage logs
- Check circuit breaker status
- Verify disk space availability

### Monthly
- Clean old activity logs
- Optimize database (VACUUM)
- Review user quotas
- Backup database

### Quarterly
- Update Node.js and dependencies
- Review security settings
- Performance testing

---

## Support & Resources

- **Documentation**: `/README.md`, `/QUICK_REFERENCE.md`
- **API Reference**: See API endpoints sections above
- **Database Schema**: `/database/init.js`, `/database/migrate-production.js`
- **Security**: `/middleware/security.js`, `/middleware/rateLimiter.js`

---

## Version History

- **v2.0.0** - Production enhancements (quota system, security, monitoring)
- **v1.0.0** - Initial release

---

**🎬 Your production CineFlask is ready! Enjoy your private streaming platform!**
