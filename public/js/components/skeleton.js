/**
 * Skeleton Loading Component
 * Placeholder for content while loading (better UX than spinners)
 * 
 * Features:
 * - Multiple skeleton types: card, text, avatar, button
 * - Movie card specific skeleton
 * - Accessible loading states
 * - Automatic show/hide with content replacement
 * 
 * Usage:
 * ```js
 * import Skeleton from './components/skeleton.js';
 * 
 * // Show skeleton while loading
 * Skeleton.show('#movie-grid', 'card', 6); // 6 movie card skeletons
 * 
 * // Replace with actual content
 * fetch('/api/movies')
 *   .then(res => res.json())
 *   .then(movies => {
 *     Skeleton.hide('#movie-grid');
 *     renderMovies(movies);
 *   });
 * 
 * // Create individual skeleton elements
 * const textSkeleton = Skeleton.create('text');
 * const cardSkeleton = Skeleton.create('card');
 * 
 * // Show loading state on existing element
 * Skeleton.loading('#my-element', true);
 * Skeleton.loading('#my-element', false);
 * ```
 */

class SkeletonManager {
  constructor() {
    this.activeSkeletons = new Map();
  }

  /**
   * Create a skeleton element
   * @param {string} type - Skeleton type (card, text, avatar, button, poster)
   * @param {Object} options - Additional options
   * @returns {HTMLElement} Skeleton element
   */
  create(type = 'text', options = {}) {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton--${type}`;
    skeleton.setAttribute('aria-hidden', 'true');

    switch (type) {
      case 'card':
        skeleton.innerHTML = this.createCardSkeleton(options);
        break;
      case 'movie-card':
        skeleton.innerHTML = this.createMovieCardSkeleton(options);
        break;
      case 'text':
        skeleton.innerHTML = this.createTextSkeleton(options);
        break;
      case 'avatar':
        skeleton.className += ` skeleton--avatar-${options.size || 'md'}`;
        break;
      case 'button':
        skeleton.className = 'skeleton skeleton--button';
        break;
      case 'poster':
        skeleton.className = 'skeleton skeleton--poster';
        break;
      case 'hero':
        skeleton.innerHTML = this.createHeroSkeleton(options);
        break;
      default:
        skeleton.className = 'skeleton skeleton--text';
    }

    return skeleton;
  }

  /**
   * Create card skeleton HTML
   * @param {Object} options - Options
   * @returns {string} HTML string
   */
  createCardSkeleton(options = {}) {
    return `
      <div class="skeleton__poster"></div>
      <div class="skeleton__content">
        <div class="skeleton__text skeleton__text--title"></div>
        <div class="skeleton__text skeleton__text--subtitle"></div>
      </div>
    `;
  }

  /**
   * Create movie card skeleton HTML
   * @param {Object} options - Options
   * @returns {string} HTML string
   */
  createMovieCardSkeleton(options = {}) {
    return `
      <div class="skeleton__poster-wrapper">
        <div class="skeleton__poster"></div>
      </div>
      <div class="skeleton__content">
        <div class="skeleton__text skeleton__text--title"></div>
        <div class="skeleton__text skeleton__text--subtitle"></div>
      </div>
    `;
  }

  /**
   * Create text skeleton HTML
   * @param {Object} options - Options
   * @returns {string} HTML string
   */
  createTextSkeleton(options = {}) {
    const { lines = 1, widths = [] } = options;
    let html = '';
    
    for (let i = 0; i < lines; i++) {
      const width = widths[i] || (i === lines - 1 ? '60%' : '100%');
      html += `<div class="skeleton__line" style="width: ${width}"></div>`;
    }
    
    return html;
  }

  /**
   * Create hero skeleton HTML
   * @param {Object} options - Options
   * @returns {string} HTML string
   */
  createHeroSkeleton(options = {}) {
    return `
      <div class="skeleton__hero-backdrop"></div>
      <div class="skeleton__hero-content">
        <div class="skeleton__text skeleton__text--hero-title"></div>
        <div class="skeleton__text skeleton__text--hero-meta"></div>
        <div class="skeleton__text skeleton__text--hero-desc" style="width: 80%"></div>
        <div class="skeleton__text skeleton__text--hero-desc" style="width: 60%"></div>
        <div class="skeleton__hero-actions">
          <div class="skeleton skeleton--button"></div>
          <div class="skeleton skeleton--button"></div>
        </div>
      </div>
    `;
  }

  /**
   * Show skeletons in a container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {string} type - Skeleton type
   * @param {number} count - Number of skeletons
   * @param {Object} options - Additional options
   */
  show(container, type = 'card', count = 1, options = {}) {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerEl) {
      console.warn('Skeleton: Container not found');
      return;
    }

    // Store original content
    const containerId = containerEl.id || this.generateId();
    containerEl.id = containerId;
    
    this.activeSkeletons.set(containerId, {
      originalContent: containerEl.innerHTML,
      originalAriaLabel: containerEl.getAttribute('aria-label')
    });

    // Clear container
    containerEl.innerHTML = '';

    // Create skeleton wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'skeleton-wrapper';
    wrapper.setAttribute('role', 'status');
    wrapper.setAttribute('aria-label', 'Loading content');

    // Add screen reader text
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = 'Loading...';
    wrapper.appendChild(srText);

    // Create skeletons
    for (let i = 0; i < count; i++) {
      const skeleton = this.create(type, options);
      wrapper.appendChild(skeleton);
    }

    containerEl.appendChild(wrapper);
    containerEl.setAttribute('aria-busy', 'true');
  }

  /**
   * Hide skeletons and optionally restore original content
   * @param {string|HTMLElement} container - Container selector or element
   * @param {boolean} restore - Whether to restore original content
   */
  hide(container, restore = false) {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerEl) return;

    const containerId = containerEl.id;
    
    if (restore && this.activeSkeletons.has(containerId)) {
      const { originalContent, originalAriaLabel } = this.activeSkeletons.get(containerId);
      containerEl.innerHTML = originalContent;
      if (originalAriaLabel) {
        containerEl.setAttribute('aria-label', originalAriaLabel);
      }
    }

    containerEl.removeAttribute('aria-busy');
    this.activeSkeletons.delete(containerId);
  }

  /**
   * Replace skeletons with actual content
   * @param {string|HTMLElement} container - Container selector or element
   * @param {string|HTMLElement|HTMLElement[]} content - New content
   */
  replace(container, content) {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerEl) return;

    // Remove skeleton wrapper
    const wrapper = containerEl.querySelector('.skeleton-wrapper');
    if (wrapper) {
      wrapper.remove();
    }

    // Add new content
    if (typeof content === 'string') {
      containerEl.innerHTML += content;
    } else if (Array.isArray(content)) {
      content.forEach(el => containerEl.appendChild(el));
    } else if (content instanceof HTMLElement) {
      containerEl.appendChild(content);
    }

    containerEl.removeAttribute('aria-busy');
    
    const containerId = containerEl.id;
    if (containerId) {
      this.activeSkeletons.delete(containerId);
    }

    // Announce content loaded
    if (typeof window !== 'undefined' && window.A11y) {
      window.A11y.announce('Content loaded');
    }
  }

  /**
   * Toggle loading state on an element
   * @param {string|HTMLElement} element - Element selector or element
   * @param {boolean} isLoading - Loading state
   */
  loading(element, isLoading) {
    const el = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!el) return;

    if (isLoading) {
      el.classList.add('is-loading');
      el.setAttribute('aria-busy', 'true');
      
      // Add skeleton overlay if not exists
      if (!el.querySelector('.skeleton-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'skeleton-overlay';
        overlay.innerHTML = '<div class="skeleton skeleton--pulse"></div>';
        el.appendChild(overlay);
      }
    } else {
      el.classList.remove('is-loading');
      el.removeAttribute('aria-busy');
      
      // Remove skeleton overlay
      const overlay = el.querySelector('.skeleton-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  }

  /**
   * Create a loading button state
   * @param {HTMLElement} button - Button element
   * @param {boolean} isLoading - Loading state
   * @param {string} loadingText - Text to show while loading
   */
  buttonLoading(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;

    if (isLoading) {
      // Store original content
      button.dataset.originalContent = button.innerHTML;
      button.dataset.originalDisabled = button.disabled;
      
      button.innerHTML = `
        <span class="btn__spinner" aria-hidden="true"></span>
        <span>${loadingText}</span>
      `;
      button.disabled = true;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
    } else {
      // Restore original content
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
      if (button.dataset.originalDisabled !== undefined) {
        button.disabled = button.dataset.originalDisabled === 'true';
        delete button.dataset.originalDisabled;
      }
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `skeleton-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if container is showing skeletons
   * @param {string|HTMLElement} container - Container selector or element
   * @returns {boolean}
   */
  isLoading(container) {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerEl) return false;
    
    return containerEl.getAttribute('aria-busy') === 'true';
  }

  /**
   * Create movie grid skeletons (convenience method)
   * @param {string|HTMLElement} container - Container selector or element
   * @param {number} count - Number of cards
   */
  showMovieGrid(container, count = 12) {
    this.show(container, 'movie-card', count);
  }

  /**
   * Create text paragraph skeleton (convenience method)
   * @param {string|HTMLElement} container - Container selector or element
   * @param {number} lines - Number of lines
   */
  showText(container, lines = 3) {
    this.show(container, 'text', 1, { lines });
  }
}

// Create singleton instance
const Skeleton = new SkeletonManager();

// Export for ES modules
export default Skeleton;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
  window.Skeleton = Skeleton;
}
