/**
 * Enhanced Metadata Fetcher
 * Includes retry logic, circuit breaker, and better error handling
 */

const { metadataCache, generateKey } = require('./cache');
const db = require('../database/db');

// Dynamic import for ES module compatibility
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

// Circuit breaker state
const circuitBreaker = {
  failures: 0,
  lastFailureTime: null,
  state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
  threshold: 5,
  timeout: 60000, // 1 minute
};

/**
 * Record API usage for monitoring
 */
function recordAPIUsage(apiName, endpoint, userId, ipAddress, success, errorMessage = null, responseTimeMs = 0) {
  try {
    const stmt = db.prepare(`
      INSERT INTO api_usage (api_name, endpoint, user_id, ip_address, success, error_message, response_time_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(apiName, endpoint, userId, ipAddress, success ? 1 : 0, errorMessage, responseTimeMs);
  } catch (error) {
    console.error('Failed to record API usage:', error.message);
  }
}

/**
 * Check circuit breaker state
 */
function checkCircuitBreaker() {
  if (circuitBreaker.state === 'OPEN') {
    const now = Date.now();
    if (now - circuitBreaker.lastFailureTime > circuitBreaker.timeout) {
      circuitBreaker.state = 'HALF_OPEN';
      console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
    } else {
      throw new Error('Circuit breaker is OPEN - too many API failures');
    }
  }
}

/**
 * Record circuit breaker success
 */
function recordSuccess() {
  if (circuitBreaker.state === 'HALF_OPEN') {
    circuitBreaker.state = 'CLOSED';
    circuitBreaker.failures = 0;
    console.log('✅ Circuit breaker CLOSED - API recovered');
  }
}

/**
 * Record circuit breaker failure
 */
function recordFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailureTime = Date.now();
  
  if (circuitBreaker.failures >= circuitBreaker.threshold) {
    circuitBreaker.state = 'OPEN';
    console.error('⚠️  Circuit breaker OPEN - too many failures');
  }
}

/**
 * Retry logic wrapper
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`⏳ Retry attempt ${attempt + 1} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Fetch movie metadata from OMDB with retry logic
 */
async function fetchMetadata(title, year = null, userId = null, ipAddress = null) {
  // Ensure fetch is loaded
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }

  // Check cache first
  const cacheKey = generateKey.metadata(title, year);
  const cached = metadataCache.get(cacheKey);
  if (cached) {
    console.log(`💾 Cache hit for metadata: ${title}${year ? ` (${year})` : ''}`);
    return cached;
  }

  const apiKey = process.env.IMDB_API_KEY || process.env.OMDB_API_KEY;

  if (!apiKey || apiKey === 'your_omdb_api_key_here') {
    console.warn('⚠️  OMDB API key not configured. Using default metadata.');
    return getDefaultMetadata(title, year);
  }

  // Check circuit breaker
  try {
    checkCircuitBreaker();
  } catch (error) {
    console.error(error.message);
    recordAPIUsage('OMDB', '/search', userId, ipAddress, false, error.message);
    return getDefaultMetadata(title, year);
  }

  const startTime = Date.now();

  try {
    const metadata = await retryWithBackoff(async () => {
      const cleanTitle = cleanMovieTitle(title);
      let url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(cleanTitle)}`;
      if (year) {
        url += `&y=${year}`;
      }

      console.log(`📡 Fetching metadata: ${cleanTitle}${year ? ` (${year})` : ''}`);

      const response = await fetch(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'CineFlask/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.Response === 'False') {
        // Not a critical error, just no match found
        console.warn(`⚠️  OMDB: ${data.Error || 'Movie not found'}`);
        return getDefaultMetadata(title, year);
      }

      return mapOMDBResponse(data, title, year);
    });

    const responseTime = Date.now() - startTime;
    recordSuccess();
    recordAPIUsage('OMDB', '/search', userId, ipAddress, true, null, responseTime);

    // Cache the result
    metadataCache.set(cacheKey, metadata);
    return metadata;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ OMDB API error:', error.message);
    
    recordFailure();
    recordAPIUsage('OMDB', '/search', userId, ipAddress, false, error.message, responseTime);
    
    return getDefaultMetadata(title, year);
  }
}

/**
 * Fetch metadata by IMDb ID with retry logic
 */
async function fetchMetadataByImdbId(imdbId, userId = null, ipAddress = null) {
  // Ensure fetch is loaded
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }

  // Check cache first
  const cacheKey = generateKey.metadataByImdb(imdbId);
  const cached = metadataCache.get(cacheKey);
  if (cached) {
    console.log(`💾 Cache hit for IMDb ID: ${imdbId}`);
    return cached;
  }

  const apiKey = process.env.IMDB_API_KEY || process.env.OMDB_API_KEY;

  if (!apiKey || apiKey === 'your_omdb_api_key_here') {
    console.warn('⚠️  OMDB API key not configured.');
    return null;
  }

  // Check circuit breaker
  try {
    checkCircuitBreaker();
  } catch (error) {
    console.error(error.message);
    recordAPIUsage('OMDB', '/by-id', userId, ipAddress, false, error.message);
    return null;
  }

  const startTime = Date.now();

  try {
    const metadata = await retryWithBackoff(async () => {
      const cleanId = imdbId.trim().startsWith('tt') ? imdbId.trim() : `tt${imdbId.trim()}`;
      const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${cleanId}`;

      console.log(`📡 Fetching metadata for IMDb ID: ${cleanId}`);

      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'CineFlask/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.Response === 'False') {
        console.warn(`⚠️  OMDB: ${data.Error || 'Movie not found'}`);
        return null;
      }

      return mapOMDBResponse(data);
    });

    const responseTime = Date.now() - startTime;
    recordSuccess();
    recordAPIUsage('OMDB', '/by-id', userId, ipAddress, true, null, responseTime);

    // Cache the result
    if (metadata) {
      metadataCache.set(cacheKey, metadata);
    }
    return metadata;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ OMDB API error:', error.message);
    
    recordFailure();
    recordAPIUsage('OMDB', '/by-id', userId, ipAddress, false, error.message, responseTime);
    
    return null;
  }
}

/**
 * Map OMDB response to database schema
 */
function mapOMDBResponse(data, fallbackTitle = null, fallbackYear = null) {
  return {
    title: data.Title || fallbackTitle || 'Unknown',
    year: data.Year || fallbackYear || 'Unknown',
    description: data.Plot !== 'N/A' ? data.Plot : 'No description available.',
    poster_url: data.Poster !== 'N/A' ? data.Poster : null,
    imdb_id: data.imdbID || null,
    genre: data.Genre !== 'N/A' ? data.Genre : null,
    actors: data.Actors !== 'N/A' ? data.Actors : null,
    director: data.Director !== 'N/A' ? data.Director : null,
    runtime: data.Runtime !== 'N/A' ? data.Runtime : null,
    imdb_rating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
    language: data.Language !== 'N/A' ? data.Language : null,
    country: data.Country !== 'N/A' ? data.Country : null
  };
}

/**
 * Clean movie title for better search results
 */
function cleanMovieTitle(title) {
  return title
    .replace(/\.(mp4|mkv|avi|mov|webm|m4v|flv)$/i, '')
    .replace(/\b(1080p|720p|480p|2160p|4K|BluRay|BRRip|WEB-DL|WEBRip|HDRip|DVDRip|HDTV|x264|x265|HEVC)\b/gi, '')
    .replace(/[\[\(]\d{4}[\]\)]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[._]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract year from filename
 */
function extractYear(filename) {
  const yearMatch = filename.match(/[\[\(]?(\d{4})[\]\)]?/);
  return yearMatch ? yearMatch[1] : null;
}

/**
 * Return default metadata
 */
function getDefaultMetadata(title, year) {
  return {
    title: cleanMovieTitle(title),
    year: year || extractYear(title) || 'Unknown',
    description: 'No description available.',
    poster_url: null,
    imdb_id: null,
    genre: null,
    actors: null,
    director: null,
    runtime: null,
    imdb_rating: null,
    language: null,
    country: null
  };
}

/**
 * Get circuit breaker status
 */
function getCircuitBreakerStatus() {
  return {
    state: circuitBreaker.state,
    failures: circuitBreaker.failures,
    lastFailureTime: circuitBreaker.lastFailureTime,
    threshold: circuitBreaker.threshold
  };
}

module.exports = {
  fetchMetadata,
  fetchMetadataByImdbId,
  cleanMovieTitle,
  extractYear,
  getCircuitBreakerStatus,
  recordAPIUsage
};
