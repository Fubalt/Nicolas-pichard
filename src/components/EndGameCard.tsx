'use client';

import React, { useEffect, useState } from 'react';
import { VideoItem, GuessResult, GameStatus, GameMode } from '@/types/game';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { formatTimecode } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { Trophy, Frown, Share2, RotateCcw, ExternalLink, Check } from 'lucide-react';

interface Props {
  video: VideoItem;
  startTime: number;
  gameStatus: GameStatus;
  guesses: GuessResult[];
  gameMode?: GameMode;
  onPlayAgain: () => void;
  onPlayFullVideo?: () => void;
}

export function EndGameCard({
  video,
  startTime,
  gameStatus,
  guesses,
  gameMode = 'all',
  onPlayAgain,
  onPlayFullVideo,
}: Props) {
  const [copied, setCopied] = useState(false);
  const isWon = gameStatus === 'won';

  // Trigger confetti on win
  useEffect(() => {
    if (isWon) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899'],
        });
      } catch (e) {}
    }
  }, [isWon]);

  // Generate Heardle-style share text
  const generateShareText = () => {
    const emojis: string[] = guesses.map((g) => {
      if (g.type === 'success') return '🟩';
      if (g.type === 'incorrect') return '🟥';
      return '⬜'; // skipped
    });

    while (emojis.length < 4) {
      emojis.push('⬛');
    }

    const grid = emojis.join(' ');
    const attemptText = isWon ? `${guesses.length}/4 essais` : 'X/4 (Échec)';
    const modeTag = gameMode === 'classic' ? ' [Classique ≤ 2016]' : '';
    return `🎬 Nicolas Pichard${modeTag} • ${attemptText}\n${grid}\n🔊 https://youtube.com/watch?v=${video.id}&t=${startTime}s`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const successfulAttempt = guesses.findIndex((g) => g.type === 'success');
  const unlockedDuration = successfulAttempt >= 0 ? ATTEMPT_DURATIONS[successfulAttempt] : ATTEMPT_DURATIONS[3];

  return (
    <div
      className={`w-full rounded-2xl border p-5 sm:p-6 transition-all shadow-2xl ${
        isWon
          ? 'bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-950 border-emerald-500/40'
          : 'bg-gradient-to-b from-red-950/30 via-zinc-900 to-zinc-950 border-zinc-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              isWon
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {isWon ? <Trophy className="w-6 h-6" /> : <Frown className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isWon ? 'Félicitations !' : 'Partie terminée !'}
            </h3>
            <p className="text-sm text-zinc-400">
              {isWon
                ? `Trouvé au palier de ${unlockedDuration}s (essai ${successfulAttempt + 1}/4)`
                : 'Tu feras mieux la prochaine fois !'}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  gameMode === 'classic'
                    ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {gameMode === 'classic' ? '📼 Mode Classique (≤ 2016)' : '🌟 Catalogue complet'}
              </span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-all active:scale-95 shadow"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copié !</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Partager</span>
            </>
          )}
        </button>
      </div>

      {/* Video Details Card */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-orange-400 mb-1">
            Vidéo mystère
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-100 truncate">
            {video.title}
          </h4>
          <div className="text-xs text-zinc-400 mt-1 font-mono">
            Timecode de départ : {formatTimecode(startTime)} • Durée : {video.durationInSeconds}s
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}&t=${startTime}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ouvrir sur YouTube</span>
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-zinc-950 font-bold text-sm shadow-xl shadow-orange-950/30 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Partie suivante (Aléatoire)</span>
        </button>
      </div>
    </div>
  );
}
