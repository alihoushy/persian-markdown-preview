import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { formatFileSize, readMarkdownFile, type ReadMarkdownResult } from '../lib/file';

type FileDropzoneProps = {
  selectedFile: Pick<ReadMarkdownResult, 'name' | 'size'> | null;
  onLoaded: (result: ReadMarkdownResult) => void;
  onError: (message: string) => void;
};

export function FileDropzone({ selectedFile, onLoaded, onError }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function loadFile(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }

    try {
      const result = await readMarkdownFile(file);
      onLoaded(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'خطای ناشناخته در خواندن فایل.');
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    void loadFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    void loadFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="rounded-3xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragging ? 'border-primary bg-primary/10' : 'border-base-content/25 bg-base-200 hover:border-primary/60 hover:bg-base-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".md,.markdown,.mdown,.mkd,.mkdn,.text,.txt,text/markdown,text/plain,text/*"
          className="hidden"
          onChange={handleInputChange}
        />
        <UploadCloud className="mb-4 h-12 w-12 text-base-content/70" aria-hidden="true" />
        <h2 className="text-xl font-bold text-base-content">فایل Markdown را انتخاب کن</h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-base-content/70">
          فایل روی مرورگر خودت خوانده می‌شود و جایی آپلود نمی‌شود. فقط فایل‌های .md و .markdown تا حجم ۲ مگابایت پذیرفته می‌شوند.
        </p>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-neutral p-4 text-neutral-content">
          <FileText className="h-6 w-6 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{selectedFile.name}</p>
            <p className="text-xs opacity-70">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>
      )}
    </section>
  );
}
