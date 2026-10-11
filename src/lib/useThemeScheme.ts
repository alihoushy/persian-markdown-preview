import { useSyncExternalStore } from 'react';
import type { ThemeScheme } from './themes';

function currentScheme(): ThemeScheme {
  return document.documentElement.dataset.scheme === 'dark' ? 'dark' : 'light';
}

/**
 * applyTheme() stamps the active theme's light/dark scheme on <html>, so an
 * attribute observer is the cheapest way for the parts that CSS cannot reach —
 * Mermaid, which bakes its palette into the SVG — to hear about a theme change.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-scheme'],
  });

  return () => observer.disconnect();
}

export function useThemeScheme(): ThemeScheme {
  return useSyncExternalStore(subscribe, currentScheme, () => 'light');
}
