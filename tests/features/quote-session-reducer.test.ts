import { describe, expect, it } from 'vitest';
import { initialQuoteSession, quoteSessionReducer, sessionScore, type QuoteSessionAction, type QuoteSessionState } from '@/features/quotes/session';
import { CYPRIEN_QUOTES } from '@/data/quotes';

const qs = CYPRIEN_QUOTES.slice(0, 5);
const run = (s: QuoteSessionState, actions: QuoteSessionAction[]) => actions.reduce(quoteSessionReducer, s);
const answer = (opt: (i: number) => string, i: number): QuoteSessionAction[] => [
  { type: 'pause_reached' },
  { type: 'select', option: opt(i) },
  { type: 'next' },
];

describe('quoteSessionReducer', () => {
  it('ignores answers before the cut and after revealing', () => {
    const s0 = initialQuoteSession(qs);
    expect(quoteSessionReducer(s0, { type: 'select', option: qs[0].correctPunchline })).toBe(s0);
    const s1 = run(s0, [{ type: 'pause_reached' }, { type: 'select', option: 'faux' }]);
    expect(s1.status).toBe('revealing');
    expect(quoteSessionReducer(s1, { type: 'select', option: qs[0].correctPunchline })).toBe(s1);
    expect(s1.answers).toHaveLength(1);
  });

  it('applies combos and finishes after the last question', () => {
    let s = initialQuoteSession(qs);
    const picks = [true, true, true, false, true];
    picks.forEach((ok, i) => {
      s = run(s, answer(() => (ok ? qs[i].correctPunchline : 'faux'), i));
    });
    expect(s.answers.map((a) => a.pointsEarned)).toEqual([1000, 1200, 1500, 0, 1000]);
    expect(s.streaks.maxStreak).toBe(3);
    expect(s.status).toBe('finished');
    expect(sessionScore(s)).toBe(4700);
  });

  it('next is a no-op unless revealing; start resets', () => {
    const s0 = initialQuoteSession(qs);
    expect(quoteSessionReducer(s0, { type: 'next' })).toBe(s0);
    const s1 = run(s0, answer(() => qs[0].correctPunchline, 0));
    expect(s1.index).toBe(1);
    const s2 = quoteSessionReducer(s1, { type: 'start', questions: qs.slice(0, 2) });
    expect(s2).toEqual(initialQuoteSession(qs.slice(0, 2)));
  });
});
