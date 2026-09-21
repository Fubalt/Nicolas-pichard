'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuoteQuestion, QuoteGameStatus, QuoteAnswerRecord } from '@/types/quotes';
import { getRandomQuotes } from '@/data/quotes';
import { QuotePlayer, QuotePlayerRef } from './QuotePlayer';
import { QuoteEndCard } from './QuoteEndCard';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Volume1,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ListFilter,
  Flame,
  Zap,
} from 'lucide-react';

interface Props {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onBackToBlindtest: () => void;
}

export function QuoteGameView({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onBackToBlindtest,
}: Props) {
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [questions, setQuestions] = useState<QuoteQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<QuoteGameStatus>('ready');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuoteAnswerRecord[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  const playerRef = useRef<QuotePlayerRef>(null);

  // Initialize game session
  const initGame = useCallback((count = totalQuestions) => {
    const qList = getRandomQuotes(count);
    setQuestions(qList);
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentStreak(0);
    setMaxStreak(0);
    setSelectedOption(null);
    setGameStatus('ready');
  }, [totalQuestions]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const currentQuestion: QuoteQuestion | undefined = questions[currentIndex];

  // Pause point reached (~3s clip ends)
  const handlePauseReached = useCallback(() => {
    setGameStatus('waiting_qcm');
  }, []);

  const handleRevealFinished = useCallback(() => {
    // Reveal ended
  }, []);

  // Player clicks a choice in the QCM
  const handleSelectOption = useCallback(
    (option: string) => {
      if (gameStatus === 'revealing' || gameStatus === 'finished' || !currentQuestion) return;

      const isCorrect = option === currentQuestion.correctPunchline;
      setSelectedOption(option);
      setGameStatus('revealing');

      // Streak & Combo Multiplier calculation
      let newStreak = 0;
      let multiplier = 1.0;
      let points = 0;

      if (isCorrect) {
        newStreak = currentStreak + 1;
        multiplier = newStreak >= 4 ? 2.0 : newStreak === 3 ? 1.5 : newStreak === 2 ? 1.2 : 1.0;
        points = Math.round(1000 * multiplier);
        setCurrentStreak(newStreak);
        setMaxStreak((prev) => Math.max(prev, newStreak));
      } else {
        newStreak = 0;
        multiplier = 1.0;
        points = 0;
        setCurrentStreak(0);
      }

      const record: QuoteAnswerRecord = {
        question: currentQuestion,
        selectedOption: option,
        isCorrect,
        pointsEarned: points,
      };

      setAnswers((prev) => [...prev, record]);

      // Play continuation to hear and see the exact punchline in video!
      playerRef.current?.revealPunchline();
    },
    [gameStatus, currentQuestion, currentStreak]
  );

  // Next question
  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setGameStatus('finished');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setGameStatus('ready');
  }, [currentIndex, questions.length]);

  // Replay 3s snippet
  const handleReplaySetup = useCallback(() => {
    playerRef.current?.replaySetup();
  }, []);

  // Switch format (5 vs 10 questions)
  const handleChangeFormat = (count: number) => {
    if (count === totalQuestions) return;
    setTotalQuestions(count);
    initGame(count);
  };

  // Global Keyboard Shortcuts (Space, 1-4, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Spacebar toggles play/pause or replays
      if (e.code === 'Space') {
        e.preventDefault();
        playerRef.current?.togglePlay();
        return;
      }

      // Enter key moves to next question when in revealing phase
      if (e.code === 'Enter') {
        if (gameStatus === 'revealing') {
          e.preventDefault();
          handleNext();
          return;
        }
      }

      // Numbers 1, 2, 3, 4 select options when waiting for answer
      if (gameStatus === 'waiting_qcm' && currentQuestion) {
        const keyIndex = parseInt(e.key, 10) - 1;
        if (keyIndex >= 0 && keyIndex < currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(currentQuestion.options[keyIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, currentQuestion, handleSelectOption, handleNext]);

  if (gameStatus === 'finished') {
    return (
      <QuoteEndCard
        answers={answers}
        maxStreak={maxStreak}
        onPlayAgain={() => initGame(totalQuestions)}
        onBackToBlindtest={onBackToBlindtest}
      />
    );
  }

  if (!currentQuestion) return null;

  const currentScore = answers.reduce((acc, a) => acc + a.pointsEarned, 0);
  const lastAnswer = answers[answers.length - 1];

  return (
    <div className="w-full flex flex-col gap-4 max-w-lg mx-auto">
      {/* Top Header Card: Level indicator, Session Format & Live Combo */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Réplique {currentIndex + 1} / {questions.length}</span>
            </span>

            {/* Streak Combo Badge */}
            {currentStreak >= 2 && (
              <span className="px-2 py-0.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-black tracking-wide flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>Combo x{currentStreak >= 4 ? '2.0' : currentStreak === 3 ? '1.5' : '1.2'}</span>
              </span>
            )}
          </div>

          {/* Live Score & Mode switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleChangeFormat(5)}
                className={`px-2 py-0.5 rounded ${totalQuestions === 5 ? 'bg-orange-500 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                title="Partie express de 5 répliques"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleChangeFormat(10)}
                className={`px-2 py-0.5 rounded ${totalQuestions === 10 ? 'bg-orange-500 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                title="Partie complète de 10 répliques"
              >
                10
              </button>
            </div>

            <span className="text-sm font-mono font-black text-white">
              {currentScore.toLocaleString('fr-FR')} pts
            </span>
          </div>
        </div>

        {/* Arcade Segmented Progress Track */}
        <div className="flex items-center gap-1.5 w-full pt-1">
          {questions.map((q, idx) => {
            const recorded = answers[idx];
            let pillClass = 'bg-zinc-800';

            if (idx === currentIndex) {
              pillClass = 'bg-orange-500 ring-2 ring-orange-500/40 animate-pulse';
            } else if (recorded) {
              pillClass = recorded.isCorrect ? 'bg-emerald-500' : 'bg-red-500';
            }

            return (
              <div
                key={q.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pillClass}`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Video Player */}
      <QuotePlayer
        key={`quote-${currentQuestion.id}`}
        ref={playerRef}
        videoId={currentQuestion.videoId}
        startTime={currentQuestion.startTime}
        pauseTime={currentQuestion.pauseTime}
        resumeDuration={currentQuestion.resumeDuration}
        volume={volume}
        isMuted={isMuted}
        onPauseReached={handlePauseReached}
        onRevealFinished={handleRevealFinished}
      />

      {/* Controls Bar: Replay 3s snippet + Dedicated Volume Slider */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md backdrop-blur-md">
        <button
          type="button"
          onClick={handleReplaySetup}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          title="Réécouter l'extrait [Espace]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          <span>Réécouter l'extrait</span>
          <span className="text-[10px] text-zinc-400 font-mono ml-0.5 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 hidden sm:inline">
            Espace
          </span>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded cursor-pointer"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 50 ? (
              <Volume1 className="w-4 h-4 text-zinc-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-zinc-300" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            title={`Volume : ${isMuted ? 0 : volume}%`}
          />

          <span className="text-[11px] font-mono text-zinc-400 w-8 text-right hidden sm:inline">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>
      </div>

      {/* Main Interactive QCM Area */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
        {/* Header with points & streak preview */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Complète la réplique exacte</span>
          </span>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>
              +{currentStreak >= 3 ? '2 000' : currentStreak === 2 ? '1 500' : currentStreak === 1 ? '1 200' : '1 000'} pts
            </span>
          </span>
        </div>

        {/* 4 Choices (Always Active QCM) */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 gap-2.5">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correctPunchline;

              let cardStyle =
                'bg-zinc-950/80 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/60';

              if (gameStatus === 'revealing') {
                if (isCorrect) {
                  cardStyle =
                    'bg-emerald-500/20 border-emerald-500/80 text-emerald-100 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/40';
                } else if (isSelected && !isCorrect) {
                  cardStyle =
                    'bg-red-500/20 border-red-500/80 text-red-200 shadow-lg shadow-red-950/40';
                } else {
                  cardStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-60';
                }
              } else if (gameStatus !== 'waiting_qcm') {
                cardStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-500 cursor-not-allowed';
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  disabled={gameStatus !== 'waiting_qcm'}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${cardStyle}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                      gameStatus === 'revealing' && isCorrect
                        ? 'bg-emerald-500 text-zinc-950'
                        : gameStatus === 'revealing' && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {gameStatus === 'revealing' && isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : gameStatus === 'revealing' && isSelected && !isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      letter
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold leading-snug">
                      {option}
                    </span>
                  </div>

                  {gameStatus === 'waiting_qcm' && (
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline self-center">
                      [{idx + 1}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Post-Answer Reveal Bar */}
        {gameStatus === 'revealing' && (
          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800">
            {/* Outcome banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                lastAnswer?.isCorrect
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-500/15 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {lastAnswer?.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-black text-sm block">
                        C'est la bonne réplique !
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        {currentStreak >= 2
                          ? `🔥 Série de ${currentStreak} d'affilée ! Bonus multiplicateur appliqué.`
                          : 'La vidéo rejoue la phrase exacte à l\'écran.'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <span className="font-black text-sm block">
                        Piégé ! 0 pt
                      </span>
                      <span className="text-[11px] text-red-300">
                        La vidéo te montre la véritable réplique exacte.
                      </span>
                    </div>
                  </>
                )}
              </div>

              <span className="font-mono font-black text-base text-white shrink-0 ml-2">
                +{lastAnswer?.pointsEarned || 0} pts
              </span>
            </div>

            {/* Revealed Answer Box */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1 text-xs">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                Réplique exacte complète
              </span>
              <p className="font-bold text-white text-sm">
                « {currentQuestion.setupPhrase} <span className="text-emerald-400">{currentQuestion.correctPunchline}</span> »
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="mt-1 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>
                {currentIndex + 1 >= questions.length ? 'Voir les résultats 🏆' : 'Réplique suivante ➡️'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
