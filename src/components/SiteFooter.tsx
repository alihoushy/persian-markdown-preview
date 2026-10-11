import { Bug } from 'lucide-react';
import { GITHUB_REPO_URL } from '../lib/github';
import { GitHubMark } from './GitHubMark';

const linkClassName = 'font-bold text-base-content/80 underline-offset-4 transition hover:text-base-content hover:underline';

export function SiteFooter() {
  return (
    <footer className="no-print mt-10 flex flex-col gap-4 border-t border-base-content/10 pt-6 text-sm leading-7 text-base-content/60 sm:flex-row sm:items-center sm:justify-between">
      <p>
        مارک داون فارسی پروژه‌ای متن‌باز با مجوز{' '}
        <a
          href={`${GITHUB_REPO_URL}/blob/master/LICENSE`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          MIT
        </a>{' '}
        است؛ ساخته‌ی{' '}
        <a
          href="https://github.com/alihoushy"
          target="_blank"
          rel="noopener noreferrer"
          className={`whitespace-nowrap ${linkClassName}`}
        >
          Ali Houshyari Pour
        </a>
        .
      </p>

      <nav aria-label="پیوندهای پروژه" className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 ${linkClassName}`}
        >
          <GitHubMark className="h-4 w-4" />
          سورس کد
        </a>
        <a
          href={`${GITHUB_REPO_URL}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 ${linkClassName}`}
        >
          <Bug className="h-4 w-4" aria-hidden="true" />
          گزارش مشکل یا پیشنهاد
        </a>
      </nav>
    </footer>
  );
}
