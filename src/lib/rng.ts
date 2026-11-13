/** Deterministic seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, maxExclusive). */
export function randomInt(min: number, maxExclusive: number, rand: () => number = Math.random): number {
  return min + Math.floor(rand() * (maxExclusive - min));
}

/** Fisher-Yates shuffle; returns a new array. */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1, rand);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickOne<T>(arr: readonly T[], rand: () => number = Math.random): T {
  if (arr.length === 0) throw new Error('pickOne: empty array');
  return arr[randomInt(0, arr.length, rand)];
}
