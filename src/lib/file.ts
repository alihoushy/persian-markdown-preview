export const MAX_MARKDOWN_FILE_SIZE = 2 * 1024 * 1024;

/** Stands in for a file name when the Markdown was pasted rather than opened. */
export const PASTED_TEXT_NAME = 'متن پیست‌شده';

export type ReadMarkdownResult = {
  name: string;
  size: number;
  content: string;
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.mkdn', '.mdtxt', '.text', '.txt'];

function hasMarkdownExtension(name: string): boolean {
  const lowerName = name.toLowerCase();
  return MARKDOWN_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

function hasTextLikeType(type: string): boolean {
  // On mobile / in-app browsers, .md files often arrive with an empty type or a
  // generic text type instead of a recognizable extension.
  return type === '' || type.startsWith('text/') || type === 'application/octet-stream';
}

export function validateMarkdownFile(file: File): void {
  // Be lenient: the user explicitly picked this file, and mobile file pickers
  // frequently strip the extension or report an empty/odd MIME type. Only reject
  // files that clearly are not text (e.g. images, PDFs, archives).
  if (!hasMarkdownExtension(file.name) && !hasTextLikeType(file.type)) {
    throw new Error('این فایل به‌نظر متنی/Markdown نمی‌رسد. یک فایل .md یا .markdown انتخاب کن.');
  }

  if (file.size > MAX_MARKDOWN_FILE_SIZE) {
    throw new Error('حجم فایل بیشتر از ۲ مگابایت است. برای نسخه آنلاین، فایل کوچک‌تر انتخاب کن.');
  }
}

/**
 * Reads a file as UTF-8 text without depending on `FileReader`, which is missing
 * in some mobile in-app browsers (the source of the "Can't find variable:
 * FileReader" error on Android/iOS). Falls back gracefully across the three
 * available APIs.
 */
async function readFileAsText(file: File): Promise<string> {
  // Modern, promise-based API (iOS 14+, all modern Android browsers).
  if (typeof file.text === 'function') {
    return file.text();
  }

  // No FileReader dependency: decode the bytes manually.
  if (typeof file.arrayBuffer === 'function' && typeof TextDecoder !== 'undefined') {
    const buffer = await file.arrayBuffer();
    return new TextDecoder('utf-8').decode(buffer);
  }

  // Legacy fallback for very old environments that still expose FileReader.
  if (typeof FileReader !== 'undefined') {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('خواندن فایل با خطا روبه‌رو شد.'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsText(file, 'utf-8');
    });
  }

  throw new Error('مرورگر شما امکان خواندن فایل را ندارد. لطفاً متن فایل را کپی کرده و از دکمه «اینجا پیست کن» استفاده کن.');
}

export async function readMarkdownFile(file: File): Promise<ReadMarkdownResult> {
  validateMarkdownFile(file);

  let content: string;
  try {
    content = await readFileAsText(file);
  } catch (error) {
    if (error instanceof Error && error.message.includes('خواندن')) {
      throw error;
    }

    throw new Error('خواندن فایل با خطا روبه‌رو شد. لطفاً متن فایل را کپی کرده و از دکمه «اینجا پیست کن» استفاده کن.', { cause: error });
  }

  return {
    name: file.name,
    size: file.size,
    content,
  };
}
