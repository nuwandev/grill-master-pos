/**
 * @fileoverview Application configuration system
 * @description Environment-aware configuration for development and production
 */

// Detect environment
const ENV = import.meta.env.MODE || 'development';
const IS_DEV = ENV === 'development';
const IS_PROD = ENV === 'production';

// API Configuration
export const API_CONFIG = {
  BASE_URL: IS_PROD
    ? import.meta.env.VITE_API_URL || 'https://api.grillmaster.com'
    : import.meta.env.VITE_API_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Image/CDN Configuration
export const IMAGE_CONFIG = {
  CDN_URL: IS_PROD
    ? import.meta.env.VITE_CDN_URL || 'https://cdn.grillmaster.com'
    : import.meta.env.VITE_CDN_URL || '/images',
  PLACEHOLDER: '/images/placeholder-product.jpg',
  FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  MAX_SIZE_MB: 5,
};

// Business Configuration
export const BUSINESS_CONFIG = {
  NAME: 'GrillMaster',
  CURRENCY: {
    CODE: 'LKR',
    SYMBOL: 'Rs.',
    LOCALE: 'en-LK',
  },
  TAX_RATE: 15, // percentage
  SERVICE_CHARGE: 0, // percentage
};

// Feature Flags
export const FEATURES = {
  ENABLE_ONLINE_ORDERING: false,
  ENABLE_DELIVERY: true,
  ENABLE_LOYALTY_PROGRAM: false,
  ENABLE_ANALYTICS: IS_PROD,
  ENABLE_DEBUG_LOGS: IS_DEV,
  USE_MOCK_DATA: IS_DEV,
};

// Storage Configuration
export const STORAGE_CONFIG = {
  PREFIX: 'grillmaster',
  VERSION: '1.0',
  ENCRYPTION_ENABLED: IS_PROD,
};

// Logging Configuration
export const LOG_CONFIG = {
  LEVEL: IS_PROD ? 'warn' : 'debug',
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  ITEMS_PER_PAGE: 20,
};

// Validation Rules
export const VALIDATION_RULES = {
  CUSTOMER: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    PHONE_PATTERN: /^0[0-9]{9}$/, // Sri Lankan phone format
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PRODUCT: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    PRICE_MIN: 0,
    PRICE_MAX: 1000000,
  },
  ORDER: {
    MIN_ITEMS: 1,
    MAX_ITEMS: 50,
    MIN_TOTAL: 0,
  },
};

// Export environment info
export const ENV_INFO = {
  MODE: ENV,
  IS_DEV,
  IS_PROD,
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  BUILD_TIME: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
};

export default {
  API_CONFIG,
  IMAGE_CONFIG,
  BUSINESS_CONFIG,
  FEATURES,
  STORAGE_CONFIG,
  LOG_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  ENV_INFO,
};
