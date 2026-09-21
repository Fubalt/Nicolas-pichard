'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuoteQuestion, QuoteGameStatus, QuoteAnswerRecord } from '@/types/quotes';
import { getRandomQuotes } from '@/data/quotes';
import { QuotePlayer, QuotePlayerRef } from './QuotePlayer';
import { QuoteEndCard } from './QuoteEndCard';
import {
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  ArrowRight,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onBackToBlindtest: () => void;
}

const TOTAL_QUESTIONS = 5;
const QUESTION_TIMEOUT = 15; // 15 seconds to answer

export function QuoteGameView({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onBackToBlindtest,
}: Props) {
  const [questions, setQuestions] = useState<QuoteQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<QuoteGameStatus>('ready');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuoteAnswerRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIMEOUT);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<QuotePlayerRef>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize 5 random questions
  const initGame = useCallback(() => {
    const qList = getRandomQuotes(TOTAL_QUESTIONS);
    setQuestions(qList);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setTimeLeft(QUESTION_TIMEOUT);
    setGameStatus('ready');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  useEffect(() => {
    initGame();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [initGame]);

  const currentQuestion: QuoteQuestion | undefined = questions[currentIndex];

  // Stop timer helper
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Submit Answer
  const handleSelectOption = useCallback(
    (option: string | null) => {
      if (gameStatus !== 'waiting_answer' || !currentQuestion) return;
      stopTimer();

      const isCorrect = option === currentQuestion.correctPunchline;
      const timeSpent = QUESTION_TIMEOUT - timeLeft;
      const speedBonus = isCorrect ? Math.round((timeLeft / QUESTION_TIMEOUT) * 500) : 0;
      const pointsEarned = isCorrect ? 1000 + speedBonus : 0;

      setSelectedOption(option);
      setGameStatus('revealing');

      const record: QuoteAnswerRecord = {
        question: currentQuestion,
        selectedOption: option ?? 'Temps écoulé',
        isCorrect,
        timeSpent,
        pointsEarned,
      };

      setAnswers((prev) => [...prev, record]);

      // Trigger video continuation to reveal punchline in video!
      playerRef.current?.revealPunchline();
    },
    [gameStatus, currentQuestion, stopTimer, timeLeft]
  );

  // Start 15s countdown when pause point is reached
  const handlePauseReached = useCallback(() => {
    setGameStatus('waiting_answer');
    setTimeLeft(QUESTION_TIMEOUT);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          handleSelectOption(null); // Timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleSelectOption]);

  const handleRevealFinished = useCallback(() => {
    // Video finished playing the reveal
  }, []);

  // Advance to next question
  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameStatus('finished');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setTimeLeft(QUESTION_TIMEOUT);
    setGameStatus('ready');
  };

  // Keyboard numbers 1, 2, 3, 4 to select options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'waiting_answer' || !currentQuestion) return;

      const keyIndex = parseInt(e.key, 10) - 1;
      if (keyIndex >= 0 && keyIndex < currentQuestion.options.length) {
        handleSelectOption(currentQuestion.options[keyIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, currentQuestion, handleSelectOption]);

  if (gameStatus === 'finished') {
    return (
      <QuoteEndCard
        answers={answers}
        onPlayAgain={initGame}
        onBackToBlindtest={onBackToBlindtest}
      />
    );
  }

  if (!currentQuestion) return null;

  const currentScore = answers.reduce((acc, a) => acc + a.pointsEarned, 0);
  const currentSpeedBonus = Math.round((timeLeft / QUESTION_TIMEOUT) * 500);

  return (
    <div className="w-full flex flex-col gap-4 max-w-lg mx-auto">
      {/* Top Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Réplique {currentIndex + 1} / {questions.length}</span>
          </span>
          <span className="text-xs text-zinc-400 font-medium truncate max-w-[140px] sm:max-w-[200px]">
            {currentQuestion.videoTitle}
          </span>
        </div>

        {/* Total Live Score & Volume */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-black text-white">
            {currentScore.toLocaleString('fr-FR')} pts
          </span>

          <button
            type="button"
            onClick={onToggleMute}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
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
        onReady={() => setPlayerReady(true)}
      />

      {/* Gameplay interactive area */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
        {/* Setup Quote Prompt */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
            Complète la réplique
          </span>
          <p className="text-sm sm:text-base font-extrabold text-white italic bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 shadow-inner">
            « {currentQuestion.setupPhrase} <span className="text-orange-400">... »</span>
          </p>
          <span className="text-[11px] text-zinc-500">
            {currentQuestion.contextDescription}
          </span>
        </div>

        {/* Countdown Timer (during waiting_answer) */}
        {gameStatus === 'waiting_answer' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Temps restant : <strong className={timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}>{timeLeft}s</strong></span>
              </span>

              <span className="text-amber-400 text-[11px] font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-400" />
                <span>Bonus vitesse : +{currentSpeedBonus} pts</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-amber-400'
                }`}
                style={{ width: `${(timeLeft / QUESTION_TIMEOUT) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 4 Choices */}
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
            } else if (gameStatus !== 'waiting_answer') {
              cardStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-500 cursor-not-allowed';
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectOption(option)}
                disabled={gameStatus !== 'waiting_answer'}
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

                {gameStatus === 'waiting_answer' && (
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline self-center">
                    [{idx + 1}]
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Reveal Bar */}
        {gameStatus === 'revealing' && (
          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedOption === currentQuestion.correctPunchline ? (
                  <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Exact ! +{answers[answers.length - 1]?.pointsEarned} pts</span>
                  </span>
                ) : (
                  <span className="text-sm font-black text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Raté ! 0 pt</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs tracking-wide shadow-lg shadow-orange-950/40 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <span>
                  {currentIndex + 1 >= questions.length ? 'Voir les résultats 🏆' : 'Suivant ➡️'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentQuestion.explanation && (
              <p className="text-[11px] text-zinc-400 italic bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                💡 {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
