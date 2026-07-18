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
