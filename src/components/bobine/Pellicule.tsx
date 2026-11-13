import { cx } from './cx';

export type PelliculeState = 'played' | 'now' | 'locked' | 'idle';

export interface PelliculeSegment {
  /** Texte affiché dans le segment. */
  label: string;
  state: PelliculeState;
  /** Libellé accessible (ex. « Palier 3 verrouillé »). */
  ariaLabel?: string;
}

export interface PelliculeProps {
  segments: PelliculeSegment[];
  /** Largeurs relatives des segments (défaut : égales). */
  weights?: number[];
  /** Position de la tête de lecture, de 0 à 1 (masquée si absente). */
  head?: number;
  /** Libellé accessible de la pellicule entière. */
  ariaLabel?: string;
  className?: string;
}

export function Pellicule({ segments, weights, head, ariaLabel, className }: PelliculeProps) {
  const cols = segments.map((_, i) => `${weights?.[i] ?? 1}fr`).join(' ');
  return (
    <div className={cx('bb-film', className)} role="group" aria-label={ariaLabel}>
      <div className="bb-perf" aria-hidden="true" />
      <div className="bb-segs" style={{ gridTemplateColumns: cols }}>
        {segments.map((s, i) => (
          <div key={i} className={cx('bb-seg', s.state !== 'idle' && s.state)}>
            {s.state === 'locked' ? (
              <span aria-label={s.ariaLabel}>🔒 {s.label}</span>
            ) : (
              <span aria-label={s.ariaLabel}>{s.label}</span>
            )}
          </div>
        ))}
        {head !== undefined && (
          <span
            className="bb-head"
            aria-hidden="true"
            style={{ left: `calc(8px + (100% - 16px) * ${Math.min(1, Math.max(0, head))})` }}
          />
        )}
      </div>
      <div className="bb-perf" aria-hidden="true" />
    </div>
  );
}
