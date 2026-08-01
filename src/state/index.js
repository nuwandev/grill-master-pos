/**
 * STATE MANAGEMENT - Main Entry Point
 * ===================================
 *
 * This is the "public API" of our state management system.
 * UI components import functions from HERE, not from individual action files.
 *
 * ARCHITECTURE LAYERS:
 * ┌─────────────────────────────────────┐
 * │  UI Components (screens)            │ ← Import from THIS file
 * ├─────────────────────────────────────┤
 * │  THIS FILE (state/index.js)         │ ← Wrapper API
 * ├─────────────────────────────────────┤
 * │  Actions (business logic)           │ ← Actual implementation
 * ├─────────────────────────────────────┤
 * │  Store (reactive state container)   │ ← Holds data
 * ├─────────────────────────────────────┤
 * │  Persistence (localStorage)         │ ← Saves/loads data
 * └─────────────────────────────────────┘
 *
 * WHY THIS STRUCTURE:
 * - Single import point for components (easy to use)
 * - Business logic separated (easy to test)
 * - Can swap storage layer (localStorage → API)
 * - Clear separation of concerns
 *
 * @module state/index
 */

import { initialState } from './initial-state.js';
import { loadState, resetToDemo, saveState } from './persistence.js';
import { createStore } from './store.js';
import * as cartActions from '../actions/cart-actions.js';
import * as customerActions from '../actions/customer-actions.js';
import * as orderActions from '../actions/order-actions.js';
import * as productActions from '../actions/product-actions.js';
import * as selectors from '../selectors/index.js';

// ============================================================================
// STORE CREATION & INITIALIZATION
// ============================================================================

/**
 * Create the global store
 * This is our "single source of truth" for all application data
 *
 * Why initialState first?
 * - Defines the shape of our state
 * - Ensures all fields exist
 * - Will be overwritten by loadState() anyway
 */
const store = createStore(initialState);

/**
 * Load persisted state from localStorage
 * Runs once on app startup
 *
 * WHAT HAPPENS:
 * 1. Check localStorage for saved data
 * 2. If found → use it
 * 3. If not found → use demo data
 * 4. Update store with loaded state
 */
function initializeStore() {
  // Load from localStorage (or demo data)
  const savedState = loadState();

  // Replace initial state with saved/demo state
  // This is the only place we start with a full state object
  store.setState(savedState);
}

/**
 * AUTO-SAVE - Persist state changes to localStorage
 *
 * DEBOUNCING EXPLAINED:
 * Without debounce:
 *   User clicks "Add" 5 times → Save 5 times (wasteful)
 *
 * With debounce:
 *   User clicks "Add" 5 times → Wait 100ms → Save once (efficient)
 *
 * HOW IT WORKS:
 * 1. State changes
 * 2. autoSave() is called
 * 3. Cancel previous save timer (if exists)
 * 4. Start new 100ms timer
 * 5. If no more changes in 100ms → actually save
 * 6. If more changes → restart timer (steps 2-5)
 *
 * WHY 100ms:
 * - Short enough user doesn't notice
 * - Long enough to group rapid changes
 * - Balances UX vs efficiency
 */
let saveTimeout; // Holds the timer ID
function autoSave() {
  // Cancel previous timer (if user made more changes)
  clearTimeout(saveTimeout);

  // Start new 100ms countdown
  saveTimeout = setTimeout(() => {
    // After 100ms of no changes, save to localStorage
    saveState(store.getState());
  }, 100); // Wait 100 milliseconds
}

/**
 * Subscribe autoSave to all state changes
 * Now every time state changes → autoSave runs → debounced save to localStorage
 */
store.subscribe(autoSave);

/**
 * Initialize the store NOW (when this module loads)
 * This runs once when app starts
 */
initializeStore();

// ============================================================================
// PUBLIC API - What Components Import
// ============================================================================

/**
 * Export the store itself
 * Components can use: store.getState(), store.setState(), store.subscribe()
 *
 * WHEN TO USE DIRECTLY:
 * - Reading state: const products = store.getState().products
 * - Subscribing to changes: store.subscribe(updateUI)
 *
 * WHEN NOT TO USE DIRECTLY:
 * - Updating state: Use action functions below instead
 */
export { store };

// ============================================================================
// CART ACTIONS - Shopping Cart Operations
// ============================================================================

/**
 * Add product to cart
 *
 * WRAPPER PATTERN:
 * - UI calls: addToCart(product)
 * - This function calls: cartActions.addToCart(store, product)
 * - Why? UI doesn't need to know about store reference
 *
 * @param {Object} product - Product to add
 * @returns {Object} { success: boolean, error?: string }
 */
export function addToCart(product) {
  // Pass store to action + return result
  return cartActions.addToCart(store, product);
}

/**
 * Remove product from cart
 * @param {string} productId - ID of product to remove
 * @returns {Object} { success: boolean }
 */
export function removeFromCart(productId) {
  return cartActions.removeFromCart(store, productId);
}

/**
 * Update quantity of item in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object} { success: boolean, error?: string }
 */
export function updateCartQuantity(productId, quantity) {
  return cartActions.updateCartQuantity(store, productId, quantity);
}

/**
 * Clear entire cart
 * @returns {Object} { success: boolean }
 */
export function clearCart() {
  return cartActions.clearCart(store);
}

/**
 * Undo last cart action
 * @returns {Object} { success: boolean, error?: string }
 */
export function undoLastAction() {
  return cartActions.undoLastAction(store);
}

// ============================================================================
// CUSTOMER ACTIONS - Customer Management
// ============================================================================

/**
 * Set current customer for order
 * @param {Object} customer - Customer object or null for guest
 * @returns {Object} { success: boolean }
 */
export function setCurrentCustomer(customer) {
  return customerActions.setCurrentCustomer(store, customer);
}

/**
 * Add new customer to database
 * @param {string} name - Customer name
 * @param {string} phone - Phone number
 * @param {string} email - Email address
 * @returns {Object} { success: boolean, customer?: Object, error?: string }
 */
export function addCustomer(name, phone, email) {
  return customerActions.addCustomer(store, name, phone, email);
}

export function updateCustomer(id, updates) {
  return customerActions.updateCustomer(store, id, updates);
}

export function deleteCustomer(customerId) {
  return customerActions.deleteCustomer(store, customerId);
}

// Order actions
export function setOrderType(type) {
  return orderActions.setOrderType(store, type);
}

export function placeOrder(paymentMethod, options) {
  return orderActions.placeOrder(store, paymentMethod, options);
}

export function updateOrder(orderId, updates) {
  return orderActions.updateOrder(store, orderId, updates);
}

export function deleteOrder(orderId) {
  return orderActions.deleteOrder(store, orderId);
}

export function markOrderPaid(orderId, amount) {
  return orderActions.markOrderPaid(store, orderId, amount);
}

// Product actions
export function addProduct(name, price, category, image) {
  return productActions.addProduct(store, name, price, category, image);
}

export function updateProduct(id, updates) {
  return productActions.updateProduct(store, id, updates);
}

export function deleteProduct(productId) {
  return productActions.deleteProduct(store, productId);
}

// Selectors
export function getCartTotal() {
  return selectors.getCartTotal(store.getState());
}

export function getCartCount() {
  return selectors.getCartCount(store.getState());
}

export function getOrderStats() {
  return selectors.getOrderStats(store.getState());
}

export function getProductsByCategory(category) {
  return selectors.getProductsByCategory(store.getState(), category);
}

export function getCategories() {
  return selectors.getCategories(store.getState());
}

export function getTopProducts(limit) {
  return selectors.getTopProducts(store.getState(), limit);
}

export function canUndo() {
  return selectors.canUndo(store.getState());
}

// Reset data
export function resetData() {
  const demoState = resetToDemo();
  store.setState(demoState);
  saveState(store.getState());
}

export default store;
