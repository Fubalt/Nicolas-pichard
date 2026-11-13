import { Chip } from './Chip';

export interface ScoreProgress {
  /** Question en cours (à partir de 1). */
  current: number;
  total: number;
  /** Texte à gauche (défaut : « current / total »). */
  label?: string;
  /** Texte à droite (ex. titre de la vidéo). */
  aside?: string;
}

export interface ScoreBlockProps {
  score: number | string;
  /** Multiplicateur de combo ; masqué si absent. */
  combo?: number;
  progress?: ScoreProgress;
  /** Libellé au-dessus du score (défaut : « Score »). */
  scoreLabel?: string;
  progressAriaLabel?: string;
}

export function ScoreBlock({ score, combo, progress, scoreLabel = 'Score', progressAriaLabel = 'Progression' }: ScoreBlockProps) {
  const shown = typeof score === 'number' ? score.toLocaleString('fr-FR') : score;
  return (
    <div>
      <div className="bb-row bb-score-row">
        <div>
          <p className="bb-label">{scoreLabel}</p>
          <p className="bb-score">{shown}</p>
        </div>
        {combo !== undefined && <Chip variant="sub">Combo ×{combo}</Chip>}
      </div>
      {progress && (
        <div className="bb-progress-wrap">
          <div className="bb-row bb-progress-meta">
            <span className="bb-mono bb-mute">{progress.label ?? `${progress.current} / ${progress.total}`}</span>
            {progress.aside && <span className="bb-mono bb-mute">{progress.aside}</span>}
          </div>
          <div
            className="bb-progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.current}
            aria-label={progressAriaLabel}
          >
            {Array.from({ length: progress.total }, (_, i) => (
              <i key={i} className={i + 1 < progress.current ? 'done' : i + 1 === progress.current ? 'now' : undefined} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
