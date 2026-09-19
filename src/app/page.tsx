'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoItem, GameStatus, GuessResult } from '@/types/game';
import { CYPRIEN_VIDEOS, getRandomGameVideo } from '@/data/videos';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { normalizeTitle, matchesSearch, cleanDisplayTitle, formatTimecode } from '@/lib/utils';
import { YouTubePlayer, YouTubePlayerRef } from '@/components/YouTubePlayer';
import { TimelineProgressBar } from '@/components/TimelineProgressBar';
import { GuessHistory } from '@/components/GuessHistory';
import { GuessInput } from '@/components/GuessInput';
import { ActionControls } from '@/components/ActionControls';
import { EndGameCard } from '@/components/EndGameCard';
import { Header } from '@/components/Header';
import { RulesModal } from '@/components/RulesModal';
import { Music, Volume2, Sparkles, Trophy, FlaskConical, Clock, RotateCcw } from 'lucide-react';

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [startTime, setStartTime] = useState<number>(10);
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [snippetProgress, setSnippetProgress] = useState<number>(0);
  const [snippetElapsed, setSnippetElapsed] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFixedVideoMode, setIsFixedVideoMode] = useState<boolean>(true);

  const playerRef = useRef<YouTubePlayerRef>(null);

  // Initialize first game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = useCallback((overrideFixed?: boolean) => {
    if (playerRef.current) {
      playerRef.current.pauseSnippet();
    }
    const useFixed = overrideFixed !== undefined ? overrideFixed : isFixedVideoMode;
    const { video, startTime: newStartTime } = getRandomGameVideo({
      forceSameVideo: useFixed,
    });
    setCurrentVideo(video);
    setStartTime(newStartTime);
    setCurrentAttempt(0);
    setGameStatus('ready');
    setGuesses([]);
    setIsPlaying(false);
    setSnippetProgress(0);
    setSnippetElapsed(0);
  }, [isFixedVideoMode]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      if (volume === 0) setVolume(60);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameStatus, playerReady]);

  const handleTogglePlay = () => {
    if (!playerRef.current || !currentVideo) return;
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    if (isPlaying) {
      playerRef.current.pauseSnippet();
    } else {
      setGameStatus('playing');
      playerRef.current.playSnippet();
    }
  };

  const handleSkip = () => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    if (playerRef.current && isPlaying) {
      playerRef.current.pauseSnippet();
    }

    const currentDuration = ATTEMPT_DURATIONS[currentAttempt];
    const newGuesses: GuessResult[] = [
      ...guesses,
      {
        attemptIndex: currentAttempt,
        type: 'skipped',
        tierDuration: currentDuration,
      },
    ];
    setGuesses(newGuesses);

    if (currentAttempt + 1 >= 4) {
      // Defeat
      setGameStatus('lost');
    } else {
      setCurrentAttempt((prev) => prev + 1);
    }
  };

  const handleGuess = (guessedTitle: string) => {
    if (!currentVideo || gameStatus === 'won' || gameStatus === 'lost') return;
    if (playerRef.current && isPlaying) {
      playerRef.current.pauseSnippet();
    }

    const normGuess = normalizeTitle(guessedTitle);
    const normTarget = normalizeTitle(currentVideo.title);

    const isCorrect =
      matchesSearch(currentVideo.title, guessedTitle) ||
      matchesSearch(guessedTitle, currentVideo.title) ||
      normGuess === normTarget ||
      (normGuess.length >= 4 && normTarget.includes(normGuess)) ||
      (normTarget.length >= 4 && normGuess.includes(normTarget));

    const currentDuration = ATTEMPT_DURATIONS[currentAttempt];

    if (isCorrect) {
      // Victory!
      const newGuesses: GuessResult[] = [
        ...guesses,
        {
          attemptIndex: currentAttempt,
          type: 'success',
          guessedTitle,
          tierDuration: currentDuration,
        },
      ];
      setGuesses(newGuesses);
      setGameStatus('won');
    } else {
      // Incorrect
      const newGuesses: GuessResult[] = [
        ...guesses,
        {
          attemptIndex: currentAttempt,
          type: 'incorrect',
          guessedTitle,
          tierDuration: currentDuration,
        },
      ];
      setGuesses(newGuesses);

      if (currentAttempt + 1 >= 4) {
        // Lost after 4 attempts
        setGameStatus('lost');
      } else {
        setCurrentAttempt((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={() => startNewGame()}
        totalVideos={CYPRIEN_VIDEOS.length}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Test Mode Card: Timecode Verification */}
        <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/40 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                Mode Test
              </span>
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFixedVideoMode}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsFixedVideoMode(checked);
                    startNewGame(checked);
                  }}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500/30 w-4 h-4 bg-zinc-800 cursor-pointer accent-amber-500"
                />
                <span className="font-medium">Même vidéo pour tester les timecodes</span>
              </label>
            </div>

            <button
              onClick={() => startNewGame()}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold group cursor-pointer"
              title="Générer un nouveau timecode aléatoire pour cette vidéo"
            >
              <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform" />
              Nouveau timecode
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono bg-black/50 px-3 py-2 rounded-xl border border-zinc-800/80 text-zinc-300 flex-wrap gap-2">
            <div className="truncate max-w-[280px] sm:max-w-none text-zinc-400">
              Vidéo : <span className="text-zinc-100 font-sans font-medium">{currentVideo?.title}</span>
            </div>
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timecode départ : {formatTimecode(startTime)} ({startTime}s / {currentVideo?.durationInSeconds}s)</span>
            </div>
          </div>
        </div>

        {/* Video Player (Visible 16:9 snippet player with freeze frame) */}
        {currentVideo && (
          <YouTubePlayer
            ref={playerRef}
            videoId={currentVideo.id}
            startTime={startTime}
            currentAttempt={currentAttempt}
            gameStatus={gameStatus}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            volume={volume}
            isMuted={isMuted}
            onTogglePlay={handleTogglePlay}
            onReady={() => setPlayerReady(true)}
            onProgressUpdate={(prog, elapsed) => {
              setSnippetProgress(prog);
              setSnippetElapsed(elapsed);
            }}
            onSnippetEnd={() => {
              setIsPlaying(false);
            }}
          />
        )}

        {/* Timeline Progress Bar with External Volume Control */}
        <TimelineProgressBar
          currentAttempt={currentAttempt}
          currentSnippetProgress={snippetProgress}
          currentElapsed={snippetElapsed}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
        />

        {/* Guess History (4 tiers) */}
        <GuessHistory
          guesses={guesses}
          currentAttempt={currentAttempt}
          gameStatus={gameStatus}
        />

        {/* In-Game Controls (Play, Skip, Guess Input) */}
        {gameStatus !== 'won' && gameStatus !== 'lost' ? (
          <div className="flex flex-col gap-4 mt-2">
            <ActionControls
              currentAttempt={currentAttempt}
              gameStatus={gameStatus}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onSkip={handleSkip}
              disabled={!playerReady}
            />

            <GuessInput
              catalog={CYPRIEN_VIDEOS}
              onGuess={handleGuess}
              disabled={!playerReady}
              placeholder="Tape le nom d'une vidéo (ex: Technophobe, Les geeks...)"
            />

            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
              <span>Astuce : [Espace] pour Lancer / Pause</span>
              <span>Micro-extraits calibrés</span>
            </div>
          </div>
        ) : (
          /* End Game Card (Victory / Defeat) */
          currentVideo && (
            <EndGameCard
              video={currentVideo}
              startTime={startTime}
              gameStatus={gameStatus}
              guesses={guesses}
              onPlayAgain={startNewGame}
              onPlayFullVideo={() => playerRef.current?.playFull()}
            />
          )
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Footer */}
      <footer className="w-full py-4 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <p>Nicolas Pichard</p>
      </footer>
    </div>
  );
}
