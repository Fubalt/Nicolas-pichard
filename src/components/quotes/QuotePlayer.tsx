'use client';

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';
import { usePlayer } from '@/features/player/usePlayer';

export interface QuotePlayerRef {
  playSetup: () => void;
  replaySetup: () => void;
  replayFullScene: () => void;
  revealPunchline: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  isPlaying: boolean;
}

interface Props {
  videoId: string;
  startTime: number;
  pauseTime: number;
  resumeDuration: number;
  volume: number;
  isMuted: boolean;
  onPauseReached: () => void;
  onRevealFinished: () => void;
  onReady?: () => void;
}

type Phase = 'standby' | 'setup_playing' | 'setup_paused' | 'revealing';

const ERROR_TEXT: Record<string, string> = {
  invalid: 'Extrait invalide.',
  html5: 'Le lecteur a rencontré un problème.',
  unavailable: 'Cette vidéo n’est plus disponible.',
  embed_blocked: 'Cette vidéo ne peut pas être lue ici.',
  unknown: 'Le lecteur YouTube n’a pas pu se charger.',
};

/**
 * Lecteur du mode Répliques, option A (docs/YOUTUBE_CONSTRAINTS.md §4) :
 * le lecteur reste visible, rien n'est superposé, les commandes sont en dessous.
 * La coupure se fait sur le temps vidéo, exactement à `pauseTime`.
 */
export const QuotePlayer = forwardRef<QuotePlayerRef, Props>(function QuotePlayer(
  { videoId, startTime, pauseTime, resumeDuration, volume, isMuted, onPauseReached, onRevealFinished, onReady },
  ref
) {
  // L'amorce dure au moins 3,8 s (comportement existant conservé).
  const setupStart = Math.max(0, pauseTime - Math.max(3.8, pauseTime - startTime));
  const setupDuration = pauseTime - setupStart;
  const revealDuration = Math.max(2.5, resumeDuration);

  const [phase, setPhase] = useState<Phase>('standby');
  const phaseRef = useRef<Phase>('standby');
  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const playSetupRef = useRef<() => void>(() => {});

  const { hostRef, engineRef, ready, playing, progress, error } = usePlayer({
    videoId,
    parkAt: setupStart,
    volume,
    muted: isMuted,
    onReady,
    // Clic dans le lecteur hors d'un segment : on rejoue l'amorce plutôt que de dévoiler la suite.
    onUnsolicitedPlay: () => {
      const p = phaseRef.current;
      if (p === 'standby' || p === 'setup_paused') playSetupRef.current();
    },
  });

  // Nouvelle question : retour à l'attente (ajustement pendant le rendu).
  const clipKey = `${videoId}@${setupStart}`;
  const [shownKey, setShownKey] = useState(clipKey);
  if (shownKey !== clipKey) {
    setShownKey(clipKey);
    setPhase('standby');
  }
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const playSetup = useCallback(() => {
    setPhaseBoth('setup_playing');
    engineRef.current?.play({
      from: setupStart,
      cutAt: pauseTime,
      duration: setupDuration,
      onDone: () => {
        setPhaseBoth('setup_paused');
        onPauseReached();
      },
    });
  }, [engineRef, setupStart, pauseTime, setupDuration, onPauseReached]);
  useEffect(() => {
    playSetupRef.current = playSetup;
  }, [playSetup]);

  const revealPunchline = useCallback(() => {
    setPhaseBoth('revealing');
    engineRef.current?.play({ from: pauseTime, cutAt: null, duration: revealDuration, onDone: onRevealFinished });
  }, [engineRef, pauseTime, revealDuration, onRevealFinished]);

  const replayFullScene = useCallback(() => {
    setPhaseBoth('revealing');
    engineRef.current?.play({
      from: setupStart,
      cutAt: null,
      duration: setupDuration + revealDuration,
      onDone: onRevealFinished,
    });
  }, [engineRef, setupStart, setupDuration, revealDuration, onRevealFinished]);

  const pause = useCallback(() => engineRef.current?.pause(), [engineRef]);

  const resume = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!engine.resumeSegment() && phaseRef.current === 'revealing') engine.resumeFree();
  }, [engineRef]);

  const togglePlay = useCallback(() => {
    const p = phaseRef.current;
    if (p === 'standby' || p === 'setup_paused') return playSetup();
    if (playing) return pause();
    resume();
  }, [playing, playSetup, pause, resume]);

  useImperativeHandle(ref, () => ({
    playSetup,
    replaySetup: playSetup,
    replayFullScene,
    revealPunchline,
    pause,
    resume,
    togglePlay,
    isPlaying: playing,
  }));

  let status: React.ReactNode;
  if (error) {
    status = (
      <span className="flex items-center gap-2 text-red-300">
        <AlertTriangle className="w-3.5 h-3.5" /> {ERROR_TEXT[error.kind]}
      </span>
    );
  } else if (!ready) {
    status = <span className="text-zinc-500">Chargement de la réplique…</span>;
  } else if (phase === 'standby') {
    status = <span className="text-zinc-400">Prêt : lance l&apos;extrait</span>;
  } else if (phase === 'setup_playing') {
    status = playing ? (
      <span className="flex items-center gap-2 text-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-400" /> Écoute l&apos;amorce…
      </span>
    ) : (
      <span className="text-zinc-400">Amorce en pause</span>
    );
  } else if (phase === 'setup_paused') {
    status = (
      <span className="flex items-center gap-2 text-orange-400">
        <span className="w-2 h-2 rounded-full bg-orange-500" /> Choisis la suite ci-dessous !
      </span>
    );
  } else {
    status = playing ? (
      <span className="flex items-center gap-2 text-emerald-300">
        <Sparkles className="w-3.5 h-3.5" /> Suite de la scène
      </span>
    ) : (
      <span className="text-zinc-400">Extrait en pause</span>
    );
  }

  const mainLabel =
    phase === 'standby' ? 'Lancer l’extrait' : phase === 'setup_paused' ? 'Réécouter' : playing ? 'Pause' : 'Reprendre';
  const MainIcon = phase === 'setup_paused' ? RotateCcw : playing ? Pause : Play;

  return (
    <div className="flex flex-col gap-2" data-testid="quote-player" data-phase={phase} data-cut-at={pauseTime}>
      {/* Lecteur YouTube : visible en permanence, rien par-dessus. */}
      <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
        <div
          ref={hostRef}
          className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        />
      </div>

      {/* Commandes et état, sous le lecteur. */}
      <div className="flex items-center gap-3 px-1">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!ready || !!error}
          aria-label={mainLabel}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <MainIcon className="w-3.5 h-3.5" />
          {mainLabel}
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold truncate" aria-live="polite">
            {status}
          </div>
          <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
