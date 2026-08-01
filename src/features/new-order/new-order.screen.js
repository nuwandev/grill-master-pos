// New Order Screen - Select order type (dine-in/takeaway/delivery) and customer

import {
  addCustomer,
  clearCart,
  setCurrentCustomer,
  setOrderType,
  store,
} from '../../state/index.js';
import { Header } from '../../ui/header.js';
import { toast } from '../../ui/modal.js';

const MAX_CUSTOMER_DISPLAY = 12;

export class NewOrderScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.selectedType = store.getState().currentOrderType || 'dine-in';
    this.query = '';
    this.showAddForm = false;
    this.newName = '';
    this.newPhone = '';
    this.newEmail = '';
  }

  render() {
    return `
      <div class="h-screen flex flex-col bg-neutral-50 overflow-hidden">
        ${Header({
          left: '<button onclick="app.navigate(\'home\')" class="text-neutral-600 hover:text-neutral-900 text-lg transition-colors">← Back</button>',
          center: '<h1 class="text-xl font-bold">New Order</h1>',
          right: '',
        })}
        <div class="flex-1 overflow-y-auto p-4 md:p-6" style="min-height: 0;">
          <div class="w-full space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>${this.renderOrderTypeSection()}</div>
              <div>${this.renderCustomerSection()}</div>
            </div>
            ${this.renderStartButton()}
          </div>
        </div>
      </div>
    `;
  }

  // Order type selection (dine-in, takeaway, delivery)
  renderOrderTypeSection() {
    return `
      <div data-order-type-section class="bg-white rounded border border-neutral-200 p-5 md:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-neutral-900">Order Type</h2>
          ${this.selectedType ? '<span class="text-xs text-success font-medium">✓ Selected</span>' : '<span class="text-xs text-neutral-400">Required</span>'}
        </div>
        <div class="grid grid-cols-3 gap-2 md:gap-3">
          ${this.renderOrderTypeButton('dine-in', '🍽️', 'Dine In')}
          ${this.renderOrderTypeButton('takeaway', '🥡', 'Takeaway')}
          ${this.renderOrderTypeButton('delivery', '🚗', 'Delivery')}
        </div>
      </div>
    `;
  }

  renderOrderTypeButton(type, emoji, label) {
    const isSelected = this.selectedType === type;
    return `
      <button 
        onclick="newOrderScreen.selectOrderType('${type}')"
        class="relative py-6 md:py-8 px-3 md:px-6 rounded border transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary hover:bg-neutral-50'}"
      >
        ${isSelected ? '<div class="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><span class="text-white text-xs">✓</span></div>' : ''}
        <div class="text-3xl md:text-4xl mb-2">${emoji}</div>
        <div class="font-semibold text-sm md:text-base">${label}</div>
      </button>
    `;
  }

  // Customer selection with search
  renderCustomerSection() {
    const selectedCustomer = store.getState().currentCustomer;
    return `
      <div data-customer-section class="bg-white rounded border border-neutral-200 p-5 md:p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold text-neutral-900">Customer</h2>
          <span data-selected-customer-badge>${selectedCustomer ? `<span class="text-xs text-success font-medium">✓ ${selectedCustomer.name}</span>` : '<span class="text-xs text-neutral-400">Optional</span>'}</span>
        </div>
        <div class="relative">
          <input type="text" data-search placeholder="Search name or phone..." value="${this.query}" oninput="newOrderScreen.handleSearchInput(this)"
            class="w-full px-4 py-2.5 border border-neutral-300 rounded focus:border-primary focus:outline-none transition-colors placeholder:text-neutral-400" />
          ${this.query ? '<button onclick="newOrderScreen.clearSearch()" class="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 text-xl">×</button>' : ''}
        </div>
        <div data-customer-actions-container>
          ${this.renderCustomerActions()}
        </div>
        <div data-add-form-container>
          ${this.showAddForm ? this.renderAddCustomerForm() : ''}
        </div>
        <div data-customer-results-container>
          ${this.renderCustomerResults()}
        </div>
      </div>
    `;
  }

  renderCustomerActions() {
    const selectedCustomer = store.getState().currentCustomer;
    const filteredCustomers = this.getFilteredCustomers();
    const noResults =
      this.query && !this.showAddForm && filteredCustomers.length === 0;

    return `
      <div data-customer-actions class="flex flex-wrap gap-2 mt-3">
        <button onclick="newOrderScreen.selectGuest()" 
          class="px-4 py-2 rounded border ${!selectedCustomer || selectedCustomer.name === 'Guest' ? 'border-primary bg-primary/10 text-primary' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'} transition-colors text-sm font-medium">
          Guest
        </button>
        <button onclick="newOrderScreen.toggleAddForm()" 
          class="px-4 py-2 rounded border border-neutral-200 hover:border-primary hover:bg-neutral-50 transition-colors text-sm font-medium">
          ➕ Add New
        </button>
        ${noResults ? `<button onclick="newOrderScreen.toggleAddForm('${this.query.replaceAll('"', '&quot;')}')" class="px-4 py-2 rounded bg-primary text-white border border-primary hover:bg-primary/90 transition-colors text-sm font-medium">✨ Add "${this.query}"</button>` : ''}
      </div>
    `;
  }

  renderAddCustomerForm() {
    return `
      <div class="mt-4 p-4 border border-primary rounded bg-primary/5">
        <h3 class="font-semibold text-primary mb-3 text-sm">Add New Customer</h3>
        <div class="space-y-3">
          <input type="text" placeholder="Name *" value="${this.newName}" oninput="newOrderScreen.setNewName(this.value)" class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:outline-none text-sm" />
          <input type="tel" placeholder="Phone" value="${this.newPhone}" oninput="newOrderScreen.setNewPhone(this.value)" class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:outline-none text-sm" />
          <input type="email" placeholder="Email" value="${this.newEmail}" oninput="newOrderScreen.setNewEmail(this.value)" class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:outline-none text-sm" />
          <div class="flex gap-2">
            <button onclick="newOrderScreen.saveNewCustomer()" class="flex-1 h-10 px-4 bg-primary text-white rounded hover:bg-primary/90 font-medium text-sm">Save</button>
            <button onclick="newOrderScreen.cancelAddForm()" class="h-10 px-4 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  renderCustomerResults() {
    const filteredCustomers = this.getFilteredCustomers();
    if (filteredCustomers.length === 0) {
      return this.query && !this.showAddForm
        ? '<div class="mt-4 text-center py-8 text-gray-400 text-sm">No customers found</div>'
        : '';
    }

    return `
      <div class="mt-4">
        <div class="text-xs font-medium text-neutral-500 mb-2 px-2">${this.query ? `SEARCH RESULTS (${filteredCustomers.length})` : `RECENT CUSTOMERS (${Math.min(filteredCustomers.length, MAX_CUSTOMER_DISPLAY)} of ${store.getState().customers.filter((c) => c.name !== 'Guest').length})`}</div>
        <div class="max-h-72 overflow-y-auto divide-y border border-neutral-200 rounded" data-customer-list>
          ${filteredCustomers
            .map((cust) => this.renderCustomerItem(cust))
            .join('')}
        </div>
      </div>
    `;
  }

  renderCustomerItem(customer) {
    const isSelected = store.getState().currentCustomer?.id === customer.id;
    return `
      <div data-customer-id="${customer.id}" onclick="newOrderScreen.selectCustomer('${customer.id}')" class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''}">
        <div class="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-sm">${customer.name.charAt(0).toUpperCase()}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-neutral-900 truncate text-sm">${customer.name}</div>
          ${customer.phone ? `<div class="text-xs text-neutral-500">${customer.phone}</div>` : ''}
        </div>
        <span data-checkmark>${isSelected ? '<span class="text-primary">✓</span>' : ''}</span>
      </div>
    `;
  }

  renderStartButton() {
    return `
      <div class="sticky bottom-0 pt-4 pb-2">
        <button data-start-btn onclick="newOrderScreen.startOrdering()" class="w-full bg-primary text-white text-xl font-bold py-5 md:py-6 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!this.selectedType ? 'disabled' : ''}>
          ${this.selectedType ? 'Start Ordering →' : 'Please Select Order Type'}
        </button>
      </div>
    `;
  }

  // Filter customers by search query (name or phone)
  getFilteredCustomers() {
    const allCustomers = store.getState().customers;
    const query = this.query.toLowerCase();

    // Always filter out Guest first
    const withoutGuest = allCustomers.filter((c) => c.name !== 'Guest');

    if (!query) {
      // No search - return recent customers (sorted by ID descending, newest first)
      return withoutGuest
        .sort((a, b) => b.id - a.id)
        .slice(0, MAX_CUSTOMER_DISPLAY);
    }

    // Search by name or phone - return ALL matches (no limit for search)
    return withoutGuest.filter(
      (c) => c.name.toLowerCase().includes(query) || c.phone.includes(query)
    );
  }

  selectOrderType(type) {
    this.selectedType = type;
    setOrderType(type);
    const section = document.querySelector('[data-order-type-section]');
    if (section) {
      const html = this.renderOrderTypeSection();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const innerContent = tempDiv.firstElementChild?.innerHTML || '';
      section.innerHTML = innerContent;
    }
    this.updateStartButton();
  }

  handleSearchInput(input) {
    this.query = input.value;
    // Only update results, not the input itself to prevent losing focus
    const resultsContainer = document.querySelector(
      '[data-customer-results-container]'
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = this.renderCustomerResults();
    }
    // Update the actions bar (Guest button, Add New button)
    const actionsContainer = document.querySelector(
      '[data-customer-actions-container]'
    );
    if (actionsContainer) {
      actionsContainer.innerHTML = this.renderCustomerActions();
    }
  }

  clearSearch() {
    this.query = '';
    this.updateCustomerSection(true);
  }

  selectGuest() {
    const guest = store
      .getState()
      .customers.find((c) => c.name.toLowerCase() === 'guest') || {
      id: 0,
      name: 'Guest',
      phone: '',
      email: '',
    };
    setCurrentCustomer(guest);
    this.updateCustomerSection();
  }

  selectCustomer(customerId) {
    const state = store.getState();
    const customer = state.customers.find(
      (c) => String(c.id) === String(customerId)
    );
    if (customer) {
      setCurrentCustomer(customer);
      this.updateCustomerSection();
    }
  }

  toggleAddForm(prefillName = '') {
    this.showAddForm = !this.showAddForm;
    this.newName = prefillName;
    this.newPhone = '';
    this.newEmail = '';
    this.updateCustomerSection();
  }

  cancelAddForm() {
    this.showAddForm = false;
    this.newName = '';
    this.newPhone = '';
    this.newEmail = '';
    this.updateCustomerSection();
  }

  setNewName(value) {
    this.newName = value;
    // Don't rerender - just update state
  }
  setNewPhone(value) {
    this.newPhone = value;
    // Don't rerender - just update state
  }
  setNewEmail(value) {
    this.newEmail = value;
    // Don't rerender - just update state
  }

  saveNewCustomer() {
    if (!this.newName.trim()) {
      toast('Please enter a name', 'error');
      return;
    }

    try {
      const result = addCustomer(this.newName, this.newPhone, this.newEmail);

      if (result.success) {
        setCurrentCustomer(result.customer);
        toast(`Customer "${result.customer.name}" added`, 'success');
        this.showAddForm = false;
        this.newName = '';
        this.newPhone = '';
        this.newEmail = '';
        this.query = '';
        // Update list to show new customer
        this.updateCustomerSection(true);
      } else {
        toast(result.error || 'Failed to add customer', 'error');
      }
    } catch (error) {
      toast(error.message || 'Failed to add customer', 'error');
    }
  }

  startOrdering() {
    if (!this.selectedType) {
      toast('Please select an order type', 'warning');
      return;
    }
    // Clear previous cart for fresh start
    clearCart();
    globalThis.app.navigate('pos');
  }

  updateCustomerSection(updateList = false) {
    const selectedCustomer = store.getState().currentCustomer;

    // Update header badge
    const badge = document.querySelector('[data-selected-customer-badge]');
    if (badge) {
      badge.innerHTML = selectedCustomer
        ? `<span class="text-xs text-success font-medium">✓ ${selectedCustomer.name}</span>`
        : '<span class="text-xs text-neutral-400">Optional</span>';
    }

    // Update customer actions (Guest button, Add New button)
    const actionsContainer = document.querySelector(
      '[data-customer-actions-container]'
    );
    if (actionsContainer) {
      actionsContainer.innerHTML = this.renderCustomerActions();
    }

    // Update add form visibility
    const addFormContainer = document.querySelector(
      '[data-add-form-container]'
    );
    if (addFormContainer) {
      addFormContainer.innerHTML = this.showAddForm
        ? this.renderAddCustomerForm()
        : '';
    }

    // Update customer list if needed (e.g., after adding new customer)
    if (updateList) {
      const resultsContainer = document.querySelector(
        '[data-customer-results-container]'
      );
      if (resultsContainer) {
        resultsContainer.innerHTML = this.renderCustomerResults();
      }
    } else {
      // Only update customer item styling (remove old selection, add new)
      const allCustomerItems = document.querySelectorAll('[data-customer-id]');
      allCustomerItems.forEach((item) => {
        const customerId = item.getAttribute('data-customer-id');
        const isSelected =
          selectedCustomer && customerId === String(selectedCustomer.id);

        // Update classes
        if (isSelected) {
          item.classList.add('bg-primary/10', 'border-l-4', 'border-primary');
        } else {
          item.classList.remove(
            'bg-primary/10',
            'border-l-4',
            'border-primary'
          );
        }

        // Update checkmark
        const checkmark = item.querySelector('[data-checkmark]');
        if (checkmark) {
          checkmark.innerHTML = isSelected
            ? '<span class="text-primary">✓</span>'
            : '';
        }
      });
    }
  }

  updateStartButton() {
    const btn = document.querySelector('[data-start-btn]');
    if (btn) {
      btn.disabled = !this.selectedType;
      btn.textContent = this.selectedType
        ? 'Start Ordering →'
        : 'Please Select Order Type';
    }
  }

  // Expose this screen instance globally for onclick handlers
  mount() {
    globalThis.newOrderScreen = this;
  }

  unmount() {
    delete globalThis.newOrderScreen;
  }
}

export default NewOrderScreen;
