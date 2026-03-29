/**
 * Global State Manager
 * Simple pub/sub state management for UI components
 * 
 * Features:
 * - Subscribe to state changes
 * - Persist state to localStorage
 * - No framework dependencies
 * 
 * Usage:
 * ```js
 * import State from './state.js';
 * 
 * // Set state
 * State.set('filters', { genre: 'action', sortBy: 'recent' });
 * 
 * // Subscribe to changes
 * State.subscribe('filters', (newFilters) => {
 *   console.log('Filters changed:', newFilters);
 * });
 * 
 * // Get state
 * const filters = State.get('filters');
 * 
 * // Persist to localStorage
 * State.persist('user-preferences', ['filters', 'viewMode']);
 * ```
 */

class StateManager {
  constructor() {
    this.state = {};
    this.subscribers = {};
    this.persistenceKey = null;
    this.persistedKeys = [];
    
    // Load persisted state on initialization
    this.loadPersistedState();
  }

  /**
   * Set state value
   * @param {string} key - State key
   * @param {*} value - State value
   */
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    // Notify subscribers if value changed
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
      this.notify(key, value, oldValue);
    }
    
    // Persist if this key is persisted
    if (this.persistedKeys.includes(key)) {
      this.savePersistedState();
    }
  }

  /**
   * Get state value
   * @param {string} key - State key
   * @returns {*} State value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Callback function (newValue, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }
    
    this.subscribers[key].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of a state change
   * @param {string} key - State key
   * @param {*} newValue - New value
   * @param {*} oldValue - Old value
   */
  notify(key, newValue, oldValue) {
    if (this.subscribers[key]) {
      this.subscribers[key].forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in state subscriber for "${key}":`, error);
        }
      });
    }
  }

  /**
   * Remove a state key
   * @param {string} key - State key to remove
   */
  remove(key) {
    const oldValue = this.state[key];
    delete this.state[key];
    
    this.notify(key, undefined, oldValue);
    
    if (this.persistedKeys.includes(key)) {
      this.savePersistedState();
    }
  }

  /**
   * Clear all state
   */
  clear() {
    const oldState = { ...this.state };
    this.state = {};
    
    // Notify all subscribers
    Object.keys(oldState).forEach(key => {
      this.notify(key, undefined, oldState[key]);
    });
    
    // Clear persisted state
    if (this.persistenceKey) {
      localStorage.removeItem(this.persistenceKey);
    }
  }

  /**
   * Enable persistence to localStorage
   * @param {string} key - localStorage key
   * @param {string[]} stateKeys - State keys to persist
   */
  persist(key, stateKeys) {
    this.persistenceKey = key;
    this.persistedKeys = stateKeys;
    
    // Load existing persisted state
    this.loadPersistedState();
  }

  /**
   * Load persisted state from localStorage
   */
  loadPersistedState() {
    if (!this.persistenceKey) return;
    
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const persistedState = JSON.parse(stored);
        
        // Restore persisted keys
        this.persistedKeys.forEach(key => {
          if (persistedState[key] !== undefined) {
            this.state[key] = persistedState[key];
          }
        });
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  /**
   * Save current state to localStorage
   */
  savePersistedState() {
    if (!this.persistenceKey) return;
    
    try {
      const toStore = {};
      this.persistedKeys.forEach(key => {
        if (this.state[key] !== undefined) {
          toStore[key] = this.state[key];
        }
      });
      
      localStorage.setItem(this.persistenceKey, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save persisted state:', error);
    }
  }

  /**
   * Get all state (for debugging)
   * @returns {Object} All state
   */
  getAll() {
    return { ...this.state };
  }

  /**
   * Check if a key exists in state
   * @param {string} key - State key
   * @returns {boolean}
   */
  has(key) {
    return this.state.hasOwnProperty(key);
  }
}

// Create singleton instance
const State = new StateManager();

// Export for ES modules
export default State;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
  window.State = State;
}
