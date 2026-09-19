'use client';

import React from 'react';
import { BattlePlayer } from '@/types/multiplayer';
import { Swords, Trophy, Crown, LogOut, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  currentRoundIndex: number;
  totalRounds: number;
  roomCode: string;
  players: BattlePlayer[];
  myPlayerId: string;
  onLeaveRoom: () => void;
}

export function BattleHeader({
  currentRoundIndex,
  totalRounds,
  roomCode,
  players,
  myPlayerId,
  onLeaveRoom,
}: Props) {
  const me = players.find((p) => p.id === myPlayerId);

  return (
    <div className="w-full bg-zinc-900/95 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Top bar: Round count + Room code + Leave */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            <span>Manche {currentRoundIndex + 1} / {totalRounds}</span>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[11px] font-mono text-zinc-400">
            {roomCode}
          </span>
        </div>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
          title="Quitter la Battle"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quitter</span>
        </button>
      </div>

      {/* Players Live Status Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {players.map((p) => {
          const isMe = p.id === myPlayerId;
          const finished = p.hasFinishedRound;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border shrink-0 transition-all text-xs ${
                isMe
                  ? 'bg-zinc-800 border-zinc-700 shadow-sm'
                  : 'bg-zinc-950/80 border-zinc-800/80'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                  p.isHost
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-700 text-zinc-200'
                }`}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-white max-w-[80px] truncate">
                    {p.name}
                  </span>
                  {isMe && <span className="text-[9px] text-zinc-400">(Toi)</span>}
                  {p.isHost && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                </div>
                <span className="text-[10px] font-mono font-bold text-orange-400">
                  {p.score.toLocaleString('fr-FR')} pts
                </span>
              </div>

              {/* Live status badge for this round */}
              <div className="ml-1">
                {finished ? (
                  <span
                    className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                    title={`A terminé : +${p.roundScore || 0} pts`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="hidden sm:inline">+{p.roundScore || 0}</span>
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                    title="En train de deviner..."
                  >
                    <Clock className="w-3 h-3 animate-spin" />
                    <span className="hidden sm:inline">En jeu</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
