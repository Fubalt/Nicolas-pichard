import { describe, expect, it } from 'vitest';
import { comboMultiplier, pickCustomQuestions, scoreAnswer } from '@/features/quotes/session';
import { CYPRIEN_QUOTES } from '@/data/quotes';
import { mulberry32 } from '@/lib/rng';

const q = CYPRIEN_QUOTES[0];

describe('quote session', () => {
  it('combo multipliers match the current game', () => {
    expect([1, 2, 3, 4, 7].map(comboMultiplier)).toEqual([1, 1.2, 1.5, 2, 2]);
  });

  it('scores streaks and resets on error', () => {
    let s = { currentStreak: 0, maxStreak: 0 };
    const pts: number[] = [];
    for (const opt of [q.correctPunchline, q.correctPunchline, 'faux', q.correctPunchline]) {
      const r = scoreAnswer(q, opt, s);
      s = r.streaks;
      pts.push(r.record.pointsEarned);
    }
    expect(pts).toEqual([1000, 1200, 0, 1000]);
    expect(s).toEqual({ currentStreak: 1, maxStreak: 2 });
  });

  it('picks distinct questions and keeps all options', () => {
    const picked = pickCustomQuestions(CYPRIEN_QUOTES.slice(0, 20), 5, mulberry32(1));
    expect(new Set(picked.map((p) => p.id)).size).toBe(5);
    for (const p of picked) {
      const orig = CYPRIEN_QUOTES.find((o) => o.id === p.id)!;
      expect([...p.options].sort()).toEqual([...orig.options].sort());
    }
  });
});
