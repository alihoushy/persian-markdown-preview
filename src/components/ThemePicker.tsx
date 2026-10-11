import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Monitor, Palette } from 'lucide-react';
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  SYSTEM_THEME,
  THEMES,
  type ThemeChoice,
} from '../lib/themes';

/** The five daisyUI tokens that make one theme recognisable at a glance. */
function ThemeSwatch({ theme }: { theme: string | null }) {
  return (
    <span
      data-theme={theme ?? undefined}
      className="flex shrink-0 gap-0.5 rounded-md bg-base-100 p-1 ring-1 ring-base-content/15"
      aria-hidden="true"
    >
      <span className="h-3.5 w-1.5 rounded-sm bg-base-content" />
      <span className="h-3.5 w-1.5 rounded-sm bg-primary" />
      <span className="h-3.5 w-1.5 rounded-sm bg-secondary" />
      <span className="h-3.5 w-1.5 rounded-sm bg-accent" />
    </span>
  );
}

export function ThemePicker() {
  // main.tsx applied the stored choice before paint, so reading it again here
  // only seeds the button label.
  const [choice, setChoice] = useState<ThemeChoice>(readStoredTheme);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // While on "system", track the OS flipping between light and dark so
  // data-scheme (and with it Mermaid and the code palette) stays in step.
  useEffect(() => {
    if (choice !== SYSTEM_THEME) {
      return;
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => applyTheme(SYSTEM_THEME);

    query.addEventListener('change', sync);

    return () => query.removeEventListener('change', sync);
  }, [choice]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent): void {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function pick(next: ThemeChoice): void {
    setChoice(next);
    applyTheme(next);
    setIsOpen(false);
  }

  const active = resolveTheme(choice);
  const activeLabel = choice === SYSTEM_THEME ? `سیستم (${active.label})` : active.label;

  return (
    <div ref={containerRef} className="no-print relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-base-content/15 bg-base-100 px-4 py-3 text-sm font-bold text-base-content transition hover:bg-base-200"
      >
        <Palette className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{activeLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Anchored to the button's start (right) edge so the menu opens inwards:
          the picker leads the action row, which on a phone sits flush against
          the right edge of the screen. */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="انتخاب پوسته"
          className="absolute start-0 z-40 mt-2 max-h-[min(24rem,60dvh)] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-base-content/15 bg-base-100 p-2 shadow-xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={choice === SYSTEM_THEME}
            onClick={() => pick(SYSTEM_THEME)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-right text-sm font-bold text-base-content transition hover:bg-base-200"
          >
            <Monitor className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
            <span className="flex-1">هماهنگ با سیستم</span>
            {choice === SYSTEM_THEME && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
          </button>

          <div className="my-2 border-t border-base-content/10" />

          {THEMES.map((theme) => (
            <button
              key={theme.name}
              type="button"
              role="option"
              aria-selected={choice === theme.name}
              onClick={() => pick(theme.name)}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-right text-sm text-base-content transition hover:bg-base-200"
            >
              <ThemeSwatch theme={theme.name} />
              <span className="flex-1 font-bold">{theme.label}</span>
              <span className="font-mono text-[0.65rem] opacity-50">{theme.name}</span>
              {choice === theme.name && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
