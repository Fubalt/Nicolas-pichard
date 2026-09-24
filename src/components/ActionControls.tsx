'use client';

import React from 'react';
import { GameStatus } from '@/types/game';
import { ATTEMPT_DURATIONS, ATTEMPT_INCREMENTS } from '@/constants/game';
import { Play, Pause, FastForward, Flag } from 'lucide-react';

interface Props {
  currentAttempt: number;
  gameStatus: GameStatus;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkip: () => void;
  disabled: boolean;
}

export function ActionControls({
  currentAttempt,
  gameStatus,
  isPlaying,
  onTogglePlay,
  onSkip,
  disabled,
}: Props) {
  const isGameOver = gameStatus === 'won' || gameStatus === 'lost';
  const currentDuration = ATTEMPT_DURATIONS[currentAttempt] ?? 0.1;
  const nextIncrement = ATTEMPT_INCREMENTS[currentAttempt + 1];

  let skipLabel = 'Passer';
  if (currentAttempt < 3 && nextIncrement) {
    skipLabel = `Passer (+${nextIncrement}s)`;
  } else {
    skipLabel = 'Abandonner (Révéler)';
  }

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Play / Pause / Replay Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={disabled || isGameOver}
        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all shadow-lg select-none active:scale-[0.98] ${
          isPlaying
            ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-950/40'
            : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-zinc-950/40'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-5 h-5 fill-current" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>Lire l&apos;extrait ({currentDuration}s)</span>
          </>
        )}
      </button>

      {/* Skip Button */}
      {!isGameOver && (
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-medium text-xs sm:text-sm bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 hover:text-white border border-zinc-800 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none shrink-0"
        >
          {currentAttempt >= 3 ? (
            <Flag className="w-4 h-4 text-red-400" />
          ) : (
            <FastForward className="w-4 h-4 text-amber-400" />
          )}
          <span>{skipLabel}</span>
        </button>
      )}
    </div>
  );
}
