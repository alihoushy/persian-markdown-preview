import { Star } from 'lucide-react';
import { GITHUB_REPO_URL, useGitHubStars } from '../lib/github';
import { GitHubMark } from './GitHubMark';

const starFormatter = new Intl.NumberFormat('fa-IR', { notation: 'compact' });

/**
 * "Open source" pill beside the privacy badge, split like GitHub's own star
 * button. The count segment only appears once the number is known, so a
 * blocked or rate-limited API leaves a plain link rather than a broken one.
 * Its outline is a ring rather than a border, so it stays exactly as tall as
 * the badge next to it.
 */
export function GitHubBadge() {
  const stars = useGitHubStars();

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="سورس کد در GitHub؛ اگر مفید بود ستاره بدهید"
      className="inline-flex items-center rounded-full text-xs font-bold text-base-content ring-1 ring-inset ring-base-content/15 transition hover:bg-base-200"
    >
      <span className="inline-flex items-center gap-2 px-4 py-2">
        <GitHubMark className="h-4 w-4" />
        متن‌باز در GitHub
      </span>
      {stars !== null && (
        <span className="inline-flex items-center gap-1 border-s border-base-content/15 py-2 ps-3 pe-3.5">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          {starFormatter.format(stars)}
          <span className="sr-only">ستاره</span>
        </span>
      )}
    </a>
  );
}
