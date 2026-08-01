/**
 * LOCALSTORAGE UTILITIES
 * ======================
 *
 * Simple wrappers around browser's localStorage API with:
 * - Automatic JSON serialization/deserialization
 * - Error handling (localStorage can fail)
 * - Logging for debugging
 *
 * WHY THESE HELPERS:
 * - localStorage only stores strings, we need objects
 * - Try-catch prevents app crash if storage is full/disabled
 * - Consistent error handling across the app
 *
 * LOCALSTORAGE BASICS:
 * - Built-in browser feature
 * - Stores key-value pairs as strings
 * - Persists even after browser close
 * - ~5-10MB limit per domain
 * - Synchronous (blocking) operations
 *
 * @module utils/storage
 */

import { logger } from './logger.js';

/**
 * Save data to localStorage
 *
 * WHAT IT DOES:
 * 1. Convert JavaScript object to JSON string
 * 2. Store in localStorage under given key
 * 3. Return success/failure
 *
 * EXAMPLE:
 * const products = [{ id: 1, name: 'Burger' }];
 * saveToStorage('products', products);
 * // localStorage now has: '{"products":"[{\"id\":1,\"name\":\"Burger\"}]"}'
 *
 * WHY TRY-CATCH:
 * - localStorage might be full (quota exceeded)
 * - User might have disabled storage (privacy mode)
 * - JSON.stringify might fail (circular references)
 *
 * @param {string} key - Storage key (e.g., 'grillmaster_products')
 * @param {any} data - Data to store (will be JSON stringified)
 * @returns {boolean} true if saved, false if error
 */
export function saveToStorage(key, data) {
  try {
    // JSON.stringify converts JavaScript object to JSON string
    // Why? localStorage can only store strings, not objects
    // Example: { name: 'John' } becomes '{"name":"John"}'
    const jsonString = JSON.stringify(data);

    // Save to browser's localStorage
    // This is a synchronous operation (blocks until done)
    localStorage.setItem(key, jsonString);

    // Success!
    return true;
  } catch (e) {
    // Possible errors:
    // - QuotaExceededError: Storage is full
    // - SecurityError: User disabled storage
    // - TypeError: Data contains circular reference

    logger.error(`Storage save error [${key}]`, { error: e.message });

    // Return false so caller knows save failed
    return false;
  }
}

/**
 * Load data from localStorage
 *
 * WHAT IT DOES:
 * 1. Get JSON string from localStorage
 * 2. Parse it back to JavaScript object
 * 3. Return parsed data or default value
 *
 * EXAMPLE:
 * const products = loadFromStorage('products', []);
 * // If data exists: returns parsed array
 * // If no data: returns [] (default)
 * // If error: returns [] (default)
 *
 * WHY DEFAULT VALUE:
 * - First time loading (no data yet)
 * - localStorage was cleared
 * - Key doesn't exist
 * - Parsing failed
 *
 * @param {string} key - Storage key to load from
 * @param {any} defaultValue - Fallback if key doesn't exist or error
 * @returns {any} Parsed data or default value
 */
export function loadFromStorage(key, defaultValue) {
  try {
    // Get string from localStorage
    // Returns null if key doesn't exist
    const data = localStorage.getItem(key);

    // If null (key doesn't exist), return default
    // Otherwise, parse JSON string back to JavaScript object
    // Why? We stored it as JSON, need to convert back
    // Example: '{"name":"John"}' becomes { name: 'John' }
    return data === null ? defaultValue : JSON.parse(data);
  } catch (e) {
    // Possible errors:
    // - SyntaxError: Invalid JSON (corrupted data)
    // - SecurityError: Storage access denied

    logger.error(`Storage load error [${key}]`, { error: e.message });

    // Return default value so app doesn't crash
    return defaultValue;
  }
}
