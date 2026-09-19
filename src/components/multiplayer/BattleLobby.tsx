'use client';

import React, { useState } from 'react';
import { RoomConfig, BattlePlayer } from '@/types/multiplayer';
import { Users, Crown, Copy, Check, Swords, LogOut, Sparkles, History, Share2 } from 'lucide-react';

interface Props {
  roomConfig: RoomConfig;
  players: BattlePlayer[];
  myPlayerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function BattleLobby({
  roomConfig,
  players,
  myPlayerId,
  isHost,
  onStartGame,
  onLeaveRoom,
}: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const hostPlayer = players.find((p) => p.isHost);

  const copyCode = () => {
    navigator.clipboard.writeText(roomConfig.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}?room=${roomConfig.roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
      {/* Top action / leave */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Quitter la Room</span>
        </button>

        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Salon connecté</span>
        </span>
      </div>

      {/* Lobby card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
        {/* Room Code Showcase */}
        <div className="flex flex-col items-center gap-2 text-center bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
            Code de la Room
          </span>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 font-mono">
              {roomConfig.roomCode}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={copyCode}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Code copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copier le code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-semibold flex items-center gap-1.5 border border-orange-500/30 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-400">Lien copié !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Inviter un ami</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Room configuration pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium">
            🎯 {roomConfig.totalRounds} manches
          </span>
          <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium flex items-center gap-1.5">
            {roomConfig.mode === 'classic' ? (
              <>
                <History className="w-3.5 h-3.5 text-orange-400" />
                <span>Classique ≤ 2016</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Toutes les époques</span>
              </>
            )}
          </span>
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-400" />
              <span>Joueurs connectés ({players.length})</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">Mêmes vidéos pour tous</span>
          </div>

          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const isMe = p.id === myPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-zinc-800/80 border-zinc-700 shadow-md'
                      : 'bg-zinc-950/70 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                        p.isHost
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-zinc-950 shadow-md'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-zinc-400 bg-zinc-700/60 px-1.5 py-0.5 rounded font-medium">
                            Toi
                          </span>
                        )}
                        {p.isHost && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" />
                            <span>Hôte</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">Prêt au combat</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Prêt</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game controls */}
        {isHost ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onStartGame}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-base tracking-wide shadow-xl shadow-orange-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Swords className="w-5 h-5" />
              <span>Lancer la Battle ⚔️</span>
            </button>
            {players.length === 1 && (
              <p className="text-[11px] text-zinc-500 text-center">
                💡 Partage le code ou le lien ci-dessus pour inviter des amis, ou lance dès maintenant pour tester !
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-bold text-zinc-200">
              En attente que {hostPlayer ? hostPlayer.name : "l'hôte"} lance la partie...
            </span>
            <span className="text-[11px] text-zinc-500">
              La manche démarrera automatiquement dès que le signal sera donné.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
