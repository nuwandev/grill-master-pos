// Reusable header component with left/center/right sections

export function Header({
  left = '',
  center = '',
  right = '',
  className = '',
} = {}) {
  return `
    <div class="bg-white shadow-sm px-6 py-4 border-b ${className}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-3">${left}</div>
        <div class="flex-1 flex justify-center items-center">${center}</div>
        <div class="flex items-center gap-2">${right}</div>
      </div>
    </div>
  `;
}
