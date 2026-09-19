'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BattlePlayer, RoomConfig } from '@/types/multiplayer';
import { Trophy, Crown, Medal, RotateCcw, LogOut, Sparkles } from 'lucide-react';

interface Props {
  players: BattlePlayer[];
  myPlayerId: string;
  isHost: boolean;
  roomConfig: RoomConfig;
  onReplay: () => void;
  onLeaveRoom: () => void;
}

export function BattlePodium({
  players,
  myPlayerId,
  isHost,
  roomConfig,
  onReplay,
  onLeaveRoom,
}: Props) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  useEffect(() => {
    // Fire celebratory confetti!
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#f97316', '#eab308', '#ef4444'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#f97316', '#eab308', '#ef4444'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col items-center text-center gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
            <h2 className="text-xl font-black tracking-tight text-white">
              Podium Final Nicolas <span className="text-orange-400">Pichard</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Fin de la Battle ({roomConfig.totalRounds} manches terminées)
          </p>
        </div>

        {/* 3D Visual Podium */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <div className="w-10 h-10 rounded-full bg-zinc-300 text-zinc-950 font-black text-sm flex items-center justify-center shadow-lg mb-2">
                2
              </div>
              <span className="text-xs font-bold text-white text-center truncate w-full">
                {second.name}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 mb-2">
                {second.score.toLocaleString('fr-FR')} pts
              </span>
              <div className="w-full h-24 bg-gradient-to-t from-zinc-800 to-zinc-700 rounded-t-2xl border-t-2 border-zinc-500 flex items-center justify-center">
                <Medal className="w-6 h-6 text-zinc-300" />
              </div>
            </div>
          )}

          {/* 1st Place */}
          {winner && (
            <div className="flex flex-col items-center flex-1 max-w-[120px] -mt-6">
              <Crown className="w-7 h-7 text-amber-400 mb-1 animate-pulse" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-zinc-950 font-black text-base flex items-center justify-center shadow-xl shadow-amber-500/20 mb-2 ring-4 ring-amber-400/30">
                1
              </div>
              <span className="text-sm font-black text-white text-center truncate w-full">
                {winner.name}
              </span>
              <span className="text-xs font-mono font-bold text-orange-400 mb-2">
                {winner.score.toLocaleString('fr-FR')} pts
              </span>
              <div className="w-full h-32 bg-gradient-to-t from-orange-600 to-amber-500 rounded-t-2xl border-t-2 border-amber-300 flex items-center justify-center shadow-lg shadow-orange-950/50">
                <Trophy className="w-8 h-8 text-zinc-950" />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-lg mb-2">
                3
              </div>
              <span className="text-xs font-bold text-white text-center truncate w-full">
                {third.name}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 mb-2">
                {third.score.toLocaleString('fr-FR')} pts
              </span>
              <div className="w-full h-16 bg-gradient-to-t from-zinc-800 to-amber-900/60 rounded-t-2xl border-t-2 border-amber-700/60 flex items-center justify-center">
                <Medal className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          )}
        </div>

        {/* Full Scoreboard */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-zinc-400 px-1">
            Tableau récapitulatif
          </span>

          <div className="flex flex-col gap-1.5">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.id === myPlayerId;
              const rank = idx + 1;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isMe
                      ? 'bg-zinc-800/90 border-zinc-700 shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                        rank === 1
                          ? 'bg-amber-400 text-zinc-950'
                          : rank === 2
                          ? 'bg-zinc-300 text-zinc-950'
                          : rank === 3
                          ? 'bg-amber-700 text-zinc-100'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rank}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-700/60 px-1.5 py-0.5 rounded">
                          Toi
                        </span>
                      )}
                      {player.isHost && (
                        <Crown className="w-3 h-3 text-amber-400" />
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-black text-sm text-orange-400">
                    {player.score.toLocaleString('fr-FR')} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
          {isHost ? (
            <button
              type="button"
              onClick={onReplay}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rejouer une Battle (même room) 🔄</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-semibold text-zinc-300">
                En attente que l'hôte relance une battle...
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onLeaveRoom}
            className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Quitter le salon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
