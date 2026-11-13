'use client';

import { ATTEMPT_DURATIONS } from '@/constants/game';
import { Button, Choice, Chip, Monitor, Pellicule, ScoreBlock, Tabs } from '@/components/bobine';
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

function Player({ label = 'Lecteur YouTube' }: { label?: string }) {
  return (
    <div data-player-slot className="aspect-video bb-slot">
      {label}
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
              <Button variant={v}>Normal</Button>
              <Button variant={v} className="is-hover" tabIndex={-1}>Survol</Button>
              <Button variant={v} className="is-focus" tabIndex={-1}>Focus</Button>
              <Button variant={v} disabled>Désactivé</Button>
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
          <Chip variant="ok" dot>Prêt</Chip>
          <Chip variant="rec" dot>Live</Chip>
          <Chip variant="sub">Hôte</Chip>
          <Chip variant="mute">En attente</Chip>
          <Chip variant="sub">Combo ×3</Chip>
        </div>
      </Section>

      <Section label="Toast (aria-live)">
        <div aria-live="polite" className="bb-grid" style={{ minHeight: 56 }}>
          {toast && (
            <div className="bb-toast" role="status">
              <span>Bonne réplique ! +300 pts</span>
              <Button variant="ghost" style={{ minHeight: 32, padding: '0 8px', marginLeft: 'auto' }} onClick={() => setToast(false)} aria-label="Fermer">✕</Button>
            </div>
          )}
        </div>
        {!toast && <Button variant="secondary" onClick={() => setToast(true)}>Réafficher</Button>}
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
          <Monitor timecode={tc(quote.pauseTime)} status="ARRÊT SUR IMAGE"><Player /></Monitor>
        </div>
        <div className="bb-sub" style={{ marginTop: 8 }} aria-live="polite">
          <q>{setup}<span className="bb-cursor" aria-label="réplique à compléter">▁▁▁</span></q>
        </div>
      </div>
      <div className="bb-panel">
        <ScoreBlock score={1250} combo={3} progress={{ current: 3, total: 5, label: 'Réplique 3 / 5', aside: quote.videoTitle }} />
        <p className="bb-h3 bb-title" style={{ marginBottom: 12 }}>Quelle est la suite ?</p>
        <div className="bb-choices">
          {quote.options.slice(0, 4).map((o, i) => {
            const state = done ? (o === quote.correctPunchline ? 'correct' : o === sel ? 'wrong' : 'idle') : sel === o ? 'selected' : 'idle';
            return (
              <Choice key={o} letter={keys[i]} state={state} disabled={done} onClick={() => setSel(o)}>
                {o}
              </Choice>
            );
          })}
        </div>
        <div className="bb-action-bar">
          <Button block disabled={!sel || done} onClick={() => setDone(true)}>
            Valider la réplique
          </Button>
          {done && (
            <Button variant="ghost" block onClick={() => { setDone(false); setSel(null); }}>
              Rejouer cet écran
            </Button>
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
          <Chip variant="rec" dot>Battle</Chip>
          <span className="bb-mono bb-mute">4 / 8 joueurs</span>
        </div>
        <ul className="bb-players">
          {PLAYERS.map((p) => (
            <li className="bb-player" key={p.n}>
              <span className="bb-avatar" aria-hidden="true">{p.n[0]}</span>
              <span className="grow">{p.n}</span>
              {p.host && <Chip variant="sub">Hôte</Chip>}
              {p.ready ? <Chip variant="ok">Prêt</Chip> : <Chip variant="mute">En attente</Chip>}
            </li>
          ))}
        </ul>
        <div className="bb-row" style={{ marginTop: 20 }}>
          <Button style={{ flex: 1 }} onClick={() => setReady(!ready)}>
            {ready ? 'Annuler : je ne suis pas prêt' : 'Je suis prêt'}
          </Button>
          <Button variant="secondary">Copier le code</Button>
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
          <Button>Rejouer</Button>
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
            <Button>Film suivant</Button>
            <Button variant="ghost">Quitter la partie</Button>
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
  const state = ['played', 'now', 'locked', 'locked'] as const;
  const segs = ATTEMPT_DURATIONS.map((d, i) => ({
    label: `${String(d).replace('.', ',')} s`,
    state: state[i] ?? ('locked' as const),
    ariaLabel: state[i] === 'locked' ? `Palier ${i + 1} verrouillé` : undefined,
  }));
  return (
    <>
      <div className="bb-banner warn bb-hold" role="note" style={{ marginTop: 8 }}>
        <b>Mode en attente de décision (contraintes YouTube)</b>
        <span>Maquette de mise en page uniquement.</span>
      </div>
      <div className="bb-game" style={{ marginTop: 16 }}>
        <div>
          <div className="bb-sticky">
            <Monitor timecode="00:00:00.8" status="TENTATIVE 2 / 4"><Player /></Monitor>
          </div>
          <Pellicule
            className="bb-film-gap"
            segments={segs}
            weights={[1, 2, 4, 8]}
            head={0.2}
            ariaLabel={`Pellicule : ${segs.length} paliers`}
          />
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
                <Choice style={{ minHeight: 44 }} state={sel === t ? 'selected' : 'idle'} onClick={() => setSel(t)}>{t}</Choice>
              </li>
            ))}
          </ul>
          <div className="bb-action-bar">
            <div className="bb-row">
              <Button style={{ flex: 1 }} disabled={!sel}>Valider</Button>
              <Button variant="secondary">Passer</Button>
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
      <Tabs
        ariaLabel="Écrans de la maquette"
        active={ecran}
        items={TABS.map((t) => ({ id: t.id, label: t.label, href: `/labo/bobine?ecran=${t.id}` }))}
      />
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
