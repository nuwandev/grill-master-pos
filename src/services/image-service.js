/**
 * @fileoverview Image service
 * @description Handle product images with CDN support, URL validation, and fallbacks
 */

import { IMAGE_CONFIG } from '../core/config.js';

/* eslint-disable no-magic-numbers */
// Constants
const BYTES_PER_MB = 1024 * 1024;
const DEFAULT_IMAGE_SIZES = [320, 640, 1024, 1920];
/* eslint-enable no-magic-numbers */

class ImageService {
  constructor() {
    this.cache = new Map();
    this.failedImages = new Set();
  }

  // Get full image URL
  getImageUrl(imagePath) {
    if (!imagePath) {
      return this.getPlaceholder();
    }

    // If it's already a full URL, return as is
    if (this._isAbsoluteUrl(imagePath)) {
      return imagePath;
    }

    // Build CDN URL
    return `${IMAGE_CONFIG.CDN_URL}/${imagePath}`;
  }

  // Get placeholder image (SVG data URL)
  getPlaceholder(category = 'default') {
    // Return SVG as data URL - always works, no file needed
    const color = this._getCategoryColor(category);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
        ${this._getCategoryLabel(category)}
      </text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  _getCategoryColor(category) {
    const colors = {
      'Beef Burgers': '#b91c1c',
      'Chicken Burgers': '#ea580c',
      'Veggie Burger': '#16a34a',
      Sides: '#ca8a04',
      Beverages: '#0284c7',
      Desserts: '#c026d3',
      default: '#6b7280',
    };
    return colors[category] || colors.default;
  }

  _getCategoryLabel(category) {
    const labels = {
      'Beef Burgers': 'BEEF',
      'Chicken Burgers': 'CHICKEN',
      'Veggie Burger': 'VEGGIE',
      Sides: 'SIDES',
      Beverages: 'BEVERAGE',
      Desserts: 'DESSERT',
      default: 'PRODUCT',
    };
    return labels[category] || labels.default;
  }

  // Check if URL is absolute
  _isAbsoluteUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  // Check if image format is valid
  isValidFormat(filename) {
    if (!filename) return false;

    const extension = filename.split('.').pop()?.toLowerCase();
    return IMAGE_CONFIG.FORMATS.includes(extension);
  }

  // Preload image
  async preloadImage(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.failedImages.has(url)) {
      return null;
    }

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };

      img.onerror = () => {
        this.failedImages.add(url);
        resolve(null);
      };

      img.src = url;
    });
  }

  // Preload multiple images
  async preloadImages(urls) {
    const promises = urls.map((url) => this.preloadImage(url));
    return Promise.allSettled(promises);
  }

  // Validate image file size (for uploads)
  validateFileSize(file) {
    const maxSizeBytes = IMAGE_CONFIG.MAX_SIZE_MB * BYTES_PER_MB;
    return file.size <= maxSizeBytes;
  }

  // Convert image to base64 (for preview/upload)
  async toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.failedImages.clear();
  }

  // Get image with fallback
  getImageWithFallback(imagePath, category) {
    const url = this.getImageUrl(imagePath);

    return {
      src: url,
      fallback: this.getPlaceholder(category),
      onError: (event) => {
        event.target.src = this.getPlaceholder(category);
        this.failedImages.add(url);
      },
    };
  }

  // Generate responsive srcset (for future CDN integration)
  generateSrcSet(imagePath, sizes = DEFAULT_IMAGE_SIZES) {
    if (!imagePath || !this._isAbsoluteUrl(imagePath)) {
      return null;
    }

    return sizes.map((size) => `${imagePath}?w=${size} ${size}w`).join(', ');
  }
}

// Export singleton instance
export const imageService = new ImageService();

export default imageService;
