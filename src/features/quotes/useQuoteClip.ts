'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/features/player/usePlayer';
import type { PlayerErrorKind } from '@/features/player/engine';

export type QuoteClipPhase = 'standby' | 'setup_playing' | 'setup_paused' | 'revealing';

export const QUOTE_ERROR_TEXT: Record<PlayerErrorKind, string> = {
  invalid: 'Extrait invalide.',
  html5: 'Le lecteur a rencontré un problème.',
  unavailable: 'Cette vidéo n’est plus disponible.',
  embed_blocked: 'Cette vidéo ne peut pas être lue ici.',
  unknown: 'Le lecteur YouTube n’a pas pu se charger.',
};

export interface QuoteClipOptions {
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

/**
 * Logique du lecteur des Répliques, sans interface (option A, docs/YOUTUBE_CONSTRAINTS.md §4).
 * La coupure se fait sur le temps vidéo, exactement à `pauseTime`.
 */
export function useQuoteClip({
  videoId,
  startTime,
  pauseTime,
  resumeDuration,
  volume,
  isMuted,
  onPauseReached,
  onRevealFinished,
  onReady,
}: QuoteClipOptions) {
  // L'amorce dure au moins 3,8 s (comportement existant conservé).
  const setupStart = Math.max(0, pauseTime - Math.max(3.8, pauseTime - startTime));
  const setupDuration = pauseTime - setupStart;
  const revealDuration = Math.max(2.5, resumeDuration);

  const [phase, setPhase] = useState<QuoteClipPhase>('standby');
  const phaseRef = useRef<QuoteClipPhase>('standby');
  const setPhaseBoth = (p: QuoteClipPhase) => {
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

  return {
    hostRef,
    phase,
    ready,
    playing,
    progress,
    error,
    playSetup,
    replaySetup: playSetup,
    replayFullScene,
    revealPunchline,
    pause,
    resume,
    togglePlay,
  };
}
