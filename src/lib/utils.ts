export function formatDuration(seconds: number): string {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)}ms`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs.toFixed(1)}s`;
  }
  return `${secs.toFixed(1)}s`;
}

export function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const remainingMs = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${remainingMs}`;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/^cyprien\s*[-–:]\s*/i, '') // remove "Cyprien -" prefix
    .replace(/\s*[-–:]\s*cyprien$/i, '') // remove "- Cyprien" suffix
    .replace(/[^\w\s]/g, ' ') // replace punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeAndStem(str: string): string[] {
  const norm = normalizeTitle(str);
  return norm
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      // Remove trailing 's' or 'x' for French plurals if word is 4+ letters
      if (word.length >= 4 && (word.endsWith('s') || word.endsWith('x'))) {
        return word.slice(0, -1);
      }
      return word;
    });
}

/**
 * Smart fuzzy and token matcher that handles:
 * - Direct substring matches (e.g. "reunions", "techno")
 * - Plural / singular variants (e.g. "reunion" matches "Les réunions")
 * - Implicit "1" for the first volume of a series (e.g. "reunion 1" matches "Les réunions", "ecole 1" matches "L'école")
 * - Word reordering and partial tokens
 */
export function matchesSearch(title: string, query: string): boolean {
  if (!query || !query.trim()) return false;
  const normTitle = normalizeTitle(title);
  const normQuery = normalizeTitle(query);

  if (normTitle.includes(normQuery)) return true;

  const titleTokens = tokenizeAndStem(title);
  const queryTokens = tokenizeAndStem(query);

  if (queryTokens.length === 0) return false;

  const hasExplicitNumberInTitle = titleTokens.some((t) => /^\d+$/.test(t));

  return queryTokens.every((qToken) => {
    // If user queries for "1", but title has no number, treat as implicit opus 1
    if (qToken === '1' && !hasExplicitNumberInTitle) {
      return true;
    }
    return titleTokens.some(
      (tToken) =>
        tToken === qToken ||
        tToken.startsWith(qToken) ||
        (qToken.length >= 4 && tToken.includes(qToken))
    );
  });
}

export function cleanDisplayTitle(title: string): string {
  return title
    .replace(/^cyprien\s*[-–:]\s*/i, '')
    .replace(/\s*[-–:]\s*cyprien$/i, '')
    .replace(/^SOUS-TITRES AUTOMATIQUES\s*:\s*/i, '')
    .trim();
}
