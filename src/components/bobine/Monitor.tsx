import type { ReactNode } from 'react';

export interface MonitorProps {
  /** Timecode affiché (ex. « 00:01:46.6 »). */
  timecode: string;
  /** Statut en pied de cadre (ex. « ARRÊT SUR IMAGE »). */
  status?: string;
  /** Lecteur (iframe, slot…) placé dans le cadre. */
  children?: ReactNode;
  /** Contenu additionnel à droite du statut. */
  footer?: ReactNode;
  /** Affiche le voyant REC (défaut : true). */
  rec?: boolean;
}

/** Cadre caméra : repères, REC et timecode AUTOUR du lecteur, jamais dessus. */
export function Monitor({ timecode, status, children, footer, rec = true }: MonitorProps) {
  return (
    <div className="bb-monitor">
      <div className="bb-monitor-bar">
        {rec ? (
          <span className="bb-rec">
            <span className="bb-dot" aria-hidden="true" /> REC
          </span>
        ) : (
          <span />
        )}
        <span className="bb-mono bb-timecode">{timecode}</span>
      </div>
      <div className="bb-frame">
        {children}
        <i aria-hidden="true" />
      </div>
      {(status || footer) && (
        <div className="bb-monitor-foot">
          <span className="bb-mono bb-mute">{status}</span>
          {footer}
        </div>
      )}
    </div>
  );
}
