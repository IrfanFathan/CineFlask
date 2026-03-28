# CineFlask - Quick Reference Card

## 🚀 Getting Started

### Docker (Recommended)
```bash
cp .env.docker .env           # Configure environment
docker-compose up -d          # Start services
docker-compose logs -f        # View logs
```

### Manual
```bash
npm install                   # Install dependencies
npm run setup                 # Initialize database
npm run migrate               # Run migrations
npm start                     # Start server
```

---

## 🔐 Environment Setup

Required variables in `.env`:
```env
JWT_SECRET=<generate with: openssl rand -base64 32>
IMDB_API_KEY=<get from omdbapi.com/apikey.aspx>
```

---

## 🎬 New Features

### 1. IMDb Metadata Search
**By Title:**
```bash
GET /api/metadata/search?title=Inception&year=2010
```

**By IMDb ID:**
```bash
GET /api/metadata/search/imdb/tt1375666
```

### 2. Edit Movie/Series Metadata
```bash
PUT /api/movies/:id
PUT /api/series/:id

Body: {
  "title": "New Title",
  "year": 2020,
  "language": "English",
  "country": "USA"
}
```

### 3. Advanced Filtering
```bash
GET /api/movies?genre=Action&year_min=2010&rating_min=7.5&sort_by=year&sort_order=DESC
GET /api/series?language=English&status=ended
```

**Available Filters:**
- `genre` - Filter by genre
- `year_min` / `year_max` - Year range
- `rating_min` - Minimum IMDb rating
- `language` - Filter by language
- `status` - Series status (ongoing/ended)
- `sort_by` - title, year, imdb_rating, created_at
- `sort_order` - ASC, DESC

### 4. Upload with IMDb ID
Frontend now supports:
- Radio toggle: Title vs IMDb ID
- Metadata preview before upload
- Auto-fetch poster and details

---

## 🔒 Security Features

### Rate Limits
- **General API**: 1000 req/15min
- **Auth**: 10 attempts/15min
- **Upload**: 50 uploads/hour
- **Metadata**: 30 req/minute

### Security Headers
- Content Security Policy
- XSS Protection
- Clickjacking Prevention
- HSTS Enabled

### Input Validation
All endpoints have validation rules for:
- User data
- Metadata
- Query parameters
- File uploads

---

## 💾 Caching

### Metadata Cache
- **TTL**: 1 hour
- **Max items**: 1000
- **Benefit**: Reduces OMDB API calls

### Movie List Cache
- **TTL**: 5 minutes
- **Max items**: 100
- **Benefit**: Faster list responses

---

## 🧪 Testing

Run tests:
```bash
npm test
```

Tests verify:
- File structure
- Database schema
- Module exports
- Docker configuration
- Helper functions

---

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "success": true,
  "message": "CineLocal is running",
  "timestamp": "2024-03-28T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Docker Logs
```bash
docker-compose logs -f cineflask
```

---

## 🗄️ Database

### Initialize
```bash
npm run setup
```

### Migrate (add language/country columns)
```bash
npm run migrate
```

### Backup
```bash
cp cinelocal.db cinelocal.db.backup
```

---

## 🌐 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure IMDB_API_KEY
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure backups
- [ ] Test health endpoint

### Ports
- **3000**: CineFlask application
- **80**: HTTP (if using Nginx)
- **443**: HTTPS (if using Nginx)

---

## 🎨 UI Enhancements

### Poster Grid
- Hover effects with metadata overlay
- Enhanced fallback posters
- Smooth transitions
- Responsive design

### Filter Bar (home.html)
- Genre dropdown
- Year range inputs
- Rating filter
- Language filter
- Sort controls
- Active filter tags
- Clear all button

---

## 📱 API Routes Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Movies
- `GET /api/movies` - List movies (with filters)
- `GET /api/movies/:id` - Get movie
- `PUT /api/movies/:id` - Edit movie (NEW)
- `DELETE /api/movies/:id` - Delete movie

### Series
- `GET /api/series` - List series (with filters)
- `GET /api/series/:id` - Get series
- `PUT /api/series/:id` - Edit series (NEW)
- `DELETE /api/series/:id` - Delete series

### Metadata (NEW)
- `GET /api/metadata/search` - Search by title
- `GET /api/metadata/search/imdb/:id` - Search by IMDb ID

### Upload
- `POST /api/upload/initiate` - Start upload
- `POST /api/upload/chunk` - Upload chunk
- `POST /api/upload/complete` - Complete upload (supports imdbId param)

### Health
- `GET /api/health` - Health check

---

## 🛠️ Troubleshooting

### "Module not found"
```bash
npm install
```

### "Database locked"
```bash
# Stop server, remove lock files
rm cinelocal.db-wal cinelocal.db-shm
```

### Upload fails
```bash
# Check disk space
df -h

# Check permissions
chmod 755 uploads/
```

### Metadata not fetching
```bash
# Verify API key
grep IMDB_API_KEY .env

# Check cache
# Cache stats available via helpers/cache.js
```

---

## 📚 Documentation Files

- `DEPLOYMENT.md` - Full deployment guide
- `PHASE1_TEST_CHECKLIST.md` - Testing procedures
- `PHASE1_PHASE2_SUMMARY.md` - Complete feature list
- `README.md` - Project overview
- `.env.example` - Environment template

---

## 🎯 NPM Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server (nodemon)
npm run setup    # Initialize database
npm run migrate  # Run migrations
npm test         # Run test suite
```

---

## 🔑 Key Files

### Configuration
- `.env` - Environment variables
- `package.json` - Dependencies & scripts
- `docker-compose.yml` - Docker stack
- `Dockerfile` - Container build

### Database
- `database/init.js` - Schema initialization
- `database/migrate.js` - Migration script
- `cinelocal.db` - SQLite database

### Middleware
- `middleware/security.js` - Helmet config
- `middleware/rateLimiter.js` - Rate limits
- `middleware/validators.js` - Input validation

### Helpers
- `helpers/metadata.js` - OMDB integration
- `helpers/cache.js` - Caching service

---

**CineFlask v1.0** - Your private cinema, anywhere 🎬
