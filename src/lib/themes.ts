// The 35 built-in daisyUI themes, in daisyUI's own order. `scheme` mirrors each
// theme's `color-scheme` declaration and is what drives the things CSS cannot
// reach on its own: the Mermaid renderer and the syntax-highlight palette.
export type ThemeScheme = 'light' | 'dark';

export type Theme = {
  name: string;
  /** Persian label shown in the picker. */
  label: string;
  scheme: ThemeScheme;
};

export const THEMES: Theme[] = [
  { name: 'light', label: 'روشن', scheme: 'light' },
  { name: 'dark', label: 'تیره', scheme: 'dark' },
  { name: 'cupcake', label: 'کاپ‌کیک', scheme: 'light' },
  { name: 'bumblebee', label: 'زنبور', scheme: 'light' },
  { name: 'emerald', label: 'زمرد', scheme: 'light' },
  { name: 'corporate', label: 'اداری', scheme: 'light' },
  { name: 'synthwave', label: 'سینث‌ویو', scheme: 'dark' },
  { name: 'retro', label: 'رترو', scheme: 'light' },
  { name: 'cyberpunk', label: 'سایبرپانک', scheme: 'light' },
  { name: 'valentine', label: 'ولنتاین', scheme: 'light' },
  { name: 'halloween', label: 'هالووین', scheme: 'dark' },
  { name: 'garden', label: 'باغ', scheme: 'light' },
  { name: 'forest', label: 'جنگل', scheme: 'dark' },
  { name: 'aqua', label: 'آبی دریایی', scheme: 'dark' },
  { name: 'lofi', label: 'لوفای', scheme: 'light' },
  { name: 'pastel', label: 'پاستل', scheme: 'light' },
  { name: 'fantasy', label: 'فانتزی', scheme: 'light' },
  { name: 'wireframe', label: 'وایرفریم', scheme: 'light' },
  { name: 'black', label: 'مشکی', scheme: 'dark' },
  { name: 'luxury', label: 'لاکچری', scheme: 'dark' },
  { name: 'dracula', label: 'دراکولا', scheme: 'dark' },
  { name: 'cmyk', label: 'CMYK', scheme: 'light' },
  { name: 'autumn', label: 'پاییز', scheme: 'light' },
  { name: 'business', label: 'کسب‌وکار', scheme: 'dark' },
  { name: 'acid', label: 'اسید', scheme: 'light' },
  { name: 'lemonade', label: 'لیموناد', scheme: 'light' },
  { name: 'night', label: 'شب', scheme: 'dark' },
  { name: 'coffee', label: 'قهوه', scheme: 'dark' },
  { name: 'winter', label: 'زمستان', scheme: 'light' },
  { name: 'dim', label: 'کم‌نور', scheme: 'dark' },
  { name: 'nord', label: 'نورد', scheme: 'light' },
  { name: 'sunset', label: 'غروب', scheme: 'dark' },
  { name: 'caramellatte', label: 'کارامل‌لاته', scheme: 'light' },
  { name: 'abyss', label: 'ژرفا', scheme: 'dark' },
  { name: 'silk', label: 'ابریشم', scheme: 'light' },
];

const THEME_BY_NAME = new Map(THEMES.map((theme) => [theme.name, theme]));
const STORAGE_KEY = 'pmp:theme';

/** The sentinel for "follow the operating system", which is also the default. */
export const SYSTEM_THEME = 'system';

export type ThemeChoice = typeof SYSTEM_THEME | string;

function prefersDark(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

/** Resolves a stored choice to the theme actually in effect right now. */
export function resolveTheme(choice: ThemeChoice): Theme {
  const picked = THEME_BY_NAME.get(choice);

  if (picked) {
    return picked;
  }

  return THEME_BY_NAME.get(prefersDark() ? 'dark' : 'light') as Theme;
}

export function readStoredTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && THEME_BY_NAME.has(stored) ? stored : SYSTEM_THEME;
  } catch {
    return SYSTEM_THEME;
  }
}

/**
 * Writes the choice to <html>. Leaving `data-theme` off for the system choice
 * is what lets daisyUI's own `prefers-color-scheme` rule take over.
 */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;

  if (choice === SYSTEM_THEME) {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = choice;
  }

  root.dataset.scheme = resolveTheme(choice).scheme;

  try {
    if (choice === SYSTEM_THEME) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, choice);
    }
  } catch {
    // Private mode or blocked storage: the choice just won't survive a reload.
  }
}
