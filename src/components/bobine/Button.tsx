import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Pleine largeur. */
  block?: boolean;
}

export function Button({ variant = 'primary', block, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx('bb-btn', `bb-btn-${variant}`, block && 'bb-btn-block', className)} {...rest} />;
}
