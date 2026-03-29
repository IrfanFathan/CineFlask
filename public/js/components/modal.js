/**
 * Modal Dialog Component
 * Focused content overlays for confirmations, forms, or detailed information
 * 
 * Features:
 * - Confirmation, alert, and custom content modes
 * - Focus trap using A11y utilities
 * - Close on Escape key or backdrop click
 * - Lock body scroll when open
 * - Animated enter/exit
 * - Danger variant for destructive actions
 * 
 * Usage:
 * ```js
 * import Modal from './components/modal.js';
 * 
 * // Confirmation dialog
 * Modal.confirm({
 *   title: 'Delete Movie',
 *   message: 'Are you sure you want to delete "Inception"?',
 *   confirmText: 'Delete',
 *   cancelText: 'Cancel',
 *   variant: 'danger',
 *   onConfirm: () => deleteMovie(id)
 * });
 * 
 * // Alert dialog
 * Modal.alert({
 *   title: 'Upload Complete',
 *   message: 'Your movie has been uploaded.',
 *   confirmText: 'OK'
 * });
 * 
 * // Custom content
 * Modal.open({
 *   title: 'Edit Movie',
 *   content: '<form>...</form>',
 *   size: 'lg',
 *   onClose: () => console.log('Modal closed')
 * });
 * 
 * // Close programmatically
 * Modal.close();
 * ```
 */

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.backdrop = null;
    this.focusTrap = null;
    this.triggerElement = null;
    this.onCloseCallback = null;
    this.counter = 0;

    this.closeIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="currentColor"/>
    </svg>`;

    this.init();
  }

  /**
   * Initialize the modal system
   */
  init() {
    if (typeof document === 'undefined') return;

    // Create backdrop
    this.createBackdrop();

    // Listen for Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });
  }

  /**
   * Create the backdrop element
   */
  createBackdrop() {
    if (document.getElementById('modal-backdrop')) {
      this.backdrop = document.getElementById('modal-backdrop');
      return;
    }

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'modal-backdrop';
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.addEventListener('click', () => this.close());
    document.body.appendChild(this.backdrop);
  }

  /**
   * Open a modal with custom content
   * @param {Object} options - Modal options
   * @returns {string} Modal ID
   */
  open(options = {}) {
    const {
      title = '',
      content = '',
      size = 'md',
      variant = 'default',
      showCloseButton = true,
      closeOnBackdrop = true,
      closeOnEscape = true,
      onClose = null,
      footer = null
    } = options;

    // Close any existing modal
    if (this.activeModal) {
      this.close(false);
    }

    // Save trigger element for focus restoration
    this.triggerElement = document.activeElement;
    this.onCloseCallback = onClose;

    const id = `modal-${++this.counter}`;
    const titleId = `${id}-title`;
    const descId = `${id}-desc`;

    // Create modal element
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = `modal modal--${size} ${variant !== 'default' ? `modal--${variant}` : ''}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', titleId);
    if (content) {
      modal.setAttribute('aria-describedby', descId);
    }

    // Build modal HTML
    modal.innerHTML = `
      <div class="modal__container">
        <div class="modal__header ${variant !== 'default' ? `modal__header--${variant}` : ''}">
          <h2 id="${titleId}" class="modal__title">${this.escapeHtml(title)}</h2>
          ${showCloseButton ? `
            <button class="modal__close" type="button" aria-label="Close dialog">
              ${this.closeIcon}
            </button>
          ` : ''}
        </div>
        <div id="${descId}" class="modal__body">
          ${typeof content === 'string' ? content : ''}
        </div>
        ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
      </div>
    `;

    // If content is an element, append it
    if (content instanceof HTMLElement) {
      modal.querySelector('.modal__body').appendChild(content);
    }

    // Store modal reference
    this.activeModal = {
      element: modal,
      closeOnBackdrop,
      closeOnEscape
    };

    // Update backdrop behavior
    if (closeOnBackdrop) {
      this.backdrop.onclick = () => this.close();
    } else {
      this.backdrop.onclick = null;
    }

    // Add to DOM
    document.body.appendChild(modal);

    // Show backdrop and modal with animation
    requestAnimationFrame(() => {
      this.backdrop.classList.add('modal-backdrop--visible');
      modal.classList.add('modal--visible');
    });

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Setup focus trap
    this.setupFocusTrap(modal);

    // Attach close button listener
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Announce to screen readers
    if (typeof window !== 'undefined' && window.A11y) {
      window.A11y.announce(`Dialog opened: ${title}`);
    }

    return id;
  }

  /**
   * Setup focus trap within modal
   * @param {HTMLElement} modal - Modal element
   */
  setupFocusTrap(modal) {
    // Use A11y focus trap if available
    if (typeof window !== 'undefined' && window.A11y && window.A11y.trapFocus) {
      this.focusTrap = window.A11y.trapFocus(modal);
      this.focusTrap.activate();
    } else {
      // Fallback: focus the modal container
      const container = modal.querySelector('.modal__container');
      if (container) {
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    }
  }

  /**
   * Close the active modal
   * @param {boolean} animate - Whether to animate the close
   */
  close(animate = true) {
    if (!this.activeModal) return;

    const modal = this.activeModal.element;
    const callback = this.onCloseCallback;

    // Deactivate focus trap
    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }

    if (animate) {
      // Animate out
      modal.classList.remove('modal--visible');
      modal.classList.add('modal--exiting');
      this.backdrop.classList.remove('modal-backdrop--visible');

      // Remove after animation
      setTimeout(() => {
        this.removeModal(modal);
        if (callback) callback();
      }, 200);
    } else {
      this.removeModal(modal);
      if (callback) callback();
    }
  }

  /**
   * Remove modal from DOM
   * @param {HTMLElement} modal - Modal element
   */
  removeModal(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus to trigger element
    if (this.triggerElement && this.triggerElement.focus) {
      this.triggerElement.focus();
    }

    this.activeModal = null;
    this.triggerElement = null;
    this.onCloseCallback = null;
  }

  /**
   * Show a confirmation dialog
   * @param {Object} options - Confirmation options
   * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
   */
  confirm(options = {}) {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'default',
      onConfirm = null,
      onCancel = null
    } = options;

    return new Promise((resolve) => {
      const footer = `
        <button class="btn btn--secondary modal__cancel-btn" type="button">
          ${this.escapeHtml(cancelText)}
        </button>
        <button class="btn ${variant === 'danger' ? 'btn--danger' : 'btn--primary'} modal__confirm-btn" type="button">
          ${this.escapeHtml(confirmText)}
        </button>
      `;

      this.open({
        title,
        content: `<p class="modal__message">${this.escapeHtml(message)}</p>`,
        variant,
        size: 'sm',
        footer,
        closeOnBackdrop: false,
        onClose: () => {
          if (onCancel) onCancel();
          resolve(false);
        }
      });

      // Attach button listeners
      const modal = this.activeModal.element;
      
      const confirmBtn = modal.querySelector('.modal__confirm-btn');
      confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        this.close();
        resolve(true);
      });

      const cancelBtn = modal.querySelector('.modal__cancel-btn');
      cancelBtn.addEventListener('click', () => {
        this.close();
        // onClose callback will handle resolve(false)
      });

      // Focus confirm button for danger, cancel button otherwise
      if (variant === 'danger') {
        cancelBtn.focus();
      } else {
        confirmBtn.focus();
      }
    });
  }

  /**
   * Show an alert dialog (single button)
   * @param {Object} options - Alert options
   * @returns {Promise<void>} Resolves when closed
   */
  alert(options = {}) {
    const {
      title = 'Alert',
      message = '',
      confirmText = 'OK',
      variant = 'default',
      onConfirm = null
    } = options;

    return new Promise((resolve) => {
      const footer = `
        <button class="btn btn--primary modal__confirm-btn" type="button">
          ${this.escapeHtml(confirmText)}
        </button>
      `;

      this.open({
        title,
        content: `<p class="modal__message">${this.escapeHtml(message)}</p>`,
        variant,
        size: 'sm',
        footer,
        showCloseButton: false,
        closeOnBackdrop: false,
        onClose: () => {
          if (onConfirm) onConfirm();
          resolve();
        }
      });

      // Focus and attach listener
      const modal = this.activeModal.element;
      const confirmBtn = modal.querySelector('.modal__confirm-btn');
      confirmBtn.addEventListener('click', () => {
        this.close();
      });
      confirmBtn.focus();
    });
  }

  /**
   * Show a prompt dialog with input
   * @param {Object} options - Prompt options
   * @returns {Promise<string|null>} Resolves with input value or null if cancelled
   */
  prompt(options = {}) {
    const {
      title = 'Input',
      message = '',
      placeholder = '',
      defaultValue = '',
      confirmText = 'OK',
      cancelText = 'Cancel',
      inputType = 'text'
    } = options;

    return new Promise((resolve) => {
      const inputId = `modal-input-${this.counter}`;
      
      const content = `
        ${message ? `<p class="modal__message">${this.escapeHtml(message)}</p>` : ''}
        <div class="form-group">
          <input 
            type="${inputType}" 
            id="${inputId}" 
            class="form-input" 
            placeholder="${this.escapeHtml(placeholder)}"
            value="${this.escapeHtml(defaultValue)}"
          >
        </div>
      `;

      const footer = `
        <button class="btn btn--secondary modal__cancel-btn" type="button">
          ${this.escapeHtml(cancelText)}
        </button>
        <button class="btn btn--primary modal__confirm-btn" type="button">
          ${this.escapeHtml(confirmText)}
        </button>
      `;

      this.open({
        title,
        content,
        size: 'sm',
        footer,
        closeOnBackdrop: false,
        onClose: () => resolve(null)
      });

      const modal = this.activeModal.element;
      const input = modal.querySelector(`#${inputId}`);
      const confirmBtn = modal.querySelector('.modal__confirm-btn');
      const cancelBtn = modal.querySelector('.modal__cancel-btn');

      // Handle confirm
      const handleConfirm = () => {
        const value = input.value;
        this.close();
        resolve(value);
      };

      confirmBtn.addEventListener('click', handleConfirm);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirm();
        }
      });

      cancelBtn.addEventListener('click', () => this.close());

      // Focus input
      input.focus();
      input.select();
    });
  }

  /**
   * Check if a modal is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.activeModal !== null;
  }

  /**
   * Get the current modal element
   * @returns {HTMLElement|null}
   */
  getElement() {
    return this.activeModal ? this.activeModal.element : null;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Create singleton instance
const Modal = new ModalManager();

// Export for ES modules
export default Modal;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
  window.Modal = Modal;
}
