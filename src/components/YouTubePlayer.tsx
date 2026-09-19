'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameStatus } from '@/types/game';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { Volume2, VolumeX, Eye, AlertTriangle, ShieldAlert, Lock } from 'lucide-react';

export interface YouTubePlayerRef {
  playSnippet: () => void;
  pauseSnippet: () => void;
  replaySnippet: () => void;
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
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

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

    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressAnimFrameRef.current) cancelAnimationFrame(progressAnimFrameRef.current);

    try {
      disableCaptions(playerRef.current);

      if (playerRef.current.isMuted?.()) {
        playerRef.current.unMute?.();
      }
      playerRef.current.setVolume?.(100);

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

      // Fallback safety timeout
      const safetyTimeoutMs = Math.max(150, maxDuration * 1000 + 400);
      timerRef.current = setTimeout(() => {
        if (isCurrentlyPlayingRef.current) {
          stopPlayback(false);
          onProgressUpdate?.(1, maxDuration);
          onSnippetEnd?.();
        }
      }, safetyTimeoutMs);
    } catch (err) {
      console.error('Failed to play video snippet:', err);
    }
  }, [playerReady, startTime, currentMaxDuration, setIsPlaying, onProgressUpdate, onSnippetEnd, stopPlayback, disableCaptions]);

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

  useImperativeHandle(
    ref,
    () => ({
      playSnippet,
      pauseSnippet,
      replaySnippet,
      playFull,
      isReady: playerReady,
    }),
    [playSnippet, pauseSnippet, replaySnippet, playFull, playerReady]
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
        host: 'https://www.youtube-nocookie.com',
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

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl transition-all select-none">
      {/* 
        YouTube IFrame Player:
        NO ZOOM! The video plays at 100% natural resolution and scale (scale-100).
        During gameplay, pointer-events are disabled so hovering never triggers YouTube UI overlays.
        When game is won/lost, pointer-events are enabled and native controls unlock.
      */}
      <div
        className={`w-full h-full relative ${
          isGameOver ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* 
        Clean Top HUD Bar (Replaces YouTube's top title bar without zooming the video):
        This bar covers the top ~48px where YouTube displays the title/avatar,
        providing an elegant in-game HUD instead of an artificial video crop.
      */}
      {!isGameOver && (
        <div className="absolute top-0 left-0 right-0 h-12 bg-zinc-950/95 border-b border-zinc-800/80 z-20 flex items-center justify-between px-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-red-500 animate-pulse' : 'bg-orange-400'
              }`}
            />
            <span className="text-xs font-semibold text-zinc-200">
              {isPlaying ? 'Lecture...' : 'Arrêt sur image'}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
              • Extrait {currentMaxDuration}s
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              <Lock className="w-3 h-3 text-orange-400" />
              <span>Titre masqué</span>
            </div>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800 pointer-events-auto shadow"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 
        Subtle Bottom Gradient Mask:
        Prevents YouTube's pause suggestions / "More videos" button from appearing at the bottom.
      */}
      {!isGameOver && (
        <div className="absolute bottom-0 left-0 right-0 h-9 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-20 pointer-events-none" />
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
