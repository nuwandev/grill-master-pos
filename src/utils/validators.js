/**
 * @fileoverview Validation utilities
 * @description Simple validation functions that return {isValid, errors}
 */

import { VALIDATION_RULES } from '../core/config.js';

// Customer validation
export function validateCustomer(customer) {
  const errors = [];
  const rules = VALIDATION_RULES.CUSTOMER;

  // Name
  if (!customer.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (customer.name.trim().length < rules.NAME_MIN_LENGTH) {
    errors.push({ field: 'name', message: `Name must be at least ${rules.NAME_MIN_LENGTH} characters` });
  }

  // Phone
  if (customer.phone && !rules.PHONE_PATTERN.test(customer.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone format (0XXXXXXXXX)' });
  }

  // Email
  if (customer.email && !rules.EMAIL_PATTERN.test(customer.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  return { isValid: errors.length === 0, errors };
}

// Product validation
export function validateProduct(product) {
  const errors = [];
  const rules = VALIDATION_RULES.PRODUCT;

  // Name
  if (!product.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (product.name.trim().length < rules.NAME_MIN_LENGTH) {
    errors.push({ field: 'name', message: `Name must be at least ${rules.NAME_MIN_LENGTH} characters` });
  }

  // Price
  if (product.price === undefined || product.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (product.price < rules.PRICE_MIN) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  }

  // Category
  if (!product.category?.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  return { isValid: errors.length === 0, errors };
}

// Order validation
export function validateOrder(order) {
  const errors = [];
  const rules = VALIDATION_RULES.ORDER;

  // Items
  if (!order.items?.length) {
    errors.push({ field: 'items', message: 'Order must contain at least one item' });
  } else if (order.items.length > rules.MAX_ITEMS) {
    errors.push({ field: 'items', message: `Order cannot exceed ${rules.MAX_ITEMS} items` });
  }

  // Customer
  if (!order.customer?.id) {
    errors.push({ field: 'customer', message: 'Customer is required' });
  }

  // Total
  if (!order.total || order.total < rules.MIN_TOTAL) {
    errors.push({ field: 'total', message: 'Invalid order total' });
  }

  return { isValid: errors.length === 0, errors };
}
