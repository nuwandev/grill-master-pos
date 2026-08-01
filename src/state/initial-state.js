// Initial state structure - single source of truth
// All app state lives here

import { ORDER_TYPES } from '../core/constants.js';

export const initialState = {
  // Product catalog
  products: [],

  // Order history
  orders: [],

  // Customer directory
  customers: [],

  // Current shopping cart
  cart: [],

  // Currently selected customer (or null for Guest)
  currentCustomer: null,

  // Order type: dine-in, takeout, delivery
  currentOrderType: ORDER_TYPES.DINE_IN,

  // Undo functionality (max 5 actions)
  actionHistory: [],
  lastAction: null,
};
