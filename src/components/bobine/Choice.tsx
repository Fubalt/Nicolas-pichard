import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

export interface ChoiceProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Lettre de la réponse (A-D). */
  letter?: string;
  state?: ChoiceState;
  children: ReactNode;
}

export function Choice({ letter, state = 'idle', className, type = 'button', children, ...rest }: ChoiceProps) {
  return (
    <button
      type={type}
      className={cx('bb-choice', state === 'correct' && 'ok', state === 'wrong' && 'ko', className)}
      aria-pressed={state === 'selected' || state === 'wrong'}
      {...rest}
    >
      {letter && <span className="k" aria-hidden="true">{letter}</span>}
      <span>{children}</span>
    </button>
  );
}
