// Status badge component with color variants

const VARIANT_CLASSES = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-cyan-100 text-cyan-700',
};

function Badge({ text, variant = 'default', className = '' }) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses} ${className}">
      ${text}
    </span>
  `;
}

// Map status strings to colored badges
export function StatusBadge(status, mappings = {}) {
  const defaultMappings = {
    // Order status
    preparing: { variant: 'warning', text: 'Preparing' },
    ready: { variant: 'info', text: 'Ready' },
    completed: { variant: 'success', text: 'Completed' },
    cancelled: { variant: 'danger', text: 'Cancelled' },
    // Payment status
    paid: { variant: 'success', text: 'Paid' },
    unpaid: { variant: 'danger', text: 'Unpaid' },
    partial: { variant: 'warning', text: 'Partial' },
  };

  const allMappings = { ...defaultMappings, ...mappings };
  const config = allMappings[status] || { variant: 'default', text: status };
  return Badge(config);
}
