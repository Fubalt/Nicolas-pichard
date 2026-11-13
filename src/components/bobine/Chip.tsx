import type { ReactNode } from 'react';
import { cx } from './cx';

export interface ChipProps {
  variant?: 'ok' | 'rec' | 'sub' | 'mute';
  /** Affiche un point de statut devant le texte. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Chip({ variant = 'sub', dot, children, className }: ChipProps) {
  return (
    <span className={cx('bb-pill', `bb-pill-${variant}`, className)}>
      {dot && <span className="bb-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
