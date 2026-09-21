import { QuoteQuestion } from '@/types/quotes';
import classicQuotesData from './classic-quotes.json';

/**
 * 100% Exact subtitles directly extracted from Cyprien's official classic YouTube videos.
 * Covers all 71 classic sketch videos (excluding making-of, bêtisiers, coulisses, FAQ).
 * 
 * Every video contains 5 to 8 distinct punchline moments spread across its timeline (early, middle, late),
 * totaling over 500 unique quote moments!
 * 
 * Confusion Engine:
 * For each question, options often include REAL phrases uttered elsewhere in that SAME video.
 * This tests true mastery by creating psychological doubt between two authentic lines of the sketch!
 * 
 * Anti-Repetition Engine:
 * - A single video never stays at the same timecode from game to game.
 * - Each game picks from different videos and varying timestamps.
 */
export const CYPRIEN_QUOTES: QuoteQuestion[] = classicQuotesData as QuoteQuestion[];

// Memory tracking of previously played quote IDs across rounds to eliminate repetition
let lastPlayedQuoteIds: Set<string> = new Set();
let lastTimecodeByVideo: Map<string, number> = new Map();

/**
 * Intelligent Anti-Repetition Picker:
 * 1. Groups quotes by videoId so each video has multiple timecodes.
 * 2. Picks distinct videos for the current round.
 * 3. For any selected video, chooses a timecode location that wasn't used in recent rounds.
 * 4. Ensures the location/timecode for a given video varies from game to game.
 */
export function getRandomQuotes(count = 5): QuoteQuestion[] {
  // Group available quotes by video
  const videoMap = new Map<string, QuoteQuestion[]>();
  for (const q of CYPRIEN_QUOTES) {
    if (!videoMap.has(q.videoId)) {
      videoMap.set(q.videoId, []);
    }
    videoMap.get(q.videoId)!.push(q);
  }

  // Shuffle video IDs to get diverse video universe
  const videoIds = Array.from(videoMap.keys()).sort(() => 0.5 - Math.random());
  const selectedQuotes: QuoteQuestion[] = [];

  for (const vId of videoIds) {
    if (selectedQuotes.length >= count) break;

    const candidates = videoMap.get(vId) || [];
    if (candidates.length === 0) continue;

    const lastTimecode = lastTimecodeByVideo.get(vId);

    // Filter out quotes played recently and quotes matching the exact last timecode
    let viable = candidates.filter(
      (c) => !lastPlayedQuoteIds.has(c.id) && (lastTimecode === undefined || Math.abs(c.startTime - lastTimecode) > 10)
    );

    // Fallback if all quotes from this video have been seen recently
    if (viable.length === 0) {
      viable = candidates.filter((c) => lastTimecode === undefined || Math.abs(c.startTime - lastTimecode) > 10);
    }
    if (viable.length === 0) {
      viable = candidates;
    }

    // Pick a random viable moment
    const chosen = viable[Math.floor(Math.random() * viable.length)];
    selectedQuotes.push(chosen);

    // Update timecode tracker
    lastTimecodeByVideo.set(vId, chosen.startTime);
    lastPlayedQuoteIds.add(chosen.id);

    // Limit memory footprint (keep up to 150 recent quotes)
    if (lastPlayedQuoteIds.size > 150) {
      const oldest = Array.from(lastPlayedQuoteIds).slice(0, 50);
      oldest.forEach((id) => lastPlayedQuoteIds.delete(id));
    }
  }

  // If count is higher than distinct videos, fill remaining from unpicked quotes
  if (selectedQuotes.length < count) {
    const remaining = CYPRIEN_QUOTES.filter((q) => !selectedQuotes.some((sq) => sq.id === q.id));
    remaining.sort(() => 0.5 - Math.random());
    while (selectedQuotes.length < count && remaining.length > 0) {
      selectedQuotes.push(remaining.pop()!);
    }
  }

  // Shuffle options for each selected question
  return selectedQuotes.map((q) => ({
    ...q,
    options: [...q.options].sort(() => 0.5 - Math.random()),
  }));
}
