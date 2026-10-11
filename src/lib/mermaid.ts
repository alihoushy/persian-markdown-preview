import type { ThemeScheme } from './themes';

// Mermaid is heavy (~500 KB), so it is imported dynamically only when a rendered
// document actually contains a ```mermaid block.
let mermaidReady: Promise<typeof import('mermaid').default> | null = null;

/** The scheme the loaded instance is currently configured for. */
let configuredScheme: ThemeScheme | null = null;

function configure(mermaid: typeof import('mermaid').default, scheme: ThemeScheme): void {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    // Mermaid draws its own palette rather than inheriting CSS, so the two
    // built-in schemes are the only lever. Anything finer would mean feeding it
    // themeVariables read back from the daisyUI tokens, which drifts every time
    // a theme changes shade.
    theme: scheme === 'dark' ? 'dark' : 'default',
    fontFamily: 'inherit',
  });

  configuredScheme = scheme;
}

function loadMermaid(scheme: ThemeScheme): Promise<typeof import('mermaid').default> {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then(({ default: mermaid }) => {
      configure(mermaid, scheme);
      return mermaid;
    });
  }

  return mermaidReady;
}

let diagramCounter = 0;

/** Drops rendered SVGs so the next pass redraws them in the new scheme. */
export function resetRenderedDiagrams(container: HTMLElement | null): void {
  container?.querySelectorAll<HTMLElement>('pre.mermaid[data-processed]').forEach((node) => {
    const source = node.getAttribute('data-mermaid-source') || '';

    node.removeAttribute('data-processed');
    node.classList.remove('mermaid-rendered', 'mermaid-error');
    node.removeAttribute('title');
    node.textContent = decodeURIComponent(source);
  });
}

/** Renders every unprocessed <pre class="mermaid"> inside the container to SVG. */
export async function renderMermaidDiagrams(
  container: HTMLElement,
  scheme: ThemeScheme,
): Promise<void> {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])'),
  );

  if (nodes.length === 0) {
    return;
  }

  let mermaid: typeof import('mermaid').default;
  try {
    mermaid = await loadMermaid(scheme);
  } catch {
    return;
  }

  if (configuredScheme !== scheme) {
    configure(mermaid, scheme);
  }

  for (const node of nodes) {
    // The container may have been re-rendered while awaiting the import.
    if (!node.isConnected) {
      continue;
    }

    const source = decodeURIComponent(node.getAttribute('data-mermaid-source') || '');
    node.setAttribute('data-processed', 'true');

    try {
      diagramCounter += 1;
      const { svg } = await mermaid.render(`mermaid-diagram-${diagramCounter}`, source);

      if (node.isConnected) {
        node.innerHTML = svg;
        node.classList.add('mermaid-rendered');
      }
    } catch (error) {
      if (node.isConnected) {
        node.classList.add('mermaid-error');
        node.setAttribute(
          'title',
          error instanceof Error ? error.message : 'خطا در رسم نمودار Mermaid',
        );
      }
    }
  }
}
