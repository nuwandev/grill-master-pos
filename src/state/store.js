/**
 * REACTIVE STORE - Observer Pattern Implementation
 * ================================================
 *
 * This is the heart of our state management system.
 * Think of it as a "smart container" that holds all app data and notifies
 * anyone who's interested when the data changes.
 *
 * KEY CONCEPTS:
 * 1. Single Source of Truth - All data lives here
 * 2. Immutability - State is never mutated directly, always replaced
 * 3. Observers - Functions that get called when state changes
 * 4. Unidirectional Flow - Data flows in one direction only
 *
 * @module state/store
 */

import { logger } from '../utils/logger.js';

/**
 * Creates a reactive store with observer pattern
 *
 * WHAT IT DOES:
 * - Holds application state
 * - Allows reading state
 * - Allows updating state
 * - Notifies listeners when state changes
 *
 * WHY OBSERVER PATTERN:
 * - UI can "subscribe" to state changes
 * - When data changes, UI automatically updates
 * - Decouples state from UI logic
 *
 * @param {Object} initialState - Starting state (products, orders, etc.)
 * @returns {Object} Store API { getState, setState, subscribe, state }
 */
export function createStore(initialState) {
  // PRIVATE STATE - Only accessible through getState()
  // Why copy? To ensure initialState isn't mutated externally
  let state = { ...initialState };

  // LISTENERS - Functions that want to be notified of changes
  // Why Set? Automatically prevents duplicate listeners + fast add/remove
  const listeners = new Set();

  /**
   * Get current state (immutable read)
   *
   * WHY RETURN A COPY:
   * - Prevents external code from mutating state directly
   * - Forces updates to go through setState()
   * - Maintains predictable state flow
   *
   * EXAMPLE:
   * const cart = store.getState().cart;
   * cart.push(item); // This WON'T affect actual state ✅
   *
   * @returns {Object} Copy of current state
   */
  function getState() {
    // Spread operator creates shallow copy
    // Changes to returned object won't affect internal state
    return { ...state };
  }

  /**
   * Update state and notify subscribers
   *
   * TWO WAYS TO UPDATE:
   * 1. Object: setState({ cart: [...] })
   * 2. Function: setState(state => ({ cart: [...state.cart, item] }))
   *
   * WHY FUNCTION OPTION:
   * - Access to current state
   * - Useful for computed updates
   *
   * WHAT HAPPENS:
   * 1. Calculate new state
   * 2. Merge with existing state
   * 3. Notify all listeners
   * 4. Auto-save triggers (via listener)
   *
   * @param {Object|Function} updater - New state or function returning new state
   */
  function setState(updater) {
    // If updater is a function, call it with current state
    // Otherwise, use updater as-is (plain object)
    // This ternary gives us flexibility in how we update
    const result = typeof updater === 'function' ? updater(state) : updater;

    // Only update if result is not undefined
    // Why? Allows functions to bail out by returning undefined
    if (result !== undefined) {
      // Spread operator merges result into state
      // Example: { ...{ a: 1, b: 2 }, ...{ b: 3 } } = { a: 1, b: 3 }
      // This creates a NEW object, doesn't mutate the old one
      state = { ...state, ...result };
    }

    // After state is updated, tell everyone who's listening
    notifyListeners();
  }

  /**
   * Notify all subscribers that state has changed
   *
   * WHEN THIS RUNS:
   * - Every time setState is called
   * - After state has been updated
   *
   * WHAT IT DOES:
   * - Calls each listener function with new state
   * - Catches errors so one bad listener doesn't break others
   *
   * LISTENERS MIGHT BE:
   * - Auto-save function (saves to localStorage)
   * - UI update function (re-renders component)
   * - Analytics tracker (logs state changes)
   */
  function notifyListeners() {
    // Loop through all registered listeners
    listeners.forEach((listener) => {
      try {
        // Call listener with current state
        // Why getState()? Give listeners a copy, not direct reference
        listener(getState());
      } catch (error) {
        // If a listener throws an error, log it but don't crash
        // This prevents one bad listener from breaking the whole app
        logger.error('Listener error', {
          error: error.message,
          stack: error.stack,
        });
      }
    });
  }

  /**
   * Subscribe to state changes
   *
   * HOW TO USE:
   * const unsubscribe = store.subscribe((newState) => {
   *   console.log('State changed:', newState);
   * });
   *
   * WHEN TO UNSUBSCRIBE:
   * - Component unmounts
   * - No longer need updates
   *
   * WHY UNSUBSCRIBE IMPORTANT:
   * - Prevents memory leaks
   * - Removes listeners that are no longer needed
   *
   * @param {Function} listener - Function to call on state changes
   * @returns {Function} Unsubscribe function
   */
  function subscribe(listener) {
    // Guard: Make sure listener is actually a function
    if (typeof listener !== 'function') {
      // Return no-op function if invalid
      return () => {};
    }

    // Add listener to the Set
    // If it's already there, Set won't add duplicates
    listeners.add(listener);

    // Return a function that removes this listener
    // This is the "unsubscribe" function
    // User calls it when they're done: unsubscribe()
    return () => listeners.delete(listener);
  }

  // PUBLIC API - What users of the store can access
  return {
    getState, // Read state (returns copy)
    setState, // Update state (triggers listeners)
    subscribe, // Listen to changes (returns unsubscribe)

    /**
     * Direct state access via getter
     *
     * WHY TWO WAYS TO ACCESS STATE:
     * 1. getState() - Returns copy (safe, can't mutate)
     * 2. .state - Returns reference (fast, for reading only)
     *
     * WHEN TO USE WHICH:
     * - Use getState() when you need to modify returned data
     * - Use .state when just reading (faster, no copy overhead)
     *
     * COMPATIBILITY:
     * - Old code used store.state directly
     * - This getter maintains backward compatibility
     */
    get state() {
      // Returns actual state object (not a copy)
      // Use carefully - don't mutate this!
      return state;
    },
  };
}
