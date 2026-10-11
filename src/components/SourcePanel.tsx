import { useState } from 'react';
import { ClipboardPaste, Eye, Trash2, UploadCloud } from 'lucide-react';
import { FileDropzone } from './FileDropzone';
import type { ReadMarkdownResult } from '../lib/file';

type SourcePanelProps = {
  selectedFile: Pick<ReadMarkdownResult, 'name' | 'size'> | null;
  onLoaded: (result: ReadMarkdownResult) => void;
  onError: (message: string) => void;
};

type SourceTab = 'upload' | 'paste';

export function SourcePanel({ selectedFile, onLoaded, onError }: SourcePanelProps) {
  const [tab, setTab] = useState<SourceTab>('upload');
  const [pastedText, setPastedText] = useState('');

  function showPastedText(): void {
    const content = pastedText;

    if (!content.trim()) {
      onError('چیزی برای نمایش وارد نشده است. متن Markdown را در کادر پیست کن.');
      return;
    }

    onError('');
    onLoaded({
      name: 'متن پیست‌شده',
      size: new Blob([content]).size,
      content,
    });
  }

  function clearPastedText(): void {
    setPastedText('');
  }

  return (
    <section className="rounded-3xl border border-base-content/10 bg-base-100 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex rounded-2xl bg-base-200 p-1">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            tab === 'upload' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          بارگذاری فایل
        </button>
        <button
          type="button"
          onClick={() => setTab('paste')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            tab === 'paste' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
          اینجا پیست کن
        </button>
      </div>

      {tab === 'upload' ? (
        <FileDropzone selectedFile={selectedFile} onLoaded={onLoaded} onError={onError} />
      ) : (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
            dir="auto"
            spellCheck={false}
            placeholder="متن کامل فایل Markdown را اینجا کپی و پیست کن..."
            className="h-56 w-full resize-y rounded-2xl border border-base-content/20 bg-base-200 p-4 text-sm leading-7 text-base-content outline-none transition focus:border-primary focus:bg-base-100"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={showPastedText}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral px-5 py-3 text-sm font-bold text-neutral-content transition hover:opacity-90"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              نمایش
            </button>
            <button
              type="button"
              onClick={clearPastedText}
              disabled={!pastedText}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-base-content/20 bg-base-100 px-5 py-3 text-sm font-bold text-base-content transition hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              پاک کردن متن
            </button>
          </div>
          <p className="text-xs leading-6 text-base-content/60">
            متن پیست‌شده فقط داخل مرورگر خودت پردازش می‌شود و جایی ارسال نمی‌شود.
          </p>
        </div>
      )}
    </section>
  );
}
