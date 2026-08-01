// Pure utility functions - no side effects

import { BUSINESS_CONFIG } from '../core/config.js';

const CURRENCY = BUSINESS_CONFIG.CURRENCY;

// Format number as LKR currency (e.g., "LKR 1,500.00")
export function formatCurrency(amount) {
  const num = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  try {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: CURRENCY.CODE,
    }).format(num);
  } catch {
    return `${CURRENCY.SYMBOL} ${num.toFixed(2)}`;
  }
}

// Format date in friendly format (e.g., "Dec 5, 2024, 10:30 AM")
export function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get unique categories from products array
export function getCategories(products) {
  if (!Array.isArray(products)) return [];
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
}

// Generate unique ID using timestamp + random string
export function generateId(prefix = '') {
  // eslint-disable-next-line no-magic-numbers
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
  return prefix ? `${prefix}-${id}` : id;
}
