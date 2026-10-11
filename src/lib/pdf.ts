// PDF export goes through the browser's own print pipeline instead of a
// canvas-based library: rasterizing the preview would turn Persian text into a
// blurry image and break shaping, whereas printing keeps the text vector,
// selectable and searchable, embeds Vazirmatn, and preserves RTL and links.
// The paper design lives in styles/print.css.

const DIALOG_DISMISS_STORAGE_KEY = 'pmp:pdf-dialog-dismissed';
const MERMAID_WAIT_TIMEOUT_MS = 5_000;
const MERMAID_POLL_INTERVAL_MS = 80;
const TITLE_RESTORE_FALLBACK_MS = 60_000;

/**
 * Firefox's PDF backend (cairo) rasterizes colour-bitmap emoji into standalone
 * images and writes the Persian text layer as Arabic presentation forms with
 * replacement characters mixed in. Measured on the same document: Chrome keeps
 * all emoji and all Persian letters as real text, Firefox keeps neither. The
 * page itself renders correctly either way — only the emoji sharpness and the
 * copy/search layer suffer — so this is a hint, never a block.
 */
export function hasDegradedPdfExport() {
  return isFirefox();
}

function isFirefox() {
  return typeof navigator !== 'undefined' && /firefox\//i.test(navigator.userAgent);
}

/** True when the user ticked "don't show again" on the pre-print hints. */
export function isPdfDialogDismissed() {
  try {
    return window.localStorage.getItem(DIALOG_DISMISS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function rememberPdfDialogDismissal() {
  try {
    window.localStorage.setItem(DIALOG_DISMISS_STORAGE_KEY, '1');
  } catch {
    // Private mode or blocked storage: the hints simply show again next time.
  }
}

/** Turns "گزارش ماهانه.md" into the default file name of the saved PDF. */
export function toPdfFileName(sourceName: string | undefined): string {
  const base = (sourceName || '')
    // A heading used as the name can carry the RLMs normalizeRtlArrows adds.
    .replace(/[‎‏‪-‮⁦-⁩]/g, '')
    .replace(/\.(md|markdown|txt)$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  return base || 'markdown';
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Mermaid renders asynchronously after mount, so a print fired too early would
 * drop the diagrams. Waits until no diagram is still pending (or we time out).
 */
async function waitForDiagrams(container: HTMLElement | null): Promise<void> {
  if (!container?.querySelector('pre.mermaid:not([data-processed])')) {
    return;
  }

  const deadline = Date.now() + MERMAID_WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (!container.querySelector('pre.mermaid:not([data-processed])')) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, MERMAID_POLL_INTERVAL_MS));
  }
}

type ExportPdfOptions = {
  /** Source file name or heading; becomes the suggested PDF name in the print dialog. */
  fileName?: string;
  /** Preview element, used to wait for pending Mermaid diagrams. */
  container?: HTMLElement | null;
};

/**
 * Opens the print dialog with the preview styled as a standalone document.
 * Resolves once the dialog has been handed over to the browser.
 */
export async function exportAsPdf({ fileName, container }: ExportPdfOptions = {}): Promise<void> {
  await waitForDiagrams(container ?? null);
  await nextFrame();

  // Chromium and Firefox use document.title as the suggested PDF file name.
  const originalTitle = document.title;
  let fallbackTimer = 0;
  let restored = false;

  function restoreTitle(): void {
    if (restored) {
      return;
    }

    restored = true;
    document.title = originalTitle;
    window.removeEventListener('afterprint', restoreTitle);
    window.clearTimeout(fallbackTimer);
  }

  document.title = toPdfFileName(fileName);
  window.addEventListener('afterprint', restoreTitle);
  // Safari does not always fire afterprint; don't leak the temporary title.
  fallbackTimer = window.setTimeout(restoreTitle, TITLE_RESTORE_FALLBACK_MS);

  try {
    window.print();
  } catch {
    restoreTitle();
  }
}
