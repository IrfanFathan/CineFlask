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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Please check if the server is running.');
    }
    
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 specifically, but avoid redirect loops on login/register endpoints
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        // Token expired or invalid
        clearToken();
        window.location.href = '/index.html';
      }
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check if the server is running.');
    }
    // Re-throw other errors
    throw error;
  }
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Show toast notification with icon and animation
 * @param {string} message - Message to display
 * @param {'info'|'success'|'error'|'warning'} type - Toast type
 * @param {number} duration - Duration in ms (default 3500)
 */
function showToast(message, type = 'info', duration = 3500) {
  // Icons per type
  const icons = {
    success: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`,
    error:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
    warning: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`,
    info:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  `;
  toast.innerHTML = `
    <span style="flex-shrink:0;color:${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--info)'}">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Auto dismiss with fade out
  const timer = setTimeout(() => {
    toast.style.animation = 'slideOutUp 0.25s var(--ease-out) forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);

  // Click to dismiss
  toast.onclick = () => {
    clearTimeout(timer);
    toast.style.animation = 'slideOutUp 0.2s var(--ease-out) forwards';
    setTimeout(() => toast.remove(), 200);
  };
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
  const genres = movie.genre ? movie.genre.split(',').map(g => g.trim()).slice(0, 2).join(', ') : '';
  const runtime = movie.runtime || '';
  
  return `
    <div class="movie-card" onclick="window.location.href='/movie.html?id=${movie.id}'">
      <div class="movie-poster-wrapper">
        ${movie.poster_url 
          ? `<img src="${movie.poster_url}" alt="${movie.title} poster" class="movie-poster" loading="lazy">`
          : `<div class="movie-poster-fallback">
               <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                 <path d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18M3 20h18M3 4h18"></path>
               </svg>
               <span style="font-size: 12px; margin-top: 8px;">No Poster</span>
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
        <!-- Hover overlay with quick info -->
        <div class="movie-info-overlay">
          <div class="movie-info-overlay-title">${movie.title}</div>
          <div class="movie-info-overlay-meta">
            <span>${movie.year || 'N/A'}</span>
            ${runtime ? `<span>• ${runtime}</span>` : ''}
            ${movie.imdb_rating ? `<span>• ⭐ ${movie.imdb_rating}</span>` : ''}
          </div>
          ${genres ? `<div class="movie-info-overlay-genre">${genres}</div>` : ''}
        </div>
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

// ============================================
// SERIES HELPERS
// ============================================

/**
 * Format episode code (e.g., "S01 E03")
 */
function formatEpisodeCode(seasonNum, episodeNum) {
  const s = String(seasonNum).padStart(2, '0');
  const e = String(episodeNum).padStart(2, '0');
  return `S${s} E${e}`;
}

/**
 * Format series year range (e.g., "2013–2019" or "2022–Present")
 */
function formatSeriesYearRange(year, endYear, status) {
  if (!year) return '';
  
  if (status === 'Ended' && endYear && endYear !== year) {
    return `${year}–${endYear}`;
  }
  
  if (status === 'Running' || status === 'Continuing') {
    return `${year}–Present`;
  }
  
  return year;
}

/**
 * Get next episode for a given episode ID
 */
async function getNextEpisode(episodeId) {
  try {
    const data = await fetchAPI(`/episodes/${episodeId}`);
    return data.next_episode || null;
  } catch (error) {
    console.error('Failed to get next episode:', error);
    return null;
  }
}

/**
 * Save episode progress
 */
async function saveEpisodeProgress(episodeId, seriesId, profileId, timestamp, duration) {
  try {
    await fetchAPI('/progress/episode', {
      method: 'POST',
      body: JSON.stringify({
        episode_id: episodeId,
        series_id: seriesId,
        profile_id: profileId,
        timestamp,
        duration
      })
    });
  } catch (error) {
    console.error('Failed to save episode progress:', error);
  }
}

/**
 * Get episode progress
 */
async function getEpisodeProgress(episodeId, profileId) {
  try {
    const data = await fetchAPI(`/progress/episode/${episodeId}?profile_id=${profileId}`);
    return data.progress || null;
  } catch (error) {
    console.error('Failed to get episode progress:', error);
    return null;
  }
}

/**
 * Toggle series watchlist
 */
async function toggleSeriesWatchlist(seriesId, profileId, currentState) {
  try {
    if (currentState) {
      await fetchAPI('/watchlist/series', {
        method: 'DELETE',
        body: JSON.stringify({
          series_id: seriesId,
          profile_id: profileId
        })
      });
      return false;
    } else {
      await fetchAPI('/watchlist/series', {
        method: 'POST',
        body: JSON.stringify({
          series_id: seriesId,
          profile_id: profileId
        })
      });
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle series watchlist:', error);
    throw error;
  }
}

/**
 * Create series card HTML
 */
function createSeriesCard(series, episodeProgress = null) {
  const hasProgress = episodeProgress && episodeProgress.progress_percentage > 0;
  const seriesId = series.series_id || series.id;
  const yearRange = formatSeriesYearRange(series.year, series.end_year, series.status);
  
  let episodeBadge = '';
  if (episodeProgress && episodeProgress.season_number && episodeProgress.episode_number) {
    const epCode = formatEpisodeCode(episodeProgress.season_number, episodeProgress.episode_number);
    episodeBadge = `<div class="movie-rating-badge" style="background: var(--accent); top: 8px; right: 8px;">${epCode}</div>`;
  }
  
  // Prepare metadata for hover overlay
  const genres = series.genre ? series.genre.split(',').slice(0, 2).join(', ') : '';
  const statusBadge = series.status ? series.status.charAt(0).toUpperCase() + series.status.slice(1) : '';
  
  return `
    <div class="movie-card" onclick="window.location.href='/series.html?id=${seriesId}'">
      <div class="movie-poster-wrapper">
        ${series.poster_url 
          ? `<img src="${series.poster_url}" alt="${series.title} poster" class="movie-poster" loading="lazy">`
          : `<div class="movie-poster-fallback">
               <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                 <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                 <polyline points="17 2 12 7 7 2"></polyline>
               </svg>
               <div style="margin-top: 8px; font-size: 14px; opacity: 0.7;">No Poster</div>
             </div>`
        }
        <div class="movie-rating-badge" style="background: var(--accent); top: 8px; left: 8px;">SERIES</div>
        ${episodeBadge}
        ${series.imdb_rating 
          ? `<div class="movie-rating-badge" style="top: ${episodeBadge ? '42px' : '8px'}; right: 8px; border: 1px solid rgba(255,255,255,0.2);">
               <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
               </svg>
               ${series.imdb_rating}
             </div>`
          : ''
        }
        ${hasProgress 
          ? `<div class="movie-progress-bar">
               <div class="movie-progress-fill" style="width: ${episodeProgress.progress_percentage}%"></div>
             </div>`
          : ''
        }
        
        <!-- Hover Overlay -->
        <div class="movie-info-overlay">
          <div class="movie-title" style="font-weight: 600; margin-bottom: 8px;">${series.title}</div>
          <div class="movie-meta" style="margin-bottom: 8px;">
            ${yearRange}${statusBadge ? ' · ' + statusBadge : ''}${series.imdb_rating ? ' · ⭐ ' + series.imdb_rating : ''}
          </div>
          ${genres ? `<div class="movie-meta" style="font-size: 12px; opacity: 0.8;">${genres}</div>` : ''}
        </div>
      </div>
      <div class="movie-info">
        <div class="movie-title">${series.title}</div>
        <div class="movie-meta">${yearRange}${series.genre ? ' · ' + series.genre.split(',')[0] : ''}</div>
      </div>
    </div>
  `;
}
