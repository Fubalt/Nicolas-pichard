'use client';

import { useEffect, useRef, useState } from 'react';
import { ClipEngine, type EngineCallbacks, type PlayerErrorKind } from './engine';

interface UsePlayerOptions extends EngineCallbacks {
  videoId: string;
  /** Position où le lecteur est garé (cue) en attendant la lecture. */
  parkAt: number;
  volume: number;
  muted: boolean;
}

/**
 * Un lecteur unique par composant monté : la vidéo change par cueVideoById,
 * sans recréer l'iframe (latence plus faible, cf. docs/YOUTUBE_CONSTRAINTS.md §6).
 */
export function usePlayer(opts: UsePlayerOptions) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ClipEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ kind: PlayerErrorKind; code: number } | null>(null);

  const cbRef = useRef(opts);
  useEffect(() => {
    cbRef.current = opts;
  });

  // Nouvelle vidéo : on remet l'état d'affichage à zéro pendant le rendu.
  const clipKey = `${opts.videoId}@${opts.parkAt}`;
  const [shownKey, setShownKey] = useState(clipKey);
  if (shownKey !== clipKey) {
    setShownKey(clipKey);
    setError(null);
    setProgress(0);
  }

  // Création unique du lecteur.
  useEffect(() => {
    if (!hostRef.current) return;
    const { videoId, parkAt } = cbRef.current;
    const engine = new ClipEngine(hostRef.current, videoId, parkAt, {
      onReady: () => {
        setReady(true);
        engine.setVolume(cbRef.current.volume, cbRef.current.muted);
        cbRef.current.onReady?.();
      },
      onPlayingChange: (p) => {
        setPlaying(p);
        cbRef.current.onPlayingChange?.(p);
      },
      onProgress: (r) => {
        setProgress(r);
        cbRef.current.onProgress?.(r);
      },
      onError: (kind, code) => {
        setError({ kind, code });
        cbRef.current.onError?.(kind, code);
      },
      onUnsolicitedPlay: () => cbRef.current.onUnsolicitedPlay?.(),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Changement de vidéo ou de point de départ : on réutilise le lecteur.
  useEffect(() => {
    engineRef.current?.cue(opts.videoId, opts.parkAt);
  }, [opts.videoId, opts.parkAt]);

  useEffect(() => {
    engineRef.current?.setVolume(opts.volume, opts.muted);
  }, [opts.volume, opts.muted]);

  return { hostRef, engineRef, ready, playing, progress, error };
}
