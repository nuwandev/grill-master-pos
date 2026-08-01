// Main application entry point
// Sets up router with all screen components and initializes the app

import { ROUTES } from './constants.js';
import { createRouter } from './router.js';
import { CustomersScreen } from '../features/customers/customers.screen.js';
import { HomeScreen } from '../features/home/home.screen.js';
import { MenuScreen } from '../features/menu/menu.screen.js';
import { NewOrderScreen } from '../features/new-order/new-order.screen.js';
import { OrdersScreen } from '../features/orders/orders.screen.js';
import { POSScreen } from '../features/pos/pos.screen.js';

class App {
  constructor() {
    this.root = null;
    this.router = null;
  }

  init() {
    this.root = document.getElementById('app');
    if (!this.root) return;

    // Map routes to screen classes
    this.router = createRouter({
      root: this.root,
      routes: {
        [ROUTES.HOME]: HomeScreen,
        [ROUTES.NEW_ORDER]: NewOrderScreen,
        [ROUTES.POS]: POSScreen,
        [ROUTES.ORDERS]: OrdersScreen,
        [ROUTES.MENU]: MenuScreen,
        [ROUTES.CUSTOMERS]: CustomersScreen,
      },
    });

    // Expose globally so screens can access navigation
    window.app = this;
    this.router.init();
  }

  navigate(route) {
    this.router?.navigate(route);
  }

  render() {
    this.router?.render();
  }
}

// Called from main.js when DOM is ready
export function initApp() {
  const app = new App();
  app.init();
}

export { App };
