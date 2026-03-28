/**
 * CineLocal Server
 * Local Wi-Fi movie streaming platform
 * 
 * Usage:
 *   npm start  - Start the server
 *   npm run dev - Start with auto-reload (nodemon)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const movieRoutes = require('./routes/movies');
const uploadRoutes = require('./routes/upload');
const streamRoutes = require('./routes/stream');
const progressRoutes = require('./routes/progress');
const watchlistRoutes = require('./routes/watchlist');
const subtitleRoutes = require('./routes/subtitles');
const metadataRoutes = require('./routes/metadata');
const adminRoutes = require('./routes/admin');

// Import series routes
const seriesRoutes = require('./routes/series');
const seasonsRoutes = require('./routes/seasons');
const episodesRoutes = require('./routes/episodes');
const uploadSeriesRoutes = require('./routes/upload-series');
const streamEpisodeRoutes = require('./routes/stream-episode');
const subtitlesEpisodeRoutes = require('./routes/subtitles-episode');
const progressEpisodeRoutes = require('./routes/progress-episode');
const watchlistSeriesRoutes = require('./routes/watchlist-series');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/security');
const { generalLimiter, authLimiter, uploadLimiter, metadataLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers (helmet)
app.use(securityHeaders);

// General rate limiting
app.use(generalLimiter);

// Enable CORS for all LAN devices
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// API ROUTES
// ============================================

// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Regular routes
app.use('/api/profiles', profileRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/subtitles', subtitleRoutes);
app.use('/api/metadata', metadataLimiter, metadataRoutes);
app.use('/api/admin', adminRoutes);

// Series routes
app.use('/api/series', seriesRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/episodes', episodesRoutes);
app.use('/api/upload-series', uploadLimiter, uploadSeriesRoutes);
app.use('/api/stream/episode', streamEpisodeRoutes);
app.use('/api/subtitles/episode', subtitlesEpisodeRoutes);
app.use('/api/progress/episode', progressEpisodeRoutes);
app.use('/api/watchlist/series', watchlistSeriesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CineLocal is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve frontend pages (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all network interfaces (allows LAN access)

// Validate environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_this_to_a_long_random_string_minimum_32_characters_please') {
  console.error('\n❌ ERROR: JWT_SECRET not configured in .env file');
  console.error('Please copy .env.example to .env and set a secure JWT_SECRET\n');
  process.exit(1);
}

// Ensure required directories exist
const requiredDirs = ['uploads', 'temp', 'series', 'subtitles/episodes'];
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Check if database exists
const dbPath = path.join(__dirname, 'cinelocal.db');
if (!fs.existsSync(dbPath)) {
  console.error('\n❌ ERROR: Database not initialized');
  console.error('Please run: npm run setup\n');
  process.exit(1);
}

// Start server
app.listen(PORT, HOST, () => {
  console.log('\n🎬 ═══════════════════════════════════════════════════════');
  console.log('   CineLocal - Your Private Cinema');
  console.log('   ═══════════════════════════════════════════════════════\n');
  
  // Display all local IP addresses
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];

  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        addresses.push(iface.address);
      }
    });
  });

  if (addresses.length > 0) {
    console.log('   ✓ Server is running and accessible at:\n');
    addresses.forEach(addr => {
      console.log(`     → http://${addr}:${PORT}`);
    });
    console.log('');
  } else {
    console.log(`   ✓ Server is running on port ${PORT}\n`);
  }

  console.log('   Open the URL above on any device connected to your Wi-Fi');
  console.log('   ═══════════════════════════════════════════════════════\n');
  console.log(`   OMDB API: ${process.env.OMDB_API_KEY ? '✓ Configured' : '✗ Not configured (upload will work but no metadata)'}`);
  console.log(`   Max file size: ${process.env.MAX_FILE_SIZE_GB || 50}GB`);
  console.log('   Chunk size:', (process.env.CHUNK_SIZE_MB || 5) + 'MB\n');
  console.log('   Press Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down CineLocal server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down CineLocal server...');
  process.exit(0);
});
