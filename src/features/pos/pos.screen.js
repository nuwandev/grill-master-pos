// POS screen: products, cart, and checkout UI (concise comments only)
import { DEFAULT_TAX_RATE } from '../../core/constants.js';
import { imageService } from '../../services/image-service.js';
import {
  addToCart,
  clearCart,
  getCartCount,
  getCartTotal,
  getCategories,
  placeOrder,
  removeFromCart,
  store,
  undoLastAction,
  updateCartQuantity,
} from '../../state/index.js';
import { updateSection } from '../../ui/dom-utils.js';
import { confirm, toast } from '../../ui/modal.js';
import { formatCurrency } from '../../utils/helpers.js';
import { logger } from '../../utils/logger.js';

const QUICK_CASH_VALUES = [1000, 2000, 5000, 10000];
const PERCENT_VALUES = [5, 10, 15, 20];
const FLAT_VALUES = [100, 200, 500, 1000];

export class POSScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.selectedCategory = 'All';
    this.showCheckout = false;
    this.showSuccess = false;
    this.lastOrderId = null;

    // Checkout state
    this.discountType = 'none';
    this.discountValue = 0;
    this.taxRate = DEFAULT_TAX_RATE;
    this.amountReceived = 0;
    this.paymentMethod = 'cash';
  }

  render() {
    const categories = ['All', ...getCategories()];
    const filteredProducts = this.getFilteredProducts();
    const currentCustomer = store.getState().currentCustomer?.name || 'Guest';

    return `
      <div class="w-full h-screen flex flex-col md:flex-row bg-neutral-100 overflow-hidden">
        <!-- Products Section - Fixed Height -->
        <div class="flex flex-col min-w-0" style="flex: 1 1 0%; min-height: 0;">
          <!-- Top Bar - Fixed Height -->
          <div class="h-14 shrink-0 w-full bg-white border-b border-neutral-200 px-4 flex items-center justify-between">
            <button onclick="app.navigate('home')" tabindex="1" class="shrink-0 w-12 h-12 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded transition-colors" aria-label="Back to home">
              <span class="text-2xl leading-none">←</span>
            </button>
            <div class="flex items-center gap-2 bg-neutral-100 px-4 py-2 rounded">
              <svg class="w-5 h-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
              <span class="text-neutral-900 font-medium truncate">${currentCustomer}</span>
            </div>
          </div>
          
          ${this.renderCategoryTabs(categories)}
          ${this.renderProductGrid(filteredProducts)}
        </div>

        <!-- Cart Sidebar - Fixed Width -->
        ${this.renderCartSection()}

        ${this.showSuccess ? this.renderSuccessModal() : ''}
      </div>
    `;
  }

  renderCategoryTabs(categories) {
    return `
      <div class="h-14 shrink-0 w-full bg-white border-b border-neutral-200 px-4 flex items-center" data-category-tabs>
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          ${categories
            .map(
              (cat, index) => `
            <button 
              onclick="posScreen.selectCategory('${cat}')"
              tabindex="${index + 2}"
              class="shrink-0 h-10 px-5 rounded font-medium text-sm whitespace-nowrap transition-colors ${
                this.selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }"
            >
              ${cat}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderProductGrid(products) {
    return `
      <div class="overflow-y-auto p-4" style="flex: 1 1 0%; min-height: 0;" data-products-scroll>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3" data-products-grid>
          ${products
            .map((product) => {
              const imageData = imageService.getImageWithFallback(
                product.image,
                product.category
              );
              return `
            <button 
              class="min-h-40 bg-white rounded border border-neutral-200 hover:border-primary cursor-pointer transition-colors overflow-hidden text-left" 
              onclick="posScreen.handleAddToCart('${product.id}')"
            >
              <div class="aspect-square bg-neutral-50 overflow-hidden">
                <img 
                  src="${imageData.src}" 
                  alt="${product.name}"
                  class="w-full h-full object-cover"
                  onerror="this.src='${imageData.fallback}'"
                  loading="lazy"
                />
              </div>
              <div class="p-3">
                <div class="font-medium text-neutral-900 mb-2 line-clamp-2 text-sm leading-snug min-h-10">${product.name}</div>
                <div class="text-lg font-bold text-neutral-900">${formatCurrency(product.price)}</div>
              </div>
            </button>
          `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  renderCartSection() {
    const cart = store.getState().cart;
    const total = getCartTotal();
    const count = getCartCount();
    const canUndo = store.getState().actionHistory?.length > 0;
    const lastAction = store.getState().lastAction;

    return `
      <div data-cart-section class="w-full md:w-96 shrink-0 bg-white border-l border-neutral-200 flex flex-col" style="max-width: 24rem;">
        <!-- Cart Header - Fixed Height -->
        <div class="h-14 shrink-0 px-4 border-b border-neutral-200 bg-primary flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">Order</h2>
          <div class="text-sm text-white/90">${count} items</div>
        </div>

        <!-- Cart Items - Scrollable Fixed Height -->
        <div class="overflow-y-auto px-4 py-3" style="flex: 1 1 0%; min-height: 0;" data-cart-scroll>
          ${cart.length === 0 ? this.renderEmptyCart() : this.renderCartItems(cart)}
        </div>

        <!-- Sticky Total & Actions - Fixed Height -->
        <div class="shrink-0 border-t border-neutral-200 bg-neutral-50">
          ${this.renderCartFooter(total, cart.length > 0, canUndo, lastAction)}
        </div>
      </div>
    `;
  }

  renderEmptyCart() {
    return `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <svg class="w-12 h-12 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <div class="text-base font-medium text-neutral-600">Cart Empty</div>
        <div class="text-sm text-neutral-500 mt-1">Add products to start</div>
      </div>
    `;
  }

  renderCartItems(cart) {
    return cart
      .map(
        (item) => `
        <div class="mb-2 p-3 bg-neutral-50 rounded border border-neutral-200">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
              <div class="font-medium text-neutral-900 text-sm mb-1 truncate">${item.name}</div>
              <div class="text-xs text-neutral-500">${formatCurrency(item.price)} each</div>
            </div>
            <button 
              onclick="posScreen.handleRemoveFromCart('${item.id}')"
              class="ml-2 shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"
              aria-label="Remove ${item.name}"
            >
              <span class="text-lg leading-none">×</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="posScreen.handleUpdateQuantity('${item.id}', ${item.quantity - 1})"
              ${item.quantity <= 1 ? 'disabled' : ''}
              class="w-12 h-12 flex items-center justify-center bg-white border border-neutral-300 rounded hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              aria-label="Decrease quantity"
            >
              <span class="text-lg leading-none font-medium">−</span>
            </button>
            <div class="flex-1 text-center">
              <div class="font-bold text-xl text-neutral-900">${item.quantity}</div>
            </div>
            <button 
              onclick="posScreen.handleUpdateQuantity('${item.id}', ${item.quantity + 1})"
              class="w-12 h-12 flex items-center justify-center bg-white border border-neutral-300 rounded hover:bg-neutral-100 transition-colors"
              aria-label="Increase quantity"
            >
              <span class="text-lg leading-none font-medium">+</span>
            </button>
            <div class="text-right font-bold text-base text-neutral-900 min-w-[90px] px-3 py-3 bg-white rounded border border-neutral-200">
              ${formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  renderCartFooter(total, hasItems, canUndo, lastAction) {
    const actionLabels = {
      ADD_TO_CART: 'Added item',
      REMOVE_FROM_CART: 'Removed item',
      UPDATE_QUANTITY: 'Changed quantity',
      CLEAR_CART: 'Cleared cart',
    };
    const undoLabel = actionLabels[lastAction] || 'Undo';

    return `
      <div class="p-4">
        <!-- Sticky Total -->
        <div class="mb-3 p-4 bg-neutral-100 rounded">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-neutral-600">Total</span>
            <div class="text-2xl font-bold text-neutral-900">
              ${formatCurrency(total)}
            </div>
          </div>
        </div>
        
        ${
          canUndo
            ? `
        <!-- Undo Button -->
        <button 
          onclick="posScreen.handleUndo()"
          class="w-full h-12 mb-2 bg-neutral-100 text-neutral-700 font-medium rounded hover:bg-neutral-200 transition-colors"
        >
          ← ${undoLabel}
        </button>
        `
            : ''
        }
        
        ${
          hasItems
            ? `
        <!-- Primary Action: Checkout -->
        <button 
          onclick="posScreen.checkout()"
          class="w-full h-14 bg-primary text-white text-base font-semibold rounded hover:bg-primary/90 transition-colors"
        >
          Checkout (Enter)
        </button>
        <!-- Danger Action: Clear Cart -->
        <button 
          onclick="posScreen.handleClearCart()"
          class="w-full h-12 mt-2 bg-white text-danger font-medium rounded border border-neutral-300 hover:bg-danger/10 hover:border-danger transition-colors"
        >
          Clear Cart
        </button>
      `
            : `
        <!-- Empty State -->
        <div class="text-center py-4 text-neutral-500 text-sm">
          Add items to checkout
        </div>
      `
        }
      </div>
    `;
  }

  renderSuccessModalDirectly() {
    // Render success modal directly to DOM without full re-render
    const existingModal = document.getElementById('success-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modalContainer = document.createElement('div');
    modalContainer.id = 'success-modal';
    modalContainer.innerHTML = this.renderSuccessModal();
    document.body.appendChild(modalContainer);
  }

  renderSuccessModal() {
    const order = store
      .getState()
      .orders.find((ord) => String(ord.id) === String(this.lastOrderId));
    if (!order) {
      return '';
    }

    return `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="text-center p-6 pb-4">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <div class="text-3xl">✅</div>
            </div>
            <div class="text-xl font-bold mb-1">Order Complete</div>
            <div class="text-neutral-600 text-sm">Order #${order.id}</div>
          </div>
          
          <div class="px-6 pb-6">
            <div class="border rounded p-4 mb-4 bg-neutral-50">
              <div class="flex justify-between mb-2 pb-2 border-b border-neutral-200">
                <span class="text-neutral-600 text-sm">Items</span>
                <span class="font-semibold">${order.items.length}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-neutral-600 text-sm">Total</span>
                <span class="font-bold text-xl text-neutral-900">${formatCurrency(order.total)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-600 text-sm">Payment</span>
                <span class="font-semibold capitalize text-sm">${order.paymentMethod}</span>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button 
                onclick="posScreen.printReceipt('${order.id}')" 
                class="w-32 h-12 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 font-medium"
              >
                Print
              </button>
              <button 
                onclick="posScreen.startNewOrder()" 
                class="flex-1 h-12 bg-primary text-white rounded hover:bg-primary/90 font-semibold"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredProducts() {
    if (this.selectedCategory === 'All') {
      return store.getState().products;
    }
    return store
      .getState()
      .products.filter((prod) => prod.category === this.selectedCategory);
  }

  selectCategory(category) {
    this.selectedCategory = category;
    this.updateProductGrid();
    this.updateCategoryTabs();
  }

  handleAddToCart(productId) {
    try {
      const product = store
        .getState()
        .products.find((prod) => String(prod.id) === String(productId));
      if (product) {
        addToCart(product);
        this.updateCartSection();
        logger.debug('Product added to cart', {
          productId,
          name: product.name,
        });
      }
    } catch (error) {
      logger.error('Failed to add product to cart', {
        productId,
        error: error.message,
      });
      toast('Failed to add product to cart', 'error');
    }
  }

  handleRemoveFromCart(productId) {
    removeFromCart(productId);
    this.updateCartSection();
  }

  handleUpdateQuantity(productId, quantity) {
    if (quantity < 1) {
      this.handleRemoveFromCart(productId);
    } else {
      updateCartQuantity(productId, quantity);
      this.updateCartSection();
    }
  }

  async handleClearCart() {
    const confirmed = await confirm({
      title: 'Clear Cart',
      message: 'Remove all items from the cart?',
      confirmText: 'Clear',
    });

    if (confirmed) {
      clearCart();
      toast('Cart cleared', 'info');
      this.updateCartSection();
    }
  }

  handleUndo() {
    const result = undoLastAction();
    if (result.success) {
      toast(`Undone: ${result.message}`, 'info');
      this.updateCartSection();
    } else {
      toast('Nothing to undo', 'warning');
    }
  }

  checkout() {
    this.showCheckout = true;
    this.renderCheckoutModal();
  }

  cancelCheckout() {
    this.showCheckout = false;
    this.closeCheckoutModal();
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.remove();
    }
  }

  renderCheckoutModal() {
    const modalId = 'checkout-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      document.body.appendChild(modal);
    }

    const subtotal = getCartTotal();
    const discountAmt = this.calculateDiscount(subtotal);
    const subAfterDiscount = Math.max(0, subtotal - discountAmt);
    const taxAmt = (subAfterDiscount * this.taxRate) / 100;
    const grandTotal = Math.max(0, subAfterDiscount + taxAmt);
    const received = Number(this.amountReceived) || 0;
    const changeDue = Math.max(0, received - grandTotal);
    const amountDue = Math.max(0, grandTotal - received);
    const canConfirm = this.paymentMethod !== 'cash' || received >= grandTotal;

    modal.innerHTML = this.getCheckoutModalHTML({
      subtotal,
      discountAmt,
      taxAmt,
      grandTotal,
      received,
      changeDue,
      amountDue,
      canConfirm,
    });
  }

  renderOrderSummary() {
    const cart = store.getState().cart;
    const items = cart
      .map(
        (item) =>
          `<div class="flex justify-between py-3 px-4 text-sm"><span class="font-medium text-gray-700">${item.quantity}x ${item.name}</span><span class="font-semibold text-gray-900">${formatCurrency(item.price * item.quantity)}</span></div>`
      )
      .join('');
    return `
      <div class="border rounded p-4 bg-neutral-50">
        <div class="flex items-center justify-between mb-3"><span class="font-semibold text-neutral-900">Order Summary</span><span class="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-sm font-medium">${getCartCount()} Items</span></div>
        <div class="divide-y max-h-40 overflow-auto bg-white rounded border border-neutral-200">${items}</div>
      </div>
    `;
  }

  renderCheckoutFooter(canConfirm) {
    const btnClass = canConfirm
      ? 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed';
    const btnText = canConfirm ? 'Confirm (Enter)' : 'Enter Amount';
    return `
      <div class="px-6 py-4 border-t bg-neutral-50 flex gap-3">
        <button onclick="posScreen.cancelCheckout()" class="w-32 h-14 bg-white border border-neutral-300 text-neutral-700 rounded font-medium hover:bg-neutral-50">Cancel</button>
        <button onclick="posScreen.confirmPayment()" ${canConfirm ? '' : 'disabled'} class="flex-1 h-14 rounded font-semibold ${btnClass}">${btnText}</button>
      </div>
    `;
  }

  getCheckoutModalHTML(params) {
    const {
      subtotal,
      discountAmt,
      taxAmt,
      grandTotal,
      changeDue,
      amountDue,
      canConfirm,
    } = params;
    return `
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onclick="if(event.target === this) posScreen.cancelCheckout()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden" onclick="event.stopPropagation()">
          <div class="px-6 py-4 border-b flex items-center justify-between bg-neutral-50">
            <div class="text-xl font-bold text-neutral-900">Checkout</div>
            <button onclick="posScreen.cancelCheckout()" class="text-neutral-500 hover:text-neutral-700 text-xl w-10 h-10 flex items-center justify-center rounded hover:bg-neutral-100">✕</button>
          </div>
          <div class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            ${this.renderOrderSummary()}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div data-discount-card>${this.renderDiscountCard()}</div>
              <div data-tax-card>${this.renderTaxCard(subtotal, discountAmt, taxAmt, grandTotal)}</div>
            </div>
            <div data-payment-card>${this.renderPaymentMethodCard(grandTotal, amountDue, changeDue)}</div>
          </div>
          <div data-checkout-footer>${this.renderCheckoutFooter(canConfirm)}</div>
        </div>
      </div>
    `;
  }

  renderDiscountCard() {
    const quickButtons = this.getQuickDiscountButtons();

    return `
      <div class="border rounded p-4 h-full flex flex-col bg-neutral-50">
        <div class="font-semibold text-neutral-900 mb-3 text-sm">Discount</div>
        
        <div class="flex gap-2 mb-3">
          ${['none', 'percent', 'flat']
            .map(
              (t) => `
            <button 
              onclick="posScreen.setDiscountType('${t}')" 
              class="flex-1 px-3 py-2 rounded font-medium text-sm ${this.discountType === t ? 'bg-primary text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'}"
            >
              ${this.getDiscountTypeLabel(t)}
            </button>
          `
            )
            .join('')}
        </div>

        <input 
          type="number" 
          min="0" 
          ${this.discountType === 'none' ? 'disabled' : ''}
          placeholder="${this.discountType === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 100 for LKR 100'}"
          value="${this.discountValue}"
          oninput="posScreen.setDiscountValue(this.value)"
          class="w-full px-3 py-2 border rounded text-sm ${this.discountType === 'none' ? 'bg-neutral-100 border-neutral-200 cursor-not-allowed' : 'border-neutral-300 focus:border-primary'}" 
        />

        ${this.discountType === 'none' ? '' : `<div class="flex flex-wrap gap-2 mt-2">${quickButtons}</div>`}
      </div>
    `;
  }

  renderTaxCard(subtotal, discountAmt, taxAmt, grandTotal) {
    return `
      <div class="border rounded p-4 h-full flex flex-col bg-neutral-50">
        <div class="font-semibold text-neutral-900 mb-3 text-sm">Tax & Total</div>

        <div class="mb-3">
          <label class="text-xs text-neutral-600 font-medium mb-1 block">Tax Rate (%)</label>
          <input 
            type="number" 
            min="0" 
            value="${this.taxRate}" 
            oninput="posScreen.setTaxRate(this.value)" 
            class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary text-sm" 
          />
        </div>

        <div class="space-y-2 p-3 bg-white rounded border flex-1 text-sm" data-tax-totals>
          <div class="flex justify-between">
            <span class="text-neutral-600">Subtotal</span>
            <span class="font-semibold">${formatCurrency(subtotal)}</span>
          </div>
          ${
            discountAmt > 0
              ? `
            <div class="flex justify-between">
              <span class="text-neutral-600">Discount</span>
              <span class="font-semibold text-success">-${formatCurrency(discountAmt)}</span>
            </div>
          `
              : ''
          }
          <div class="flex justify-between">
            <span class="text-neutral-600">Tax (${this.taxRate}%)</span>
            <span class="font-semibold">${formatCurrency(taxAmt)}</span>
          </div>
          <div class="pt-2 border-t flex justify-between items-center">
            <span class="font-bold">Total</span>
            <span class="text-xl font-bold text-neutral-900">${formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderTaxTotals(subtotal, discountAmt, taxAmt, grandTotal) {
    return `
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-semibold">${formatCurrency(subtotal)}</span>
      </div>
      ${
        discountAmt > 0
          ? `
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Discount</span>
          <span class="font-semibold text-green-600">-${formatCurrency(discountAmt)}</span>
        </div>
      `
          : ''
      }
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Tax (${this.taxRate}%)</span>
        <span class="font-semibold">${formatCurrency(taxAmt)}</span>
      </div>
      <div class="pt-3 border-t flex justify-between items-center">
        <span class="text-lg font-bold">Total</span>
        <span class="text-2xl font-bold text-primary">${formatCurrency(grandTotal)}</span>
      </div>
    `;
  }

  renderPaymentMethodCard(grandTotal, amountDue, changeDue) {
    return `
      <div class="border rounded p-4 bg-neutral-50">
        <div class="font-semibold text-neutral-900 mb-3 text-sm">Payment Method</div>

        <div class="grid grid-cols-4 gap-2 mb-4">
          ${['cash', 'card', 'digital', 'unpaid']
            .map(
              (m) => `
            <button 
              onclick="posScreen.setPaymentMethod('${m}')" 
              class="px-3 py-3 rounded border font-medium text-sm ${this.paymentMethod === m ? 'bg-primary border-primary text-white' : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'}"
            >
              <div class="text-xl mb-1">${this.getPaymentMethodIcon(m)}</div>
              <div class="text-xs capitalize">${m}</div>
            </button>
          `
            )
            .join('')}
        </div>

        ${
          this.paymentMethod === 'cash'
            ? this.renderCashPaymentSection(grandTotal, amountDue, changeDue)
            : `
          <div class="bg-white border rounded p-4 text-center">
            <div class="text-2xl mb-1">✓</div>
            <div class="font-medium text-neutral-700 text-sm">Ready to process</div>
          </div>
        `
        }
      </div>
    `;
  }

  getPaymentMethodIcon(method) {
    const icons = { cash: '💵', card: '💳', digital: '📱', unpaid: '📝' };
    return icons[method] || '💰';
  }

  renderCashPaymentSection(grandTotal, amountDue, changeDue) {
    const statusLabel = amountDue > 0 ? 'Amount Due' : 'Change';
    const statusColor = amountDue > 0 ? 'text-danger' : 'text-success';
    const displayAmount = amountDue > 0 ? amountDue : changeDue;

    return `
      <div class="bg-white border rounded p-4">
        <div class="mb-3">
          <label class="text-xs font-semibold text-neutral-700 mb-1 block">Amount Received</label>
          <input 
            type="number" 
            min="0" 
            value="${this.amountReceived}" 
            oninput="posScreen.setAmountReceived(this.value)" 
            class="w-full px-3 py-2 border border-neutral-300 rounded font-semibold focus:border-primary" 
          />
        </div>

        <div class="flex flex-wrap gap-2 mb-3">
          <button onclick="posScreen.applyExact(${grandTotal})" class="px-3 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded">Exact</button>
          ${QUICK_CASH_VALUES.map((v) => `<button onclick="posScreen.applyQuickCash(${v})" class="px-3 py-1.5 text-xs font-medium bg-white hover:bg-neutral-100 border border-neutral-200 rounded">₨${v}</button>`).join('')}
        </div>

        <div class="flex justify-between items-center pt-3 border-t">
          <span class="font-semibold text-sm">${statusLabel}</span>
          <span class="text-lg font-bold ${statusColor}">${formatCurrency(displayAmount)}</span>
        </div>
      </div>
    `;
  }

  setDiscountType(type) {
    this.discountType = type;
    if (type === 'none') {
      this.discountValue = 0;
    }
    this.updateCheckoutModal();
  }

  setDiscountValue(value) {
    this.discountValue = Number(value) || 0;
    this.updateTotalsOnly(); // Avoids re-rendering the input to maintain focus
  }

  setTaxRate(rate) {
    this.taxRate = Number(rate) || 0;
    this.updateTotalsOnly(); // Avoids re-rendering the input to maintain focus
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    if (method !== 'cash' && method !== 'unpaid') {
      this.amountReceived = 0;
    }
    this.updateCheckoutModal();
  }

  setAmountReceived(amount) {
    this.amountReceived = Number(amount) || 0;
    this.updateTotalsOnly(); // Avoids re-rendering the input to maintain focus
  }

  getDiscountTypeLabel(type) {
    const labels = { none: 'None', percent: '%', flat: '₨' };
    return labels[type] || type;
  }

  getQuickDiscountButtons() {
    if (this.discountType === 'percent') {
      return PERCENT_VALUES.map(
        (v) =>
          `<button onclick="posScreen.applyQuickPercent(${v})" class="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200">${v}%</button>`
      ).join('');
    }

    if (this.discountType === 'flat') {
      return FLAT_VALUES.map(
        (v) =>
          `<button onclick="posScreen.applyQuickFlat(${v})" class="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200">₨${v}</button>`
      ).join('');
    }

    return '';
  }

  applyQuickPercent(value) {
    this.discountType = 'percent';
    this.discountValue = value;
    this.updateCheckoutModal();
  }

  applyQuickFlat(value) {
    this.discountType = 'flat';
    this.discountValue = value;
    this.updateCheckoutModal();
  }

  applyExact(amount) {
    this.amountReceived = Math.max(0, Number(amount) || 0);
    this.updateCheckoutModal();
  }

  applyQuickCash(value) {
    this.amountReceived = value;
    this.updateCheckoutModal();
  }

  updateCheckoutModal() {
    if (!this.showCheckout) {
      return;
    }

    const subtotal = getCartTotal();
    const discountAmt = this.calculateDiscount(subtotal);
    const subAfterDiscount = Math.max(0, subtotal - discountAmt);
    const taxAmt = (subAfterDiscount * this.taxRate) / 100;
    const grandTotal = Math.max(0, subAfterDiscount + taxAmt);
    const received = Number(this.amountReceived) || 0;
    const changeDue = Math.max(0, received - grandTotal);
    const amountDue = Math.max(0, grandTotal - received);
    const canConfirm = this.paymentMethod !== 'cash' || received >= grandTotal;

    const discountCard = document.querySelector('[data-discount-card]');
    const taxCard = document.querySelector('[data-tax-card]');
    const paymentCard = document.querySelector('[data-payment-card]');
    const footer = document.querySelector('[data-checkout-footer]');

    if (discountCard) {
      discountCard.innerHTML = this.renderDiscountCard();
    }
    if (taxCard) {
      taxCard.innerHTML = this.renderTaxCard(
        subtotal,
        discountAmt,
        taxAmt,
        grandTotal
      );
    }
    if (paymentCard) {
      paymentCard.innerHTML = this.renderPaymentMethodCard(
        grandTotal,
        amountDue,
        changeDue
      );
    }
    if (footer) {
      footer.innerHTML = this.renderCheckoutFooter(canConfirm);
    }
  }

  // Update only the tax totals section to maintain input focus
  updateTotalsOnly() {
    if (!this.showCheckout) {
      return;
    }

    const subtotal = getCartTotal();
    const discountAmt = this.calculateDiscount(subtotal);
    const subAfterDiscount = Math.max(0, subtotal - discountAmt);
    const taxAmt = (subAfterDiscount * this.taxRate) / 100;
    const grandTotal = Math.max(0, subAfterDiscount + taxAmt);
    const received = Number(this.amountReceived) || 0;
    const changeDue = Math.max(0, received - grandTotal);
    const amountDue = Math.max(0, grandTotal - received);
    const canConfirm = this.paymentMethod !== 'cash' || received >= grandTotal;

    // Only update the totals display and footer
    const taxTotals = document.querySelector('[data-tax-totals]');
    const footer = document.querySelector('[data-checkout-footer]');
    const paymentCard = document.querySelector('[data-payment-card]');

    if (taxTotals) {
      taxTotals.innerHTML = this.renderTaxTotals(
        subtotal,
        discountAmt,
        taxAmt,
        grandTotal
      );
    }
    if (paymentCard) {
      paymentCard.innerHTML = this.renderPaymentMethodCard(
        grandTotal,
        amountDue,
        changeDue
      );
    }
    if (footer) {
      footer.innerHTML = this.renderCheckoutFooter(canConfirm);
    }
  }

  // Calculates discount: percentage of subtotal or capped flat amount
  calculateDiscount(subtotal) {
    if (this.discountType === 'percent') {
      return (subtotal * (Number(this.discountValue) || 0)) / 100;
    } else if (this.discountType === 'flat') {
      return Math.min(Number(this.discountValue) || 0, subtotal);
    }
    return 0;
  }

  confirmPayment() {
    try {
      const subtotal = getCartTotal();
      const discountAmt = this.calculateDiscount(subtotal);
      const subAfterDiscount = Math.max(0, subtotal - discountAmt);
      const taxAmt = (subAfterDiscount * this.taxRate) / 100;
      const grandTotal = Math.max(0, subAfterDiscount + taxAmt);

      if (this.paymentMethod === 'cash' && this.amountReceived < grandTotal) {
        toast('Insufficient cash received', 'error');
        return;
      }

      const result = placeOrder(this.paymentMethod, {
        subtotal,
        discountType: this.discountType,
        discountValue: discountAmt,
        taxRate: this.taxRate,
        taxAmount: taxAmt,
        total: grandTotal,
        paymentStatus: this.paymentMethod === 'unpaid' ? 'unpaid' : 'paid',
        amountReceived: this.paymentMethod === 'cash' ? this.amountReceived : 0,
        changeDue:
          this.paymentMethod === 'cash'
            ? Math.max(0, this.amountReceived - grandTotal)
            : 0,
      });

      if (result.success) {
        this.lastOrderId = result.order.id;
        this.showCheckout = false;
        this.closeCheckoutModal();
        this.showSuccess = true;
        this.renderSuccessModalDirectly();
        logger.info('Order placed successfully', {
          orderId: result.order.id,
          total: grandTotal,
        });
        toast('Order placed successfully!', 'success');
      } else {
        toast(result.error || 'Failed to place order', 'error');
        logger.error('Failed to place order', { error: result.error });
      }
    } catch (error) {
      logger.error('Error placing order', { error: error.message });
      toast(`Failed to place order: ${error.message}`, 'error');
    }
  }

  /**
   * Start a new order.
   */
  startNewOrder() {
    this.showSuccess = false;
    this.discountType = 'none';
    this.discountValue = 0;
    this.amountReceived = 0;
    this.paymentMethod = 'cash';
    this.lastOrderId = null;

    // Remove success modal
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      successModal.remove();
    }

    clearCart();
    globalThis.app.navigate('new-order');
  }

  printReceipt(orderId) {
    const order = store
      .getState()
      .orders.find((ord) => String(ord.id) === String(orderId));
    if (!order) {
      return;
    }

    const html = this.getReceiptHTML(order);
    const w = window.open('', 'PRINT', 'height=650,width=400');

    if (!w) {
      toast('Please allow popups to print receipts', 'warning');
      return;
    }

    w.document.write(html);
    w.document.close();
    w.focus();
  }

  getReceiptHTML(order) {
    return `
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: system-ui, Arial, sans-serif; padding: 16px; max-width: 400px; }
            h1 { font-size: 18px; margin: 0 0 8px; }
            .muted { color: #555; font-size: 14px; }
            .line { display: flex; justify-content: space-between; margin: 4px 0; }
            .items { margin: 12px 0; border-top: 1px dashed #ccc; padding-top: 8px; }
            .total { font-weight: 700; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>GrillMaster POS</h1>
          <div class="muted">Order #${order.id}</div>
          <div class="muted">${new Date(order.timestamp).toLocaleString()}</div>
          <div class="items">
            ${order.items.map((item) => `<div class="line"><span>${item.quantity}x ${item.name}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>`).join('')}
          </div>
          <div class="line"><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
          ${order.discountValue > 0 ? `<div class="line"><span>Discount</span><span>-${formatCurrency(order.discountValue)}</span></div>` : ''}
          ${order.taxAmount > 0 ? `<div class="line"><span>Tax (${order.taxRate}%)</span><span>${formatCurrency(order.taxAmount)}</span></div>` : ''}
          <div class="line total"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
          ${order.amountReceived ? `<div class="line"><span>Received</span><span>${formatCurrency(order.amountReceived)}</span></div>` : ''}
          ${order.changeDue > 0 ? `<div class="line"><span>Change</span><span>${formatCurrency(order.changeDue)}</span></div>` : ''}
          <div class="muted" style="margin-top: 12px;">Payment: ${order.paymentMethod}</div>
          <div class="muted" style="margin-top: 12px; text-align: center;">Thank you!</div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;
  }

  updateCartSection() {
    const html = this.renderCartSection();
    updateSection('[data-cart-section]', html);
  }

  updateProductGrid() {
    const products = this.getFilteredProducts();
    updateSection(
      '[data-products-grid]',
      this.renderProductGridContent(products),
      false
    );
  }

  renderProductGridContent(products) {
    return products
      .map((product) => {
        const imageData = imageService.getImageWithFallback(
          product.image,
          product.category
        );
        return `
        <div 
          class="bg-white rounded-lg border border-gray-200 hover:border-primary cursor-pointer transition-colors overflow-hidden" 
          onclick="posScreen.handleAddToCart('${product.id}')"
        >
          <div class="aspect-square bg-gray-50 overflow-hidden">
            <img 
              src="${imageData.src}" 
              alt="${product.name}"
              class="w-full h-full object-cover"
              onerror="this.src='${imageData.fallback}'"
              loading="lazy"
            />
          </div>
          <div class="p-3">
            <div class="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug">${product.name}</div>
            <div class="text-lg font-bold text-primary">${formatCurrency(product.price)}</div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  updateCategoryTabs() {
    const categories = ['All', ...getCategories()];
    updateSection('[data-category-tabs]', this.renderCategoryTabs(categories));
  }

  mount() {
    globalThis.posScreen = this;
    clearCart();

    // Keyboard navigation
    this.keyboardHandler = (e) => {
      // Ignore if user is typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const { cart } = store.getState();
      const hasItems = cart.length > 0;

      switch (e.key) {
        case 'Enter':
          if (this.showCheckout) {
            // In checkout modal - confirm if ready
            e.preventDefault();
            const subtotal = getCartTotal();
            const discountAmt = this.calculateDiscount(subtotal);
            const subAfterDiscount = Math.max(0, subtotal - discountAmt);
            const taxAmt = (subAfterDiscount * this.taxRate) / 100;
            const grandTotal = Math.max(0, subAfterDiscount + taxAmt);
            const received = Number(this.amountReceived) || 0;
            const canConfirm =
              this.paymentMethod !== 'cash' || received >= grandTotal;
            if (canConfirm) {
              this.confirmPayment();
            }
          } else if (hasItems) {
            // Not in checkout - open checkout
            e.preventDefault();
            this.checkout();
          }
          break;
        case 'Escape':
          if (this.showCheckout) {
            e.preventDefault();
            this.closeCheckoutModal();
          } else if (hasItems) {
            e.preventDefault();
            this.handleClearCart();
          }
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          this.handleUndo();
          break;
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
  }

  unmount() {
    delete globalThis.posScreen;
    this.closeCheckoutModal();

    // Remove keyboard handler
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
    }

    // Clean up success modal if exists
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      successModal.remove();
    }
  }
}

export default POSScreen;
