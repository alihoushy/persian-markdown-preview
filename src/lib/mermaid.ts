// Mermaid is heavy (~500 KB), so it is imported dynamically only when a rendered
// document actually contains a ```mermaid block.
let mermaidReady: Promise<typeof import('mermaid').default> | null = null;

function loadMermaid(): Promise<typeof import('mermaid').default> {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'default',
        fontFamily: 'inherit',
      });
      return mermaid;
    });
  }

  return mermaidReady;
}

let diagramCounter = 0;

/** Renders every unprocessed <pre class="mermaid"> inside the container to SVG. */
export async function renderMermaidDiagrams(container: HTMLElement): Promise<void> {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])'),
  );

  if (nodes.length === 0) {
    return;
  }

  let mermaid: typeof import('mermaid').default;
  try {
    mermaid = await loadMermaid();
  } catch {
    return;
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
