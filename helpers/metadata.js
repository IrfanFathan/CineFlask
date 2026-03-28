/**
 * IMDb Metadata Fetcher (via OMDB API)
 * Fetches movie metadata from OMDB API which provides IMDb data
 * Docs: http://www.omdbapi.com/
 */

const { metadataCache, generateKey } = require('./cache');

// Dynamic import for ES module compatibility
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

/**
 * Fetch movie metadata from OMDB (IMDb data)
 * @param {string} title - Movie title to search
 * @param {string} year - Optional year to narrow search
 * @returns {Promise<Object>} Movie metadata or null if not found
 */
async function fetchMetadata(title, year = null) {
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
    console.warn('⚠️  IMDB_API_KEY not configured. Skipping metadata fetch.');
    return getDefaultMetadata(title, year);
  }

  try {
    // Clean up title (remove file extensions, special chars)
    const cleanTitle = cleanMovieTitle(title);

    // Build API URL
    let url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(cleanTitle)}`;
    if (year) {
      url += `&y=${year}`;
    }

    console.log(`📡 Fetching metadata for: ${cleanTitle}${year ? ` (${year})` : ''}`);

    const response = await fetch(url);
    const data = await response.json();

    // OMDB returns Response: "False" if movie not found
    if (data.Response === 'False') {
      console.warn(`⚠️  OMDB: ${data.Error || 'Movie not found'}`);
      return getDefaultMetadata(title, year);
    }

    // Map OMDB response to our database schema
    const metadata = {
      title: data.Title || title,
      year: data.Year || year || 'Unknown',
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

    // Cache the result
    metadataCache.set(cacheKey, metadata);
    return metadata;

  } catch (error) {
    console.error('❌ OMDB API error:', error.message);
    return getDefaultMetadata(title, year);
  }
}

/**
 * Fetch movie metadata by IMDb ID
 * @param {string} imdbId - IMDb ID (e.g., tt0111161)
 * @returns {Promise<Object>} Movie metadata or null if not found
 */
async function fetchMetadataByImdbId(imdbId) {
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
    console.warn('⚠️  IMDB_API_KEY not configured. Skipping metadata fetch.');
    return null;
  }

  try {
    // Clean IMDb ID (ensure it starts with 'tt')
    const cleanId = imdbId.trim().startsWith('tt') ? imdbId.trim() : `tt${imdbId.trim()}`;

    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${cleanId}`;

    console.log(`📡 Fetching metadata for IMDb ID: ${cleanId}`);

    const response = await fetch(url);
    const data = await response.json();

    // OMDB returns Response: "False" if not found
    if (data.Response === 'False') {
      console.warn(`⚠️  OMDB: ${data.Error || 'Movie not found'}`);
      return null;
    }

    // Map OMDB response to our database schema
    const metadata = {
      title: data.Title || 'Unknown',
      year: data.Year || 'Unknown',
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

    // Cache the result
    metadataCache.set(cacheKey, metadata);
    return metadata;

  } catch (error) {
    console.error('❌ OMDB API error:', error.message);
    return null;
  }
}

/**
 * Clean movie title for better OMDB search results
 * Removes file extensions, year in brackets, quality tags, etc.
 */
function cleanMovieTitle(title) {
  return title
    // Remove file extensions
    .replace(/\.(mp4|mkv|avi|mov|webm|m4v|flv)$/i, '')
    // Remove quality tags like 1080p, 720p, BluRay, WEB-DL, etc.
    .replace(/\b(1080p|720p|480p|2160p|4K|BluRay|BRRip|WEB-DL|WEBRip|HDRip|DVDRip|HDTV|x264|x265|HEVC)\b/gi, '')
    // Remove year in brackets or parentheses
    .replace(/[\[\(]\d{4}[\]\)]/g, '')
    // Remove common group tags
    .replace(/\[.*?\]/g, '')
    // Replace dots/underscores with spaces
    .replace(/[._]/g, ' ')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract year from filename (e.g., "Movie.Name.2021.1080p.mp4" -> "2021")
 */
function extractYear(filename) {
  const yearMatch = filename.match(/[\[\(]?(\d{4})[\]\)]?/);
  return yearMatch ? yearMatch[1] : null;
}

/**
 * Return default metadata when OMDB fails or API key not configured
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

module.exports = {
  fetchMetadata,
  fetchMetadataByImdbId,
  cleanMovieTitle,
  extractYear
};
