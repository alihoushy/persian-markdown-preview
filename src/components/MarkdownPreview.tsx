import { useEffect, useMemo, useRef } from 'react';
import {
  hasMermaidBlocks,
  normalizeMarkdownLinks,
  normalizeRtlArrows,
  renderMarkdown,
} from '../lib/markdown';
import { renderMermaidDiagrams, resetRenderedDiagrams } from '../lib/mermaid';
import { useThemeScheme } from '../lib/useThemeScheme';

type MarkdownPreviewProps = {
  markdown: string;
};

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  const scheme = useThemeScheme();

  useEffect(() => {
    normalizeMarkdownLinks(previewRef.current);
    normalizeRtlArrows(previewRef.current);
  }, [html]);

  // Mermaid bakes its palette into the SVG, so a theme change has to redraw the
  // diagrams rather than just restyle them.
  useEffect(() => {
    if (!previewRef.current || !hasMermaidBlocks(previewRef.current)) {
      return;
    }

    resetRenderedDiagrams(previewRef.current);
    void renderMermaidDiagrams(previewRef.current, scheme);
  }, [html, scheme]);

  if (!markdown.trim()) {
    return (
      <div className="flex min-h-[320px] min-w-0 max-w-full items-center justify-center rounded-3xl border border-dashed border-base-content/25 bg-base-100 p-8 text-center text-base-content/60">
        هنوز محتوایی برای نمایش وجود ندارد.
      </div>
    );
  }

  return (
    <article
      ref={previewRef}
      className="markdown-preview min-h-[320px] min-w-0 max-w-full overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-sm md:p-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
