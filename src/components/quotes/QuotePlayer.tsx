'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

export interface QuotePlayerRef {
  playSetup: () => void;
  replaySetup: () => void;
  revealPunchline: () => void;
  pause: () => void;
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

export const QuotePlayer = forwardRef<QuotePlayerRef, Props>(function QuotePlayer(
  {
    videoId,
    startTime,
    pauseTime,
    resumeDuration,
    volume,
    isMuted,
    onPauseReached,
    onRevealFinished,
    onReady,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const stateRef = useRef<'setup' | 'paused_for_answer' | 'revealing' | 'finished'>('setup');

  // Sync volume & mute with player
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

  // Disable subtitles / captions
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

  // Monitor playback for the pause cutoff or the reveal cutoff
  const startMonitoring = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const check = () => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') {
        animFrameRef.current = requestAnimationFrame(check);
        return;
      }

      try {
        const currentTime = playerRef.current.getCurrentTime();

        if (stateRef.current === 'setup' && currentTime >= pauseTime) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
          stateRef.current = 'paused_for_answer';
          onPauseReached();
          return;
        }

        if (stateRef.current === 'revealing' && currentTime >= pauseTime + resumeDuration) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
          stateRef.current = 'finished';
          onRevealFinished();
          return;
        }
      } catch (e) {}

      animFrameRef.current = requestAnimationFrame(check);
    };

    animFrameRef.current = requestAnimationFrame(check);
  }, [pauseTime, resumeDuration, onPauseReached, onRevealFinished]);

  const playSetup = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    stateRef.current = 'setup';
    disableCaptions(playerRef.current);
    try {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
      setHasStarted(true);
      startMonitoring();
    } catch (e) {}
  }, [startTime, isReady, disableCaptions, startMonitoring]);

  const replaySetup = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    stateRef.current = 'setup';
    disableCaptions(playerRef.current);
    try {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
      startMonitoring();
    } catch (e) {}
  }, [startTime, isReady, disableCaptions, startMonitoring]);

  const revealPunchline = useCallback(() => {
    if (!playerRef.current) return;
    stateRef.current = 'revealing';
    disableCaptions(playerRef.current);
    try {
      playerRef.current.seekTo(pauseTime, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
      startMonitoring();
    } catch (e) {}
  }, [pauseTime, disableCaptions, startMonitoring]);

  const pause = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
      } catch (e) {}
    }
    setIsPlaying(false);
  }, []);

  useImperativeHandle(ref, () => ({
    playSetup,
    replaySetup,
    revealPunchline,
    pause,
  }));

  // Initialize YouTube Player iframe
  useEffect(() => {
    let isCancelled = false;

    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      const iframeDiv = document.createElement('div');
      iframeDiv.id = `quote-yt-player-${Math.random().toString(36).substring(2, 9)}`;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframeDiv);

      playerRef.current = new window.YT.Player(iframeDiv.id, {
        videoId,
        playerVars: {
          start: startTime,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
        },
        events: {
          onReady: (event: any) => {
            if (isCancelled) return;
            setIsReady(true);
            disableCaptions(event.target);
            try {
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(volume);
              }
              event.target.seekTo(startTime, true);
            } catch (e) {}
            onReady?.();
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              disableCaptions(event.target);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevOnReady?.();
        if (!isCancelled) initPlayer();
      };
    }

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId, startTime, disableCaptions]);

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
      {/* YouTube iframe container */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-none select-none scale-[1.02]"
      />

      {/* Standby overlay before first launch */}
      {!hasStarted && isReady && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
          <button
            type="button"
            onClick={playSetup}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-zinc-950 flex items-center justify-center shadow-xl shadow-orange-950/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-8 h-8 fill-zinc-950 ml-1" />
          </button>
          <span className="text-xs font-bold text-zinc-300">
            Lancer l'extrait culte
          </span>
        </div>
      )}

      {/* Replay snippet button when paused for answer */}
      {hasStarted && !isPlaying && stateRef.current === 'paused_for_answer' && (
        <button
          type="button"
          onClick={replaySetup}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          <span>Réécouter l'amorce</span>
        </button>
      )}

      {/* Floating status tag */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-950/70 border border-zinc-800 backdrop-blur-md text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 z-20">
        {stateRef.current === 'setup' && isPlaying && (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Écoute la réplique...</span>
          </>
        )}
        {stateRef.current === 'paused_for_answer' && (
          <>
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-orange-400">À toi de compléter !</span>
          </>
        )}
        {stateRef.current === 'revealing' && (
          <>
            <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
            <span className="text-emerald-400">Révélation en vidéo !</span>
          </>
        )}
        {stateRef.current === 'finished' && (
          <span className="text-zinc-400">Extrait terminé</span>
        )}
      </div>
    </div>
  );
});
