/**
 * CART ACTIONS - Shopping Cart Business Logic
 * ===========================================
 *
 * This file contains ALL cart-related operations.
 * Think of it as the "cart manager" - it knows how to:
 * - Add items to cart
 * - Remove items from cart
 * - Update quantities
 * - Clear cart
 * - Undo cart actions
 *
 * KEY PRINCIPLES:
 * 1. Pure Logic - No DOM manipulation, only state updates
 * 2. Immutable Updates - Never mutate state directly, always create new objects
 * 3. Undo Support - Records previous state for undo functionality
 * 4. Validation - Checks inputs before updating state
 *
 * WHY SEPARATE FILE:
 * - Easy to test (no UI dependencies)
 * - Easy to reuse (import anywhere)
 * - Easy to maintain (all cart logic in one place)
 * - Easy to swap (can change logic without touching UI)
 *
 * @module actions/cart-actions
 */

/**
 * Maximum undo history to keep
 * Why limit? Prevents memory bloat with long session
 * 5 is enough for most user mistakes
 */
const MAX_HISTORY = 5;

/**
 * Record an action for undo functionality
 *
 * UNDO SYSTEM:
 * Every cart action is recorded with:
 * - What happened (type: 'ADD_TO_CART')
 * - When it happened (timestamp)
 * - What to restore (previousState)
 *
 * This lets us build "Undo: Added Burger" buttons
 *
 * @param {Object} store - Store reference
 * @param {string} type - Action type (e.g., 'ADD_TO_CART')
 * @param {Object} data - Action details (productId, name, etc.)
 * @param {Object} previousState - State before action (for undo)
 */
function recordAction(store, type, data, previousState) {
  // Create action record
  const action = {
    type, // What happened
    data, // Details
    previousState, // State to restore
    timestamp: Date.now(), // When it happened
  };

  // Get current history
  const currentHistory = store.getState().actionHistory;

  // Add new action to front, keep only last 5
  // Why front? Most recent actions appear first
  // Example: [new, old, older, oldest, ancient] → [new, old, older, oldest]
  const newHistory = [action, ...currentHistory].slice(0, MAX_HISTORY);

  // Update store with new history
  store.setState({
    actionHistory: newHistory, // Stack of actions
    lastAction: type, // For "Undo: X" label
  });
}

/**
 * Add product to cart (or increment if already exists)
 *
 * LOGIC:
 * 1. Product already in cart? → Increment quantity
 * 2. Product not in cart? → Add with quantity = 1
 * 3. Record action for undo
 *
 * WHY INCREMENT VS ADD:
 * - Better UX: Click "Add" 3 times = 3 burgers (not 3 separate items)
 * - Simpler cart: One row per product (not duplicates)
 *
 * IMMUTABILITY:
 * - We NEVER do: cart.push(item) ❌
 * - We ALWAYS do: cart = [...cart, item] ✅
 * - Why? Ensures React/observers detect changes
 *
 * @param {Object} store - Store reference
 * @param {Object} product - Product to add { id, name, price, ... }
 * @returns {void} Updates state directly
 */
export function addToCart(store, product) {
  // Guard: Ensure product exists and has ID
  if (!product?.id) {
    return; // Silent fail - could show error toast
  }

  // Get current state
  const state = store.getState();

  // Save cart for undo (IMPORTANT: copy array, not reference)
  const previousCart = [...state.cart];

  // Check if product already in cart
  // Using == (not ===) for type coercion (string '1' matches number 1)
  const existingItem = state.cart.find((item) => item.id === product.id);

  if (existingItem) {
    // CASE 1: Product exists → Increment quantity
    // Use map to create new array with updated item
    const updatedCart = state.cart.map(
      (item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 } // Update this item
          : item // Keep other items same
    );

    // Update store with new cart
    store.setState({ cart: updatedCart });
  } else {
    // CASE 2: Product doesn't exist → Add new item
    // Spread operator creates new array with new item at end
    store.setState({
      cart: [...state.cart, { ...product, quantity: 1 }],
    });
  }

  // Record for undo (save product info + previous cart state)
  recordAction(
    store,
    'ADD_TO_CART',
    { productId: product.id, productName: product.name },
    { cart: previousCart } // This is what we'll restore on undo
  );
}

/**
 * Remove item from cart completely
 *
 * REMOVES ALL QUANTITIES:
 * - If cart has 3 burgers → Remove all 3
 * - For removing 1 at a time, use updateCartQuantity()
 *
 * @param {Object} store - Store reference
 * @param {string} productId - ID of product to remove
 * @returns {void} Updates state directly
 */
export function removeFromCart(store, productId) {
  const state = store.getState();

  // Save cart for undo
  const previousCart = [...state.cart];

  // Find item (for name in undo label)
  const item = state.cart.find((i) => i.id === productId);

  // Filter creates new array WITHOUT the removed item
  const updatedCart = state.cart.filter((item) => item.id !== productId);

  // Update store
  store.setState({ cart: updatedCart });

  // Record for undo (if item was found)
  if (item) {
    recordAction(
      store,
      'REMOVE_FROM_CART',
      { productId, productName: item.name },
      { cart: previousCart }
    );
  }
}

/**
 * Update quantity of cart item
 *
 * SPECIAL CASES:
 * - quantity = 0 → Remove item
 * - quantity < 0 → Remove item
 * - quantity > 0 → Update quantity
 *
 * @param {Object} store - Store reference
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {void} Updates state directly
 */
export function updateCartQuantity(store, productId, quantity) {
  // If quantity is 0 or negative, remove item instead
  if (quantity <= 0) {
    removeFromCart(store, productId);
    return;
  }

  const state = store.getState();

  // Save cart for undo
  const previousCart = [...state.cart];

  // Find item (for name in undo label)
  const item = state.cart.find((i) => i.id === productId);

  // Map creates new array with updated quantity
  const updatedCart = state.cart.map(
    (item) =>
      item.id === productId
        ? { ...item, quantity } // Update this item's quantity
        : item // Keep other items same
  );

  // Update store
  store.setState({ cart: updatedCart });

  // Record for undo (if item was found)
  if (item) {
    recordAction(
      store,
      'UPDATE_QUANTITY',
      {
        productId,
        productName: item.name,
        from: item.quantity,
        to: quantity,
      },
      { cart: previousCart }
    );
  }
}

// Clear all items from cart
export function clearCart(store) {
  const state = store.getState();
  const previousCart = [...state.cart];

  store.setState({ cart: [] });

  recordAction(
    store,
    'CLEAR_CART',
    { itemCount: previousCart.length },
    { cart: previousCart }
  );
}

// Undo last cart action
export function undoLastAction(store) {
  const state = store.getState();
  const history = state.actionHistory;

  if (history.length === 0) {
    return false;
  }

  const lastAction = history[0];
  const remainingHistory = history.slice(1);

  // Restore previous state
  store.setState({
    ...lastAction.previousState,
    actionHistory: remainingHistory,
    lastAction: remainingHistory[0]?.type || null,
  });

  return true;
}
