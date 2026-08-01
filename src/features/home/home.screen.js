// Home Screen - Dashboard with stats, quick actions, and navigation

import { imageService } from '../../services/image-service.js';
import {
  getOrderStats,
  getTopProducts,
  resetData,
  store,
} from '../../state/index.js';
import { Header } from '../../ui/header.js';
import { confirm, toast } from '../../ui/modal.js';
import { formatCurrency } from '../../utils/helpers.js';

const TOP_PRODUCTS_LIMIT = 4;
const CLOCK_UPDATE_INTERVAL = 1000;

export class HomeScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.now = new Date();
    this.clockInterval = null;
  }

  render() {
    const stats = getOrderStats();
    const topProducts = getTopProducts(TOP_PRODUCTS_LIMIT);
    const avgOrderValue =
      stats.today > 0 ? stats.todayRevenue / stats.today : 0;

    return `
      <div class="h-screen flex flex-col bg-neutral-50 overflow-hidden">
        ${this.renderHeader()}
        <div class="flex-1 overflow-y-auto" style="min-height: 0;">
          <div class="w-full p-6">
            ${this.renderNewOrderButton()}
            ${this.renderStatsGrid(stats, avgOrderValue)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${this.renderTopProducts(topProducts)}
              ${this.renderQuickNav(stats)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderHeader() {
    return Header({
      left: '<h1 class="text-xl font-bold text-neutral-900">GrillMaster POS</h1>',
      right: `
        <div class="text-xs text-neutral-500 flex items-center gap-2">
          <span>${this.now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <span class="w-px h-4 bg-neutral-300"></span>
          <span data-clock>${this.now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      `,
    });
  }

  renderNewOrderButton() {
    return `
      <div class="mb-6">
        <button onclick="app.navigate('new-order')" tabindex="1" class="w-full bg-primary text-white text-xl font-bold py-8 rounded hover:bg-primary/90 transition-colors">
          + Start New Order (Enter)
        </button>
      </div>
    `;
  }

  // Stats cards row
  renderStatsGrid(stats, avgOrderValue) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        ${this.renderStatCard("Today's Revenue", formatCurrency(stats.todayRevenue), `${stats.today} orders today`, 'text-primary')}
        ${this.renderStatCard('Total Revenue', formatCurrency(stats.revenue), `${stats.total} total orders`, 'text-success')}
        ${this.renderStatCard('Avg Order Value', formatCurrency(avgOrderValue), 'Per order', 'text-orange-500')}
        ${this.renderStatCard('Orders Today', stats.today, 'Completed', 'text-blue-500')}
      </div>
    `;
  }

  renderStatCard(label, value, subtitle, colorClass) {
    return `
      <div class="bg-white rounded p-4 border border-neutral-200">
        <div class="text-xs text-neutral-500 mb-1">${label}</div>
        <div class="text-2xl font-bold ${colorClass}">${value}</div>
        <div class="text-xs text-neutral-400 mt-1">${subtitle}</div>
      </div>
    `;
  }

  // Top selling products from order history
  renderTopProducts(topProducts) {
    const productList =
      topProducts.length === 0
        ? `<div class="text-center text-gray-400 py-8"><div class="text-4xl mb-2">�</div><div>No orders yet</div></div>`
        : topProducts
            .map((item) => {
              const { src, fallback } = imageService.getImageWithFallback(
                item.image,
                'default'
              );
              return `
          <div class="flex items-center justify-between mb-3 pb-3 border-b last:border-0">
            <div class="flex items-center gap-3">
              <img 
                src="${src}" 
                alt="${item.name}"
                class="w-10 h-10 object-cover rounded-lg"
                onerror="this.src='${fallback}'"
                loading="lazy"
              />
              <div>
                <div class="font-medium">${item.name}</div>
                <div class="text-sm text-gray-500">${item.sales} sold</div>
              </div>
            </div>
            <div class="text-sm font-semibold text-primary">${formatCurrency(item.revenue)}</div>
          </div>
        `;
            })
            .join('');

    return `
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-bold mb-4">Top Products</h3>
        ${productList}
      </div>
    `;
  }

  // Quick navigation buttons
  renderQuickNav(stats) {
    const state = store.getState();
    return `
      <div class="bg-white rounded p-5 border border-neutral-200">
        <h3 class="text-base font-bold mb-4">Quick Access</h3>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="app.navigate('orders')" class="p-4 rounded border border-neutral-200 hover:border-primary hover:bg-neutral-50 transition-colors text-left">
            <div class="text-2xl mb-2">📋</div>
            <div class="font-semibold text-sm">Orders</div>
            <div class="text-xs text-neutral-500">${stats.total} total</div>
          </button>
          <button onclick="app.navigate('menu')" class="p-4 rounded border border-neutral-200 hover:border-primary hover:bg-neutral-50 transition-colors text-left">
            <div class="text-2xl mb-2">📖</div>
            <div class="font-semibold text-sm">Menu</div>
            <div class="text-xs text-neutral-500">${state.products.length} items</div>
          </button>
          <button onclick="app.navigate('customers')" class="p-4 rounded border border-neutral-200 hover:border-primary hover:bg-neutral-50 transition-colors text-left">
            <div class="text-2xl mb-2">👥</div>
            <div class="font-semibold text-sm">Customers</div>
            <div class="text-xs text-neutral-500">${state.customers.length} total</div>
          </button>
          <button onclick="homeScreen.handleReset()" class="p-4 rounded border border-neutral-200 hover:border-danger hover:bg-danger/10 transition-colors text-left">
            <div class="text-2xl mb-2">🔄</div>
            <div class="font-semibold text-sm">Reset</div>
            <div class="text-xs text-neutral-500">Clear data</div>
          </button>
        </div>
      </div>
    `;
  }

  async handleReset() {
    const confirmed = await confirm({
      title: 'Reset All Data',
      message:
        'This will clear all orders, cart, and reset to demo data. Continue?',
      confirmText: 'Reset',
      danger: true,
    });
    if (confirmed) {
      resetData();
      toast('Data has been reset', 'success');
      globalThis.app.render();
    }
  }

  // Live clock update
  updateClock() {
    const clockEl = document.querySelector('[data-clock]');
    if (clockEl) {
      this.now = new Date();
      clockEl.textContent = this.now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
  }

  // Lifecycle: called after render
  mount() {
    globalThis.homeScreen = this;
    this.clockInterval = setInterval(
      () => this.updateClock(),
      CLOCK_UPDATE_INTERVAL
    );

    // Keyboard navigation
    this.keyboardHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        globalThis.app.navigate('new-order');
      }
    };
    document.addEventListener('keydown', this.keyboardHandler);
  }

  // Lifecycle: cleanup before leaving screen
  unmount() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
    }
    delete globalThis.homeScreen;
  }
}

export default HomeScreen;
