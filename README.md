# 🎬 CineFlask - Your Private Cinema

A fully self-hosted movie and TV series streaming platform that runs on any old PC/laptop and streams to every device on your Wi-Fi network. No cloud, no subscriptions, no apps required — just open a browser.

![Platform](https://img.shields.io/badge/Platform-Node.js-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## ✨ Features

- **🔐 Multi-user Authentication** - JWT-based secure login system
- **👥 Multiple Profiles** - Up to 4 profiles per account (Netflix-style)
- **📺 HTTP Range Streaming** - Seek/resume works on all devices (iOS, Android, Desktop)
- **⏯️ Resume Playback** - Continue watching exactly where you left off
- **❤️ Watchlist/Favorites** - Bookmark movies and TV series to watch later
- **🔍 Advanced Search & Filtering** - Filter by genre, year, rating, language, and sorting.
- **📁 TV Series Support** - Full support for Seasons and Episodes tracking.
- **📤 Chunked & Batch Uploads** - Drag-and-drop multiple large files (50GB+) with auto queueing.
- **🎭 Auto-Metadata & Caching** - Fetches posters, cast, ratings, and descriptions from OMDB (via Title or IMDb ID).
- **💬 OpenSubtitles Integration** - 1-Click download and attach `.srt` subtitles.
- **🛡️ Enterprise Security** - Helmet security headers, input validation, and rate limiting to prevent brute-force attacks.
- **👑 Admin Dashboard** - Live server logs, user management, storage monitoring, and cache controls.
- **🐳 Docker Ready** - Quick and consistent deployment via `docker-compose`.
- **📱 Mobile Responsive** - Netflix-style dark theme UI with smooth hover animations.

---

## 🚀 Quick Start (Docker - Recommended)

The easiest way to get started is using Docker.

```bash
# 1. Clone the project
git clone https://github.com/IrfanFathan/CineFlask.git
cd CineFlask

# 2. Setup environment variables
cp .env.docker .env
# Edit .env and set your JWT_SECRET and IMDB_API_KEY (from omdbapi.com)

# 3. Start the application
docker-compose up -d
```
Access the application at `http://localhost:3000` (or your machine's LAN IP).

---

## 🚀 Manual Installation

### 1. Prerequisites
- **Node.js 20 LTS**
- **FFmpeg** (for video processing)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/IrfanFathan/CineFlask.git
cd CineFlask

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add a secure JWT_SECRET and your IMDB_API_KEY

# Initialize and migrate the database
npm run setup
npm run migrate

# Start the server
npm start
```
*Note: The first user you register will automatically become the System Admin.*

---

## 👑 Administration

The first user created is granted **Admin** privileges. Admin features include:
- **System Dashboard:** View disk usage, total media size, memory usage, and database stats.
- **User Management:** See all registered users, their profile counts, and delete misbehaving users.
- **Cache Controls:** Clear the metadata and API caches manually.
- **Log Viewer:** Read backend server logs directly from the UI.
- *Access the dashboard via the User Avatar dropdown menu -> Admin Dashboard.*

---

## 📁 Project Structure

```text
CineFlask/
├── Dockerfile             # Container configuration
├── docker-compose.yml     # Multi-container stack
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env                   # Configuration
├── database/              # SQLite connection and migrations
├── routes/                # API Endpoints (Auth, Movies, Series, Admin, Upload)
├── middleware/            # JWT Auth, Security Headers, Rate Limiting, Validation
├── helpers/               # OMDB API, Caching, OpenSubtitles API
├── public/                # Vanilla HTML/CSS/JS Frontend
├── tests/                 # Integration tests
└── uploads/               # Persisted Video/Subtitle files
```

---

## 💬 OpenSubtitles Setup

To use the 1-click subtitle download feature:
1. Register for a free account at [OpenSubtitles.com](https://www.opensubtitles.com/)
2. Navigate to the Consumers section to generate an API Key.
3. Add the following to your `.env` file:
```env
OPENSUBTITLES_API_KEY=your_api_key
OPENSUBTITLES_USERNAME=your_username
OPENSUBTITLES_PASSWORD=your_password
```

---

## 🛠️ Advanced Deployment & Docs

Check out the detailed documentation files included in the project:
- `DEPLOYMENT.md` - Advanced setup (Nginx Reverse Proxy, SSL, PM2, Systemd)
- `QUICK_REFERENCE.md` - Cheat sheet for API endpoints and scripts.
- `PHASE1_PHASE2_SUMMARY.md` & `PHASE3_SUMMARY.md` - Detailed breakdown of all implemented features.

---

## 🐛 Troubleshooting

- **"Video won't play / seek doesn't work"** - Some browsers (like Safari) strictly require MP4 (H.264). Try converting MKV/AVI files using HandBrake.
- **"OMDB not fetching metadata"** - Verify your `IMDB_API_KEY` in `.env`. Free tier is limited to 1,000 requests/day.
- **"Database locked"** - Stop the server, delete `cinelocal.db-wal` and `cinelocal.db-shm`, then restart.
- **"Upload fails for large files"** - If using Nginx, ensure `client_max_body_size 50G;` is set.

---

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Express.js 4.18 |
| Database | SQLite (better-sqlite3) |
| Security | Helmet, express-rate-limit, express-validator |
| Caching | node-cache |
| Authentication | JWT + bcrypt |
| File Upload | Multer (chunked upload) |
| Metadata | OMDB API & OpenSubtitles API |
| Frontend | Vanilla HTML/CSS/JS |

---

## 📝 License

MIT License - see full license in source code.

---

**Built with ❤️ for self-hosting enthusiasts**

*No tracking. No analytics. No cloud dependency. Your movies, your server, your rules.*
