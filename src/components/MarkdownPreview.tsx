import { useEffect, useMemo, useRef } from 'react';
import { hasMermaidBlocks, isolateFlowArrows, normalizeMarkdownLinks, renderMarkdown } from '../lib/markdown';
import { renderMermaidDiagrams } from '../lib/mermaid';

type MarkdownPreviewProps = {
  markdown: string;
};

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    normalizeMarkdownLinks(previewRef.current);
    isolateFlowArrows(previewRef.current);

    if (previewRef.current && hasMermaidBlocks(previewRef.current)) {
      void renderMermaidDiagrams(previewRef.current);
    }
  }, [html]);

  if (!markdown.trim()) {
    return (
      <div className="flex min-h-[320px] min-w-0 max-w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/75 p-8 text-center text-slate-500">
        هنوز محتوایی برای نمایش وجود ندارد.
      </div>
    );
  }

  return (
    <article
      ref={previewRef}
      className="markdown-preview min-h-[320px] min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
