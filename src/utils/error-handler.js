/**
 * @fileoverview Error handling utilities
 * @description Simple error handling with ValidationError type
 */

import { logger } from './logger.js';

// Custom ValidationError for form/data validation
export class ValidationError extends Error {
  constructor(message, fields = []) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Setup global error handlers to log unhandled errors
export function setupGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
    });
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    logger.error('Global error', {
      message: event.message,
      filename: event.filename,
    });
  });
}
