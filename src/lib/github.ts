import { useEffect, useState } from 'react';

export const GITHUB_REPO = 'alihoushy/persian-markdown-preview';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

const STARS_STORAGE_KEY = 'pmp:github-stars';
// Unauthenticated GitHub API calls are capped at 60 an hour per IP, so a reader
// reloading the page should not spend one every time.
const STARS_CACHE_TTL_MS = 60 * 60 * 1000;

type CachedStars = {
  count: number;
  fetchedAt: number;
};

function readCachedStars(): CachedStars | null {
  try {
    const cached = JSON.parse(window.localStorage.getItem(STARS_STORAGE_KEY) || 'null');

    return typeof cached?.count === 'number' && typeof cached?.fetchedAt === 'number'
      ? cached
      : null;
  } catch {
    return null;
  }
}

function writeCachedStars(count: number): void {
  try {
    window.localStorage.setItem(
      STARS_STORAGE_KEY,
      JSON.stringify({ count, fetchedAt: Date.now() } satisfies CachedStars),
    );
  } catch {
    // Private mode or blocked storage: the count is just fetched again next load.
  }
}

let starsRequest: Promise<number | null> | null = null;

/**
 * One request per page load, however many components ask. This is the only
 * request the page makes on its own, and it carries nothing about the open
 * document — no-referrer keeps even a `?url=` link out of it.
 */
function requestStarCount(): Promise<number | null> {
  starsRequest ??= fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
    referrerPolicy: 'no-referrer',
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((repo) => {
      const count = repo?.stargazers_count;

      if (typeof count !== 'number') {
        return null;
      }

      writeCachedStars(count);
      return count;
    })
    .catch(() => null);

  return starsRequest;
}

/**
 * The repository's star count, or null until it is known. A stale cached count
 * is shown straight away and kept if the refresh fails (offline, rate limit).
 */
export function useGitHubStars(): number | null {
  const [stars, setStars] = useState(() => readCachedStars()?.count ?? null);

  useEffect(() => {
    const cached = readCachedStars();

    if (cached && Date.now() - cached.fetchedAt < STARS_CACHE_TTL_MS) {
      return;
    }

    let cancelled = false;

    void requestStarCount().then((count) => {
      if (!cancelled && count !== null) {
        setStars(count);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return stars;
}
