/**
 * @fileoverview Application entry point
 * @description Bootstraps the GrillMaster POS application
 * @author GrillMaster Dev Team
 * @version 1.0.0
 */

import './styles/tailwind.css';
import './styles/animations.css';
import { initApp } from './core/app.js';
import { setupGlobalErrorHandler } from './utils/error-handler.js';

// Setup global error handling
setupGlobalErrorHandler();

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}
