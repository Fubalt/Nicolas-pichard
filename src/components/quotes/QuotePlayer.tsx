'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Play, RotateCcw, Pause, Sparkles, Volume2, VolumeX } from 'lucide-react';

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

  // Runtime guarantee: setup always has at least 3.8s breathing room
  const effectiveStartTime = Math.max(0, pauseTime - Math.max(3.8, pauseTime - startTime));

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [centerIcon, setCenterIcon] = useState<'play' | 'pause' | 'replay' | null>(null);

  // Playback state tracking
  // 'standby': initial state, paused at startTime, waiting for user
  // 'setup_playing': playing the setup clip
  // 'setup_paused': paused after setup clip (or paused by user)
  // 'revealing': playing the punchline continuation continuously
  // 'reveal_finished': reveal initial segment finished
  const [phase, setPhase] = useState<
    'standby' | 'setup_playing' | 'setup_paused' | 'revealing' | 'reveal_finished'
  >('standby');

  const userHasClickedPlayRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iconTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track playback time elapsed within current segment
  const elapsedPlayTimeRef = useRef<number>(0);
  const lastTimeCheckRef = useRef<number>(0);
  const targetDurationRef = useRef<number>(3.8);
  const currentModeRef = useRef<'setup' | 'reveal'>('setup');

  const showCenterIconFeedback = (icon: 'play' | 'pause' | 'replay') => {
    if (iconTimerRef.current) clearTimeout(iconTimerRef.current);
    setCenterIcon(icon);
    iconTimerRef.current = setTimeout(() => {
      setCenterIcon(null);
    }, 600);
  };

  const clearTimers = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  };

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

  // Disable subtitles / captions aggressively
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

  // Internal monitoring loop using performance.now() and getCurrentTime() while video is PLAYING
  const startMonitoring = useCallback(
    (mode: 'setup' | 'reveal', duration: number, onComplete: () => void) => {
      clearTimers();
      currentModeRef.current = mode;
      targetDurationRef.current = duration;
      lastTimeCheckRef.current = performance.now();
      let hasCompleted = false;

      const loop = () => {
        if (!playerRef.current) return;

        try {
          const state = playerRef.current.getPlayerState?.();
          // State 1 = PLAYING
          if (state === 1) {
            disableCaptions(playerRef.current);
            const now = performance.now();
            const deltaSec = (now - lastTimeCheckRef.current) / 1000;
            lastTimeCheckRef.current = now;

            elapsedPlayTimeRef.current += deltaSec;
            const currentRatio = Math.min(1, elapsedPlayTimeRef.current / targetDurationRef.current);
            setProgress(currentRatio);

            const currentSec = playerRef.current.getCurrentTime?.() ?? 0;

            if (mode === 'setup') {
              // Cut condition for setup:
              // Strictly cut when the actual video timestamp reaches pauseTime + 0.12s
              // The +0.12s buffer gives the speaker breathing room so the final word is never cut off
              const reachedPauseTimestamp =
                currentSec >= effectiveStartTime &&
                currentSec >= pauseTime + 0.12;

              if (reachedPauseTimestamp) {
                try {
                  playerRef.current.pauseVideo();
                } catch (e) {}
                setIsPlaying(false);
                setProgress(1);
                clearTimers();
                onComplete();
                return;
              }
            } else if (mode === 'reveal') {
              // In reveal mode: DO NOT PAUSE THE VIDEO!
              // The video continues playing the scene seamlessly.
              if (elapsedPlayTimeRef.current >= targetDurationRef.current) {
                setProgress(1);
                if (!hasCompleted) {
                  hasCompleted = true;
                  onComplete();
                }
              }
            }
          } else {
            // Video is buffering or paused, keep clock aligned
            lastTimeCheckRef.current = performance.now();
          }
        } catch (e) {}

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);

      // Safety timeout: strictly for setup mode fallback if anim loop stalls (e.g. background tab)
      if (mode === 'setup') {
        const safetyMs = Math.ceil((duration + 3.5) * 1000);
        safetyTimeoutRef.current = setTimeout(() => {
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            try {
              playerRef.current.pauseVideo();
            } catch (e) {}
          }
          setIsPlaying(false);
          setProgress(1);
          clearTimers();
          onComplete();
        }, safetyMs);
      }
    },
    [effectiveStartTime, pauseTime, disableCaptions]
  );

  // Play initial setup snippet from effectiveStartTime
  const playSetup = useCallback(() => {
    if (!playerRef.current) return;
    userHasClickedPlayRef.current = true;
    setHasStarted(true);
    setPhase('setup_playing');
    setIsPlaying(true);
    showCenterIconFeedback('play');

    const duration = Math.max(3.8, pauseTime - effectiveStartTime);
    elapsedPlayTimeRef.current = 0;
    setProgress(0);

    try {
      disableCaptions(playerRef.current);
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }
      playerRef.current.seekTo(effectiveStartTime, true);
      playerRef.current.playVideo();

      startMonitoring('setup', duration, () => {
        setPhase('setup_paused');
        onPauseReached();
      });
    } catch (e) {}
  }, [effectiveStartTime, pauseTime, volume, isMuted, disableCaptions, startMonitoring, onPauseReached]);

  // Replay the setup snippet from the start
  const replaySetup = useCallback(() => {
    playSetup();
  }, [playSetup]);

  // Resume setup snippet if paused mid-playback
  const resumeSetup = useCallback(() => {
    if (!playerRef.current) return;
    userHasClickedPlayRef.current = true;
    setPhase('setup_playing');
    setIsPlaying(true);
    showCenterIconFeedback('play');

    try {
      disableCaptions(playerRef.current);
      playerRef.current.playVideo();

      startMonitoring('setup', targetDurationRef.current, () => {
        setPhase('setup_paused');
        onPauseReached();
      });
    } catch (e) {}
  }, [disableCaptions, startMonitoring, onPauseReached]);

  // Reveal the punchline and continue playing the scene continuously!
  const revealPunchline = useCallback(() => {
    if (!playerRef.current) return;
    userHasClickedPlayRef.current = true;
    setPhase('revealing');
    setIsPlaying(true);
    showCenterIconFeedback('play');

    const duration = Math.max(2.5, resumeDuration);
    elapsedPlayTimeRef.current = 0;
    setProgress(0);

    try {
      disableCaptions(playerRef.current);
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }
      playerRef.current.seekTo(pauseTime, true);
      playerRef.current.playVideo();

      startMonitoring('reveal', duration, () => {
        onRevealFinished();
      });
    } catch (e) {}
  }, [pauseTime, resumeDuration, volume, isMuted, disableCaptions, startMonitoring, onRevealFinished]);

  // Replay from the beginning of the setup phrase and keep playing continuously through the punchline
  const replayFullScene = useCallback(() => {
    if (!playerRef.current) return;
    userHasClickedPlayRef.current = true;
    setPhase('revealing');
    setIsPlaying(true);
    showCenterIconFeedback('play');

    const totalDuration = Math.max(3.8, pauseTime - effectiveStartTime) + Math.max(2.5, resumeDuration);
    elapsedPlayTimeRef.current = 0;
    setProgress(0);

    try {
      disableCaptions(playerRef.current);
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }
      playerRef.current.seekTo(effectiveStartTime, true);
      playerRef.current.playVideo();

      startMonitoring('reveal', totalDuration, () => {
        onRevealFinished();
      });
    } catch (e) {}
  }, [effectiveStartTime, pauseTime, resumeDuration, volume, isMuted, disableCaptions, startMonitoring, onRevealFinished]);

  // Replay punchline reveal
  const replayReveal = useCallback(() => {
    revealPunchline();
  }, [revealPunchline]);

  // Pause whatever is currently playing
  const pause = useCallback(() => {
    clearTimers();
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
      } catch (e) {}
    }
    setIsPlaying(false);
    showCenterIconFeedback('pause');
  }, []);

  // Universal Toggle Play / Pause / Replay on click or Space
  const togglePlay = useCallback(() => {
    if (phase === 'standby') {
      playSetup();
      return;
    }

    if (phase === 'setup_playing') {
      pause();
      return;
    }

    if (phase === 'setup_paused') {
      // Replay the setup clip
      replaySetup();
      return;
    }

    if (phase === 'revealing' || phase === 'reveal_finished') {
      if (isPlaying) {
        pause();
      } else {
        // Resume continuous playback
        if (playerRef.current) {
          try {
            const currentSec = playerRef.current.getCurrentTime?.() ?? 0;
            const dur = playerRef.current.getDuration?.() ?? 0;
            if (dur > 0 && currentSec >= dur - 0.5) {
              playerRef.current.seekTo(pauseTime, true);
            }
            playerRef.current.playVideo();
            setIsPlaying(true);
            showCenterIconFeedback('play');
          } catch (e) {}
        }
      }
      return;
    }
  }, [phase, isPlaying, playSetup, pause, replaySetup, pauseTime]);

  useImperativeHandle(ref, () => ({
    playSetup,
    replaySetup,
    replayFullScene,
    revealPunchline,
    pause,
    resume: resumeSetup,
    togglePlay,
    isPlaying,
  }));

  // Initialize YouTube Player
  useEffect(() => {
    let isCancelled = false;
    clearTimers();
    userHasClickedPlayRef.current = false;
    setIsPlaying(false);
    setHasStarted(false);
    setPhase('standby');
    setProgress(0);

    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      // Clean container
      containerRef.current.innerHTML = '';
      const iframeDiv = document.createElement('div');
      iframeDiv.id = `quote-yt-player-${Math.random().toString(36).substring(2, 9)}`;
      iframeDiv.style.width = '100%';
      iframeDiv.style.height = '100%';
      containerRef.current.appendChild(iframeDiv);

      playerRef.current = new window.YT.Player(iframeDiv.id, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          cc_lang_pref: 'off',
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
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

              // Pre-cue video parked at effectiveStartTime. Strictly prevent autoplay.
              if (typeof event.target.cueVideoById === 'function') {
                event.target.cueVideoById({
                  videoId,
                  startSeconds: effectiveStartTime,
                });
              } else {
                event.target.seekTo(effectiveStartTime, false);
                event.target.pauseVideo();
              }
            } catch (e) {}

            onReady?.();
          },
          onStateChange: (event: any) => {
            if (isCancelled) return;

            // IRONCLAD AUTOPLAY PROTECTION:
            // If YouTube attempts to play before the user explicitly clicked play,
            // intercept immediately, force-pause and rewind to effectiveStartTime.
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!userHasClickedPlayRef.current) {
                try {
                  event.target.pauseVideo();
                  event.target.seekTo(effectiveStartTime, false);
                } catch (e) {}
                setIsPlaying(false);
                return;
              }
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
      clearTimers();
      if (iconTimerRef.current) clearTimeout(iconTimerRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId, effectiveStartTime, disableCaptions]);

  return (
    <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl select-none group">
      {/* 
        Responsive 16:9 YouTube Container:
        Forces the generated YouTube iframe to fill 100% width and 100% height,
        framing the video edge-to-edge with zero distortion or off-center shift.
      */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:border-0 pointer-events-none"
      />

      {/* 
        Transparent Clickable Overlay covering the entire video:
        Captures all user clicks to toggle play/pause or replay cleanly.
      */}
      <div
        onClick={togglePlay}
        className="absolute inset-0 z-10 cursor-pointer"
        title={isPlaying ? 'Mettre en pause [Espace]' : 'Lire / Rejouer [Espace]'}
      />

      {/* Sleek Standby Screen before user launches the first extract */}
      {!hasStarted && isReady && (
        <div
          onClick={playSetup}
          className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20 cursor-pointer transition-colors hover:bg-zinc-950/75 group"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-zinc-950 shadow-xl shadow-orange-950/60 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 fill-zinc-950 ml-1" />
          </div>
          <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
            Lancer l'extrait
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            Cliquer ici ou appuyer sur [Espace]
          </span>
        </div>
      )}

      {/* Floating Status Badge (Top Left) */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-950/85 border border-zinc-800 backdrop-blur-md text-[11px] font-bold text-zinc-300 flex items-center gap-2 z-20 pointer-events-none">
        {phase === 'setup_playing' && (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-medium">Écoute l'amorce...</span>
          </>
        )}
        {phase === 'setup_paused' && (
          <>
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-orange-400">Choisis la suite ci-dessous !</span>
          </>
        )}
        {(phase === 'revealing' || phase === 'reveal_finished') && (
          <>
            {isPlaying ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-medium">Extrait en cours de lecture...</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-zinc-400" />
                <span className="text-zinc-400 font-medium">Extrait en pause</span>
              </>
            )}
          </>
        )}
      </div>

      {/* Subtle Hover Replay Hint when paused */}
      {hasStarted && !isPlaying && phase === 'setup_paused' && (
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md z-20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <RotateCcw className="w-3 h-3 text-orange-400" />
          <span>Cliquer ou [Espace] pour réécouter</span>
        </div>
      )}
      {hasStarted && !isPlaying && (phase === 'revealing' || phase === 'reveal_finished') && (
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md z-20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          <span>Cliquer ou [Espace] pour reprendre</span>
        </div>
      )}

      {/* Center Tactile Icon Pop Feedback on Play/Pause/Replay */}
      {centerIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none animate-in fade-in zoom-in-75 duration-200">
          <div className="w-14 h-14 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-2xl">
            {centerIcon === 'play' && <Play className="w-7 h-7 fill-white ml-0.5" />}
            {centerIcon === 'pause' && <Pause className="w-7 h-7 fill-white" />}
            {centerIcon === 'replay' && <RotateCcw className="w-7 h-7 text-orange-400" />}
          </div>
        </div>
      )}

      {/* Discrete Bottom Progress Bar during 3s extract or reveal */}
      {hasStarted && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/60 z-20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-75 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {/* Loading state indicator before player is ready */}
      {!isReady && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-2 z-30">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span className="text-[11px] text-zinc-500 font-medium">Chargement de la réplique...</span>
        </div>
      )}
    </div>
  );
});
