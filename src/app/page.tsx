'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoItem, GameStatus, GuessResult } from '@/types/game';
import { CYPRIEN_VIDEOS, getRandomGameVideo } from '@/data/videos';
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
import { AlertCircle, Music, Volume2, Sparkles, Trophy } from 'lucide-react';

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const playerRef = useRef<YouTubePlayerRef>(null);

  // Initialize first game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    const { video, startTime: newStartTime } = getRandomGameVideo();
    setCurrentVideo(video);
    setStartTime(newStartTime);
    setCurrentAttempt(0);
    setGameStatus('ready');
    setGuesses([]);
    setIsPlaying(false);
    setSnippetProgress(0);
    setSnippetElapsed(0);
    setFeedbackMessage(null);
  }, []);

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
      setFeedbackMessage('Dommage ! Découvre la vidéo ci-dessous.');
    } else {
      setCurrentAttempt((prev) => prev + 1);
      const nextDuration = ATTEMPT_DURATIONS[currentAttempt + 1];
      setFeedbackMessage(`Palier suivant débloqué : ${nextDuration}s`);
      setTimeout(() => setFeedbackMessage(null), 3000);
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
      setFeedbackMessage('🎉 Bravo ! C\'est la bonne vidéo !');
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
        setFeedbackMessage('Toutes tes chances sont épuisées !');
      } else {
        setCurrentAttempt((prev) => prev + 1);
        const nextDuration = ATTEMPT_DURATIONS[currentAttempt + 1];
        setFeedbackMessage(`Mauvaise réponse ! Palier ${nextDuration}s débloqué.`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={startNewGame}
        totalVideos={CYPRIEN_VIDEOS.length}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Temporary Feedback Toast / Notification */}
        {feedbackMessage && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
              gameStatus === 'won'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-orange-950/80 border-orange-500/50 text-orange-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-zinc-400 hover:text-zinc-200 text-xs font-mono ml-2"
            >
              ✕
            </button>
          </div>
        )}

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

        {/* Timeline Progress Bar */}
        <TimelineProgressBar
          currentAttempt={currentAttempt}
          currentSnippetProgress={snippetProgress}
          currentElapsed={snippetElapsed}
          isPlaying={isPlaying}
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
