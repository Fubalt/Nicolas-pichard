import { matchesSearch, normalizeTitle } from '@/lib/utils';

interface TitledVideo {
  id: string;
  title: string;
}

/** Suggestions list for the autocomplete. */
export function filterVideos<T extends TitledVideo>(videos: readonly T[], query: string, limit?: number): T[] {
  const res = videos.filter((v) => matchesSearch(v.title, query));
  return limit === undefined ? res : res.slice(0, limit);
}

/** Returns the id of the video the guess unambiguously designates, or null. */
export function resolveGuess(videos: readonly TitledVideo[], input: string | { id: string }): string | null {
  if (typeof input !== 'string') {
    return videos.some((v) => v.id === input.id) ? input.id : null;
  }
  const normInput = normalizeTitle(input);
  if (!normInput) return null;
  const exact = videos.filter((v) => normalizeTitle(v.title) === normInput);
  if (exact.length === 1) return exact[0].id;
  if (exact.length > 1) return null;
  const matches = videos.filter((v) => matchesSearch(v.title, input));
  return matches.length === 1 ? matches[0].id : null;
}

export function isCorrectGuess(videos: readonly TitledVideo[], input: string | { id: string }, targetId: string): boolean {
  return resolveGuess(videos, input) === targetId;
}
