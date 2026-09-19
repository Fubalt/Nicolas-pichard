export const ATTEMPT_DURATIONS = [0.1, 2.1, 10.1, 26.1] as const;
export const ATTEMPT_INCREMENTS = [0.1, 2.0, 8.0, 16.0] as const;
export const MAX_ATTEMPTS = 4;

export const ATTEMPT_LABELS = [
  '0.1s',
  '+2s (2.1s)',
  '+8s (10.1s)',
  '+16s (26.1s)'
] as const;
