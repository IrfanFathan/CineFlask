/**
 * Accessibility Utilities
 * Helpers for focus management, screen reader announcements, and keyboard navigation
 * 
 * Features:
 * - Focus trap for modals/dialogs
 * - Screen reader announcements
 * - Keyboard shortcut management
 * - Focus management utilities
 * 
 * Usage:
 * ```js
 * import A11y from './a11y.js';
 * 
 * // Create focus trap
 * const trap = A11y.trapFocus(modalElement);
 * trap.activate();
 * trap.deactivate();
 * 
 * // Announce to screen readers
 * A11y.announce('Item added to cart');
 * 
 * // Register keyboard shortcuts
 * A11y.registerShortcut('/', () => focusSearch(), 'Focus search');
 * A11y.registerShortcut('Escape', () => closeModal());
 * ```
 */

class AccessibilityUtils {
  constructor() {
    this.shortcuts = new Map();
    this.liveRegion = null;
    this.focusHistory = [];
    
    this.init();
  }

  /**
   * Initialize accessibility utilities
   */
  init() {
    // Create live region for announcements
    this.createLiveRegion();
    
    // Setup global keyboard listener
    this.setupKeyboardListener();
  }

  /**
   * Create ARIA live region for screen reader announcements
   */
  createLiveRegion() {
    // Check if already exists
    if (document.getElementById('a11y-live-region')) {
      this.liveRegion = document.getElementById('a11y-live-region');
      return;
    }

    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'a11y-live-region';
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announce(message, priority = 'polite') {
    if (!this.liveRegion) {
      this.createLiveRegion();
    }

    // Set priority
    this.liveRegion.setAttribute('aria-live', priority);
    
    // Clear and set message (required for re-announcement)
    this.liveRegion.textContent = '';
    
    // Small delay to ensure screen reader picks up the change
    requestAnimationFrame(() => {
      this.liveRegion.textContent = message;
    });
  }

  /**
   * Announce assertively (interrupts current speech)
   * @param {string} message - Message to announce
   */
  announceAssertive(message) {
    this.announce(message, 'assertive');
  }

  /**
   * Create a focus trap within an element
   * @param {HTMLElement} container - Container element to trap focus within
   * @returns {Object} Focus trap controller
   */
  trapFocus(container) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(',');

    let active = false;
    let previouslyFocused = null;

    const getFocusableElements = () => {
      return Array.from(container.querySelectorAll(focusableSelectors))
        .filter(el => el.offsetParent !== null); // Filter out hidden elements
    };

    const handleKeyDown = (e) => {
      if (!active || e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    return {
      /**
       * Activate focus trap
       */
      activate: () => {
        if (active) return;
        
        active = true;
        previouslyFocused = document.activeElement;
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Focus first focusable element
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          // If no focusable elements, make container focusable
          container.setAttribute('tabindex', '-1');
          container.focus();
        }
      },

      /**
       * Deactivate focus trap and restore focus
       */
      deactivate: () => {
        if (!active) return;
        
        active = false;
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore focus to previously focused element
        if (previouslyFocused && previouslyFocused.focus) {
          previouslyFocused.focus();
        }
      },

      /**
       * Check if trap is active
       */
      isActive: () => active
    };
  }

  /**
   * Setup global keyboard shortcut listener
   */
  setupKeyboardListener() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      const isContentEditable = e.target.contentEditable === 'true';
      
      if (isInput || isContentEditable) {
        // Only allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      // Build shortcut key
      let shortcutKey = '';
      if (e.ctrlKey || e.metaKey) shortcutKey += 'Ctrl+';
      if (e.altKey) shortcutKey += 'Alt+';
      if (e.shiftKey) shortcutKey += 'Shift+';
      shortcutKey += e.key;

      // Check for registered shortcut
      if (this.shortcuts.has(shortcutKey)) {
        const shortcut = this.shortcuts.get(shortcutKey);
        e.preventDefault();
        shortcut.callback();
      }

      // Also check without modifiers for simple keys
      if (this.shortcuts.has(e.key)) {
        const shortcut = this.shortcuts.get(e.key);
        if (!shortcut.requiresModifier) {
          e.preventDefault();
          shortcut.callback();
        }
      }
    });
  }

  /**
   * Register a keyboard shortcut
   * @param {string} key - Key or key combination (e.g., '/', 'Ctrl+K', 'Escape')
   * @param {Function} callback - Function to call when shortcut is triggered
   * @param {string} description - Description for help display
   * @returns {Function} Unregister function
   */
  registerShortcut(key, callback, description = '') {
    this.shortcuts.set(key, {
      callback,
      description,
      requiresModifier: key.includes('+')
    });

    // Return unregister function
    return () => {
      this.shortcuts.delete(key);
    };
  }

  /**
   * Unregister a keyboard shortcut
   * @param {string} key - Key or key combination
   */
  unregisterShortcut(key) {
    this.shortcuts.delete(key);
  }

  /**
   * Get all registered shortcuts
   * @returns {Array} Array of {key, description} objects
   */
  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([key, value]) => ({
      key,
      description: value.description
    }));
  }

  /**
   * Save current focus to history
   */
  saveFocus() {
    if (document.activeElement) {
      this.focusHistory.push(document.activeElement);
    }
  }

  /**
   * Restore focus from history
   */
  restoreFocus() {
    const element = this.focusHistory.pop();
    if (element && element.focus) {
      element.focus();
    }
  }

  /**
   * Focus first focusable element in container
   * @param {HTMLElement} container - Container element
   */
  focusFirst(container) {
    const focusable = container.querySelector([
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(','));

    if (focusable) {
      focusable.focus();
    }
  }

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if user prefers dark color scheme
   * @returns {boolean}
   */
  prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Make an element inert (not focusable or interactive)
   * @param {HTMLElement} element - Element to make inert
   */
  setInert(element) {
    element.setAttribute('inert', '');
    element.setAttribute('aria-hidden', 'true');
  }

  /**
   * Remove inert state from element
   * @param {HTMLElement} element - Element to make active
   */
  removeInert(element) {
    element.removeAttribute('inert');
    element.removeAttribute('aria-hidden');
  }

  /**
   * Generate unique ID for ARIA relationships
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId(prefix = 'a11y') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Create singleton instance
const A11y = new AccessibilityUtils();

// Export for ES modules
export default A11y;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
  window.A11y = A11y;
}
