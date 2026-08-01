// Customer actions - business logic for customer management
// No DOM manipulation, pure state updates

import { generateId } from '../utils/helpers.js';
import { validateCustomer } from '../utils/validators.js';

function idsMatch(left, right) {
  return String(left) === String(right);
}

// Set currently selected customer
export function setCurrentCustomer(store, customer) {
  store.setState({ currentCustomer: customer });
}

// Add new customer with validation
export function addCustomer(store, name, phone = '', email = '') {
  const trimmedName = (name || '').trim();
  const trimmedPhone = (phone || '').trim();

  if (!trimmedName) {
    return { success: false, error: 'Name is required' };
  }

  const state = store.getState();

  // Check for duplicate phone
  if (
    trimmedPhone &&
    state.customers.some((cust) => cust.phone === trimmedPhone)
  ) {
    return { success: false, error: 'Phone number already exists' };
  }

  const customer = {
    id: generateId(),
    name: trimmedName,
    phone: trimmedPhone,
    email: (email || '').trim(),
  };

  // Validate customer data
  const validation = validateCustomer(customer);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors[0]?.message || 'Invalid customer data',
    };
  }

  store.setState({
    customers: [...state.customers, customer],
  });

  return { success: true, customer };
}

// Update existing customer
export function updateCustomer(store, id, updates) {
  const state = store.getState();
  const customerIndex = state.customers.findIndex((cust) =>
    idsMatch(cust.id, id)
  );

  if (customerIndex === -1) {
    return { success: false, error: 'Customer not found' };
  }

  const customer = {
    ...state.customers[customerIndex],
    ...(updates.name?.trim() && { name: updates.name.trim() }),
    ...(updates.phone !== undefined && { phone: (updates.phone || '').trim() }),
    ...(updates.email !== undefined && { email: (updates.email || '').trim() }),
  };

  const customers = [...state.customers];
  customers[customerIndex] = customer;
  store.setState({ customers });

  // Update current customer if it's the one being edited
  if (idsMatch(state.currentCustomer?.id, id)) {
    store.setState({ currentCustomer: customer });
  }

  return { success: true, customer };
}

// Delete customer
export function deleteCustomer(store, customerId) {
  // Prevent deleting Guest customer (id 0 or 1)
  if (idsMatch(customerId, 0) || idsMatch(customerId, 1)) {
    return { success: false, error: 'Cannot delete Guest customer' };
  }

  const state = store.getState();
  const wasSelected = idsMatch(state.currentCustomer?.id, customerId);

  store.setState({
    customers: state.customers.filter((cust) => !idsMatch(cust.id, customerId)),
  });

  // Reset to Guest if deleted customer was selected
  if (wasSelected) {
    const guest = state.customers.find(
      (cust) => cust.name.toLowerCase() === 'guest'
    );
    store.setState({ currentCustomer: guest || null });
  }

  return { success: true };
}
