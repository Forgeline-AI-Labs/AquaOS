import type { Theme } from "./tokens";

/**
 * Apply a theme's design tokens as CSS custom properties on a target element
 * (typically `document.documentElement`).
 *
 * Naming convention: `--aqua-<category>-<token>`
 * e.g. `--aqua-color-primary`, `--aqua-radius-md`, `--aqua-space-lg`
 */
export function applyTheme(theme: Theme, el: HTMLElement): void {
  const s = el.style;

  for (const [key, value] of Object.entries(theme.colors)) {
    s.setProperty(`--aqua-color-${camelToDash(key)}`, value);
  }

  for (const [key, value] of Object.entries(theme.radii)) {
    s.setProperty(`--aqua-radius-${key}`, value);
  }

  for (const [key, value] of Object.entries(theme.spacing)) {
    s.setProperty(`--aqua-space-${key}`, value);
  }
}

function camelToDash(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
