/**
 * Toast Notification Component
 * Temporary messages for user feedback (success, error, info, warning)
 * 
 * Features:
 * - Four variants: success, error, info, warning
 * - Auto-dismiss with configurable duration
 * - Stack multiple toasts
 * - ARIA live region for screen readers
 * - Keyboard dismissible (Escape key)
 * - Pause on hover/focus
 * - Action buttons support
 * 
 * Usage:
 * ```js
 * import Toast from './components/toast.js';
 * 
 * // Success
 * Toast.success('Movie uploaded successfully!');
 * 
 * // Error
 * Toast.error('Failed to upload movie. Please try again.');
 * 
 * // Info with custom duration
 * Toast.info('Processing...', { duration: 3000 });
 * 
 * // Warning with action
 * Toast.warning('Storage almost full', {
 *   action: {
 *     label: 'Upgrade',
 *     onClick: () => navigateToUpgrade()
 *   }
 * });
 * 
 * // Manual dismiss
 * const id = Toast.info('Processing...');
 * Toast.dismiss(id);
 * 
 * // Dismiss all
 * Toast.dismissAll();
 * ```
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.counter = 0;
    this.defaultDuration = 5000;
    
    // Icons for each variant
    this.icons = {
      success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill="currentColor"/>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill="currentColor"/>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fill="currentColor"/>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fill="currentColor"/>
      </svg>`
    };
    
    this.closeIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" fill="currentColor"/>
    </svg>`;
    
    this.init();
  }

  /**
   * Initialize the toast container
   */
  init() {
    // Only init in browser environment
    if (typeof document === 'undefined') return;
    
    // Create container if not exists
    this.createContainer();
    
    // Listen for Escape key to dismiss all toasts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.toasts.size > 0) {
        this.dismissAll();
      }
    });
  }

  /**
   * Create the toast container element
   */
  createContainer() {
    if (document.getElementById('toast-container')) {
      this.container = document.getElementById('toast-container');
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} variant - Toast variant (success, error, info, warning)
   * @param {Object} options - Toast options
   * @returns {string} Toast ID for manual dismissal
   */
  show(message, variant = 'info', options = {}) {
    const {
      duration = this.defaultDuration,
      action = null,
      persistent = false
    } = options;

    const id = `toast-${++this.counter}`;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast--${variant}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');
    toast.setAttribute('aria-atomic', 'true');
    
    // Build toast HTML
    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true">
        ${this.icons[variant] || this.icons.info}
      </div>
      <div class="toast__content">
        <p class="toast__message">${this.escapeHtml(message)}</p>
        ${action ? `
          <button class="toast__action" type="button">
            ${this.escapeHtml(action.label)}
          </button>
        ` : ''}
      </div>
      <button class="toast__close" type="button" aria-label="Dismiss notification">
        ${this.closeIcon}
      </button>
      ${!persistent ? '<div class="toast__progress"></div>' : ''}
    `;

    // Store toast data
    const toastData = {
      element: toast,
      timerId: null,
      isPaused: false,
      remainingTime: duration,
      startTime: Date.now()
    };
    this.toasts.set(id, toastData);

    // Add event listeners
    this.attachEventListeners(id, toastData, action);

    // Add to container with animation
    this.container.appendChild(toast);
    
    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Start auto-dismiss timer (if not persistent)
    if (!persistent) {
      this.startTimer(id, duration);
    }

    // Announce to screen readers via A11y if available
    if (typeof window !== 'undefined' && window.A11y) {
      const priority = variant === 'error' ? 'assertive' : 'polite';
      window.A11y.announce(message, priority);
    }

    return id;
  }

  /**
   * Attach event listeners to toast
   */
  attachEventListeners(id, toastData, action) {
    const toast = toastData.element;
    
    // Close button
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => this.dismiss(id));

    // Action button
    if (action && action.onClick) {
      const actionBtn = toast.querySelector('.toast__action');
      actionBtn.addEventListener('click', () => {
        action.onClick();
        this.dismiss(id);
      });
    }

    // Pause on hover
    toast.addEventListener('mouseenter', () => this.pauseTimer(id));
    toast.addEventListener('mouseleave', () => this.resumeTimer(id));
    
    // Pause on focus
    toast.addEventListener('focusin', () => this.pauseTimer(id));
    toast.addEventListener('focusout', () => this.resumeTimer(id));
  }

  /**
   * Start auto-dismiss timer
   */
  startTimer(id, duration) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    toastData.startTime = Date.now();
    toastData.remainingTime = duration;
    
    // Animate progress bar
    const progress = toastData.element.querySelector('.toast__progress');
    if (progress) {
      progress.style.animationDuration = `${duration}ms`;
      progress.classList.add('toast__progress--active');
    }

    toastData.timerId = setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  /**
   * Pause auto-dismiss timer
   */
  pauseTimer(id) {
    const toastData = this.toasts.get(id);
    if (!toastData || toastData.isPaused) return;

    toastData.isPaused = true;
    
    if (toastData.timerId) {
      clearTimeout(toastData.timerId);
      toastData.remainingTime -= Date.now() - toastData.startTime;
    }

    // Pause progress animation
    const progress = toastData.element.querySelector('.toast__progress');
    if (progress) {
      progress.style.animationPlayState = 'paused';
    }
  }

  /**
   * Resume auto-dismiss timer
   */
  resumeTimer(id) {
    const toastData = this.toasts.get(id);
    if (!toastData || !toastData.isPaused) return;

    toastData.isPaused = false;
    
    // Resume progress animation
    const progress = toastData.element.querySelector('.toast__progress');
    if (progress) {
      progress.style.animationPlayState = 'running';
    }

    // Restart timer with remaining time
    if (toastData.remainingTime > 0) {
      toastData.startTime = Date.now();
      toastData.timerId = setTimeout(() => {
        this.dismiss(id);
      }, toastData.remainingTime);
    }
  }

  /**
   * Dismiss a toast
   * @param {string} id - Toast ID
   */
  dismiss(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    // Clear timer
    if (toastData.timerId) {
      clearTimeout(toastData.timerId);
    }

    // Animate out
    const toast = toastData.element;
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--exiting');

    // Remove after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 300); // Match CSS transition duration
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach((_, id) => {
      this.dismiss(id);
    });
  }

  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  error(message, options = {}) {
    return this.show(message, 'error', { duration: 8000, ...options });
  }

  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', { duration: 6000, ...options });
  }

  /**
   * Show persistent loading toast (must be dismissed manually)
   * @param {string} message - Toast message
   * @returns {string} Toast ID
   */
  loading(message) {
    return this.show(message, 'info', { persistent: true });
  }

  /**
   * Update an existing toast message
   * @param {string} id - Toast ID
   * @param {string} message - New message
   * @param {string} variant - New variant (optional)
   */
  update(id, message, variant = null) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const messageEl = toastData.element.querySelector('.toast__message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    if (variant) {
      toastData.element.className = `toast toast--${variant} toast--visible`;
      const iconEl = toastData.element.querySelector('.toast__icon');
      if (iconEl) {
        iconEl.innerHTML = this.icons[variant] || this.icons.info;
      }
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Set default duration for all toasts
   * @param {number} duration - Duration in milliseconds
   */
  setDefaultDuration(duration) {
    this.defaultDuration = duration;
  }
}

// Create singleton instance
const Toast = new ToastManager();

// Export for ES modules
export default Toast;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
  window.Toast = Toast;
}
