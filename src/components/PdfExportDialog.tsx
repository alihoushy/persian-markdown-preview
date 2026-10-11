import { useEffect, useRef, useState } from 'react';
import { FileDown, Printer, TriangleAlert, X } from 'lucide-react';
import { hasDegradedPdfExport, rememberPdfDialogDismissal } from '../lib/pdf';

/** The two print-dialog options that visibly change how the PDF looks. */
const TIPS = [
  {
    title: 'مقصد را روی Save as PDF بگذارید',
    body: 'اگر چاپگر انتخاب شده باشد، فایلی ذخیره نمی‌شود.',
  },
  {
    title: 'گزینه‌ی Background graphics را روشن کنید',
    body: 'تا پس‌زمینه‌ی کال‌اوت‌ها، سرستون جدول‌ها و بلوک‌های کد هم چاپ شوند. در Chrome زیر More settings است.',
  },
  {
    title: 'گزینه‌ی Headers and footers را خاموش کنید',
    body: 'وگرنه مرورگر آدرس صفحه و تاریخ را بالا و پایین هر برگه اضافه می‌کند.',
  },
];

type PdfExportDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function PdfExportDialog({ onConfirm, onCancel }: PdfExportDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const degradedExport = hasDegradedPdfExport();
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    confirmRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  function confirm(): void {
    if (dontShowAgain) {
      rememberPdfDialogDismissal();
    }

    onConfirm();
  }

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-neutral/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* On a short phone the three tips outgrow the screen; scrolling inside
          the card keeps the title and the buttons reachable. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-base-content/10 bg-base-100 p-5 shadow-2xl sm:p-6 md:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content">
              <Printer className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="pdf-dialog-title" className="text-lg font-black text-base-content">
                برای بهترین خروجی
              </h2>
              <p className="mt-0.5 text-sm text-base-content/60">
                سه گزینه در پنجره‌ی چاپ مرورگر
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="بستن"
            className="-m-1 rounded-xl p-1 text-base-content/50 transition hover:bg-base-200 hover:text-base-content"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ol className="space-y-3">
          {TIPS.map((tip, index) => (
            <li key={tip.title} className="flex gap-3 rounded-2xl bg-base-200 p-3.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-base-100 text-xs font-black text-base-content shadow-sm">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-6 text-base-content">{tip.title}</p>
                <p className="mt-0.5 text-xs leading-6 text-base-content/60">{tip.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {degradedExport && (
          <div className="mt-3 flex gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-3.5">
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-6 text-base-content">
                خروجی فایرفاکس اموجی‌ها را تصویر می‌کند
              </p>
              <p className="mt-0.5 text-xs leading-6 text-base-content/70">
                صفحه درست چاپ می‌شود، ولی اموجی‌ها به‌جای متن به تصویر تبدیل می‌شوند (در بزرگ‌نمایی نرم دیده
                می‌شوند) و متن فارسی در PDF قابل کپی و جست‌وجو نمی‌ماند. برای خروجی کاملاً برداری، همین صفحه را
                در Chrome یا Edge باز کنید.
              </p>
            </div>
          </div>
        )}

        <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-base-content/70">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          دیگر این راهنما را نشان نده
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            ref={confirmRef}
            type="button"
            onClick={confirm}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-content transition hover:opacity-90"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            باز کردن پنجره‌ی چاپ
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-base-content/20 bg-base-100 px-5 py-3 text-sm font-bold text-base-content transition hover:bg-base-200"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
