# CineFlask Deployment Guide

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- OMDB API key (get free at http://www.omdbapi.com/apikey.aspx)

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd CineFlask
```

2. **Set up environment variables**
```bash
cp .env.docker .env
```

Edit `.env` and set:
```env
JWT_SECRET=your-super-secret-random-string-here
IMDB_API_KEY=your-omdb-api-key
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

3. **Build and run with Docker**
```bash
docker-compose up -d
```

4. **Access the application**
- Open browser to `http://localhost:3000`
- Create your admin account
- Start uploading media!

### Docker Commands

```bash
# View logs
docker-compose logs -f cineflask

# Stop the container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Access shell in container
docker exec -it cineflask sh
```

---

## Manual Deployment

### Prerequisites
- Node.js 18+ installed
- FFmpeg installed (for video processing)

### Steps

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment**
```bash
cp .env.example .env
```

Edit `.env` with your values.

3. **Initialize database**
```bash
npm run setup
npm run migrate
```

4. **Start the server**
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

5. **Access the application**
- Open browser to `http://localhost:3000`

---

## Deployment Options

### Option 1: Docker Compose (Recommended)
- Easiest setup
- Consistent environment
- Automatic restarts
- Volume persistence

### Option 2: PM2 (Node.js Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name cineflask
pm2 save
pm2 startup
```

### Option 3: Systemd Service
Create `/etc/systemd/system/cineflask.service`:
```ini
[Unit]
Description=CineFlask Media Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cineflask
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable cineflask
sudo systemctl start cineflask
```

---

## Production Considerations

### 1. Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/cineflask`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50G;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeouts for large uploads
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/cineflask /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. HTTPS with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Firewall
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | No | development |
| `PORT` | Server port | No | 3000 |
| `JWT_SECRET` | Secret for JWT tokens | **Yes** | - |
| `IMDB_API_KEY` | OMDB API key for metadata | **Yes** | - |

---

## Volume Mounts (Docker)

The docker-compose.yml creates two volumes:

1. **`./data`** - Database and application data
2. **`./uploads`** - Uploaded media files

To use existing media library:
```yaml
volumes:
  - /path/to/movies:/app/uploads/movies:ro
  - /path/to/series:/app/uploads/series:ro
```

---

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "CineLocal is running",
  "timestamp": "2024-03-28T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Cache Statistics
Access cache stats programmatically via the helpers/cache.js module.

---

## Security Features

### Built-in Security
- ✅ Helmet security headers
- ✅ Rate limiting (auth, upload, metadata)
- ✅ Input validation
- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ CORS configuration

### Additional Recommendations
1. Use HTTPS in production
2. Keep JWT_SECRET secure and random
3. Regular security updates: `npm audit fix`
4. Firewall configuration
5. Regular backups of `data/` directory

---

## Testing

Run the test suite:
```bash
npm test
```

This runs basic integration tests to verify:
- File structure
- Database schema
- Module exports
- Configuration files
- Docker files
- Helper functions

---

## Backup and Restore

### Backup
```bash
# Backup database
cp data/cinelocal.db data/cinelocal.db.backup

# Backup entire data directory
tar -czf cineflask-backup-$(date +%Y%m%d).tar.gz data/ uploads/
```

### Restore
```bash
# Restore from backup
tar -xzf cineflask-backup-YYYYMMDD.tar.gz
```

---

## Troubleshooting

### Issue: "Module not found"
```bash
npm install
```

### Issue: "Database locked"
- Stop all instances of the server
- Remove `cinelocal.db-wal` and `cinelocal.db-shm` files
- Restart server

### Issue: Large file uploads fail
- Increase nginx `client_max_body_size`
- Check disk space
- Verify upload directory permissions

### Issue: Metadata not fetching
- Verify IMDB_API_KEY in .env
- Check API quota (free tier: 1000 requests/day)
- Check cache statistics

---

## Performance Optimization

1. **Enable caching** - Already implemented via node-cache
2. **Use CDN** for static assets (optional)
3. **Database optimization** - Indexes already created
4. **Nginx caching** - Cache static assets at reverse proxy
5. **Keep uploads on fast storage** (SSD recommended for large libraries)

---

## Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Check existing documentation
- Review test files for examples

---

## License

MIT
