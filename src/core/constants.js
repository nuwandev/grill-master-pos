// App-wide constants and configuration

import { BUSINESS_CONFIG, UI_CONFIG } from './config.js';

// Business settings (imported from config)
export const DEFAULT_TAX_RATE = BUSINESS_CONFIG.TAX_RATE;
export const CURRENCY = BUSINESS_CONFIG.CURRENCY;

// Order types for dine-in, takeaway, delivery
export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
};

// LocalStorage keys - prefixed to avoid conflicts
export const STORAGE_KEYS = {
  PRODUCTS: 'grillmaster_products',
  ORDERS: 'grillmaster_orders',
  CUSTOMERS: 'grillmaster_customers',
  CART: 'grillmaster_cart',
  CURRENT_CUSTOMER: 'grillmaster_current_customer',
  ORDER_TYPE: 'grillmaster_order_type',
};

// UI settings (imported from config)
export const DEFAULT_PRODUCT_IMAGE = '🍽️';
export const TOAST_DURATION_MS = UI_CONFIG.TOAST_DURATION;

// Route names for navigation
export const ROUTES = {
  HOME: 'home',
  NEW_ORDER: 'new-order',
  POS: 'pos',
  ORDERS: 'orders',
  MENU: 'menu',
  CUSTOMERS: 'customers',
};

export const DEFAULT_ROUTE = ROUTES.HOME;
