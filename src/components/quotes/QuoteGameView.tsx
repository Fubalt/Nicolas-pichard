'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuoteQuestion, QuoteGameStatus, QuoteAnswerRecord } from '@/types/quotes';
import { getRandomQuotes, isQuoteMatch } from '@/data/quotes';
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
  HelpCircle,
  Keyboard,
  ListFilter,
  Send,
  AlertCircle,
} from 'lucide-react';

interface Props {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onBackToBlindtest: () => void;
}

const TOTAL_QUESTIONS = 5;

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

  // Input states
  const [manualText, setManualText] = useState<string>('');
  const [manualAttemptFailed, setManualAttemptFailed] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuoteAnswerRecord[]>([]);

  const playerRef = useRef<QuotePlayerRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize 5 random questions
  const initGame = useCallback(() => {
    const qList = getRandomQuotes(TOTAL_QUESTIONS);
    setQuestions(qList);
    setCurrentIndex(0);
    setAnswers([]);
    setManualText('');
    setManualAttemptFailed(false);
    setSelectedOption(null);
    setGameStatus('ready');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const currentQuestion: QuoteQuestion | undefined = questions[currentIndex];

  // When pause is reached (~3s clip ended), activate manual input mode
  const handlePauseReached = useCallback(() => {
    setGameStatus('waiting_manual');
    setManualAttemptFailed(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleRevealFinished = useCallback(() => {
    // Video finished playing the continuation
  }, []);

  // Submit Manual Typing
  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (gameStatus !== 'waiting_manual' || !currentQuestion || !manualText.trim()) return;

    const trimmed = manualText.trim();
    const isCorrect = isQuoteMatch(trimmed, currentQuestion.correctPunchline);

    if (isCorrect) {
      // Direct hit via manual input! 1 000 pts
      const record: QuoteAnswerRecord = {
        question: currentQuestion,
        userText: trimmed,
        isCorrect: true,
        method: 'manual',
        pointsEarned: 1000,
      };
      setAnswers((prev) => [...prev, record]);
      setGameStatus('revealing');
      playerRef.current?.revealPunchline();
    } else {
      // Incorrect manual guess: switch to QCM fallback!
      setManualAttemptFailed(true);
      setGameStatus('waiting_qcm');
    }
  };

  // Switch to QCM fallback manually
  const handleSwitchToQcm = () => {
    setGameStatus('waiting_qcm');
  };

  // Submit QCM Choice
  const handleSelectOption = (option: string) => {
    if (gameStatus !== 'waiting_qcm' || !currentQuestion) return;

    const isCorrect = option === currentQuestion.correctPunchline;
    setSelectedOption(option);
    setGameStatus('revealing');

    const record: QuoteAnswerRecord = {
      question: currentQuestion,
      userText: manualText.trim() || undefined,
      selectedOption: option,
      isCorrect,
      method: isCorrect ? 'qcm' : 'failed',
      pointsEarned: isCorrect ? 500 : 0,
    };

    setAnswers((prev) => [...prev, record]);
    playerRef.current?.revealPunchline();
  };

  // Next question
  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameStatus('finished');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setManualText('');
    setManualAttemptFailed(false);
    setSelectedOption(null);
    setGameStatus('ready');
  };

  // Replay the 3s setup snippet
  const handleReplaySetup = () => {
    playerRef.current?.replaySetup();
  };

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
  const lastAnswer = answers[answers.length - 1];

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

        {/* Live Score */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black text-white">
            {currentScore.toLocaleString('fr-FR')} pts
          </span>
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
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          <span>Réécouter l'extrait (3s)</span>
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

      {/* Main Interactive Box */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
        {/* The Exact Quote Setup from Subtitles */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
            Complète la réplique exacte
          </span>
          <p className="text-sm sm:text-base font-extrabold text-white italic bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 shadow-inner">
            « {currentQuestion.setupPhrase} <span className="text-orange-400">... »</span>
          </p>
          <span className="text-[11px] text-zinc-500">
            {currentQuestion.contextDescription}
          </span>
        </div>

        {/* ---------------- STEP 1: MANUAL TYPING ---------------- */}
        {gameStatus === 'waiting_manual' && (
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-orange-400" />
                  <span>Écris la suite de la phrase :</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +1 000 pts si trouvé
                </span>
              </label>

              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Tape la réplique au clavier..."
                  className="w-full pl-4 pr-24 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 font-medium transition-all"
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={!manualText.trim()}
                  className="absolute right-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/40"
                >
                  <span>Valider</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500">
                Pas de limite de temps, prends ton temps !
              </span>

              <button
                type="button"
                onClick={handleSwitchToQcm}
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>J'hésite, passer au QCM (+500 pts)</span>
              </button>
            </div>
          </form>
        )}

        {/* ---------------- STEP 2: QCM FALLBACK (IF WRONG OR REQUESTED) ---------------- */}
        {gameStatus === 'waiting_qcm' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                {manualAttemptFailed
                  ? 'Pas tout à fait ! Choisis parmi les 4 propositions :'
                  : 'Choisis parmi les 4 propositions :'}
              </span>

              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                +500 pts si trouvé
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className="p-3.5 rounded-2xl border bg-zinc-950/80 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/70 text-left flex items-start gap-3 transition-all cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold leading-snug">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- STEP 3: REVEALING IN VIDEO ---------------- */}
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
                        {lastAnswer.method === 'manual'
                          ? 'Bien joué ! Trouvé en saisie libre !'
                          : 'Bien joué ! Trouvé avec le QCM !'}
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        La vidéo rejoue la phrase exacte à l'écran.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <span className="font-black text-sm block">
                        Manqué ! 0 pt
                      </span>
                      <span className="text-[11px] text-red-300">
                        La vidéo rejoue la phrase exacte pour te montrer.
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
