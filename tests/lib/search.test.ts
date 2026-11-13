import { describe, it, expect } from 'vitest';
import { CYPRIEN_ALL_VIDEOS as all } from '@/data/videos';
import { normalizeTitle } from '@/lib/utils';
import { resolveGuess, isCorrectGuess, filterVideos } from '@/lib/search';

const groups = new Map<string, string[]>();
for (const v of all) {
  const k = normalizeTitle(v.title);
  groups.set(k, [...(groups.get(k) ?? []), v.id]);
}
const ambiguous = [...groups.entries()].filter(([, ids]) => ids.length > 1);

describe('search', () => {
  it('reports ambiguous normalized titles', () => {
    console.log(`AMBIGUOUS normalized titles: ${ambiguous.length}`, ambiguous.map(([k]) => k));
    expect(all.length).toBeGreaterThan(0);
  });

  it('no title of A ever wins for a different B (all ordered pairs)', () => {
    const bad: string[] = [];
    for (const a of all) for (const b of all) {
      if (a.id === b.id) continue;
      if (isCorrectGuess(all, a.title, b.id)) bad.push(`${a.title} -> ${b.title}`);
    }
    expect(bad).toEqual([]);
  }, 120000);

  it('id guess always resolves to itself', () => {
    for (const b of all) expect(isCorrectGuess(all, { id: b.id }, b.id)).toBe(true);
    expect(resolveGuess(all, { id: 'nope' })).toBeNull();
  });

  it('exact title resolves to own id unless normalized title shared', () => {
    for (const v of all) {
      const shared = (groups.get(normalizeTitle(v.title)) ?? []).length > 1;
      const r = resolveGuess(all, v.title);
      if (shared) expect(r).toBeNull();
      else expect(r).toBe(v.id);
    }
  });

  it('"X" vs "X 3" style pairs: shorter title does not win for longer one', () => {
    const norms = all.map((v) => ({ v, n: normalizeTitle(v.title) }));
    const pairs = norms.flatMap((s) =>
      norms.filter((l) => l.v.id !== s.v.id && /^\d+$/.test(l.n.slice(s.n.length + 1)) && l.n.startsWith(s.n + ' '))
        .map((l) => [s.v, l.v] as const));
    console.log('series pairs:', pairs.map(([s, l]) => `${s.title} / ${l.title}`));
    for (const [s, l] of pairs) {
      expect(isCorrectGuess(all, s.title, l.id)).toBe(false);
      expect(isCorrectGuess(all, l.title, l.id) || groups.get(normalizeTitle(l.title))!.length > 1).toBe(true);
    }
    const fake = [{ id: '1', title: 'Le Japon' }, { id: '3', title: 'Le Japon 3' }];
    expect(resolveGuess(fake, 'Le Japon')).toBe('1');
    expect(isCorrectGuess(fake, 'Le Japon', '3')).toBe(false);
    expect(resolveGuess(fake, 'Le Japon 3')).toBe('3');
  });

  it('empty input and filterVideos', () => {
    expect(resolveGuess(all, '  ')).toBeNull();
    expect(filterVideos(all, 'zzzzzzqq')).toEqual([]);
    expect(filterVideos(all, 'a', 3).length).toBeLessThanOrEqual(3);
  });
});
