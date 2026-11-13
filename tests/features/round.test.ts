import { describe, expect, it } from 'vitest';
import { initialRound, roundStep, type RoundState } from '@/features/blindtest/round';
import { ATTEMPT_DURATIONS } from '@/constants/game';

const run = (actions: Parameters<typeof roundStep>[1][]) =>
  actions.reduce<{ state: RoundState; outcomes: string[] }>(
    (acc, a) => {
      const r = roundStep(acc.state, a);
      return { state: r.state, outcomes: [...acc.outcomes, r.outcome.kind] };
    },
    { state: initialRound(), outcomes: [] }
  );

describe('blindtest round', () => {
  it('wins on a correct guess and records the tier', () => {
    const { state, outcomes } = run([{ type: 'start' }, { type: 'skip' }, { type: 'guess', guessedTitle: 'X', correct: true }]);
    expect(state.status).toBe('won');
    expect(outcomes).toEqual(['none', 'next', 'won']);
    expect(state.guesses.map((g) => g.tierDuration)).toEqual([ATTEMPT_DURATIONS[0], ATTEMPT_DURATIONS[1]]);
  });

  it('loses after 4 wrong attempts', () => {
    const wrong = { type: 'guess', guessedTitle: 'Y', correct: false } as const;
    const { state, outcomes } = run([wrong, { type: 'skip' }, wrong, wrong]);
    expect(state.status).toBe('lost');
    expect(outcomes).toEqual(['next', 'next', 'next', 'lost']);
    expect(state.guesses).toHaveLength(4);
  });

  it('ignores actions after the round is over', () => {
    const { state } = run([{ type: 'guess', guessedTitle: 'X', correct: true }, { type: 'skip' }]);
    expect(state.guesses).toHaveLength(1);
  });

  it('next outcome carries continuation durations', () => {
    const r = roundStep(initialRound(), { type: 'skip' });
    expect(r.outcome).toEqual({ kind: 'next', previousDuration: ATTEMPT_DURATIONS[0], nextDuration: ATTEMPT_DURATIONS[1] });
  });
});
