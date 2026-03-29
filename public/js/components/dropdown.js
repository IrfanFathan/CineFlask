/**
 * Dropdown Menu Component
 * Contextual menus for actions or navigation options
 * 
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Auto-positioning (flip if near edge)
 * - Click outside to close
 * - Focus management
 * - Full ARIA support
 * 
 * Usage:
 * ```js
 * import Dropdown from './components/dropdown.js';
 * 
 * // Initialize dropdown
 * const dropdown = new Dropdown('#user-menu', {
 *   trigger: '#user-avatar',
 *   placement: 'bottom-end',
 *   offset: 8
 * });
 * 
 * // Programmatic control
 * dropdown.open();
 * dropdown.close();
 * dropdown.toggle();
 * 
 * // Auto-initialize all dropdowns with data attributes
 * Dropdown.initAll();
 * ```
 * 
 * HTML:
 * ```html
 * <div class="dropdown" data-dropdown>
 *   <button class="dropdown__trigger" data-dropdown-trigger aria-haspopup="true">
 *     Menu
 *   </button>
 *   <div class="dropdown__menu" data-dropdown-menu role="menu">
 *     <a href="/profile" class="dropdown__item" role="menuitem">Profile</a>
 *     <hr class="dropdown__divider">
 *     <button class="dropdown__item dropdown__item--danger" role="menuitem">Logout</button>
 *   </div>
 * </div>
 * ```
 */

class DropdownInstance {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!this.element) {
      console.warn('Dropdown: Element not found');
      return;
    }

    this.options = {
      trigger: options.trigger || '[data-dropdown-trigger]',
      menu: options.menu || '[data-dropdown-menu]',
      placement: options.placement || 'bottom-start',
      offset: options.offset || 4,
      closeOnSelect: options.closeOnSelect !== false,
      closeOnOutsideClick: options.closeOnOutsideClick !== false,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      onSelect: options.onSelect || null
    };

    this.trigger = this.element.querySelector(this.options.trigger) || this.element.querySelector('.dropdown__trigger');
    this.menu = this.element.querySelector(this.options.menu) || this.element.querySelector('.dropdown__menu');
    
    if (!this.trigger || !this.menu) {
      console.warn('Dropdown: Trigger or menu not found');
      return;
    }

    this.isOpen = false;
    this.focusedIndex = -1;
    this.items = [];

    this.init();
  }

  /**
   * Initialize dropdown
   */
  init() {
    // Generate IDs if needed
    if (!this.menu.id) {
      this.menu.id = `dropdown-menu-${Date.now()}`;
    }

    // Setup ARIA attributes
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-controls', this.menu.id);
    
    this.menu.setAttribute('role', 'menu');
    this.menu.setAttribute('aria-labelledby', this.trigger.id || this.menu.id);

    // Bind events
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Trigger click
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Trigger keyboard
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.open();
        this.focusFirstItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.open();
        this.focusLastItem();
      }
    });

    // Menu keyboard navigation
    this.menu.addEventListener('keydown', (e) => this.handleMenuKeydown(e));

    // Click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.element.contains(e.target)) {
        this.close();
      }
    });

    // Escape key (global)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.trigger.focus();
      }
    });

    // Item selection
    this.menu.addEventListener('click', (e) => {
      const item = e.target.closest('[role="menuitem"]');
      if (item && !item.disabled && !item.getAttribute('aria-disabled')) {
        this.selectItem(item);
      }
    });
  }

  /**
   * Handle menu keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleMenuKeydown(e) {
    const items = this.getItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusNextItem();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.focusPreviousItem();
        break;
        
      case 'Home':
        e.preventDefault();
        this.focusFirstItem();
        break;
        
      case 'End':
        e.preventDefault();
        this.focusLastItem();
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.focusedIndex >= 0 && items[this.focusedIndex]) {
          this.selectItem(items[this.focusedIndex]);
        }
        break;
        
      case 'Tab':
        this.close();
        break;
        
      default:
        // Type to search
        if (e.key.length === 1) {
          this.focusItemStartingWith(e.key);
        }
    }
  }

  /**
   * Get menu items
   * @returns {HTMLElement[]} Array of menu items
   */
  getItems() {
    return Array.from(this.menu.querySelectorAll('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'));
  }

  /**
   * Focus next item
   */
  focusNextItem() {
    const items = this.getItems();
    if (items.length === 0) return;
    
    this.focusedIndex = (this.focusedIndex + 1) % items.length;
    items[this.focusedIndex].focus();
  }

  /**
   * Focus previous item
   */
  focusPreviousItem() {
    const items = this.getItems();
    if (items.length === 0) return;
    
    this.focusedIndex = this.focusedIndex <= 0 ? items.length - 1 : this.focusedIndex - 1;
    items[this.focusedIndex].focus();
  }

  /**
   * Focus first item
   */
  focusFirstItem() {
    const items = this.getItems();
    if (items.length === 0) return;
    
    this.focusedIndex = 0;
    items[0].focus();
  }

  /**
   * Focus last item
   */
  focusLastItem() {
    const items = this.getItems();
    if (items.length === 0) return;
    
    this.focusedIndex = items.length - 1;
    items[this.focusedIndex].focus();
  }

  /**
   * Focus item starting with character
   * @param {string} char - Character to match
   */
  focusItemStartingWith(char) {
    const items = this.getItems();
    const startIndex = this.focusedIndex + 1;
    
    // Search from current position
    for (let i = 0; i < items.length; i++) {
      const index = (startIndex + i) % items.length;
      const text = items[index].textContent.trim().toLowerCase();
      if (text.startsWith(char.toLowerCase())) {
        this.focusedIndex = index;
        items[index].focus();
        return;
      }
    }
  }

  /**
   * Select an item
   * @param {HTMLElement} item - Menu item
   */
  selectItem(item) {
    if (this.options.onSelect) {
      this.options.onSelect(item);
    }

    // Trigger click event if it's a link or button
    if (item.tagName === 'A') {
      // Let the link handle navigation
    } else if (item.onclick) {
      item.onclick();
    }

    if (this.options.closeOnSelect) {
      this.close();
      this.trigger.focus();
    }
  }

  /**
   * Open dropdown
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.classList.add('dropdown__menu--visible');
    
    // Position menu
    this.positionMenu();

    // Announce to screen readers
    if (typeof window !== 'undefined' && window.A11y) {
      window.A11y.announce('Menu expanded');
    }

    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }

  /**
   * Close dropdown
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.focusedIndex = -1;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.classList.remove('dropdown__menu--visible');

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Toggle dropdown
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Position menu based on placement option
   */
  positionMenu() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const menuRect = this.menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offset = this.options.offset;

    let placement = this.options.placement;

    // Reset positioning
    this.menu.style.top = '';
    this.menu.style.bottom = '';
    this.menu.style.left = '';
    this.menu.style.right = '';

    // Check if we need to flip
    const [vertical, horizontal] = placement.split('-');

    // Flip vertical if needed
    if (vertical === 'bottom' && triggerRect.bottom + menuRect.height + offset > viewportHeight) {
      placement = placement.replace('bottom', 'top');
    } else if (vertical === 'top' && triggerRect.top - menuRect.height - offset < 0) {
      placement = placement.replace('top', 'bottom');
    }

    // Apply positioning classes
    this.menu.dataset.placement = placement;

    // Calculate position
    switch (placement) {
      case 'bottom-start':
        this.menu.style.top = `${offset}px`;
        this.menu.style.left = '0';
        break;
      case 'bottom-end':
        this.menu.style.top = `${offset}px`;
        this.menu.style.right = '0';
        break;
      case 'bottom':
        this.menu.style.top = `${offset}px`;
        this.menu.style.left = '50%';
        this.menu.style.transform = 'translateX(-50%)';
        break;
      case 'top-start':
        this.menu.style.bottom = `100%`;
        this.menu.style.marginBottom = `${offset}px`;
        this.menu.style.left = '0';
        break;
      case 'top-end':
        this.menu.style.bottom = `100%`;
        this.menu.style.marginBottom = `${offset}px`;
        this.menu.style.right = '0';
        break;
      case 'top':
        this.menu.style.bottom = `100%`;
        this.menu.style.marginBottom = `${offset}px`;
        this.menu.style.left = '50%';
        this.menu.style.transform = 'translateX(-50%)';
        break;
    }
  }

  /**
   * Destroy dropdown instance
   */
  destroy() {
    this.close();
    this.trigger.removeAttribute('aria-haspopup');
    this.trigger.removeAttribute('aria-expanded');
    this.trigger.removeAttribute('aria-controls');
  }
}

/**
 * Dropdown Manager - handles multiple dropdowns
 */
class DropdownManager {
  constructor() {
    this.instances = new Map();
  }

  /**
   * Create a dropdown instance
   * @param {string|HTMLElement} element - Element or selector
   * @param {Object} options - Options
   * @returns {DropdownInstance} Dropdown instance
   */
  create(element, options = {}) {
    const instance = new DropdownInstance(element, options);
    if (instance.element) {
      this.instances.set(instance.element, instance);
    }
    return instance;
  }

  /**
   * Get dropdown instance by element
   * @param {string|HTMLElement} element - Element or selector
   * @returns {DropdownInstance|null} Dropdown instance
   */
  get(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    return this.instances.get(el) || null;
  }

  /**
   * Initialize all dropdowns with data-dropdown attribute
   */
  initAll() {
    document.querySelectorAll('[data-dropdown]').forEach(el => {
      if (!this.instances.has(el)) {
        this.create(el);
      }
    });
  }

  /**
   * Close all open dropdowns
   */
  closeAll() {
    this.instances.forEach(instance => instance.close());
  }

  /**
   * Destroy all dropdown instances
   */
  destroyAll() {
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
  }
}

// Create singleton manager
const Dropdown = new DropdownManager();

// Export for ES modules
export { DropdownInstance, Dropdown as default };

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
  window.Dropdown = Dropdown;
  window.DropdownInstance = DropdownInstance;
}
