import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import go from 'highlight.js/lib/languages/go';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { Marked } from 'marked';
import markedAlert from 'marked-alert';
import markedFootnote from 'marked-footnote';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { escapeText, extendedSyntax } from './marked-extensions';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('go', go);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('toml', ini);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('php', php);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('text', plaintext);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('svg', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);

const marked = new Marked();

marked.use({
  gfm: true,
  breaks: false,
});

marked.use(gfmHeadingId());
marked.use(markedFootnote());
marked.use(markedAlert());
marked.use(extendedSyntax);

// Custom code renderer: divert ```mermaid blocks to a <pre class="mermaid">
// element (rendered client-side after mount), and syntax-highlight everything
// else with highlight.js.
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();

      if (language === 'mermaid') {
        return `<pre class="mermaid" data-mermaid-source="${encodeURIComponent(text)}">${escapeText(text)}</pre>`;
      }

      const resolved = language && hljs.getLanguage(language) ? language : 'plaintext';
      const highlighted = hljs.highlight(text, { language: resolved }).value;

      return `<pre><code class="hljs language-${resolved}">${highlighted}</code></pre>`;
    },
  },
});

export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ADD_ATTR: ['target', 'rel', 'id', 'data-mermaid-source', 'data-footnotes', 'data-footnote-ref', 'data-footnote-backref', 'align', 'width', 'height', 'colspan', 'rowspan'],
    ADD_TAGS: ['mark', 'sub', 'sup', 'dl', 'dt', 'dd', 'ins', 'figure', 'figcaption'],
  });
}

// Arrows written as "leads to" separators in Persian prose. The Unicode bidi
// algorithm resolves a neutral character sitting between two Latin runs to LTR
// (rule N1), so in `... لایه‌ی Registrar API → retry ارزش دارد` the arrow joins
// its Latin neighbours into one left-to-right island: `Registrar API → retry`
// is laid out as a unit in the middle of the line and `ارزش دارد` is stranded
// at the far end, tearing the phrase in half. Fencing each arrow with RLM makes
// both of its neighbours strongly RTL, so the arrow stays in the paragraph's
// own direction and each Latin word keeps its place in the reading order.
// Only arrows are touched — widening this to every neutral would reverse
// genuinely left-to-right runs such as `E = mc^2`.
const FLOW_ARROWS = /[\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F]+/g;
const RLM = '\u200F';

/** Keeps arrow separators inside the right-to-left flow of the line. */
export function isolateFlowArrows(container: HTMLElement | null): void {
  if (!container) {
    return;
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Code keeps its own direction rules; never rewrite what it contains.
      if (node.parentElement?.closest('pre, code')) {
        return NodeFilter.FILTER_REJECT;
      }

      FLOW_ARROWS.lastIndex = 0;

      return FLOW_ARROWS.test(node.nodeValue || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const targets: Text[] = [];
  let node = walker.nextNode();

  while (node) {
    targets.push(node as Text);
    node = walker.nextNode();
  }

  targets.forEach((text) => {
    text.nodeValue = (text.nodeValue || '')
      .replace(FLOW_ARROWS, (arrows) => `${RLM}${arrows}${RLM}`)
      // Collapsing runs keeps a second pass over the same node a no-op.
      .replace(/\u200F{2,}/g, RLM);
  });
}

export function normalizeMarkdownLinks(container: HTMLElement | null): void {
  if (!container) {
    return;
  }

  container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';

    if (/^https?:\/\//i.test(href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer nofollow';
    }
  });
}

/** Returns true if the rendered container has any mermaid diagrams to process. */
export function hasMermaidBlocks(container: HTMLElement | null): boolean {
  return !!container?.querySelector('pre.mermaid');
}
