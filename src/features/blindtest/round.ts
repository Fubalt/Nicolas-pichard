import { ATTEMPT_DURATIONS, MAX_ATTEMPTS } from '@/constants/game';
import type { GameStatus, GuessResult } from '@/types/game';

/**
 * Pure state of one blindtest round, shared by Solo and Battle.
 * Side effects (player control, network) are derived by the caller from the
 * returned `outcome`.
 */
export interface RoundState {
  attempt: number;
  status: GameStatus;
  guesses: GuessResult[];
}

export type RoundAction =
  | { type: 'start' }
  | { type: 'skip' }
  | { type: 'guess'; guessedTitle: string; correct: boolean };

export type RoundOutcome =
  | { kind: 'none' }
  | { kind: 'won'; attempt: number }
  | { kind: 'lost'; attempt: number }
  | { kind: 'next'; previousDuration: number; nextDuration: number };

export const initialRound = (): RoundState => ({ attempt: 0, status: 'ready', guesses: [] });

export function isRoundOver(state: RoundState): boolean {
  return state.status === 'won' || state.status === 'lost';
}

export function roundStep(
  state: RoundState,
  action: RoundAction
): { state: RoundState; outcome: RoundOutcome } {
  if (isRoundOver(state)) return { state, outcome: { kind: 'none' } };

  if (action.type === 'start') {
    return { state: { ...state, status: 'playing' }, outcome: { kind: 'none' } };
  }

  const tierDuration = ATTEMPT_DURATIONS[state.attempt];
  const entry: GuessResult =
    action.type === 'skip'
      ? { attemptIndex: state.attempt, type: 'skipped', tierDuration }
      : {
          attemptIndex: state.attempt,
          type: action.correct ? 'success' : 'incorrect',
          guessedTitle: action.guessedTitle,
          tierDuration,
        };
  const guesses = [...state.guesses, entry];

  if (action.type === 'guess' && action.correct) {
    return {
      state: { ...state, guesses, status: 'won' },
      outcome: { kind: 'won', attempt: state.attempt },
    };
  }

  if (state.attempt + 1 >= MAX_ATTEMPTS) {
    return {
      state: { ...state, guesses, status: 'lost' },
      outcome: { kind: 'lost', attempt: state.attempt },
    };
  }

  const next = state.attempt + 1;
  return {
    state: { ...state, guesses, attempt: next },
    outcome: { kind: 'next', previousDuration: tierDuration, nextDuration: ATTEMPT_DURATIONS[next] },
  };
}
