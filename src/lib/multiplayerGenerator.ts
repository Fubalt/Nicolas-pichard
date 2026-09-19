import { VideoItem, GameMode } from '@/types/game';
import { CYPRIEN_ALL_VIDEOS, CYPRIEN_CLASSIC_VIDEOS } from '@/data/videos';
import { BattleRound } from '@/types/multiplayer';

/**
 * Fast, deterministic 32-bit PRNG (Mulberry32)
 */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Computes a numeric hash from any string (room code)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates an identical, deterministic list of rounds for all players
 * given a roomCode, round count and game mode.
 */
export function generateDeterministicRounds(
  roomCode: string,
  totalRounds: number,
  mode: GameMode
): BattleRound[] {
  const catalog = mode === 'classic' ? CYPRIEN_CLASSIC_VIDEOS : CYPRIEN_ALL_VIDEOS;
  const seed = hashString(roomCode.toUpperCase().trim());
  const rng = mulberry32(seed);

  // Shuffle copies of indices to avoid duplicate videos within the same battle
  const availableIndices = Array.from({ length: catalog.length }, (_, i) => i);
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }

  const rounds: BattleRound[] = [];
  const count = Math.min(totalRounds, catalog.length);

  for (let r = 0; r < count; r++) {
    const videoIndex = availableIndices[r];
    const video = catalog[videoIndex];

    const minStart = 5;
    const duration = video.durationInSeconds || video.duration || 300;
    const maxStart = Math.max(minStart, duration - 35);
    const range = maxStart - minStart;

    const startTime = Math.floor(minStart + rng() * range);

    rounds.push({
      roundIndex: r,
      video,
      startTime,
    });
  }

  return rounds;
}

/**
 * Calculates score for a round:
 * - Base points by attempt:
 *   - Attempt 0 (0.1s): 1000 pts
 *   - Attempt 1 (2.1s): 750 pts
 *   - Attempt 2 (10.1s): 500 pts
 *   - Attempt 3 (26.1s): 250 pts
 *   - Failed / Skipped: 0 pts
 * - Speed bonus: up to +200 bonus pts if solved quickly
 */
export function calculateRoundScore(
  attemptIndex: number,
  success: boolean,
  elapsedSeconds: number
): { basePoints: number; speedBonus: number; totalPoints: number } {
  if (!success) {
    return { basePoints: 0, speedBonus: 0, totalPoints: 0 };
  }

  const basePointsMap = [1000, 750, 500, 250];
  const basePoints = basePointsMap[attemptIndex] ?? 250;

  // Speed bonus: up to 200 pts if found within 40 seconds
  const speedBonus = Math.max(0, Math.min(200, Math.round((40 - elapsedSeconds) * 5)));
  const totalPoints = basePoints + speedBonus;

  return {
    basePoints,
    speedBonus,
    totalPoints,
  };
}

/**
 * Generates a clean, friendly Room Code like "NP-4829" or "CYP-318"
 */
export function generateRandomRoomCode(): string {
  const prefixes = ['CYP', 'NP', 'CLASH', 'GEEK', 'NICO'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}
