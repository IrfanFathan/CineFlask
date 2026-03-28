/**
 * Caching Service
 * In-memory cache for frequently accessed data like metadata
 */

const NodeCache = require('node-cache');

// Create cache instances with different TTLs
const metadataCache = new NodeCache({
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Performance optimization - don't clone objects
  maxKeys: 1000, // Maximum 1000 cached items
});

const movieListCache = new NodeCache({
  stdTTL: 300, // 5 minutes for movie lists
  checkperiod: 120,
  useClones: false,
  maxKeys: 100,
});

// Generate cache keys
const generateKey = {
  metadata: (title, year) => `metadata:${title}:${year || 'any'}`,
  metadataByImdb: (imdbId) => `metadata:imdb:${imdbId}`,
  movieList: (filters) => {
    const sortedFilters = Object.keys(filters)
      .sort()
      .map(key => `${key}=${filters[key]}`)
      .join('&');
    return `movies:${sortedFilters}`;
  },
  seriesList: (filters) => {
    const sortedFilters = Object.keys(filters)
      .sort()
      .map(key => `${key}=${filters[key]}`)
      .join('&');
    return `series:${sortedFilters}`;
  },
};

// Cache statistics
const getStats = () => {
  return {
    metadata: metadataCache.getStats(),
    movieList: movieListCache.getStats(),
  };
};

// Clear all caches
const clearAll = () => {
  metadataCache.flushAll();
  movieListCache.flushAll();
};

// Clear specific cache
const clearMetadata = () => metadataCache.flushAll();
const clearMovieLists = () => movieListCache.flushAll();

module.exports = {
  metadataCache,
  movieListCache,
  generateKey,
  getStats,
  clearAll,
  clearMetadata,
  clearMovieLists,
};
