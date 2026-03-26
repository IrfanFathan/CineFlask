# 🎬 CineLocal — Build Plan
> Local Wi-Fi Movie Streaming Platform

---

## Project Overview

A fully self-hosted movie streaming platform that runs on an old PC/laptop and is accessible by every device on the same Wi-Fi network — no cloud, no subscriptions, no installs required beyond a browser.

---

## Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | Fast, huge ecosystem, single language full-stack |
| Framework | Express.js | Lightweight, minimal config, perfect for REST APIs |
| Database | SQLite (via `better-sqlite3`) | Zero-setup, single file, no server process needed |
| Auth | JWT + bcrypt | Stateless, works across all devices on LAN |
| Metadata | OMDB API (free tier) | Simple key, returns poster + cast + rating + plot |
| Frontend | Vanilla HTML/CSS/JS | No build step, loads instantly on all devices |
| Video | HTML5 `<video>` + range requests | Native browser support, seek works on iOS/Safari |

---

## Phase 1 — Project Scaffold

**Goal:** Get the folder structure and server running locally.

```
cinelocal/
├── server.js               # Entry point — binds to LAN IP
├── .env                    # API keys, JWT secret, PORT
├── .env.example            # Template for new installs
├── package.json
├── database/
│   ├── init.js             # Creates all tables on first run
│   └── db.js               # Exports the SQLite connection
├── routes/
│   ├── auth.js             # POST /api/register, /api/login
│   ├── movies.js           # GET/POST /api/movies
│   ├── upload.js           # POST /api/upload
│   ├── stream.js           # GET /api/stream/:id
│   └── progress.js         # GET/POST /api/progress
├── middleware/
│   ├── authMiddleware.js   # JWT validation
│   └── errorHandler.js     # Global error responses
├── helpers/
│   └── metadata.js         # OMDB API fetch helper
├── uploads/                # Video files stored here
└── public/                 # All frontend files
    ├── index.html          # Login / Register
    ├── home.html           # Browse / Movie grid
    ├── movie.html          # Movie detail page
    ├── player.html         # Video player
    ├── upload.html         # Upload page
    ├── css/
    │   └── style.css
    └── js/
        ├── auth.js
        ├── home.js
        ├── movie.js
        ├── player.js
        └── upload.js
```

---

## Phase 2 — Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| username | TEXT UNIQUE | |
| password_hash | TEXT | bcrypt, cost 12 |
| created_at | DATETIME | DEFAULT now |

### `movies`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| title | TEXT | |
| year | TEXT | |
| description | TEXT | Plot from OMDB |
| file_path | TEXT | Local path to video |
| poster_url | TEXT | OMDB poster URL |
| imdb_id | TEXT | e.g. tt0111161 |
| genre | TEXT | |
| actors | TEXT | Comma-separated |
| imdb_rating | TEXT | e.g. "9.3" |
| uploaded_by | INTEGER | FK → users.id |
| created_at | DATETIME | |

### `playback_progress`
| Column | Type | Notes |
|---|---|---|
| user_id | INTEGER | FK → users.id |
| movie_id | INTEGER | FK → movies.id |
| timestamp_seconds | REAL | Last position |
| last_watched | DATETIME | For "Continue Watching" row |

---

## Phase 3 — Auth System

- `POST /api/register` — hash password with bcrypt (cost 12), store user
- `POST /api/login` — verify hash, return signed JWT (7-day expiry)
- `authMiddleware.js` — verify Bearer token on all protected routes
- Token stored in `localStorage` on client, sent as `Authorization: Bearer <token>`

---

## Phase 4 — Movie & Metadata System

- `POST /api/upload` — accepts multipart form, saves to `/uploads/`, triggers metadata fetch
- `helpers/metadata.js` — calls `https://www.omdbapi.com/?t=<title>&apikey=<key>`
- Returns: Title, Year, Plot, Poster, Actors, Genre, imdbRating, imdbID
- Stores everything in `movies` table
- `GET /api/movies` — returns all movies (auth required)
- `GET /api/movies/:id` — returns single movie detail

---

## Phase 5 — Streaming Engine

- `GET /api/stream/:id` — reads `file_path` from DB, streams with HTTP range support
- Checks `Range` header → responds with `206 Partial Content`
- Critical for: iOS Safari seek, Android Chrome seek, fast-forward/rewind

---

## Phase 6 — Playback Progress (Resume Feature)

- `POST /api/progress` — saves `{ movie_id, timestamp_seconds }` for logged-in user
- `GET /api/progress/:movie_id` — returns last saved timestamp
- Frontend calls POST every 10 seconds during playback
- On player load, fetches GET and sets `video.currentTime`

---

## Phase 7 — Frontend Pages

| Page | File | Key Features |
|---|---|---|
| Login/Register | `index.html` | Toggle form, JWT stored on success |
| Home/Browse | `home.html` | Movie grid, Continue Watching row, search |
| Movie Detail | `movie.html` | Poster, cast, rating, plot, Play button |
| Player | `player.html` | HTML5 video, custom controls, auto-resume |
| Upload | `upload.html` | Drag-and-drop, title input, progress bar |

---

## Phase 8 — Local Network Setup

- Server binds to `0.0.0.0` (all interfaces) on port `3000`
- Users on same Wi-Fi navigate to `http://<HOST_IP>:3000`
- Optional: PM2 for auto-start on boot

---

## Dependency List

```json
{
  "express": "^4.18",
  "better-sqlite3": "^9.4",
  "bcrypt": "^5.1",
  "jsonwebtoken": "^9.0",
  "multer": "^1.4",
  "node-fetch": "^3.3",
  "dotenv": "^16.4",
  "cors": "^2.8"
}
```

---

## Milestone Checklist

- [ ] Phase 1 — Scaffold & server boots on LAN IP
- [ ] Phase 2 — Database initialises all tables
- [ ] Phase 3 — Register/login/token flow working
- [ ] Phase 4 — Upload + OMDB metadata fetch working
- [ ] Phase 5 — Video streams with range request support
- [ ] Phase 6 — Resume timestamps saving & loading
- [ ] Phase 7 — All 5 frontend pages complete & mobile responsive
- [ ] Phase 8 — Tested on phone + tablet on same Wi-Fi
