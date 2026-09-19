'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameStatus } from '@/types/game';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { Volume2, VolumeX, Eye, AlertTriangle } from 'lucide-react';

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
        YouTube IFrame Player with subtle cinematic crop (1.20x):
        Pushes YouTube's top title bar (~48px) and pause "More videos" shelf
        cleanly outside the overflow:hidden container.
        The video remains clear, natural, and free of any intrusive YouTube branding.
        When game is won/lost, transitions smoothly back to 1.0x with native controls unlocked.
      */}
      <div
        className={`w-full h-full relative overflow-hidden transition-all duration-500 ease-out ${
          isGameOver
            ? 'scale-100 translate-y-0 pointer-events-auto'
            : 'scale-[1.20] -translate-y-[1.5%] pointer-events-none select-none'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Floating Status Pill & Controls */}
      {!isGameOver && (
        <>
          <div className="absolute top-3 left-3 pointer-events-none z-20 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-zinc-200 shadow-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-red-500 animate-pulse' : 'bg-orange-400'
                }`}
              />
              <span>{isPlaying ? 'Lecture...' : 'Arrêt sur image'}</span>
              <span className="text-zinc-500 font-mono hidden sm:inline">
                • {currentMaxDuration}s
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-zinc-300 hover:text-white transition-colors border border-white/10 shadow-lg z-20 pointer-events-auto"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Minimalist bottom guard to guarantee suggestions never flash */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
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
