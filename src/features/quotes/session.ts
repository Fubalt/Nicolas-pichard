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

// --- Session reducer (shared by QuoteGameView and the BOBINE screen) ---

export type QuoteSessionStatus = 'ready' | 'waiting_qcm' | 'revealing' | 'finished';

export interface QuoteSessionState {
  questions: QuoteQuestion[];
  index: number;
  status: QuoteSessionStatus;
  selected: string | null;
  answers: QuoteAnswerRecord[];
  streaks: StreakState;
}

export type QuoteSessionAction =
  | { type: 'start'; questions: QuoteQuestion[] }
  | { type: 'pause_reached' }
  | { type: 'select'; option: string }
  | { type: 'next' };

export function initialQuoteSession(questions: QuoteQuestion[]): QuoteSessionState {
  return {
    questions,
    index: 0,
    status: 'ready',
    selected: null,
    answers: [],
    streaks: { currentStreak: 0, maxStreak: 0 },
  };
}

export function quoteSessionReducer(state: QuoteSessionState, action: QuoteSessionAction): QuoteSessionState {
  switch (action.type) {
    case 'start':
      return initialQuoteSession(action.questions);
    case 'pause_reached':
      return state.status === 'ready' ? { ...state, status: 'waiting_qcm' } : state;
    case 'select': {
      const question = state.questions[state.index];
      if (!question || state.status !== 'waiting_qcm') return state;
      const { record, streaks } = scoreAnswer(question, action.option, state.streaks);
      return { ...state, status: 'revealing', selected: action.option, answers: [...state.answers, record], streaks };
    }
    case 'next':
      if (state.status !== 'revealing') return state;
      if (state.index + 1 >= state.questions.length) return { ...state, status: 'finished' };
      return { ...state, index: state.index + 1, status: 'ready', selected: null };
  }
}

export function sessionScore(state: QuoteSessionState): number {
  return state.answers.reduce((acc, a) => acc + a.pointsEarned, 0);
}
