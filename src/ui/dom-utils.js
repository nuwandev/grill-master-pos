// DOM update helpers for partial re-renders (more efficient than full page render)

// Replace element HTML by selector
export function updateSection(selector, html, replaceOuter = true) {
  const element = document.querySelector(selector);
  if (!element) return false;

  if (replaceOuter) {
    element.outerHTML = html;
  } else {
    element.innerHTML = html;
  }
  return true;
}

// Update just text content (faster than innerHTML for text-only)
export function updateText(selector, text) {
  const element = document.querySelector(selector);
  if (!element) return false;
  element.textContent = text;
  return true;
}
