// Simple reactive store using observer pattern
// Listeners get notified whenever state changes

import { logger } from '../utils/logger.js';

export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  // Return a copy to prevent direct mutation
  function getState() {
    return { ...state };
  }

  // Update state and notify all listeners
  function setState(updater) {
    const result = typeof updater === 'function' ? updater(state) : updater;
    if (result !== undefined) {
      state = { ...state, ...result };
    }
    // Notify all subscribed listeners
    listeners.forEach((fn) => {
      try {
        fn(getState());
      } catch (e) {
        logger.error('State listener error', {
          error: e.message,
          stack: e.stack,
        });
      }
    });
  }

  // Subscribe to state changes, returns unsubscribe function
  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState,
    setState,
    subscribe,
    get state() {
      return state;
    },
  };
}
