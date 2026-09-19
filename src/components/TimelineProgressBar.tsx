'use client';

import React from 'react';
import { ATTEMPT_DURATIONS, ATTEMPT_INCREMENTS } from '@/constants/game';
import { Lock, Unlock } from 'lucide-react';

interface Props {
  currentAttempt: number;
  currentSnippetProgress: number; // 0 to 1 of the unlocked segment
  currentElapsed: number; // in seconds
  isPlaying: boolean;
}

export function TimelineProgressBar({
  currentAttempt,
  currentSnippetProgress,
  currentElapsed,
  isPlaying,
}: Props) {
  // We can represent each tier with a clean percentage width for great visual balance
  const segmentWidths = ['15%', '25%', '30%', '30%'];
  const maxUnlockedDuration = ATTEMPT_DURATIONS[currentAttempt] ?? 0.1;

  return (
    <div className="w-full space-y-2">
      {/* Time indicators */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-zinc-600'}`} />
          <span className="font-semibold text-zinc-200">
            {currentElapsed.toFixed(1)}s
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 font-medium">
            {maxUnlockedDuration.toFixed(1)}s débloqués
          </span>
        </div>

        <div className="text-zinc-400 text-[11px] font-medium">
          Essai {Math.min(currentAttempt + 1, 4)} / 4
        </div>
      </div>

      {/* Main Bar Container */}
      <div className="relative w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5 flex gap-1">
        {ATTEMPT_DURATIONS.map((dur, index) => {
          const isUnlocked = index <= currentAttempt;
          const isCurrentTier = index === currentAttempt;
          const segmentWidth = segmentWidths[index];

          // Compute fill inside this specific segment if current or previous
          let fillPercent = 0;
          if (index < currentAttempt) {
            fillPercent = 100;
          } else if (index === currentAttempt) {
            fillPercent = currentSnippetProgress * 100;
          }

          return (
            <div
              key={index}
              className={`relative h-full rounded-sm overflow-hidden transition-all flex items-center justify-center ${
                isUnlocked
                  ? 'bg-zinc-800/90 border-zinc-700'
                  : 'bg-zinc-950/60 opacity-40'
              }`}
              style={{ width: segmentWidth }}
            >
              {/* Animated fill when playing */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 transition-all ease-linear"
                style={{
                  width: `${fillPercent}%`,
                  transitionDuration: isPlaying ? '50ms' : '200ms',
                }}
              />

              {/* Tier separator / Lock hint */}
              {!isUnlocked && (
                <Lock className="w-2.5 h-2.5 text-zinc-500 z-10 opacity-70" />
              )}
            </div>
          );
        })}
      </div>

      {/* Tier Labels & Increments */}
      <div className="flex w-full gap-1 text-[10px] text-zinc-500 font-mono">
        {ATTEMPT_DURATIONS.map((dur, index) => {
          const isUnlocked = index <= currentAttempt;
          const isCurrent = index === currentAttempt;

          return (
            <div
              key={index}
              className="text-center truncate transition-colors"
              style={{ width: segmentWidths[index] }}
            >
              <span
                className={`inline-block px-1 rounded ${
                  isCurrent
                    ? 'text-orange-400 font-bold bg-orange-950/40 border border-orange-800/40'
                    : isUnlocked
                    ? 'text-zinc-300'
                    : 'text-zinc-600'
                }`}
              >
                {index === 0 ? '0.1s' : `+${ATTEMPT_INCREMENTS[index]}s (${dur}s)`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
