import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, FileDown, LoaderCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { SourcePanel } from './components/SourcePanel';
import { MarkdownPreview } from './components/MarkdownPreview';
import type { ReadMarkdownResult } from './lib/file';
import { exportAsPdf, isPdfDialogDismissed, toPdfFileName } from './lib/pdf';
import { PdfExportDialog } from './components/PdfExportDialog';
import { ThemePicker } from './components/ThemePicker';

const SAMPLE_MARKDOWN = `# پیش‌نمایش Markdown فارسی

این یک نمونه متن فارسی است. پاراگراف‌ها، لیست‌ها، جدول‌ها و تیترها به‌صورت راست‌چین و RTL نمایش داده می‌شوند.

## نمونه لیست

- مورد اول
- مورد دوم
- مورد سوم با عبارت انگلیسی مثل React و Vite داخل متن فارسی

## نمونه کد

\`\`\`php
<?php

function sayHello(string $name): string
{
    return "Hello {$name}";
}
\`\`\`

## نمونه جدول

| عنوان | توضیح |
| --- | --- |
| زبان | فارسی |
| جهت متن | راست به چپ |
| جهت کد | چپ به راست |

## فهرست کارها

- [x] پشتیبانی از راست‌چین
- [x] برجسته‌سازی کد
- [ ] موارد بیشتر

## قالب‌بندی متن

می‌توان متن را ~~خط‌خورده~~، ==های‌لایت== یا با فرمول مثل H~2~O و E = mc^2^ نوشت. این یک پانویس دارد.[^1]

> [!NOTE]
> این یک یادداشت است.

> [!WARNING]
> این یک هشدار است.

## فهرست تعریف

مارک‌داون
: زبان نشانه‌گذاری سبک برای قالب‌بندی متن.

RTL
: راست به چپ، جهت نگارش زبان فارسی.

## نمودار دایره‌ای

\`\`\`mermaid
pie title سهم زبان‌ها
    "فارسی" : 70
    "انگلیسی" : 20
    "سایر" : 10
\`\`\`

## نمودار جریان

\`\`\`mermaid
flowchart TD
    A[شروع] --> B{تصمیم}
    B -->|بله| C[انجام کار]
    B -->|خیر| D[پایان]
\`\`\`

> این ابزار فایل را به سرور ارسال نمی‌کند و فقط داخل مرورگر کاربر اجرا می‌شود.

[^1]: این متن پانویس است و در انتهای سند نمایش داده می‌شود.
`;

function getMarkdownFileName(url: URL): string {
  return decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) || 'remote.md');
}

function isMarkdownUrl(url: URL): boolean {
  const pathname = url.pathname.toLowerCase();

  return pathname.endsWith('.md') || pathname.endsWith('.markdown');
}

function normalizeRemoteMarkdownUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('لینک فایل باید با http یا https شروع شود.');
  }

  if (url.hostname === 'github.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const blobIndex = parts.indexOf('blob');

    if (parts.length > 4 && blobIndex === 2) {
      const [owner, repo, , branch, ...pathParts] = parts;
      return new URL(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pathParts.join('/')}`);
    }
  }

  return url;
}

const printDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function clearUrlQueryParam(): void {
  const url = new URL(window.location.href);

  if (!url.searchParams.has('url')) {
    return;
  }

  url.searchParams.delete('url');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export default function App() {
  const [loadedFile, setLoadedFile] = useState<ReadMarkdownResult | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');
  const [isRemoteLoading, setIsRemoteLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const printAreaRef = useRef<HTMLElement | null>(null);

  const previewMarkdown = useMemo(() => markdown.trim() ? markdown : '', [markdown]);
  const hasContent = previewMarkdown.length > 0;
  const documentTitle = loadedFile ? toPdfFileName(loadedFile.name) : 'سند Markdown';

  useEffect(() => {
    const remoteUrlParam = new URLSearchParams(window.location.search).get('url');

    if (remoteUrlParam === null) {
      return;
    }

    const requestedUrl = remoteUrlParam;
    const abortController = new AbortController();

    async function loadRemoteMarkdown(): Promise<void> {
      setLoadedFile(null);
      setMarkdown('');
      setError('');
      setIsRemoteLoading(true);

      try {
        if (!requestedUrl.trim()) {
          throw new Error('پارامتر url خالی است.');
        }

        const remoteUrl = normalizeRemoteMarkdownUrl(requestedUrl);

        if (!isMarkdownUrl(remoteUrl)) {
          throw new Error('لینک باید به فایل Markdown با پسوند .md یا .markdown اشاره کند.');
        }

        const response = await fetch(remoteUrl, { signal: abortController.signal });

        if (!response.ok) {
          throw new Error(`دریافت فایل Markdown با خطای ${response.status} روبه‌رو شد.`);
        }

        const content = await response.text();

        setLoadedFile({
          name: getMarkdownFileName(remoteUrl),
          size: new Blob([content]).size,
          content,
        });
        setMarkdown(content);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setError(error instanceof Error ? error.message : 'دریافت فایل Markdown با خطا روبه‌رو شد.');
      } finally {
        if (!abortController.signal.aborted) {
          setIsRemoteLoading(false);
        }
      }
    }

    void loadRemoteMarkdown();

    return () => abortController.abort();
  }, []);

  function handleLoaded(result: ReadMarkdownResult): void {
    setLoadedFile(result);
    setMarkdown(result.content);
    setError('');
    setIsRemoteLoading(false);
    clearUrlQueryParam();
  }

  function reset(): void {
    setLoadedFile(null);
    setMarkdown('');
    setError('');
    setIsRemoteLoading(false);
    clearUrlQueryParam();
  }

  function startPdfExport(): void {
    if (!hasContent || isExporting) {
      return;
    }

    // The print dialog's "background graphics" and "headers and footers"
    // options visibly change the result, so walk the user past them once.
    if (isPdfDialogDismissed()) {
      void downloadPdf();
      return;
    }

    setIsExportDialogOpen(true);
  }

  async function downloadPdf(): Promise<void> {
    setIsExportDialogOpen(false);
    setIsExporting(true);

    try {
      await exportAsPdf({ fileName: documentTitle, container: printAreaRef.current });
    } finally {
      setIsExporting(false);
    }
  }

  function loadSample(): void {
    setLoadedFile({
      name: 'sample-fa.md',
      size: new Blob([SAMPLE_MARKDOWN]).size,
      content: SAMPLE_MARKDOWN,
    });
    setMarkdown(SAMPLE_MARKDOWN);
    setError('');
    setIsRemoteLoading(false);
    clearUrlQueryParam();
  }

  return (
    <main className="app-main min-h-screen bg-base-200 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <div className="app-shell mx-auto max-w-6xl">
        <header className="no-print mb-8 rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-neutral px-4 py-2 text-xs font-bold text-neutral-content">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                پردازش داخل مرورگر انجام میشود
              </p>
              <h1 className="text-3xl font-black tracking-tight text-base-content md:text-5xl">
                مارک داون فارسی
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-base-content/70">
                فایل Markdown را انتخاب کنید و خروجی برای فارسی ببین.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ThemePicker />
              <button
                type="button"
                onClick={startPdfExport}
                disabled={!hasContent || isExporting}
                title={hasContent ? 'خروجی PDF با همین ظاهر' : 'ابتدا یک فایل Markdown را باز کنید'}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-content transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/40"
              >
                {isExporting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                )}
                خروجی PDF
              </button>
              <button
                type="button"
                onClick={loadSample}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral px-5 py-3 text-sm font-bold text-neutral-content transition hover:opacity-90"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                نمایش نمونه
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-base-content/20 bg-base-100 px-5 py-3 text-sm font-bold text-base-content transition hover:bg-base-200"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                پاک‌سازی
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-row-[420px_1fr]">
          <section className="no-print min-w-0 space-y-4">
            <SourcePanel selectedFile={loadedFile} onLoaded={handleLoaded} onError={setError} />

            {isRemoteLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 text-sm font-bold text-base-content shadow-sm">
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                در حال بارگذاری فایل Markdown...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm leading-7 text-error">
                {error}
              </div>
            )}
          </section>

          <section ref={printAreaRef} className="print-area min-w-0">
            {hasContent && (
              <div className="print-only print-header">
                <span className="print-header-title">{documentTitle}</span>
                <span className="print-header-date">{printDateFormatter.format(new Date())}</span>
              </div>
            )}
            <MarkdownPreview markdown={previewMarkdown} />
          </section>
        </div>

        {isExportDialogOpen && (
          <PdfExportDialog
            onConfirm={() => void downloadPdf()}
            onCancel={() => setIsExportDialogOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
