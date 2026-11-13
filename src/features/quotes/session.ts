import type { QuoteAnswerRecord, QuoteQuestion } from '@/types/quotes';
import { shuffle } from '@/lib/rng';

/** Combo multiplier for a streak of consecutive correct answers. */
export function comboMultiplier(streak: number): number {
  if (streak >= 4) return 2.0;
  if (streak === 3) return 1.5;
  if (streak === 2) return 1.2;
  return 1.0;
}

export interface StreakState {
  currentStreak: number;
  maxStreak: number;
}

/** Scores one answer and returns the record plus the updated streaks. */
export function scoreAnswer(
  question: QuoteQuestion,
  selectedOption: string,
  streaks: StreakState
): { record: QuoteAnswerRecord; streaks: StreakState } {
  const isCorrect = selectedOption === question.correctPunchline;
  const currentStreak = isCorrect ? streaks.currentStreak + 1 : 0;
  const pointsEarned = isCorrect ? Math.round(1000 * comboMultiplier(currentStreak)) : 0;
  return {
    record: { question, selectedOption, isCorrect, pointsEarned },
    streaks: { currentStreak, maxStreak: Math.max(streaks.maxStreak, currentStreak) },
  };
}

/** Picks `count` questions from a custom list, with shuffled options (unbiased). */
export function pickCustomQuestions(
  list: readonly QuoteQuestion[],
  count: number,
  rand: () => number = Math.random
): QuoteQuestion[] {
  return shuffle(list, rand)
    .slice(0, count)
    .map((q) => ({ ...q, options: shuffle(q.options, rand) }));
}
