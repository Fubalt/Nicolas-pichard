'use client';

import React, { useState } from 'react';
import { GameMode } from '@/types/game';
import { CYPRIEN_ALL_VIDEOS, CYPRIEN_CLASSIC_VIDEOS } from '@/data/videos';
import { Users, Swords, Sparkles, History, ArrowLeft, KeyRound } from 'lucide-react';

interface Props {
  initialRoomCode?: string;
  onCreateRoom: (pseudo: string, totalRounds: number, mode: GameMode) => void;
  onJoinRoom: (code: string, pseudo: string) => void;
  onBackToSolo: () => void;
}

export function CreateJoinRoom({
  initialRoomCode = '',
  onCreateRoom,
  onJoinRoom,
  onBackToSolo,
}: Props) {
  const [tab, setTab] = useState<'create' | 'join'>(initialRoomCode ? 'join' : 'create');
  const [pseudo, setPseudo] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('np_multiplayer_pseudo') || '';
      } catch {}
    }
    return '';
  });
  const [roomCode, setRoomCode] = useState(initialRoomCode.toUpperCase());
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [gameMode, setGameMode] = useState<GameMode>('all');
  const [error, setError] = useState<string | null>(null);

  const [prevInitialCode, setPrevInitialCode] = useState(initialRoomCode);
  if (initialRoomCode !== prevInitialCode) {
    setPrevInitialCode(initialRoomCode);
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setTab('join');
    }
  }

  const savePseudo = (name: string) => {
    try {
      localStorage.setItem('np_multiplayer_pseudo', name.trim());
    } catch {}
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPseudo = pseudo.trim();
    if (!cleanPseudo) {
      setError('Veuillez entrer votre pseudo avant de continuer.');
      return;
    }
    savePseudo(cleanPseudo);
    onCreateRoom(cleanPseudo, totalRounds, gameMode);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPseudo = pseudo.trim();
    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanPseudo) {
      setError('Veuillez entrer votre pseudo.');
      return;
    }
    if (!cleanCode) {
      setError('Veuillez renseigner un code de Room.');
      return;
    }
    savePseudo(cleanPseudo);
    onJoinRoom(cleanCode, cleanPseudo);
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSolo}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au mode Solo</span>
        </button>
        <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
          Mode Battle Multijoueur
        </span>
      </div>

      {/* Main card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
        {/* Banner */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-950/40 shrink-0">
            <Swords className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Battle Nicolas <span className="text-orange-400">Pichard</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Affronte tes amis en direct : mêmes vidéos, mêmes timecodes, scoring en temps réel !
            </p>
          </div>
        </div>

        {/* Pseudo input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Ton pseudo de joueur</span>
            <span className="text-[11px] text-zinc-500 font-normal">Obligatoire</span>
          </label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => {
              setPseudo(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ex: CyprienFan, MasterGeek, Alex..."
            maxLength={20}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all font-medium"
          />
        </div>

        {/* Tabs: Créer / Rejoindre */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              setTab('create');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'create'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Créer une Room</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('join');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'join'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Rejoindre par Code</span>
          </button>
        </div>

        {/* Tab content: Create Room */}
        {tab === 'create' && (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            {/* Number of rounds */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nombre de manches</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 3, label: '3 manches', desc: 'Express (3 min)' },
                  { value: 5, label: '5 manches', desc: 'Standard (5 min)' },
                  { value: 10, label: '10 manches', desc: 'Marathon (10 min)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTotalRounds(opt.value)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                      totalRounds === opt.value
                        ? 'bg-orange-500/10 border-orange-500/60 text-white shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Game mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Catalogue des vidéos</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGameMode('all')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    gameMode === 'all'
                      ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white">Toutes époques</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {CYPRIEN_ALL_VIDEOS.length} vidéos (2010 à auj.)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameMode('classic')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    gameMode === 'classic'
                      ? 'bg-gradient-to-tr from-orange-600/30 to-amber-600/20 border-orange-500/60 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-white">Classique ≤ 2016</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {CYPRIEN_CLASSIC_VIDEOS.length} vidéos d&apos;époque
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Users className="w-4 h-4" />
              <span>Créer la Room & Inviter des amis 🚀</span>
            </button>
          </form>
        )}

        {/* Tab content: Join Room */}
        {tab === 'join' && (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Code de la Room</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  if (error) setError(null);
                }}
                placeholder="Ex: NP-4829 ou CYP-123"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 font-mono tracking-widest uppercase transition-all"
              />
              <span className="text-[11px] text-zinc-500">
                Demande le code à l&apos;ami qui a créé la room.
              </span>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Swords className="w-4 h-4" />
              <span>Rejoindre la Battle ⚔️</span>
            </button>
          </form>
        )}
      </div>

      {/* Rules summary for battle */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-2 text-xs text-zinc-400">
        <span className="font-bold text-zinc-200">Comment marche le mode Battle ?</span>
        <ul className="list-disc pl-4 space-y-1 text-zinc-400">
          <li>Tous les joueurs reçoivent <strong className="text-zinc-200">exactement les mêmes vidéos</strong> au même timecode.</li>
          <li><strong className="text-zinc-200">Scoring rapide :</strong> 1 000 pts (1er coup) → 750 → 500 → 250 pts.</li>
          <li><strong className="text-orange-400">Bonus vitesse :</strong> jusqu&apos;à +200 pts bonus si tu trouves vite !</li>
          <li>Le classement se met à jour en direct à chaque manche avec un podium final 🥇.</li>
        </ul>
      </div>
    </div>
  );
}
