// Modal dialog and toast notification components

import { TOAST_DURATION_MS } from '../core/constants.js';

const TOAST_FADE_DURATION = 300;

const BUTTON_VARIANTS = {
  primary: 'px-4 py-2 rounded-xl bg-primary text-white hover:bg-blue-600',
  secondary: 'px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100',
};

// Create a button element for modal footer
function createActionButton(action, cleanup) {
  const btn = document.createElement('button');
  btn.textContent = action.label;
  btn.className = BUTTON_VARIANTS[action.variant] || BUTTON_VARIANTS.secondary;
  btn.onclick = () => {
    action.onClick?.();
    cleanup();
  };
  return btn;
}

// Build modal DOM structure
function createModalElements(title, html) {
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-backdrop';

  const box = document.createElement('div');
  box.className =
    'bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal';

  const header = document.createElement('div');
  header.className = 'px-6 pt-6 text-xl font-bold text-gray-900';
  header.textContent = title;

  const body = document.createElement('div');
  body.className = 'px-6 py-4 max-h-[60vh] overflow-y-auto text-gray-700';
  body.innerHTML = html;

  const footer = document.createElement('div');
  footer.className = 'px-6 pb-6 pt-2 flex flex-wrap gap-2 justify-end';

  return { overlay, box, header, body, footer };
}

// Set up click-outside and Escape key to close
function setupModalEvents(overlay, closeOnOverlay, cleanup) {
  if (closeOnOverlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup();
    });
  }
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Create and show a modal dialog
// Returns cleanup function to close it programmatically
export function createModal({
  title = '',
  html = '',
  actions = [],
  closeOnOverlay = true,
}) {
  const { overlay, box, header, body, footer } = createModalElements(
    title,
    html
  );

  const cleanup = () => {
    try {
      document.body.removeChild(overlay);
    } catch {
      /* Already removed */
    }
  };

  actions.forEach((action) =>
    footer.appendChild(createActionButton(action, cleanup))
  );
  box.appendChild(header);
  box.appendChild(body);
  if (actions.length > 0) box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  setupModalEvents(overlay, closeOnOverlay, cleanup);
  return cleanup;
}

// Show confirmation dialog - returns Promise<boolean>
export function confirm({
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    createModal({
      title,
      html: `<p>${message}</p>`,
      actions: [
        {
          label: cancelText,
          variant: 'secondary',
          onClick: () => resolve(false),
        },
        {
          label: confirmText,
          variant: danger ? 'danger' : 'primary',
          onClick: () => resolve(true),
        },
      ],
    });
  });
}

// Show toast notification (auto-dismisses)
export function toast(message, type = 'info', duration = TOAST_DURATION_MS) {
  // Remove existing toast
  document.querySelector('[data-toast]')?.remove();

  const typeConfig = {
    info: { bg: 'bg-gray-800', icon: 'i' },
    success: { bg: 'bg-green-600', icon: '✓' },
    warning: { bg: 'bg-yellow-500', icon: '!' },
    error: { bg: 'bg-red-600', icon: '✗' },
  };

  const config = typeConfig[type] || typeConfig.info;

  const toastEl = document.createElement('div');
  toastEl.setAttribute('data-toast', '');
  toastEl.className = `
    fixed bottom-6 left-1/2 -translate-x-1/2 z-50
    ${config.bg} text-white px-6 py-3 rounded-xl shadow-lg
    flex items-center gap-3 animate-toast-in
  `;
  toastEl.innerHTML = `<span class="text-lg">${config.icon}</span><span>${message}</span>`;

  document.body.appendChild(toastEl);

  // Fade out and remove after duration
  setTimeout(() => {
    toastEl.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => toastEl.remove(), TOAST_FADE_DURATION);
  }, duration);
}
