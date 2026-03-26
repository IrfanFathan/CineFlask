# 🎬 CineLocal - Your Private Cinema

A fully self-hosted movie streaming platform that runs on any old PC/laptop and streams to every device on your Wi-Fi network. No cloud, no subscriptions, no apps required — just open a browser.

![Platform](https://img.shields.io/badge/Platform-Node.js-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## ✨ Features

- **🔐 Multi-user Authentication** - JWT-based secure login system
- **👥 Multiple Profiles** - Up to 4 profiles per account (Netflix-style)
- **📺 HTTP Range Streaming** - Seek/resume works on all devices (iOS, Android, Desktop)
- **⏯️ Resume Playback** - Continue watching exactly where you left off
- **❤️ Watchlist/Favorites** - Bookmark movies to watch later
- **🔍 Search** - Find movies by title, actor, genre, or director
- **📤 Chunked Uploads** - Reliably upload large files (50GB+) with progress tracking
- **🎭 Auto-Metadata** - Fetches posters, cast, ratings, and descriptions from OMDB
- **📱 Mobile Responsive** - Works beautifully on phones, tablets, and desktops
- **🌐 LAN Streaming** - Access from any device on the same Wi-Fi network
- **🎨 Netflix-Style UI** - Dark theme with hero banners and smooth animations

---

## 🚀 Quick Start

### 1. Prerequisites

Install **Node.js 20 LTS** from [nodejs.org](https://nodejs.org)

Verify installation:
```bash
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

### 2. Installation

```bash
# Clone or download the project
cd CineFlask

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Configuration

Edit `.env` file:

```env
PORT=3000
HOST_IP=192.168.1.45        # ⚠️ REPLACE with your LAN IP (see instructions.md)
JWT_SECRET=your-very-long-random-secret-minimum-32-characters
OMDB_API_KEY=your_omdb_key  # Get free key at https://www.omdbapi.com/apikey.aspx
```

**Finding your LAN IP:**
- **Windows**: Run `ipconfig` in Command Prompt, look for "IPv4 Address"
- **Mac**: Run `ipconfig getifaddr en0` in Terminal
- **Linux**: Run `hostname -I` in Terminal

**Get OMDB API Key (free):**
1. Go to https://www.omdbapi.com/apikey.aspx
2. Select "FREE (1,000 daily limit)"
3. Enter your email and activate via email link
4. Copy the key into `.env`

### 4. Initialize Database

```bash
npm run setup
```

You should see:
```
✓ Database initialized successfully!
```

### 5. Start Server

```bash
npm start
```

The server will display your local URLs:
```
🎬 ═══════════════════════════════════════════════════════
   CineLocal - Your Private Cinema
   ═══════════════════════════════════════════════════════

   ✓ Server is running and accessible at:

     → http://192.168.1.45:3000

   Open the URL above on any device connected to your Wi-Fi
   ═══════════════════════════════════════════════════════
```

### 6. Access from Any Device

On your phone, tablet, or another computer connected to the **same Wi-Fi**:

1. Open any browser (Chrome, Safari, Firefox, Edge)
2. Navigate to `http://YOUR_LAN_IP:3000`
3. Register an account and start streaming!

---

## 📁 Project Structure

```
CineFlask/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env                   # Configuration (create from .env.example)
├── database/
│   ├── db.js              # SQLite connection
│   └── init.js            # Database setup script
├── routes/
│   ├── auth.js            # Login/register endpoints
│   ├── profiles.js        # Profile management
│   ├── movies.js          # Movie CRUD + search
│   ├── upload.js          # Chunked file upload
│   ├── stream.js          # Video streaming with range support
│   ├── progress.js        # Resume playback tracking
│   └── watchlist.js       # Favorites/bookmarks
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── errorHandler.js    # Global error handling
├── helpers/
│   └── metadata.js        # OMDB API integration
├── public/                # Frontend files
│   ├── index.html         # Login/register page
│   ├── profiles.html      # Profile picker
│   ├── home.html          # Browse/home page
│   ├── movie.html         # Movie details
│   ├── player.html        # Video player
│   ├── upload.html        # File upload
│   ├── css/style.css      # Global styles
│   └── js/utils.js        # Frontend utilities
└── uploads/               # Video files stored here
```

---

## 🎯 Usage

### Uploading Movies

1. Click **Upload** button in navigation
2. Drag-and-drop a video file or click to browse
3. Enter movie title (or leave blank to auto-detect)
4. Click **Upload** and wait for completion
5. Metadata (poster, cast, rating) is fetched automatically from OMDB

**Supported formats:** MP4, MKV, AVI, MOV, WebM  
**Recommended:** MP4 (H.264) for best browser compatibility  
**Max size:** 50GB (configurable in `.env`)

### Watching Movies

1. Browse movies on home page
2. Click a movie card to view details
3. Click **Play** to start streaming
4. Video automatically resumes from your last position
5. Use keyboard shortcuts:
   - `Space` - Play/Pause
   - `←/→` - Skip backward/forward 10 seconds
   - `F` - Toggle fullscreen
   - `Esc` - Exit fullscreen

### Managing Profiles

1. After login, select or create a profile
2. Each profile has independent:
   - Watch history
   - Watchlist
   - Resume positions
3. Max 4 profiles per account

---

## 🔧 Advanced Configuration

### Auto-Start on Boot (Optional)

Install PM2 process manager:

```bash
npm install -g pm2
pm2 start server.js --name cinelocal
pm2 save
pm2 startup
```

Copy and run the command that `pm2 startup` outputs.

**Manage server:**
```bash
pm2 stop cinelocal      # Stop server
pm2 restart cinelocal   # Restart server
pm2 logs cinelocal      # View logs
```

### Firewall Configuration

If other devices can't connect, allow port 3000:

**Windows:**
1. Search "Windows Defender Firewall"
2. Advanced Settings → Inbound Rules → New Rule
3. Port → TCP → 3000 → Allow

**Linux (ufw):**
```bash
sudo ufw allow 3000/tcp
```

**macOS:**
```bash
# Usually no firewall configuration needed
```

### Static IP Assignment

To prevent your LAN IP from changing:

1. Access your router's admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Find "DHCP Reservation" or "Static DHCP"
3. Assign a static IP to your PC's MAC address
4. Update `HOST_IP` in `.env` if it changed

---

## 🛠️ Development

### Running with Auto-Reload

```bash
npm run dev
```

Uses `nodemon` to restart server on file changes.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST_IP` | Required | Your LAN IP address |
| `JWT_SECRET` | Required | Secret for signing tokens (min 32 chars) |
| `OMDB_API_KEY` | Optional | OMDB API key for metadata |
| `MAX_FILE_SIZE_GB` | `50` | Maximum upload size in GB |
| `CHUNK_SIZE_MB` | `5` | Upload chunk size in MB |

### API Endpoints

<details>
<summary>View API Documentation</summary>

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

#### Profiles
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

#### Movies
- `GET /api/movies` - List all movies (supports `?q=search`)
- `GET /api/movies/:id` - Get single movie
- `DELETE /api/movies/:id` - Delete movie

#### Upload
- `POST /api/upload/init` - Initialize chunked upload
- `POST /api/upload/chunk` - Upload single chunk
- `POST /api/upload/complete` - Finalize upload
- `POST /api/upload/cancel` - Cancel upload

#### Streaming
- `GET /api/stream/:id` - Stream video with range support

#### Progress
- `GET /api/progress` - Get continue watching list
- `GET /api/progress/:movie_id` - Get progress for movie
- `POST /api/progress` - Save progress
- `DELETE /api/progress/:movie_id` - Reset progress

#### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:movie_id` - Remove from watchlist

</details>

---

## 🐛 Troubleshooting

### "Can't connect from phone"
- Ensure both devices are on the **same Wi-Fi network**
- Check you're using the correct LAN IP
- Verify server is running (`node server.js`)
- Check firewall settings (see Advanced Configuration)

### "Video won't play / seek doesn't work"
- Convert to MP4 using [HandBrake](https://handbrake.fr/) (free)
- MKV/AVI may not work in Safari
- Ensure HTTP range requests are enabled (default in this app)

### "OMDB not fetching metadata"
- Check `OMDB_API_KEY` in `.env`
- Verify you activated the key via email
- Free tier limit: 1,000 requests/day
- Try searching exact IMDb title

### "Upload fails for large files"
- Increase Node.js memory: `node --max-old-space-size=4096 server.js`
- Check available disk space
- Try splitting into smaller files

### "LAN IP changed"
- Assign static IP in router (see Advanced Configuration)
- Update `HOST_IP` in `.env`
- Restart server

---

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Express.js 4.18 |
| Database | SQLite (better-sqlite3) |
| Authentication | JWT + bcrypt |
| File Upload | Multer (chunked upload) |
| Metadata | OMDB API |
| Frontend | Vanilla HTML/CSS/JS |
| Icons | Lucide Icons |
| Fonts | Google Fonts (Outfit + Inter) |

---

## 📝 License

MIT License - see full license in source code.

---

## 🙏 Credits

- **OMDB API** - Movie metadata provider
- **Design Inspiration** - Netflix, Prime Video, Plex
- **Typography** - Google Fonts (Outfit & Inter)
- **Icons** - Lucide Icons

---

## 🚧 Roadmap

Potential future features (not currently implemented):

- [ ] Subtitle support (.srt files)
- [ ] Video transcoding (auto-convert to MP4)
- [ ] TV shows & seasons support
- [ ] Advanced search filters (year, rating, genre)
- [ ] User roles (admin/viewer)
- [ ] Download for offline viewing
- [ ] Chromecast/AirPlay support
- [ ] Theme customization

---

## 💬 Support

For detailed setup instructions, see `instructions.md`  
For design specifications, see `ui.md` and `typography.md`  
For architecture details, see `plan.md`

---

**Built with ❤️ for self-hosting enthusiasts**

*No tracking. No analytics. No cloud dependency. Your movies, your server, your rules.*
