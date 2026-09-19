'use client';

import React from 'react';
import { HelpCircle, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  onOpenRules: () => void;
  onNewGame: () => void;
  totalVideos: number;
}

export function Header({ onOpenRules, onNewGame, totalVideos }: Props) {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-950/30">
            <span className="font-black text-zinc-950 text-sm tracking-tighter">NP</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Nicolas <span className="text-orange-400">Pichard</span>
              </h1>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              {totalVideos} vidéos culte en jeu
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewGame}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            title="Nouvelle partie aléatoire"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            title="Règles du jeu"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
