// Product actions - business logic for product management
// No DOM manipulation, pure state updates

import { DEFAULT_PRODUCT_IMAGE } from '../core/constants.js';
import { generateId } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { validateProduct } from '../utils/validators.js';

function idsMatch(left, right) {
  return String(left) === String(right);
}

// Add new product
export function addProduct(
  store,
  name,
  price,
  category,
  image = DEFAULT_PRODUCT_IMAGE
) {
  const trimmedName = (name || '').trim();
  const trimmedCategory = (category || '').trim();
  const parsedPrice = Number.parseFloat(price);

  // Validate required fields
  if (
    !trimmedName ||
    !trimmedCategory ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice < 0
  ) {
    logger.warn('Invalid product data', { name, price, category });
    return { success: false, error: 'Invalid product data' };
  }

  const product = {
    id: generateId(),
    name: trimmedName,
    price: parsedPrice,
    category: trimmedCategory,
    image: image || DEFAULT_PRODUCT_IMAGE,
  };

  // Validate product
  const validation = validateProduct(product);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors[0]?.message || 'Invalid product data',
    };
  }

  const state = store.getState();
  store.setState({
    products: [...state.products, product],
  });

  return { success: true, product };
}

// Update existing product
export function updateProduct(store, id, updates) {
  const state = store.getState();
  const productIndex = state.products.findIndex((prod) =>
    idsMatch(prod.id, id)
  );

  if (productIndex === -1) {
    return { success: false, error: 'Product not found' };
  }

  const parsedPrice = Number.parseFloat(updates.price);
  const product = {
    ...state.products[productIndex],
    ...(updates.name?.trim() && { name: updates.name.trim() }),
    ...(Number.isFinite(parsedPrice) &&
      parsedPrice >= 0 && { price: parsedPrice }),
    ...(updates.category?.trim() && { category: updates.category.trim() }),
    ...(updates.image?.trim() && { image: updates.image.trim() }),
  };

  const products = [...state.products];
  products[productIndex] = product;
  store.setState({ products });

  return { success: true, product };
}

// Delete product
export function deleteProduct(store, productId) {
  const state = store.getState();
  store.setState({
    products: state.products.filter((prod) => !idsMatch(prod.id, productId)),
  });

  return { success: true };
}
