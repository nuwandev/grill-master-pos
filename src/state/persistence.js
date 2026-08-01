/**
 * PERSISTENCE LAYER - localStorage Integration
 * ============================================
 *
 * This file connects our in-memory state with browser's localStorage.
 * Think of it as a "bridge" between RAM (temporary) and storage (permanent).
 *
 * THREE MAIN JOBS:
 * 1. saveState() - Write current state to localStorage
 * 2. loadState() - Read state from localStorage (or use demo data)
 * 3. resetToDemo() - Clear everything and load fresh demo data
 *
 * DATA FLOW:
 * App Start → loadState() → populate store → user interacts →
 * → store changes → auto-save → saveState() → localStorage
 *
 * WHY SPLIT INTO SEPARATE KEYS:
 * - Easier to debug (can view each type separately)
 * - Can clear one type without affecting others
 * - Faster updates (only save what changed)
 *
 * @module state/persistence
 */

import { STORAGE_KEYS, ORDER_TYPES } from '../core/constants.js';
import { demoData } from '../data/demo-data.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

/**
 * Save current state to localStorage
 *
 * WHAT IT DOES:
 * - Takes state object
 * - Saves each piece to localStorage with its own key
 *
 * WHY SEPARATE KEYS:
 * Instead of one big key like 'grillmaster_data', we use:
 * - grillmaster_products
 * - grillmaster_orders
 * - grillmaster_customers
 * etc.
 *
 * BENEFITS:
 * - Can inspect each type in DevTools separately
 * - Can clear products without losing orders
 * - Easier to debug
 *
 * WHEN THIS RUNS:
 * - Automatically after every state change (debounced)
 * - Via auto-save subscription in state/index.js
 * - User clicks "Save" (if we add a save button)
 *
 * @param {Object} state - Current application state
 */
export function saveState(state) {
  // Save each piece of state separately
  // Why? Better organization and debugging

  // Products = menu items (burgers, pizzas, etc.)
  saveToStorage(STORAGE_KEYS.PRODUCTS, state.products);

  // Orders = transaction history
  saveToStorage(STORAGE_KEYS.ORDERS, state.orders);

  // Customers = contact database
  saveToStorage(STORAGE_KEYS.CUSTOMERS, state.customers);

  // Cart = current shopping cart (items user is buying now)
  saveToStorage(STORAGE_KEYS.CART, state.cart);

  // Current customer = who's ordering (null if guest)
  saveToStorage(STORAGE_KEYS.CURRENT_CUSTOMER, state.currentCustomer);

  // Order type = dine-in, takeaway, or delivery
  saveToStorage(STORAGE_KEYS.ORDER_TYPE, state.currentOrderType);

  // Note: We don't save actionHistory or lastAction
  // Why? These are temporary undo/redo stacks, no need to persist
}

/**
 * Load state from localStorage (or use demo data as fallback)
 *
 * WHAT IT DOES:
 * 1. Try to load data from localStorage
 * 2. If empty (first time), use demo data
 * 3. Return complete state object
 *
 * SMART FALLBACK LOGIC:
 * - If products exists in localStorage → use it
 * - If products is empty array → use demo products
 * - Same for orders and customers
 *
 * WHY DEMO DATA:
 * - User's first time using app (no data yet)
 * - localStorage was cleared
 * - Makes app useful immediately (not empty)
 * - User can see how it works with sample data
 *
 * WHEN THIS RUNS:
 * - App initialization (only once on startup)
 * - Called by initializeStore() in state/index.js
 *
 * @returns {Object} Complete state object
 */
export function loadState() {
  // Load each piece from localStorage
  // Second parameter is default value if key doesn't exist
  const products = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);

  // Build and return complete state object
  return {
    // SMART FALLBACK: Use saved data if exists, otherwise demo data
    // Why .length check? User might have cleared data (empty arrays)
    // In that case, reload demo data so app isn't empty

    // Products: menu items
    // If we have saved products, use them; otherwise demo items
    products: products.length ? products : demoData.items,

    // Orders: transaction history
    // If we have saved orders, use them; otherwise demo orders
    orders: orders.length ? orders : demoData.orders,

    // Customers: contact database
    // If we have saved customers, use them; otherwise demo customers
    customers: customers.length ? customers : demoData.customers,

    // Cart: current shopping cart
    // Always start with empty cart on reload (don't persist cart)
    // Why? User probably isn't mid-checkout when they closed browser
    cart: loadFromStorage(STORAGE_KEYS.CART, []),

    // Current customer: who's ordering
    // null = guest
    currentCustomer: loadFromStorage(STORAGE_KEYS.CURRENT_CUSTOMER, null),

    // Order type: dine-in, takeaway, delivery
    // Default to DINE_IN if not set
    currentOrderType: loadFromStorage(
      STORAGE_KEYS.ORDER_TYPE,
      ORDER_TYPES.DINE_IN
    ),

    // Action history: for undo functionality
    // Always start fresh (don't persist undo stack)
    // Why? Undo is for current session only
    actionHistory: [],

    // Last action: for "Undo: Add to Cart" label
    // Always start null (no last action on fresh load)
    lastAction: null,
  };
}

/**
 * Reset everything to fresh demo data
 *
 * WHAT IT DOES:
 * - Returns fresh copy of demo data
 * - Ignores anything in localStorage
 * - Gives user a "factory reset"
 *
 * WHEN USED:
 * - User clicks "Reset Data" button
 * - For testing/development
 * - To clear corrupted data
 *
 * SIDE EFFECTS:
 * - Caller must call saveState() after this
 * - Otherwise reset is only in memory (lost on refresh)
 *
 * @returns {Object} Fresh state with demo data
 */
export function resetToDemo() {
  // Return fresh state with demo data
  // This is a "factory reset" - clears everything
  return {
    // Load fresh demo data (not references, copies)
    products: demoData.items,
    orders: demoData.orders,
    customers: demoData.customers,

    // Start with empty cart
    cart: [],

    // No customer selected (guest)
    currentCustomer: null,

    // Default to dine-in
    currentOrderType: ORDER_TYPES.DINE_IN,

    // Empty undo stack
    actionHistory: [],
    lastAction: null,
  };
}
