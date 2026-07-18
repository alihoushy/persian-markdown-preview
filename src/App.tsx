import { useEffect, useMemo, useState } from 'react';
import { Eye, LoaderCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { SourcePanel } from './components/SourcePanel';
import { MarkdownPreview } from './components/MarkdownPreview';
import type { ReadMarkdownResult } from './lib/file';

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

  const previewMarkdown = useMemo(() => markdown.trim() ? markdown : '', [markdown]);

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2e8f0,_transparent_35%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                پردازش داخل مرورگر انجام میشود
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                مارک داون فارسی
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                فایل Markdown را انتخاب کنید و خروجی برای فارسی ببین.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadSample}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                نمایش نمونه
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                پاک‌سازی
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-row-[420px_1fr]">
          <section className="min-w-0 space-y-4">
            <SourcePanel selectedFile={loadedFile} onLoaded={handleLoaded} onError={setError} />

            {isRemoteLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
                <LoaderCircle className="h-5 w-5 animate-spin text-slate-950" aria-hidden="true" />
                در حال بارگذاری فایل Markdown...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
                {error}
              </div>
            )}
          </section>

          <section className="min-w-0">
            <MarkdownPreview markdown={previewMarkdown} />
          </section>
        </div>
      </div>
    </main>
  );
}
