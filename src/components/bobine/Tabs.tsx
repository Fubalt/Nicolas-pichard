import Link from 'next/link';
import { cx } from './cx';

export interface TabItem {
  id: string;
  label: string;
  /** Si fourni, l'onglet est un lien. */
  href?: string;
}

export interface TabsProps {
  items: TabItem[];
  /** id de l'onglet actif. */
  active: string;
  /** Appelé au clic (onglets sans href). Nécessite un composant client appelant. */
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

/** Onglets : passent à la ligne plutôt que de défiler horizontalement. */
export function Tabs({ items, active, onSelect, ariaLabel, className }: TabsProps) {
  return (
    <nav className={cx('bb-tabs', className)} aria-label={ariaLabel}>
      {items.map((t) => {
        const current = active === t.id ? ('page' as const) : undefined;
        return t.href ? (
          <Link key={t.id} href={t.href} className="bb-tab" aria-current={current} scroll={false}>
            {t.label}
          </Link>
        ) : (
          <button key={t.id} type="button" className="bb-tab" aria-current={current} onClick={() => onSelect?.(t.id)}>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
