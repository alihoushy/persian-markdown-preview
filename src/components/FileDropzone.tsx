import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { formatFileSize, readMarkdownFile, type ReadMarkdownResult } from '../lib/file';

type FileDropzoneProps = {
  selectedFile: Pick<ReadMarkdownResult, 'name' | 'size'> | null;
  onLoaded: (result: ReadMarkdownResult) => void;
  onError: (message: string) => void;
};

/** "report.final.md" → ["report.final", ".md"]; a name without one stays whole. */
function splitExtension(name: string): [string, string] {
  const dot = name.lastIndexOf('.');

  return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
}

export function FileDropzone({ selectedFile, onLoaded, onError }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [baseName, extension] = splitExtension(selectedFile?.name ?? '');

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
    <section className="rounded-3xl border border-base-content/10 bg-base-100 p-3 shadow-sm sm:p-5">
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
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
        <h2 className="text-lg font-bold text-base-content sm:text-xl">فایل Markdown را انتخاب کن</h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-base-content/70">
          فایل روی مرورگر خودت خوانده می‌شود و جایی آپلود نمی‌شود. فقط فایل‌های .md و .markdown تا حجم ۲ مگابایت پذیرفته می‌شوند.
        </p>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-neutral p-4 text-neutral-content">
          <FileText className="h-6 w-6 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            {/* dir="auto" runs a Latin name left-to-right, so a long one loses
                its end rather than its start, and the extension is kept out of
                the ellipsis. Splitting at the dot never breaks Persian joining. */}
            <p dir="auto" title={selectedFile.name} className="flex w-fit max-w-full text-sm font-bold">
              <span className="truncate">{baseName}</span>
              <span className="shrink-0">{extension}</span>
            </p>
            {/* Isolated, or the RTL line would print "42.9 KB" as "KB 42.9". */}
            <p className="text-xs opacity-70">
              <span dir="ltr">{formatFileSize(selectedFile.size)}</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
