'use client';

import Link from 'next/link';
import { useCallback, useEffect, useReducer, useState } from 'react';
import type { QuoteQuestion } from '@/types/quotes';
import { getRandomQuotes } from '@/data/quotes';
import { Button, Choice, Monitor, ScoreBlock, Tabs } from '@/components/bobine';
import { comboMultiplier, initialQuoteSession, quoteSessionReducer, sessionScore } from './session';
import { QUOTE_ERROR_TEXT, useQuoteClip, type QuoteClipPhase } from './useQuoteClip';

const LETTERS = ['A', 'B', 'C', 'D'];
const FORMATS = [
  { id: '5', label: '5 répliques' },
  { id: '10', label: '10 répliques' },
];

/** 106.6 → « 00:01:46.6 » */
function timecode(s: number): string {
  const t = Math.max(0, s);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = (t % 60).toFixed(1).padStart(4, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec}`;
}

function monitorStatus(phase: QuoteClipPhase, ready: boolean, playing: boolean): string {
  if (!ready) return 'CHARGEMENT…';
  if (phase === 'standby') return 'PRÊT · LANCE L’EXTRAIT';
  if (phase === 'setup_playing') return playing ? 'LECTURE DE L’AMORCE' : 'AMORCE EN PAUSE';
  if (phase === 'setup_paused') return 'ARRÊT SUR IMAGE';
  return playing ? 'SUITE DE LA SCÈNE' : 'EXTRAIT EN PAUSE';
}

export function RepliquesGame({ initialQuestions }: { initialQuestions: QuoteQuestion[] }) {
  const [total, setTotal] = useState(initialQuestions.length);
  const [session, dispatch] = useReducer(quoteSessionReducer, initialQuestions, initialQuoteSession);
  const [muted, setMuted] = useState(false);
  const volume = 80;

  const { questions, index, status, selected, answers, streaks } = session;
  const question = questions[index];
  const score = sessionScore(session);

  const clip = useQuoteClip({
    videoId: question?.videoId ?? '',
    startTime: question?.startTime ?? 0,
    pauseTime: question?.pauseTime ?? 0,
    resumeDuration: question?.resumeDuration ?? 0,
    volume,
    isMuted: muted,
    onPauseReached: useCallback(() => dispatch({ type: 'pause_reached' }), []),
    onRevealFinished: useCallback(() => {}, []),
  });
  const { hostRef, phase, ready, playing, progress, error, togglePlay, revealPunchline, replaySetup, replayFullScene } = clip;

  const start = useCallback((count: number) => {
    setTotal(count);
    dispatch({ type: 'start', questions: getRandomQuotes(count) });
  }, []);

  const answer = useCallback(
    (option: string) => {
      if (status !== 'waiting_qcm') return;
      dispatch({ type: 'select', option });
      revealPunchline();
    },
    [status, revealPunchline]
  );

  const next = useCallback(() => dispatch({ type: 'next' }), []);

  // Raccourcis identiques au mode actuel : Espace, 1-4, Entrée.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (status === 'finished') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.code === 'Enter' && status === 'revealing') {
        e.preventDefault();
        next();
        return;
      }
      if (status === 'waiting_qcm' && question) {
        const k = parseInt(e.key, 10) - 1;
        if (k >= 0 && k < question.options.length) {
          e.preventDefault();
          answer(question.options[k]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, question, togglePlay, next, answer]);

  const header = (
    <header className="bb-row" style={{ justifyContent: 'space-between', marginBottom: 'var(--sp-5)' }}>
      <div>
        <p className="bb-label">Nicolas Pichard</p>
        <h1 className="bb-h bb-title">Complète la réplique</h1>
      </div>
      <Link href="/" className="bb-btn bb-btn-ghost">
        ← Accueil
      </Link>
    </header>
  );

  if (status === 'finished') {
    const good = answers.filter((a) => a.isCorrect).length;
    return (
      <main className="bb-wrap">
        {header}
        <section className="bb-screen bb-panel" aria-labelledby="recap-title" data-testid="quote-recap">
          <p className="bb-label">Fin de la bobine</p>
          <h2 id="recap-title" className="bb-score">
            {score.toLocaleString('fr-FR')} pts
          </h2>
          <p className="bb-mono bb-mute" style={{ margin: 'var(--sp-2) 0 var(--sp-5)' }}>
            {good} / {answers.length} bonnes répliques · meilleur combo {streaks.maxStreak}
          </p>
          <ol className="bb-grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {answers.map((a, i) => (
              <li key={a.question.id} className={`bb-choice ${a.isCorrect ? 'ok' : 'ko'}`} style={{ cursor: 'default' }}>
                <span className="k">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="bb-small bb-mute">{a.question.videoTitle}</span>
                  <br />
                  {a.question.setupPhrase} <strong>{a.question.correctPunchline}</strong>
                  <br />
                  <span className="bb-mono bb-small" style={{ color: a.isCorrect ? 'var(--ok)' : '#ff8379' }}>
                    {a.isCorrect ? `+${a.pointsEarned.toLocaleString('fr-FR')} pts` : `Raté : « ${a.selectedOption} »`}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div className="bb-action-bar">
            <Button block onClick={() => start(total)}>
              Rejouer
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (!question) return null;

  const revealing = status === 'revealing';
  const last = answers[answers.length - 1];
  const nextCombo = comboMultiplier(streaks.currentStreak + 1);

  let mainLabel: string;
  if (phase === 'standby') mainLabel = 'Lancer l’extrait';
  else if (phase === 'setup_paused') mainLabel = 'Réécouter l’amorce';
  else mainLabel = playing ? 'Pause' : 'Reprendre';

  return (
    <main className="bb-wrap">
      {header}
      <Tabs
        items={FORMATS}
        active={String(total)}
        onSelect={(id) => {
          const n = Number(id);
          if (n !== total) start(n);
        }}
        ariaLabel="Format de la session"
        className="bb-film-gap"
      />
      <div className="bb-game" style={{ marginTop: 'var(--sp-4)' }}>
        <div>
          <div className="bb-sticky">
            <Monitor
              timecode={timecode(question.pauseTime)}
              status={error ? 'SIGNAL PERDU' : monitorStatus(phase, ready, playing)}
              footer={
                <Button
                  variant="ghost"
                  onClick={() => setMuted((m) => !m)}
                  aria-pressed={muted}
                  style={{ minHeight: 32, padding: '0 8px' }}
                >
                  {muted ? 'Son coupé' : 'Son'}
                </Button>
              }
            >
              <div
                className="aspect-video"
                style={{ position: 'relative', background: '#000' }}
                data-testid="quote-player"
                data-phase={phase}
                data-cut-at={question.pauseTime}
              >
                <div
                  ref={hostRef}
                  className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                />
              </div>
            </Monitor>
          </div>
          <div className="bb-row" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
            <Button variant="secondary" onClick={togglePlay} disabled={!ready || !!error}>
              {mainLabel}
            </Button>
            {revealing && (
              <Button variant="ghost" onClick={replayFullScene} disabled={!ready || !!error}>
                Revoir la scène
              </Button>
            )}
            {phase === 'setup_playing' && !playing && (
              <Button variant="ghost" onClick={replaySetup}>
                Depuis le début
              </Button>
            )}
            <div aria-hidden="true" style={{ flex: 1, minWidth: 80, height: 6, background: 'var(--ink-3)', borderRadius: 1 }}>
              <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: '#f4f1ea' }} />
            </div>
          </div>
          {error && (
            <div className="bb-banner off" role="alert" style={{ marginTop: 'var(--sp-3)' }}>
              <p>{QUOTE_ERROR_TEXT[error.kind]}</p>
              <Button variant="secondary" onClick={() => start(total)}>
                Nouvelle session
              </Button>
            </div>
          )}
          <div className="bb-sub" style={{ marginTop: 'var(--sp-2)' }} aria-live="polite">
            <q>
              {question.setupPhrase}{' '}
              {revealing ? (
                <span style={{ color: '#f4f1ea' }}>{question.correctPunchline}</span>
              ) : (
                <span className="bb-cursor" aria-label="réplique à compléter">
                  ▁▁▁
                </span>
              )}
            </q>
          </div>
        </div>

        <div className="bb-panel">
          <ScoreBlock
            score={score}
            combo={streaks.currentStreak > 0 ? comboMultiplier(streaks.currentStreak) : undefined}
            progress={{ current: index + 1, total: questions.length, label: `Réplique ${index + 1} / ${questions.length}`, aside: question.videoTitle }}
          />
          <p className="bb-h3 bb-title" style={{ marginBottom: 12 }}>
            {revealing ? (last?.isCorrect ? 'Bonne réplique !' : 'Raté !') : 'Quelle est la suite ?'}
          </p>
          {revealing && last && (
            <p className="bb-mono bb-small" role="status" data-testid="quote-result" style={{ marginBottom: 12, color: last.isCorrect ? 'var(--ok)' : '#ff8379' }}>
              {last.isCorrect ? `+${last.pointsEarned.toLocaleString('fr-FR')} pts` : '+0 pt · le combo repart de zéro'}
            </p>
          )}
          {status === 'ready' && (
            <p className="bb-small bb-mute" style={{ marginBottom: 12 }}>
              Écoute l’amorce : les choix s’ouvrent à l’arrêt sur image. Bonne réponse : {Math.round(1000 * nextCombo).toLocaleString('fr-FR')} pts.
            </p>
          )}
          <div className="bb-choices">
            {question.options.map((o, i) => {
              const state = revealing
                ? o === question.correctPunchline
                  ? 'correct'
                  : o === selected
                    ? 'wrong'
                    : 'idle'
                : 'idle';
              return (
                <Choice key={o} letter={LETTERS[i]} state={state} disabled={status !== 'waiting_qcm'} onClick={() => answer(o)}>
                  {o}
                </Choice>
              );
            })}
          </div>
          {revealing && (
            <div className="bb-action-bar">
              <Button block onClick={next} data-testid="quote-next">
                {index + 1 < questions.length ? 'Réplique suivante' : 'Voir le bilan'}
              </Button>
            </div>
          )}
          <p className="bb-small bb-mute" style={{ marginTop: 'var(--sp-3)' }}>
            Espace : lecture · 1-4 : répondre · Entrée : suivante
          </p>
        </div>
      </div>
    </main>
  );
}
