// Hash-based SPA router
// Uses URL hash (#home, #orders, etc.) for navigation without page reloads

import { DEFAULT_ROUTE } from './constants.js';

// Get route from URL hash, e.g., "#orders" -> "orders"
function getCurrentRoute(defaultRoute) {
  return window.location.hash.slice(1) || defaultRoute;
}

// Call screen's unmount method if it exists (cleanup)
function unmountScreen(screen) {
  if (screen?.unmount) screen.unmount();
}

// Call screen's mount method if it exists (setup)
function mountScreen(screen) {
  if (screen?.mount) screen.mount();
}

export function createRouter(config) {
  const { root, routes, defaultRoute = DEFAULT_ROUTE } = config;
  let currentScreen = null;
  let currentRoute = '';

  // Navigate to a route - creates new screen instance and renders it
  function navigate(route, params = {}) {
    unmountScreen(currentScreen);

    const ScreenClass = routes[route] || routes[defaultRoute];
    if (!ScreenClass) return;

    currentRoute = route;
    window.location.hash = route;
    currentScreen = new ScreenClass({ router: routerInstance, params });

    // Expose screen instance globally for onclick handlers
    // Map route to screen name: 'pos' -> 'posScreen', 'new-order' -> 'newOrderScreen'
    const screenName = `${route
      .split('-')
      .map((part, i) =>
        i === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`
      )
      .join('')}Screen`;
    window[screenName] = currentScreen;

    render();
    window.scrollTo(0, 0);
    mountScreen(currentScreen);
  }

  // Render current screen to DOM with fade animation
  function render() {
    if (!currentScreen || !root) return;
    root.classList.add('screen-enter');
    root.innerHTML = currentScreen.render?.() || '';
    setTimeout(() => root.classList.remove('screen-enter'), 250);
  }

  // Listen for browser back/forward navigation
  function handleHashChange() {
    const route = getCurrentRoute(defaultRoute);
    if (route !== currentRoute) navigate(route);
  }

  function init() {
    window.addEventListener('hashchange', handleHashChange);
    navigate(getCurrentRoute(defaultRoute));
  }

  const routerInstance = { navigate, render, init };
  return routerInstance;
}
