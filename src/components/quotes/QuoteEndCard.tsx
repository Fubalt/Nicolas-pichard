'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { QuoteAnswerRecord } from '@/types/quotes';
import { Trophy, Check, X, RotateCcw, Share2, ExternalLink, Keyboard, ListFilter, Gamepad2 } from 'lucide-react';

interface Props {
  answers: QuoteAnswerRecord[];
  onPlayAgain: () => void;
  onBackToBlindtest: () => void;
}

export function QuoteEndCard({ answers, onPlayAgain, onBackToBlindtest }: Props) {
  const [copied, setCopied] = useState(false);

  const totalScore = answers.reduce((acc, a) => acc + a.pointsEarned, 0);
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const manualCount = answers.filter((a) => a.method === 'manual').length;
  const maxPossible = answers.length * 1000;

  // Rank title
  let rankTitle = 'Néophyte de la Cartouche 👶';
  let rankDesc = 'Encore un petit effort pour connaître les répliques cultes par cœur !';
  let rankColor = 'text-zinc-300';
  let rankBg = 'bg-zinc-800/80 border-zinc-700';

  if (totalScore >= 4500) {
    rankTitle = 'Légende Cyprienologique Suprême 👑';
    rankDesc = 'Score presque parfait ! Tu connais chaque mot des répliques par cœur.';
    rankColor = 'text-amber-300';
    rankBg = 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-amber-500/20';
  } else if (totalScore >= 3000) {
    rankTitle = 'Vrai Ancien des Geeks 🎮';
    rankDesc = 'Solide culture YouTube ! Tu as trouvé la plupart des répliques sans hésiter.';
    rankColor = 'text-orange-400';
    rankBg = 'bg-orange-500/15 border-orange-500/40 shadow-orange-500/20';
  } else if (totalScore >= 1500) {
    rankTitle = 'Fan Émérite de YouTube 📺';
    rankDesc = 'Pas mal du tout ! Le QCM t\'a bien aidé sur les fins de phrases.';
    rankColor = 'text-amber-400';
    rankBg = 'bg-zinc-800/90 border-zinc-700';
  }

  useEffect(() => {
    if (correctCount >= 3) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#eab308', '#22c55e'],
      });
    }
  }, [correctCount]);

  const handleShare = () => {
    const emojis = answers.map((a) => (a.method === 'manual' ? '🟩' : a.method === 'qcm' ? '🟨' : '🟥')).join('');
    const text = `💬 Nicolas Pichard - Mode Complète la réplique !\nScore : ${totalScore.toLocaleString('fr-FR')} pts (${correctCount}/${answers.length})\n🎯 Trouvé en saisie libre : ${manualCount}/${answers.length}\nRang : ${rankTitle}\n${emojis}\n\nJoue gratuitement sur https://nicolas-pichard.vercel.app`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col items-center text-center gap-1.5 border-b border-zinc-800/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-950/40">
            <Trophy className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-1">
            Partie Terminée !
          </h2>
          <p className="text-xs text-zinc-400">
            Tu as trouvé <strong className="text-white">{correctCount} sur {answers.length}</strong> répliques cultes
            {manualCount > 0 && <span> (dont <strong className="text-emerald-400">{manualCount} en saisie libre</strong> !)</span>}
          </p>
        </div>

        {/* Score & Rank Card */}
        <div className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-1.5 shadow-lg ${rankBg}`}>
          <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold">
            Score Final
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
            {totalScore.toLocaleString('fr-FR')}{' '}
            <span className="text-sm font-normal text-zinc-400">/ {maxPossible.toLocaleString('fr-FR')} pts</span>
          </span>

          <div className="mt-2 flex flex-col items-center gap-0.5">
            <span className={`text-base font-black tracking-wide ${rankColor}`}>
              {rankTitle}
            </span>
            <p className="text-xs text-zinc-300 max-w-xs">
              {rankDesc}
            </p>
          </div>
        </div>

        {/* Answer Breakdown */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-zinc-400 px-1">
            Détail des répliques ({answers.length})
          </span>

          <div className="flex flex-col gap-2">
            {answers.map((ans) => (
              <div
                key={ans.question.id}
                className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-3 text-xs"
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                    ans.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {ans.isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white truncate">
                      {ans.question.videoTitle}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        ans.method === 'manual'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : ans.method === 'qcm'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {ans.method === 'manual' && <Keyboard className="w-3 h-3" />}
                      {ans.method === 'qcm' && <ListFilter className="w-3 h-3" />}
                      <span>+{ans.pointsEarned} pts</span>
                    </span>
                  </div>

                  <p className="text-zinc-400 italic">
                    « {ans.question.setupPhrase} »
                  </p>

                  <p className="text-emerald-300 font-semibold">
                    👉 {ans.question.correctPunchline}
                  </p>

                  {ans.userText && ans.method === 'manual' && (
                    <p className="text-[11px] text-zinc-400">
                      Ta saisie : <span className="text-zinc-200">"{ans.userText}"</span>
                    </p>
                  )}

                  <a
                    href={`https://www.youtube.com/watch?v=${ans.question.videoId}&t=${Math.floor(ans.question.pauseTime)}s`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-zinc-500 hover:text-orange-400 flex items-center gap-1 mt-0.5 transition-colors self-start"
                  >
                    <span>Voir sur YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejouer 5 nouvelles répliques 🔄</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-orange-400" />
            <span>{copied ? 'Score copié dans le presse-papier !' : 'Partager mon score'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToBlindtest}
            className="w-full py-2.5 px-4 rounded-xl text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Retourner au Blindtest Solo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
