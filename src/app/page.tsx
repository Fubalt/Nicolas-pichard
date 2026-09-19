'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoItem, GameStatus, GuessResult, GameMode } from '@/types/game';
import { CYPRIEN_ALL_VIDEOS, CYPRIEN_CLASSIC_VIDEOS, getRandomGameVideo } from '@/data/videos';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { normalizeTitle, matchesSearch, cleanDisplayTitle } from '@/lib/utils';
import { YouTubePlayer, YouTubePlayerRef } from '@/components/YouTubePlayer';
import { TimelineProgressBar } from '@/components/TimelineProgressBar';
import { GuessHistory } from '@/components/GuessHistory';
import { GuessInput } from '@/components/GuessInput';
import { ActionControls } from '@/components/ActionControls';
import { EndGameCard } from '@/components/EndGameCard';
import { Header } from '@/components/Header';
import { RulesModal } from '@/components/RulesModal';
import { Music, Volume2, Sparkles, Trophy, History } from 'lucide-react';

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('all');
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

  const playerRef = useRef<YouTubePlayerRef>(null);

  const currentCatalog = gameMode === 'classic' ? CYPRIEN_CLASSIC_VIDEOS : CYPRIEN_ALL_VIDEOS;

  const startNewGame = useCallback((targetMode?: GameMode) => {
    if (playerRef.current) {
      playerRef.current.pauseSnippet();
    }
    const mode = targetMode ?? gameMode;
    const { video, startTime: newStartTime } = getRandomGameVideo({ mode });
    setCurrentVideo(video);
    setStartTime(newStartTime);
    setCurrentAttempt(0);
    setGameStatus('ready');
    setGuesses([]);
    setIsPlaying(false);
    setSnippetProgress(0);
    setSnippetElapsed(0);
  }, [gameMode]);

  // Initialize game on mount and restore saved mode if any
  useEffect(() => {
    let initialMode: GameMode = 'all';
    try {
      const saved = localStorage.getItem('nicolas_pichard_game_mode') as GameMode;
      if (saved === 'all' || saved === 'classic') {
        initialMode = saved;
        setGameMode(saved);
      }
    } catch (e) {}
    startNewGame(initialMode);
  }, []);

  const handleSelectMode = (newMode: GameMode) => {
    if (newMode === gameMode) return;
    setGameMode(newMode);
    try {
      localStorage.setItem('nicolas_pichard_game_mode', newMode);
    } catch (e) {}
    startNewGame(newMode);
  };

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
      const nextAttempt = currentAttempt + 1;
      const nextDuration = ATTEMPT_DURATIONS[nextAttempt];
      setCurrentAttempt(nextAttempt);
      setTimeout(() => {
        playerRef.current?.playContinuation(currentDuration, nextDuration);
      }, 50);
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
        const nextAttempt = currentAttempt + 1;
        const nextDuration = ATTEMPT_DURATIONS[nextAttempt];
        setCurrentAttempt(nextAttempt);
        setTimeout(() => {
          playerRef.current?.playContinuation(currentDuration, nextDuration);
        }, 50);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={() => startNewGame()}
        totalVideos={currentCatalog.length}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Game Mode Selector */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-2xl flex items-center gap-1 w-full shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleSelectMode('all')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all select-none cursor-pointer ${
                gameMode === 'all'
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${gameMode === 'all' ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span>Toutes les époques ({CYPRIEN_ALL_VIDEOS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('classic')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all select-none cursor-pointer ${
                gameMode === 'classic'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/40 border border-orange-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <History className={`w-3.5 h-3.5 ${gameMode === 'classic' ? 'text-amber-200' : 'text-zinc-500'}`} />
              <span>Classique ≤ 2016 ({CYPRIEN_CLASSIC_VIDEOS.length})</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 font-medium text-center">
            {gameMode === 'classic'
              ? '📼 Époque culte : du « DESSIN » (déc. 2016) au « McDonald\'s » (2010)'
              : '🌟 Catalogue complet : toutes les vidéos de 2010 à aujourd\'hui'}
          </p>
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
              catalog={currentCatalog}
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
              gameMode={gameMode}
              onPlayAgain={() => startNewGame()}
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
