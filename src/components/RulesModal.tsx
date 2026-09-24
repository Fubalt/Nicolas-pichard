'use client';

import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Comment jouer ?</h3>
            <p className="text-xs text-zinc-400">Règles du jeu Nicolas Pichard</p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-300">
          <p className="text-xs leading-relaxed text-zinc-400">
            Le but est de deviner le titre exact de la vidéo de <span className="text-white font-semibold">Cyprien</span> à partir d&apos;extraits de plus en plus longs, débutant à un moment aléatoire :
          </p>

          <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/80 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-orange-400 font-semibold">• Essai 1 :</span>
              <span className="font-bold text-white">0.1 seconde</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-orange-400 font-semibold">• Essai 2 :</span>
              <span className="font-bold text-white">+2.0s (total 2.1s)</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-orange-400 font-semibold">• Essai 3 :</span>
              <span className="font-bold text-white">+8.0s (total 10.1s)</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-orange-400 font-semibold">• Essai 4 :</span>
              <span className="font-bold text-white">+16.0s (total 26.1s)</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                La vidéo et le son se jouent pendant la durée exacte débloquée, puis restent <strong>figés sur la dernière frame</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                Chaque mauvaise réponse ou &quot;Passer&quot; débloque le palier de durée suivant.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                Tape quelques lettres dans le champ pour utiliser l&apos;autocomplétion des titres.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">★</span>
              <span>
                <strong>2 modes de jeu disponibles :</strong> &quot;Toutes les époques&quot; (205 vidéos) ou &quot;Classique ≤ 2016&quot; (les 89 vidéos cultes du « DESSIN » au « McDonald&apos;s »).
              </span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          C&apos;est parti !
        </button>
      </div>
    </div>
  );
}
