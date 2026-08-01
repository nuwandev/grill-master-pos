// Order actions - business logic for order management
// No DOM manipulation, pure state updates

import { generateId } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { validateOrder } from '../utils/validators.js';

function idsMatch(left, right) {
  return String(left) === String(right);
}

// Set current order type (dine-in, takeout, delivery)
export function setOrderType(store, type) {
  store.setState({ currentOrderType: type });
}

// Create order from current cart
export function placeOrder(store, paymentMethod = 'cash', options = {}) {
  const state = store.getState();

  if (!state.cart.length) {
    logger.warn('Cannot place order: cart is empty');
    return { success: false, error: 'Cart is empty' };
  }

  const {
    subtotal,
    discountValue = 0,
    discountType = 'none',
    taxRate = 0,
    taxAmount = 0,
    total,
    amountReceived = 0,
    changeDue = 0,
    paymentStatus = 'unpaid',
    status = 'preparing',
  } = options;

  const order = {
    id: generateId(),
    items: [...state.cart],
    customer: state.currentCustomer,
    orderType: state.currentOrderType,
    subtotal,
    discountValue,
    discountType,
    taxRate,
    taxAmount,
    total,
    amountReceived,
    changeDue,
    paymentMethod: String(paymentMethod),
    paymentStatus,
    status,
    timestamp: new Date().toISOString(),
  };

  // Validate order before saving
  const validation = validateOrder(order);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors[0]?.message || 'Invalid order data',
    };
  }

  // Save order and clear cart
  store.setState({
    orders: [...state.orders, order],
    cart: [],
  });

  return { success: true, order };
}

// Update existing order
export function updateOrder(store, orderId, updates) {
  const state = store.getState();
  const orderIndex = state.orders.findIndex((ord) =>
    idsMatch(ord.id, orderId)
  );

  if (orderIndex === -1) {
    return { success: false, error: 'Order not found' };
  }

  const orders = [...state.orders];
  orders[orderIndex] = { ...orders[orderIndex], ...updates };
  store.setState({ orders });

  return { success: true, order: orders[orderIndex] };
}

// Delete order
export function deleteOrder(store, orderId) {
  const state = store.getState();
  const filteredOrders = state.orders.filter(
    (ord) => !idsMatch(ord.id, orderId)
  );

  if (filteredOrders.length === state.orders.length) {
    return { success: false, error: 'Order not found' };
  }

  store.setState({ orders: filteredOrders });
  return { success: true };
}

// Mark order as paid and calculate change
export function markOrderPaid(store, orderId, amount) {
  const state = store.getState();
  const order = state.orders.find((ord) => idsMatch(ord.id, orderId));

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  const received = Number.isFinite(amount) ? amount : order.total;
  const changeDue = Math.max(0, received - order.total);
  const paymentStatus = received >= order.total ? 'paid' : 'unpaid';

  return updateOrder(store, orderId, {
    amountReceived: received,
    changeDue,
    paymentStatus,
  });
}
