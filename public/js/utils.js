/**
 * Utility Functions for CineLocal Frontend
 * Shared helpers for API calls, authentication, and UI
 */

// ============================================
// API BASE URL
// ============================================
const API_BASE = window.location.origin + '/api';

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Get JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem('cinelocal_token');
}

/**
 * Save JWT token to localStorage
 */
function setToken(token) {
  localStorage.setItem('cinelocal_token', token);
}

/**
 * Remove JWT token from localStorage
 */
function clearToken() {
  localStorage.removeItem('cinelocal_token');
  localStorage.removeItem('cinelocal_user');
  localStorage.removeItem('cinelocal_profile');
}

/**
 * Get current user from localStorage
 */
function getUser() {
  const userStr = localStorage.getItem('cinelocal_user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Save user data to localStorage
 */
function setUser(user) {
  localStorage.setItem('cinelocal_user', JSON.stringify(user));
}

/**
 * Get selected profile from sessionStorage
 */
function getProfile() {
  const profileStr = sessionStorage.getItem('cinelocal_profile');
  return profileStr ? JSON.parse(profileStr) : null;
}

/**
 * Save selected profile to sessionStorage
 */
function setProfile(profile) {
  sessionStorage.setItem('cinelocal_profile', JSON.stringify(profile));
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getToken();
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

/**
 * Logout user
 */
function logout() {
  clearToken();
  window.location.href = '/index.html';
}

// ============================================
// API CALLS
// ============================================

/**
 * Make authenticated API request
 */
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      clearToken();
      window.location.href = '/index.html';
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2h 28m")
 */
function formatDuration(seconds) {
  if (!seconds) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format timestamp to time string
 * @param {number} seconds - Timestamp in seconds
 * @returns {string} Formatted time (e.g., "1:23:45")
 */
function formatTime(seconds) {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse runtime string (e.g., "148 min") to seconds
 */
function parseRuntime(runtime) {
  if (!runtime) return null;
  const match = runtime.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : null;
}

/**
 * Get initials from name for avatar
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get URL parameter
 */
function getURLParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Create movie card HTML
 */
function createMovieCard(movie, progressPercent = null) {
  const hasProgress = progressPercent !== null && progressPercent > 0;
  
  return `
    <div class="movie-card" onclick="window.location.href='/movie.html?id=${movie.id}'">
      <div class="movie-poster-wrapper">
        ${movie.poster_url 
          ? `<img src="${movie.poster_url}" alt="${movie.title} poster" class="movie-poster" loading="lazy">`
          : `<div class="movie-poster-fallback">
               <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                 <path d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18M3 20h18M3 4h18"></path>
               </svg>
             </div>`
        }
        ${movie.imdb_rating 
          ? `<div class="movie-rating-badge">
               <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
               </svg>
               ${movie.imdb_rating}
             </div>`
          : ''
        }
        ${hasProgress 
          ? `<div class="movie-progress-bar">
               <div class="movie-progress-fill" style="width: ${progressPercent}%"></div>
             </div>`
          : ''
        }
      </div>
      <div class="movie-info">
        <div class="movie-title">${movie.title}</div>
        <div class="movie-meta">${movie.year}${movie.genre ? ' · ' + movie.genre.split(',')[0] : ''}</div>
      </div>
    </div>
  `;
}

/**
 * Show loading overlay
 */
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Initialize Lucide icons on page
 */
function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Initialize icons when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIcons);
} else {
  initIcons();
}
