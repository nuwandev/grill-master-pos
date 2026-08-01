/**
 * @fileoverview Simple logging service with color-coded output
 */

/* eslint-disable no-console */

import { LOG_CONFIG } from '../core/config.js';

// Log levels
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = LOG_LEVELS[LOG_CONFIG.LEVEL] ?? LOG_LEVELS.info;

class Logger {
  _log(level, message, context) {
    if (LOG_LEVELS[level] > CURRENT_LEVEL) return;

    const styles = {
      error: 'color: #ef4444; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      info: 'color: #3b82f6',
      debug: 'color: #6b7280',
    };

    console[level === 'debug' ? 'log' : level](
      `%c[${level.toUpperCase()}]`,
      styles[level],
      message,
      context || ''
    );
  }

  error(message, context) {
    return this._log('error', message, context);
  }

  warn(message, context) {
    return this._log('warn', message, context);
  }

  info(message, context) {
    return this._log('info', message, context);
  }

  debug(message, context) {
    return this._log('debug', message, context);
  }

  group(label) {
    if (CURRENT_LEVEL >= LOG_LEVELS.debug) console.group(label);
  }

  groupEnd() {
    if (CURRENT_LEVEL >= LOG_LEVELS.debug) console.groupEnd();
  }

  time(label) {
    if (CURRENT_LEVEL >= LOG_LEVELS.debug) console.time(label);
  }

  timeEnd(label) {
    if (CURRENT_LEVEL >= LOG_LEVELS.debug) console.timeEnd(label);
  }
}

export const logger = new Logger();
export default logger;
