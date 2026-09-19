'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameStatus } from '@/types/game';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { Eye, AlertTriangle, Play, RotateCcw } from 'lucide-react';

export interface YouTubePlayerRef {
  playSnippet: () => void;
  pauseSnippet: () => void;
  replaySnippet: () => void;
  playContinuation: (fromDuration: number, toDuration: number) => void;
  playFull: () => void;
  isReady: boolean;
}

interface Props {
  videoId: string;
  startTime: number;
  currentAttempt: number;
  gameStatus: GameStatus;
  onSnippetEnd?: () => void;
  onProgressUpdate?: (progress: number, elapsedSeconds: number) => void;
  onReady?: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onTogglePlay?: () => void;
  volume: number;
  isMuted: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, Props>(function YouTubePlayer(
  {
    videoId,
    startTime,
    currentAttempt,
    gameStatus,
    onSnippetEnd,
    onProgressUpdate,
    onReady,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [hasEverPlayed, setHasEverPlayed] = useState(false);

  // Reset standby screen and seek player whenever a new game or startTime is set
  useEffect(() => {
    if (gameStatus === 'ready') {
      setHasEverPlayed(false);
      if (playerRef.current && playerReady && typeof playerRef.current.seekTo === 'function') {
        try {
          playerRef.current.seekTo(startTime, true);
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
    }
  }, [videoId, startTime, gameStatus, playerReady]);

  // Sync external volume and mute changes to the player
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }
    } catch (e) {}
  }, [volume, isMuted]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimFrameRef = useRef<number | null>(null);
  const isCurrentlyPlayingRef = useRef<boolean>(false);

  isCurrentlyPlayingRef.current = isPlaying;

  const currentMaxDuration = ATTEMPT_DURATIONS[currentAttempt] ?? ATTEMPT_DURATIONS[0];
  const isGameOver = gameStatus === 'won' || gameStatus === 'lost';

  // Force disable all subtitles/captions
  const disableCaptions = useCallback((player: any) => {
    if (!player) return;
    try {
      if (typeof player.unloadModule === 'function') {
        player.unloadModule('captions');
        player.unloadModule('cc');
      }
      if (typeof player.setOption === 'function') {
        player.setOption('captions', 'track', {});
        player.setOption('captions', 'reload', false);
        player.setOption('cc', 'track', {});
      }
    } catch (e) {}
  }, []);

  // Stop playback and freeze on current frame (no rewind)
  const stopPlayback = useCallback((resetToStart = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressAnimFrameRef.current) {
      cancelAnimationFrame(progressAnimFrameRef.current);
      progressAnimFrameRef.current = null;
    }

    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        if (resetToStart) {
          playerRef.current.seekTo(startTime, true);
        }
      } catch (e) {
        console.warn('Error pausing player', e);
      }
    }

    setIsPlaying(false);
    onProgressUpdate?.(0, 0);
  }, [startTime, setIsPlaying, onProgressUpdate]);

  // Play snippet of current tier starting from startTime
  const playSnippet = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    setHasEverPlayed(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressAnimFrameRef.current) cancelAnimationFrame(progressAnimFrameRef.current);

    try {
      disableCaptions(playerRef.current);

      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }

      // Seek back to start of snippet
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
      setIsPlaying(true);

      const maxDuration = currentMaxDuration;
      let playbackStartTime: number | null = null;

      const checkProgress = () => {
        if (!playerRef.current) return;

        try {
          const state = playerRef.current.getPlayerState?.();
          // State 1 = PLAYING
          if (state === 1) {
            disableCaptions(playerRef.current);

            if (playbackStartTime === null) {
              playbackStartTime = performance.now();
            }

            const elapsedSec = (performance.now() - playbackStartTime) / 1000;
            const progress = Math.min(1, elapsedSec / maxDuration);
            onProgressUpdate?.(progress, elapsedSec);

            // Cut off strictly at the allocated duration and freeze frame
            if (elapsedSec >= maxDuration) {
              stopPlayback(false);
              onProgressUpdate?.(1, maxDuration);
              onSnippetEnd?.();
              return;
            }
          }
        } catch (err) {
          console.error(err);
        }

        progressAnimFrameRef.current = requestAnimationFrame(checkProgress);
      };

      progressAnimFrameRef.current = requestAnimationFrame(checkProgress);

      // Fallback safety timeout (tight cutoff to guarantee stop)
      const safetyTimeoutMs = Math.ceil(maxDuration * 1000 + 350);
      timerRef.current = setTimeout(() => {
        stopPlayback(false);
        onProgressUpdate?.(1, maxDuration);
        onSnippetEnd?.();
      }, safetyTimeoutMs);
    } catch (err) {
      console.error('Failed to play video snippet:', err);
    }
  }, [playerReady, startTime, currentMaxDuration, setIsPlaying, onProgressUpdate, onSnippetEnd, stopPlayback, disableCaptions, isMuted, volume]);

  // Play full video continuously when game ends
  const playFull = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressAnimFrameRef.current) cancelAnimationFrame(progressAnimFrameRef.current);

    try {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
  }, [playerReady, startTime, setIsPlaying]);

  const pauseSnippet = useCallback(() => {
    stopPlayback(false);
  }, [stopPlayback]);

  const replaySnippet = useCallback(() => {
    stopPlayback(true);
    setTimeout(() => {
      playSnippet();
    }, 50);
  }, [stopPlayback, playSnippet]);

  // Play only the extra incremental seconds granted by skipping/advancing
  const playContinuation = useCallback(
    (fromDuration: number, toDuration: number) => {
      if (!playerRef.current || !playerReady) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressAnimFrameRef.current) cancelAnimationFrame(progressAnimFrameRef.current);

      const actualFrom = hasEverPlayed ? fromDuration : 0;
      const additionalDuration = Math.max(0.1, toDuration - actualFrom);

      setHasEverPlayed(true);

      try {
        disableCaptions(playerRef.current);

        if (isMuted) {
          playerRef.current.mute?.();
        } else {
          playerRef.current.unMute?.();
          playerRef.current.setVolume?.(volume);
        }

        // If never played yet, seek to startTime; otherwise simply resume playing from current frozen frame
        if (!hasEverPlayed) {
          playerRef.current.seekTo(startTime, true);
        }

        playerRef.current.playVideo();
        setIsPlaying(true);

        let playbackStartTime: number | null = null;

        const checkProgress = () => {
          if (!playerRef.current) return;

          try {
            const state = playerRef.current.getPlayerState?.();
            // State 1 = PLAYING
            if (state === 1) {
              disableCaptions(playerRef.current);

              if (playbackStartTime === null) {
                playbackStartTime = performance.now();
              }

              const elapsedSec = (performance.now() - playbackStartTime) / 1000;
              const totalElapsedInTier = actualFrom + Math.min(additionalDuration, elapsedSec);
              const progress = Math.min(1, totalElapsedInTier / toDuration);
              onProgressUpdate?.(progress, totalElapsedInTier);

              // Freeze immediately when the additional seconds have elapsed
              if (elapsedSec >= additionalDuration) {
                stopPlayback(false);
                onProgressUpdate?.(1, toDuration);
                onSnippetEnd?.();
                return;
              }
            }
          } catch (err) {
            console.error(err);
          }

          progressAnimFrameRef.current = requestAnimationFrame(checkProgress);
        };

        progressAnimFrameRef.current = requestAnimationFrame(checkProgress);

        // Safety timeout strictly based on additionalDuration + small margin
        const safetyTimeoutMs = Math.ceil(additionalDuration * 1000 + 350);
        timerRef.current = setTimeout(() => {
          stopPlayback(false);
          onProgressUpdate?.(1, toDuration);
          onSnippetEnd?.();
        }, safetyTimeoutMs);
      } catch (err) {
        console.error('Failed to play continuation snippet:', err);
      }
    },
    [
      playerReady,
      startTime,
      hasEverPlayed,
      isMuted,
      volume,
      disableCaptions,
      stopPlayback,
      onProgressUpdate,
      onSnippetEnd,
      setIsPlaying,
    ]
  );

  useImperativeHandle(
    ref,
    () => ({
      playSnippet,
      pauseSnippet,
      replaySnippet,
      playContinuation,
      playFull,
      isReady: playerReady,
    }),
    [playSnippet, pauseSnippet, replaySnippet, playContinuation, playFull, playerReady]
  );

  // Load YouTube IFrame API
  useEffect(() => {
    const loadAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
      loadAPI();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressAnimFrameRef.current) cancelAnimationFrame(progressAnimFrameRef.current);
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId]);

  // Initialize YT.Player
  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT) return;

    if (playerRef.current?.destroy) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
    }

    setPlayerReady(false);
    setHasError(false);

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: gameStatus === 'won' || gameStatus === 'lost' ? 1 : 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          cc_load_policy: 0,
          cc_lang_pref: 'off',
          iv_load_policy: 3, // Disables annotations & video end cards
          hl: 'fr',
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true);
            disableCaptions(event.target);
            try {
              event.target.seekTo(startTime, true);
              event.target.pauseVideo();
            } catch (e) {}
            onReady?.();
          },
          onStateChange: (event: any) => {
            disableCaptions(event.target);
            if (event.data === 0) {
              stopPlayback(false);
            }
          },
          onError: (event: any) => {
            console.error('YouTube Player Error:', event.data);
            setHasError(true);
            setDebugInfo(`Code d'erreur lecteur YouTube: ${event.data}`);
          },
        },
      });
    } catch (e: any) {
      console.error('Failed to create YT.Player instance', e);
      setHasError(true);
    }
  }, [videoId, startTime, gameStatus, onReady, stopPlayback, disableCaptions]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl transition-all select-none group">
      {/* 
        Anti-cheat Framing:
        Scale 1.32 with -2.8% vertical translation pushes:
        - The top ~68px (title bar, channel avatar, share, watch later)
        - The bottom ~52px (suggestions drawer, subtitles, watermark)
        outside of the overflow:hidden container.
        pointer-events-none prevents hovering and native YouTube overlays.
      */}
      <div
        className={`w-full h-full relative overflow-hidden transition-all duration-500 ease-out ${
          isGameOver
            ? 'scale-100 translate-y-0 pointer-events-auto'
            : 'scale-[1.32] -translate-y-[2.8%] pointer-events-none select-none'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* 
        Sleek Standby Screen before the user plays the snippet for the first time:
        Eliminates the initial YouTube poster with the ugly unclickable play button and title!
      */}
      {!hasEverPlayed && !isGameOver && (
        <div
          onClick={playSnippet}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-md cursor-pointer transition-all hover:bg-zinc-950/75 group"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 group-hover:scale-110 transition-transform mb-3">
            <Play className="w-7 h-7 fill-white ml-1" />
          </div>
          <span className="text-sm font-bold tracking-wide text-zinc-100 group-hover:text-orange-400 transition-colors">
            Lancer l'extrait ({currentMaxDuration}s)
          </span>
          <span className="text-xs text-zinc-400 mt-1 font-mono">
            Cliquer ici ou appuyer sur [Espace]
          </span>
        </div>
      )}

      {/* Video Interactions when frozen (Tap to replay) */}
      {!isGameOver && hasEverPlayed && (
        <>
          {/* Tap video to replay when frozen */}
          {!isPlaying && (
            <div
              onClick={playSnippet}
              className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center pointer-events-auto"
              title="Cliquer pour rejouer l'extrait"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-zinc-200 shadow-xl flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-semibold">Rejouer ({currentMaxDuration}s)</span>
              </div>
            </div>
          )}

          {/* Bottom gradient guard ensuring suggestions / subtitles never leak */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Unlocked Full Video Banner */}
      {isGameOver && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/40 text-xs font-semibold text-white shadow-lg">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lecteur complet débloqué</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {hasError && (
        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertTriangle className="w-10 h-10 text-red-400 mb-2" />
          <h4 className="text-red-200 font-semibold text-base mb-1">
            Impossible de charger cette vidéo
          </h4>
          <p className="text-red-300 text-xs mb-3">
            {debugInfo || "Problème d'intégration YouTube IFrame"}
          </p>
        </div>
      )}
    </div>
  );
});
