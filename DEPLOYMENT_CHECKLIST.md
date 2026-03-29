# ✅ CineFlask v2.0 - Deployment Checklist

Use this checklist to ensure smooth deployment to production.

---

## 📋 Pre-Deployment

- [x] All code committed to git
- [x] All tests passing (35/35)
- [x] Documentation complete
- [x] Database migration script tested
- [ ] Backup existing database
- [ ] Review .env configuration

---

## 🔧 Deployment Steps

### 1. Backup Current System
```bash
# Backup database
cp cinelocal.db cinelocal.db.backup.$(date +%Y%m%d_%H%M%S)

# Backup .env file
cp .env .env.backup
```

### 2. Pull Latest Code
```bash
# If using git
git pull origin main

# Verify you're on the latest commit
git log -1 --oneline
# Should show: b466fdf feat: Production v2.0 - Upload Quotas...
```

### 3. Install/Update Dependencies
```bash
# Rebuild native modules for your Node.js version
npm rebuild better-sqlite3

# Verify no errors
echo $?  # Should output 0
```

### 4. Run Database Migration
```bash
# Run migration
node database/migrate-production.js

# Expected output: "✅ Production migration completed successfully!"
```

### 5. Verify Migration
```bash
# Check new tables exist
sqlite3 cinelocal.db "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('upload_activity', 'login_attempts', 'api_usage', 'system_settings');"

# Should output all 4 table names
```

### 6. Run Tests
```bash
# Run all tests
npm test
node tests/production.test.js

# Both should show 100% passing
```

### 7. Update Environment Variables (if needed)
```bash
# Edit .env file
nano .env

# Ensure these are set:
# - JWT_SECRET (64+ characters, random)
# - IMDB_API_KEY or OMDB_API_KEY (optional)
# - PORT (default 3000)
```

### 8. Start Server
```bash
# Option A: Direct start
npm start

# Option B: With PM2 (recommended for production)
pm2 start server.js --name cinelocal
pm2 save
```

### 9. Verify Server Started
```bash
# Check server is running
curl http://localhost:3000/api/health

# Expected response: {"success":true,"message":"CineLocal is running",...}
```

### 10. Test Key Features
```bash
# Test quota endpoint (requires auth token)
curl http://localhost:3000/api/upload/quota \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return quota information
```

---

## 🎯 Post-Deployment Verification

### Functionality Checks
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Quota displays on upload page
- [ ] Can upload a file
- [ ] Quota updates after upload
- [ ] Admin endpoints accessible (if admin)
- [ ] Failed login tracking works

### Admin-Specific Checks
- [ ] Can access `/api/admin/quota/users`
- [ ] Can view system statistics
- [ ] Can update user quotas
- [ ] Can view login attempts
- [ ] API health monitoring works

### Performance Checks
- [ ] Page load times normal
- [ ] Upload speeds acceptable
- [ ] No console errors in browser
- [ ] Server logs clean (no errors)

---

## 📊 Monitoring Setup

### Daily Checks
```bash
# View recent uploads
curl http://localhost:3000/api/admin/quota/activity \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Check for suspicious logins
curl http://localhost:3000/api/admin/quota/login-attempts \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Weekly Maintenance
```bash
# Optimize database
sqlite3 cinelocal.db "VACUUM; ANALYZE;"

# Check disk space
df -h

# Review server logs
pm2 logs cinelocal --lines 100
```

### Monthly Cleanup
```bash
# Clean old activity (keeps 90 days)
sqlite3 cinelocal.db "DELETE FROM upload_activity WHERE upload_date < date('now', '-90 days');"

# Clean old login attempts (keeps 30 days)
sqlite3 cinelocal.db "DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-30 days');"

# Clean old API logs (keeps 30 days)
sqlite3 cinelocal.db "DELETE FROM api_usage WHERE created_at < datetime('now', '-30 days');"
```

---

## 🔒 Security Verification

- [ ] JWT_SECRET is strong (64+ random characters)
- [ ] No default passwords in use
- [ ] Rate limiters active
- [ ] Helmet security headers enabled
- [ ] HTTPS configured (if applicable)
- [ ] Firewall allows only necessary ports
- [ ] Admin accounts properly secured

---

## 📞 Rollback Plan (If Needed)

If something goes wrong:

```bash
# 1. Stop server
pm2 stop cinelocal
# or Ctrl+C if running directly

# 2. Restore database backup
cp cinelocal.db.backup.TIMESTAMP cinelocal.db

# 3. Restore .env if changed
cp .env.backup .env

# 4. Restart server
pm2 start cinelocal
```

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Server starts without errors  
✅ All tests passing  
✅ Users can register/login  
✅ Uploads work correctly  
✅ Quota system functioning  
✅ Admin endpoints accessible  
✅ No error logs in server  
✅ Frontend displays quota info  

---

## 📚 Quick Reference

| Action | Command |
|--------|---------|
| Check server status | `pm2 status` or `curl localhost:3000/api/health` |
| View logs | `pm2 logs cinelocal` |
| Restart server | `pm2 restart cinelocal` |
| Run tests | `npm test && node tests/production.test.js` |
| Database backup | `cp cinelocal.db cinelocal.db.backup.$(date +%Y%m%d)` |
| View migrations | `sqlite3 cinelocal.db ".schema"` |

---

## 📖 Documentation Links

- **Deployment Guide**: `PRODUCTION_DEPLOYMENT.md`
- **API Reference**: `API_DOCUMENTATION.md`
- **Release Notes**: `RELEASE_NOTES_v2.0.md`
- **Main README**: `README.md`

---

## 🆘 Troubleshooting

### Issue: Migration fails
**Solution**: Check Node.js version, rebuild better-sqlite3
```bash
node --version  # Should be v18+ or v20+
npm rebuild better-sqlite3
```

### Issue: "JWT_SECRET not configured"
**Solution**: Set JWT_SECRET in .env file
```bash
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env
```

### Issue: Quota not displaying
**Solution**: Clear browser cache, check browser console for errors

### Issue: Admin endpoints return 403
**Solution**: Verify user is admin (first registered user or has is_admin=1)
```bash
sqlite3 cinelocal.db "SELECT id, username, is_admin FROM users ORDER BY id LIMIT 5;"
```

---

**🎬 Ready to deploy! Follow this checklist step by step for a smooth deployment.**

**Questions?** Check `PRODUCTION_DEPLOYMENT.md` for detailed troubleshooting.
