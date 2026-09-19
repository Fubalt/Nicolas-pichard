'use client';

import React from 'react';
import { GuessResult, GameStatus } from '@/types/game';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { CheckCircle2, XCircle, SkipForward, CircleDot, Minus } from 'lucide-react';

interface Props {
  guesses: GuessResult[];
  currentAttempt: number;
  gameStatus: GameStatus;
}

export function GuessHistory({ guesses, currentAttempt, gameStatus }: Props) {
  const isGameOver = gameStatus === 'won' || gameStatus === 'lost';

  return (
    <div className="w-full space-y-2">
      {ATTEMPT_DURATIONS.map((duration, index) => {
        const guess = guesses[index];
        const isCurrent = !isGameOver && index === currentAttempt;
        const isPast = index < currentAttempt || (isGameOver && guess);
        const isPending = !isPast && !isCurrent;

        let statusBg = 'bg-zinc-900/50 border-zinc-800/80 text-zinc-500';
        let icon = <Minus className="w-4 h-4 text-zinc-700" />;
        let label = `Essai ${index + 1} (${duration}s)`;

        if (guess) {
          if (guess.type === 'success') {
            statusBg = 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300 shadow-sm shadow-emerald-950';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            label = guess.guessedTitle || 'Bonne réponse !';
          } else if (guess.type === 'incorrect') {
            statusBg = 'bg-red-950/30 border-red-800/50 text-red-300';
            icon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
            label = guess.guessedTitle || 'Mauvaise réponse';
          } else if (guess.type === 'skipped') {
            statusBg = 'bg-zinc-800/50 border-zinc-700 text-zinc-400';
            icon = <SkipForward className="w-4 h-4 text-amber-400 shrink-0" />;
            label = 'Passé';
          }
        } else if (isCurrent) {
          statusBg = 'bg-zinc-900 border-orange-500/60 text-zinc-300 shadow-sm ring-1 ring-orange-500/20';
          icon = <CircleDot className="w-4 h-4 text-orange-400 animate-pulse shrink-0" />;
          label = `À toi de jouer (palier ${duration}s)...`;
        }

        return (
          <div
            key={index}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${statusBg}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <span className="truncate text-xs sm:text-sm">{label}</span>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 shrink-0 ml-2">
              {duration}s
            </div>
          </div>
        );
      })}
    </div>
  );
}
