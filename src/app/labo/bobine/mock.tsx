'use client';

import { ATTEMPT_DURATIONS } from '@/constants/game';
import Link from 'next/link';
import { useState } from 'react';

export interface MockQuote {
  videoTitle: string;
  setupPhrase: string;
  correctPunchline: string;
  options: string[];
  startTime: number;
  pauseTime: number;
}

type Ecran = 'primitives' | 'repliques' | 'battle' | 'etats' | 'blindtest';

const TABS: { id: Ecran; label: string }[] = [
  { id: 'primitives', label: 'Primitives' },
  { id: 'repliques', label: 'Répliques' },
  { id: 'battle', label: 'Battle' },
  { id: 'etats', label: 'États' },
  { id: 'blindtest', label: 'Blindtest' },
];

function tc(s: number) {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `00:${String(m).padStart(2, '0')}:${r.toFixed(1).padStart(4, '0')}`;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="bb-section">
      <span className="bb-label">{label}</span>
      {children}
    </section>
  );
}

/** Moniteur : repères, timecode, REC AUTOUR du lecteur, jamais dessus. */
function Monitor({ timecode, status, children }: { timecode: string; status: string; children?: React.ReactNode }) {
  return (
    <div className="bb-monitor">
      <div className="bb-monitor-bar">
        <span className="bb-rec">
          <span className="bb-dot" aria-hidden="true" /> REC
        </span>
        <span className="bb-mono" style={{ color: '#f4f1ea' }}>{timecode}</span>
      </div>
      <div className="bb-frame">
        <div data-player-slot className="aspect-video bb-slot">
          Lecteur YouTube
        </div>
        <i aria-hidden="true" />
      </div>
      <div className="bb-monitor-foot">
        <span className="bb-mono bb-mute">{status}</span>
        {children}
      </div>
    </div>
  );
}

function Primitives() {
  const colors = [
    ['--ink', '#0F0E13', 'Fond'],
    ['--ink-2', '#18161E', 'Surface'],
    ['--ink-3', '#232030', 'Surface +'],
    ['--paper', '#F2ECE1', 'Papier'],
    ['--subtitle', '#FFD84A', 'Sous-titre'],
    ['--rec', '#FF4A3D', 'REC'],
    ['--ok', '#5BE49B', 'Validé'],
    ['--mute', '#8D8799', 'Neutre'],
  ];
  const scale = [12, 14, 16, 20, 25, 31, 39, 61];
  const [toast, setToast] = useState(true);
  return (
    <>
      <Section label="Palette">
        <div className="bb-grid bb-swatches">
          {colors.map(([t, v, n]) => (
            <div className="bb-swatch" key={t}>
              <i style={{ background: v }} />
              <div>
                <div className="bb-small">{n}</div>
                <div className="bb-mono bb-mute">{t} · {v}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Typographie">
        <div className="bb-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))' }}>
          <div className="bb-panel">
            <p className="bb-label">Archivo Extra-Condensed Black</p>
            <p className="bb-title bb-h1" style={{ marginTop: 8 }}>Nicolas Pichard</p>
            <p className="bb-label" style={{ marginTop: 16 }}>Archivo largeur normale</p>
            <p>Interface : libellés, boutons, consignes de jeu.</p>
          </div>
          <div className="bb-panel">
            <p className="bb-label">Instrument Serif italique — répliques</p>
            <p style={{ fontFamily: 'var(--font-quote)', fontStyle: 'italic', fontSize: 'var(--fs-31)', color: 'var(--subtitle)', marginTop: 8 }}>
              « Tu sais VOLER ! »
            </p>
            <p className="bb-label" style={{ marginTop: 16 }}>JetBrains Mono — timecodes, codes</p>
            <p className="bb-mono" style={{ fontSize: 'var(--fs-16)' }}>00:01:46.6 · K7QX-42</p>
          </div>
        </div>
        <div className="bb-panel" style={{ marginTop: 16 }}>
          <p className="bb-label" style={{ marginBottom: 8 }}>Échelle 12 / 14 / 16 / 20 / 25 / 31 / 39 / 61</p>
          {scale.map((s) => (
            <p key={s} style={{ fontSize: s, lineHeight: 1.2, margin: '4px 0' }}>
              <span className="bb-mono bb-mute" style={{ marginRight: 12 }}>{s}px</span>
              <span className={s >= 39 ? 'bb-title' : ''}>La bobine tourne</span>
            </p>
          ))}
        </div>
      </Section>

      <Section label="Boutons">
        <div className="bb-panel" style={{ display: 'grid', gap: 16 }}>
          {(['primary', 'secondary', 'ghost'] as const).map((v) => (
            <div className="bb-row" key={v}>
              <button className={`bb-btn bb-btn-${v}`}>Normal</button>
              <button className={`bb-btn bb-btn-${v} is-hover`} tabIndex={-1}>Survol</button>
              <button className={`bb-btn bb-btn-${v} is-focus`} tabIndex={-1}>Focus</button>
              <button className={`bb-btn bb-btn-${v}`} disabled>Désactivé</button>
              <span className="bb-mono bb-mute">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Champ">
        <div className="bb-panel bb-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))' }}>
          <div className="bb-field">
            <label htmlFor="f1" className="bb-small">Ta réponse</label>
            <input id="f1" className="bb-input" placeholder="Titre de la vidéo…" />
          </div>
          <div className="bb-field">
            <label htmlFor="f2" className="bb-small">Code du salon</label>
            <input id="f2" className="bb-input" defaultValue="K7QX" aria-invalid="true" aria-describedby="f2e" style={{ fontFamily: 'var(--font-mono)' }} />
            <span id="f2e" className="bb-err">Aucun salon avec ce code.</span>
          </div>
        </div>
      </Section>

      <Section label="Pastilles">
        <div className="bb-row">
          <span className="bb-pill bb-pill-ok"><span className="bb-dot" /> Prêt</span>
          <span className="bb-pill bb-pill-rec"><span className="bb-dot" /> Live</span>
          <span className="bb-pill bb-pill-sub">Hôte</span>
          <span className="bb-pill bb-pill-mute">En attente</span>
          <span className="bb-pill bb-pill-sub">Combo ×3</span>
        </div>
      </Section>

      <Section label="Toast (aria-live)">
        <div aria-live="polite" className="bb-grid" style={{ minHeight: 56 }}>
          {toast && (
            <div className="bb-toast" role="status">
              <span>Bonne réplique ! +300 pts</span>
              <button className="bb-btn bb-btn-ghost" style={{ minHeight: 32, padding: '0 8px', marginLeft: 'auto' }} onClick={() => setToast(false)} aria-label="Fermer">✕</button>
            </div>
          )}
        </div>
        {!toast && <button className="bb-btn bb-btn-secondary" onClick={() => setToast(true)}>Réafficher</button>}
      </Section>
    </>
  );
}

function Repliques({ quote }: { quote: MockQuote }) {
  const [sel, setSel] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const keys = ['A', 'B', 'C', 'D'];
  const setup = quote.setupPhrase;
  return (
    <div className="bb-game" style={{ marginTop: 8 }}>
      <div>
        <div className="bb-sticky">
          <Monitor timecode={tc(quote.pauseTime)} status="ARRÊT SUR IMAGE" />
        </div>
        <div className="bb-sub" style={{ marginTop: 8 }} aria-live="polite">
          <q>{setup}<span className="bb-cursor" aria-label="réplique à compléter">▁▁▁</span></q>
        </div>
      </div>
      <div className="bb-panel">
        <div className="bb-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p className="bb-label">Score</p>
            <p className="bb-score">1 250</p>
          </div>
          <span className="bb-pill bb-pill-sub">Combo ×3</span>
        </div>
        <div style={{ margin: '16px 0' }}>
          <div className="bb-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="bb-mono bb-mute">Réplique 3 / 5</span>
            <span className="bb-mono bb-mute">{quote.videoTitle}</span>
          </div>
          <div className="bb-progress" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={3} aria-label="Progression">
            <i className="done" /><i className="done" /><i className="now" /><i /><i />
          </div>
        </div>
        <p className="bb-h3 bb-title" style={{ marginBottom: 12 }}>Quelle est la suite ?</p>
        <div className="bb-choices">
          {quote.options.slice(0, 4).map((o, i) => {
            const cls = done ? (o === quote.correctPunchline ? 'ok' : o === sel ? 'ko' : '') : '';
            return (
              <button key={o} className={`bb-choice ${cls}`} aria-pressed={sel === o} disabled={done} onClick={() => setSel(o)}>
                <span className="k">{keys[i]}</span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
        <div className="bb-actions">
          <button className="bb-btn bb-btn-primary bb-btn-block" disabled={!sel || done} onClick={() => setDone(true)}>
            Valider la réplique
          </button>
          {done && (
            <button className="bb-btn bb-btn-ghost bb-btn-block bb-note" onClick={() => { setDone(false); setSel(null); }}>
              Rejouer cet écran
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const PLAYERS = [
  { n: 'Léa', host: true, ready: true, pts: 4820 },
  { n: 'Maxime', host: false, ready: true, pts: 4310 },
  { n: 'Inès', host: false, ready: false, pts: 3950 },
  { n: 'Théo', host: false, ready: true, pts: 2740 },
];

function Battle() {
  const [ready, setReady] = useState(false);
  return (
    <div className="bb-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', marginTop: 8, alignItems: 'start' }}>
      <section className="bb-panel" aria-labelledby="lobby">
        <p className="bb-label" id="lobby">Salon</p>
        <p className="bb-code" style={{ margin: '4px 0 16px' }}>K7QX-42</p>
        <div className="bb-row" style={{ marginBottom: 16 }}>
          <span className="bb-pill bb-pill-rec"><span className="bb-dot" /> Battle</span>
          <span className="bb-mono bb-mute">4 / 8 joueurs</span>
        </div>
        <ul className="bb-players">
          {PLAYERS.map((p) => (
            <li className="bb-player" key={p.n}>
              <span className="bb-avatar" aria-hidden="true">{p.n[0]}</span>
              <span className="grow">{p.n}</span>
              {p.host && <span className="bb-pill bb-pill-sub">Hôte</span>}
              {p.ready ? <span className="bb-pill bb-pill-ok">Prêt</span> : <span className="bb-pill bb-pill-mute">En attente</span>}
            </li>
          ))}
        </ul>
        <div className="bb-row" style={{ marginTop: 20 }}>
          <button className="bb-btn bb-btn-primary" style={{ flex: 1 }} onClick={() => setReady(!ready)}>
            {ready ? 'Annuler : je ne suis pas prêt' : 'Je suis prêt'}
          </button>
          <button className="bb-btn bb-btn-secondary">Copier le code</button>
        </div>
        <div className="bb-row" style={{ marginTop: 24, gap: 16 }}>
          <div className="bb-clap" role="img" aria-label="Clap : compte à rebours 3">
            <div className="top" /><div className="body">3</div>
          </div>
          <p className="bb-small bb-mute" style={{ flex: 1, minWidth: 140 }}>Clap de départ : compte à rebours du battle.</p>
        </div>
      </section>

      <section className="bb-ticket" aria-labelledby="recap">
        <p className="bb-label">Séance terminée · Salle K7QX-42</p>
        <h2 id="recap" className="bb-title" style={{ fontSize: 'var(--fs-39)', marginTop: 4 }}>Classement</h2>
        <hr />
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {[...PLAYERS].sort((a, b) => b.pts - a.pts).map((p, i) => (
            <li className={`bb-rank ${i === 0 ? 'first' : ''}`} key={p.n}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span>{p.n}{p.host ? ' · hôte' : ''}</span>
              <span className="pts">{p.pts.toLocaleString('fr-FR')}</span>
            </li>
          ))}
        </ol>
        <hr />
        <div className="bb-row" style={{ justifyContent: 'space-between' }}>
          <span className="bb-mono" style={{ color: 'var(--on-paper-mute)' }}>N° 000482 · 5 manches</span>
          <button className="bb-btn bb-btn-primary">Rejouer</button>
        </div>
      </section>
    </div>
  );
}

function Etats() {
  return (
    <>
      <Section label="Chargement : mire « RÉGLAGE EN COURS »">
        <div className="bb-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))' }}>
          <div className="bb-mire" role="status"><span>RÉGLAGE EN COURS</span></div>
          <div className="bb-panel bb-grid" aria-hidden="true">
            <div className="bb-skel" style={{ width: '40%' }} />
            <div className="bb-skel" />
            <div className="bb-skel" style={{ width: '80%' }} />
            <div className="bb-skel" style={{ height: 48 }} />
            <div className="bb-skel" style={{ height: 48 }} />
          </div>
        </div>
      </Section>

      <Section label="Erreur">
        <div className="bb-panel" role="alert" style={{ borderColor: 'var(--rec)' }}>
          <p className="bb-label" style={{ color: '#ff8379' }}>Erreur 150 · lecture impossible</p>
          <p className="bb-title bb-h2" style={{ margin: '8px 0 16px' }}>Bobine abîmée — on change de film</p>
          <div className="bb-row">
            <button className="bb-btn bb-btn-primary">Film suivant</button>
            <button className="bb-btn bb-btn-ghost">Quitter la partie</button>
          </div>
        </div>
      </Section>

      <Section label="Bandeau de connexion">
        <div className="bb-grid">
          <div className="bb-banner ok" role="status"><span className="bb-dot" aria-hidden="true" /> <b>Connecté</b> · salon K7QX-42, 4 joueurs</div>
          <div className="bb-banner warn" role="status"><span className="bb-dot" aria-hidden="true" /> <b>Reconnexion…</b> on recolle la pellicule (essai 2 / 5)</div>
          <div className="bb-banner off" role="alert"><span className="bb-dot" aria-hidden="true" /> <b>Hors ligne</b> · tes réponses seront renvoyées au retour du réseau</div>
        </div>
      </Section>
    </>
  );
}

function Blindtest({ titles }: { titles: string[] }) {
  const [sel, setSel] = useState<string | null>(null);
  // Durées réelles du jeu (src/constants/game.ts). Le palier 1 reste à redéfinir (étape 1a).
  const state = ['played', 'now', 'locked', 'locked'];
  const segs = ATTEMPT_DURATIONS.map((d, i) => ({ t: `${String(d).replace('.', ',')} s`, c: state[i] }));
  return (
    <>
      <div className="bb-banner warn bb-hold" role="note" style={{ marginTop: 8 }}>
        <b>Mode en attente de décision (contraintes YouTube)</b>
        <span>Maquette de mise en page uniquement.</span>
      </div>
      <div className="bb-game" style={{ marginTop: 16 }}>
        <div>
          <div className="bb-sticky">
            <Monitor timecode="00:00:00.8" status="TENTATIVE 2 / 4" />
          </div>
          <div className="bb-film" style={{ marginTop: 8 }} aria-label="Pellicule : 4 paliers">
            <div className="bb-perf" aria-hidden="true" />
            <div className="bb-segs">
              {segs.map((s, i) => (
                <div key={s.t} className={`bb-seg ${s.c}`}>
                  {s.c === 'locked' ? <span aria-label={`Palier ${i + 1} verrouillé`}>🔒 {s.t}</span> : s.t}
                </div>
              ))}
              <span className="bb-head" aria-hidden="true" />
            </div>
            <div className="bb-perf" aria-hidden="true" />
          </div>
          <p className="bb-mono bb-mute bb-note">Paliers actuels du jeu : {ATTEMPT_DURATIONS.map((d) => String(d).replace('.', ',')).join(' s · ')} s</p>
        </div>
        <div className="bb-panel">
          <p className="bb-title bb-h3">Quelle vidéo ?</p>
          <div className="bb-field" style={{ marginTop: 12 }}>
            <label htmlFor="bt" className="bb-small">Ta réponse</label>
            <input id="bt" className="bb-input" placeholder="Rechercher un titre…" value={sel ?? ''} onChange={(e) => setSel(e.target.value)} role="combobox" aria-expanded="true" aria-controls="sug" aria-autocomplete="list" />
          </div>
          <ul id="sug" role="listbox" className="bb-players" style={{ marginTop: 8 }}>
            {titles.slice(0, 4).map((t) => (
              <li key={t} role="option" aria-selected={sel === t}>
                <button className="bb-choice" style={{ minHeight: 44 }} onClick={() => setSel(t)}>{t}</button>
              </li>
            ))}
          </ul>
          <div className="bb-actions">
            <div className="bb-row">
              <button className="bb-btn bb-btn-primary" style={{ flex: 1 }} disabled={!sel}>Valider</button>
              <button className="bb-btn bb-btn-secondary">Passer</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function BobineMock({ ecran, quote, titles }: { ecran: Ecran; quote: MockQuote; titles: string[] }) {
  return (
    <main className="bb-wrap">
      <p className="bb-label">Labo · maquette non indexée</p>
      <h1 className="bb-title bb-h1" style={{ marginTop: 8 }}>Bobine</h1>
      <nav className="bb-tabs" aria-label="Écrans de la maquette">
        {TABS.map((t) => (
          <Link key={t.id} href={`/labo/bobine?ecran=${t.id}`} className="bb-tab" aria-current={ecran === t.id ? 'page' : undefined} scroll={false}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="bb-screen" key={ecran}>
        {ecran === 'primitives' && <Primitives />}
        {ecran === 'repliques' && <Repliques quote={quote} />}
        {ecran === 'battle' && <Battle />}
        {ecran === 'etats' && <Etats />}
        {ecran === 'blindtest' && <Blindtest titles={titles} />}
      </div>
    </main>
  );
}
