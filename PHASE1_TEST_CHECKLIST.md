# Phase 1 Testing Checklist

## Prerequisites
- [ ] Server is running: `npm start`
- [ ] `.env` file has `IMDB_API_KEY` set
- [ ] Database migration completed: `node database/migrate.js`

## 1. Environment Configuration ✓
- [x] `.env` has `IMDB_API_KEY` instead of `OMDB_API_KEY`
- [x] `.env.example` updated with new variable name
- [x] `helpers/metadata.js` supports both old and new variable names

## 2. Database Schema ✓
- [x] Migration script created (`database/migrate.js`)
- [x] Movies table has `language` and `country` columns
- [x] Series table has `language` and `country` columns

**Test Command:**
```bash
sqlite3 database/cinelocal.db "PRAGMA table_info(movies);" | grep -E "language|country"
sqlite3 database/cinelocal.db "PRAGMA table_info(series);" | grep -E "language|country"
```

## 3. Metadata API Enhancement ✓
**Backend Routes:**
- [x] `GET /api/metadata/search?title=...&year=...` - Search by title
- [x] `GET /api/metadata/search/imdb/:id` - Search by IMDb ID
- [x] `helpers/metadata.js` has `fetchMetadataByImdbId()` function

**Manual API Tests:**
```bash
# Test title search
curl "http://localhost:3000/api/metadata/search?title=Inception&year=2010" -H "Authorization: Bearer YOUR_TOKEN"

# Test IMDb ID search
curl "http://localhost:3000/api/metadata/search/imdb/tt1375666" -H "Authorization: Bearer YOUR_TOKEN"
```

## 4. Movie/Series Edit Functionality ✓
**Backend Routes:**
- [x] `PUT /api/movies/:id` - Edit movie metadata
- [x] `PUT /api/series/:id` - Edit series metadata
- [x] Both endpoints validate ownership
- [x] Both support language and country fields

**Manual API Tests:**
```bash
# Test movie edit
curl -X PUT "http://localhost:3000/api/movies/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Title","year":2020,"language":"English","country":"USA"}'

# Test series edit
curl -X PUT "http://localhost:3000/api/series/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Series","language":"English"}'
```

## 5. Upload Enhancement with IMDb ID ✓
**Frontend (`upload.html`):**
- [ ] Radio toggle between "Movie Title" and "IMDb ID" visible
- [ ] IMDb ID input field and "Fetch" button work
- [ ] Metadata preview card displays after fetch
- [ ] Preview shows poster, title, year, genres

**Backend (`routes/upload.js`):**
- [x] Accepts `imdbId` parameter in complete upload
- [x] Uses IMDb ID for metadata if provided
- [x] Falls back to title search if no IMDb ID
- [x] Saves language and country to database

**Manual Test:**
1. Navigate to `/upload.html`
2. Select "IMDb ID" radio
3. Enter `tt1375666` (Inception)
4. Click "Fetch Metadata"
5. Verify preview shows correct info
6. Upload a test file and verify metadata saves

## 6. Advanced Filtering System ✓
**Backend (`routes/movies.js` & `routes/series.js`):**
- [x] `genre` filter
- [x] `year_min` and `year_max` filters
- [x] `rating_min` filter
- [x] `language` filter
- [x] `status` filter (series only)
- [x] `sort_by` parameter
- [x] `sort_order` parameter

**Frontend (`home.html`):**
- [ ] Filter bar visible with all controls
- [ ] Genre dropdown populated
- [ ] Year range inputs work
- [ ] Rating input works
- [ ] Language dropdown works
- [ ] Sort dropdown works
- [ ] "Clear Filters" button works
- [ ] Active filter tags display
- [ ] Filters persist during view toggle (Movies/Series)

**Manual Tests:**
```bash
# Test genre filter
curl "http://localhost:3000/api/movies?genre=Action" -H "Authorization: Bearer YOUR_TOKEN"

# Test year range
curl "http://localhost:3000/api/movies?year_min=2010&year_max=2020" -H "Authorization: Bearer YOUR_TOKEN"

# Test rating minimum
curl "http://localhost:3000/api/movies?rating_min=7.5" -H "Authorization: Bearer YOUR_TOKEN"

# Test sorting
curl "http://localhost:3000/api/movies?sort_by=imdb_rating&sort_order=DESC" -H "Authorization: Bearer YOUR_TOKEN"

# Combined filters
curl "http://localhost:3000/api/movies?genre=Sci-Fi&year_min=2010&rating_min=8.0&sort_by=year&sort_order=DESC" -H "Authorization: Bearer YOUR_TOKEN"
```

**UI Test:**
1. Go to `/home.html`
2. Apply genre filter → verify results
3. Add year range → verify results update
4. Add minimum rating → verify results
5. Change sort order → verify order changes
6. Click filter tag "×" → verify filter removed
7. Click "Clear Filters" → verify all reset

## 7. Enhanced Poster Grid ✓
**CSS Updates (`public/css/style.css`):**
- [x] Grid columns increased to 180px minimum
- [x] Enhanced hover effects (translateY + scale)
- [x] `.movie-info-overlay` styles added
- [x] Better shadows and transitions
- [x] Rating badge with border
- [x] Progress bar with gradient
- [x] Better fallback poster styling

**JavaScript Updates (`public/js/utils.js`):**
- [x] `createMovieCard()` has hover overlay
- [x] `createSeriesCard()` has hover overlay
- [x] Hover shows title, metadata, and genres
- [x] Better fallback poster with icon and text
- [x] Genres limited to first 2

**Manual UI Test:**
1. Go to `/home.html` with content
2. Hover over movie cards → verify overlay appears
3. Hover over series cards → verify overlay appears
4. Check cards without posters → verify fallback displays
5. Check cards with progress → verify progress bar visible
6. Verify rating badges have borders
7. Verify grid is responsive

---

## Summary of Changes

### Files Modified (14):
1. `.env` - Renamed API key variable
2. `.env.example` - Updated documentation
3. `database/migrate.js` - NEW: Migration script
4. `helpers/metadata.js` - Added IMDb ID search, language/country
5. `routes/metadata.js` - NEW: Metadata endpoints
6. `routes/movies.js` - Edit endpoint + filtering
7. `routes/series.js` - Edit endpoint + filtering
8. `routes/upload.js` - IMDb ID support
9. `server.js` - Registered metadata routes
10. `public/upload.html` - IMDb ID UI + preview
11. `public/home.html` - Filter bar + logic
12. `public/css/style.css` - Enhanced card styles
13. `public/js/utils.js` - Enhanced card functions
14. `PHASE1_TEST_CHECKLIST.md` - NEW: This file

### Next Steps:
After completing Phase 1 testing, proceed to **Phase 2**:
- Docker deployment configuration
- Security hardening (helmet, validation, rate limiting)
- Caching implementation
- Test suite creation
