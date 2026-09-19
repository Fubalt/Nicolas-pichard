'use client';

import React from 'react';
import { BattlePlayer, BattleRound } from '@/types/multiplayer';
import { cleanDisplayTitle } from '@/lib/utils';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  ExternalLink,
  Crown,
  Clock,
  Swords,
} from 'lucide-react';

interface Props {
  roundIndex: number;
  totalRounds: number;
  currentRound: BattleRound;
  players: BattlePlayer[];
  myPlayerId: string;
  isHost: boolean;
  lastRoundResult: {
    basePoints: number;
    speedBonus: number;
    totalPoints: number;
    success: boolean;
    attemptIndex: number;
  } | null;
  onNextRound: () => void;
  onLeaveRoom: () => void;
}

export function BattleRoundRecap({
  roundIndex,
  totalRounds,
  currentRound,
  players,
  myPlayerId,
  isHost,
  lastRoundResult,
  onNextRound,
  onLeaveRoom,
}: Props) {
  const isFinalRound = roundIndex + 1 >= totalRounds;

  // Sort players by total score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const allPlayersFinished = players.every((p) => p.hasFinishedRound);
  const me = players.find((p) => p.id === myPlayerId);

  const cleanTitle = cleanDisplayTitle(currentRound.video.title);

  return (
    <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
      {/* Round outcome card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-orange-400">
            Fin de la Manche {roundIndex + 1} / {totalRounds}
          </span>

          {allPlayersFinished ? (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Tous les joueurs ont fini
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Clock className="w-3 h-3 animate-spin" />
              <span>Joueurs en cours...</span>
            </span>
          )}
        </div>

        {/* Player's individual result */}
        {lastRoundResult && (
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              lastRoundResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastRoundResult.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm text-emerald-300">
                      Trouvé en {lastRoundResult.attemptIndex + 1} coup(s) !
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span className="font-bold text-sm text-red-300">
                      Manche non trouvée !
                    </span>
                  </>
                )}
              </div>

              <span className="text-lg font-black font-mono text-white">
                +{lastRoundResult.totalPoints.toLocaleString('fr-FR')} pts
              </span>
            </div>

            {lastRoundResult.success && (
              <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1 border-t border-emerald-500/20">
                <span>Base : <strong className="text-zinc-200">+{lastRoundResult.basePoints} pts</strong></span>
                {lastRoundResult.speedBonus > 0 && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Zap className="w-3 h-3 fill-amber-300" />
                    <span>Bonus vitesse : +{lastRoundResult.speedBonus} pts</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Revealed video card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="w-20 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative">
            <img
              src={`https://img.youtube.com/vi/${currentRound.video.id}/mqdefault.jpg`}
              alt={cleanTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              C'était la vidéo
            </span>
            <span className="font-bold text-sm text-white truncate" title={cleanTitle}>
              {cleanTitle}
            </span>
            <a
              href={`https://www.youtube.com/watch?v=${currentRound.video.id}&t=${currentRound.startTime}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 mt-0.5"
            >
              <span>Voir sur YouTube (timecode {currentRound.startTime}s)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Room Leaderboard Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Classement en direct</span>
            </span>
            <span>Total Points</span>
          </div>

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

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-zinc-400 bg-zinc-700/60 px-1 py-0.2 rounded">
                            Toi
                          </span>
                        )}
                        {player.isHost && (
                          <Crown className="w-3 h-3 text-amber-400" />
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400">
                        {player.hasFinishedRound ? (
                          <span className="text-emerald-400">
                            +{player.roundScore || 0} pts cette manche
                          </span>
                        ) : (
                          <span className="text-amber-400 italic">
                            En train de deviner...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-black text-sm text-white">
                    {player.score.toLocaleString('fr-FR')} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Round Action */}
        <div className="mt-2 flex flex-col gap-2">
          {isHost ? (
            <button
              type="button"
              onClick={onNextRound}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>
                {isFinalRound ? 'Voir le Podium Final 🏆' : `Passer à la Manche ${roundIndex + 2} ➡️`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-semibold text-zinc-300">
                En attente de l'hôte pour lancer la manche suivante...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
