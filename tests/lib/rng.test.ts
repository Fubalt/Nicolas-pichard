import { describe, it, expect } from 'vitest';
import { mulberry32, shuffle, pickOne, randomInt } from '@/lib/rng';

describe('rng', () => {
  it('mulberry32 is deterministic and in [0,1)', () => {
    const a = mulberry32(42), b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
  it('shuffle returns a permutation without mutating', () => {
    const src = Array.from({ length: 50 }, (_, i) => i);
    const copy = [...src];
    const out = shuffle(src, mulberry32(7));
    expect(src).toEqual(copy);
    expect(out).not.toBe(src);
    expect([...out].sort((x, y) => x - y)).toEqual(src);
    expect(out).not.toEqual(src);
    expect(shuffle(src, mulberry32(7))).toEqual(out);
  });
  it('randomInt stays in range and is roughly uniform', () => {
    const r = mulberry32(123);
    const counts = new Array(5).fill(0);
    for (let i = 0; i < 10000; i++) {
      const n = randomInt(3, 8, r);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThan(8);
      counts[n - 3]++;
    }
    for (const c of counts) expect(Math.abs(c - 2000)).toBeLessThan(200);
  });
  it('pickOne picks members, roughly uniformly', () => {
    const r = mulberry32(5);
    const arr = ['a', 'b', 'c'];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 3000; i++) counts[pickOne(arr, r)]++;
    for (const k of arr) expect(Math.abs(counts[k] - 1000)).toBeLessThan(150);
    expect(() => pickOne([])).toThrow();
  });
  it('shuffle position uniformity sanity', () => {
    const r = mulberry32(99);
    const first = [0, 0, 0, 0];
    for (let i = 0; i < 4000; i++) first[shuffle([0, 1, 2, 3], r)[0]]++;
    for (const c of first) expect(Math.abs(c - 1000)).toBeLessThan(150);
  });
});
