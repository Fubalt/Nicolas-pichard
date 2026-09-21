'use client';

import React, { useState, useRef, useCallback } from 'react';
import { QuoteQuestion } from '@/types/quotes';
import { GEEKS_TEST_MOMENTS, GEEKS_VIDEO_ID, GEEKS_VIDEO_TITLE } from '@/data/geeks-moments';
import geeksTranscriptData from '@/data/geeks-transcript.json';
import { QuotePlayer, QuotePlayerRef } from '@/components/quotes/QuotePlayer';
import { QuoteGameView } from '@/components/quotes/QuoteGameView';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Sliders,
  FileText,
  Gamepad2,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onClose: () => void;
}

type TabType = 'studio' | 'play' | 'transcript';

interface SubtitleItem {
  index: number;
  offset: number;
  duration: number;
  end: number;
  text: string;
}

export function GeeksDevLab({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('studio');

  // Studio inspector state
  const [selectedMomentIndex, setSelectedMomentIndex] = useState<number>(0);
  const [moments, setMoments] = useState<QuoteQuestion[]>(GEEKS_TEST_MOMENTS);

  // Live overrides for current moment
  const currentMoment = moments[selectedMomentIndex] || moments[0];
  const [liveStartTime, setLiveStartTime] = useState<number>(currentMoment.startTime);
  const [livePauseTime, setLivePauseTime] = useState<number>(currentMoment.pauseTime);
  const [liveResumeDuration, setLiveResumeDuration] = useState<number>(currentMoment.resumeDuration);

  // Studio playback state
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [playbackPhase, setPlaybackPhase] = useState<'idle' | 'setup' | 'paused' | 'punchline'>('idle');
  const [testedOption, setTestedOption] = useState<string | null>(null);
  const [hasCopiedJson, setHasCopiedJson] = useState<boolean>(false);
  const [isChainRunning, setIsChainRunning] = useState<boolean>(false);

  // Transcript search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  const playerRef = useRef<QuotePlayerRef>(null);

  // Synchronize live sliders when changing moment
  const handleSelectMoment = (index: number) => {
    setSelectedMomentIndex(index);
    const m = moments[index];
    setLiveStartTime(m.startTime);
    setLivePauseTime(m.pauseTime);
    setLiveResumeDuration(m.resumeDuration);
    setTestedOption(null);
    setPlaybackPhase('idle');
    setIsChainRunning(false);
  };

  // Adjusters
  const adjustStartTime = (delta: number) => {
    setLiveStartTime((prev) => Number(Math.max(0, prev + delta).toFixed(2)));
  };

  const adjustPauseTime = (delta: number) => {
    setLivePauseTime((prev) => Number(Math.max(liveStartTime + 0.5, prev + delta).toFixed(2)));
  };

  const adjustResumeDuration = (delta: number) => {
    setLiveResumeDuration((prev) => Number(Math.max(0.5, prev + delta).toFixed(2)));
  };

  const handleResetToDefault = () => {
    const original = GEEKS_TEST_MOMENTS[selectedMomentIndex];
    setLiveStartTime(original.startTime);
    setLivePauseTime(original.pauseTime);
    setLiveResumeDuration(original.resumeDuration);
  };

  // Copy JSON configuration
  const handleCopyJson = () => {
    const snippet = {
      id: currentMoment.id,
      videoId: GEEKS_VIDEO_ID,
      videoTitle: GEEKS_VIDEO_TITLE,
      startTime: liveStartTime,
      pauseTime: livePauseTime,
      resumeDuration: liveResumeDuration,
      setupPhrase: currentMoment.setupPhrase,
      correctPunchline: currentMoment.correctPunchline,
      options: currentMoment.options,
    };
    navigator.clipboard.writeText(JSON.stringify(snippet, null, 2));
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  // Studio Player Handlers
  const handlePlaySetup = () => {
    setIsChainRunning(false);
    setPlaybackPhase('setup');
    playerRef.current?.replaySetup();
  };

  const handlePlayPunchline = () => {
    setIsChainRunning(false);
    setPlaybackPhase('punchline');
    playerRef.current?.revealPunchline();
  };

  const handlePlayChain = () => {
    setIsChainRunning(true);
    setPlaybackPhase('setup');
    playerRef.current?.replaySetup();
  };

  const handlePauseReached = useCallback(() => {
    setPlaybackPhase('paused');
    if (isChainRunning) {
      setTimeout(() => {
        setPlaybackPhase('punchline');
        playerRef.current?.revealPunchline();
        setIsChainRunning(false);
      }, 1200);
    }
  }, [isChainRunning]);

  const handleRevealFinished = useCallback(() => {
    setPlaybackPhase('idle');
  }, []);

  // Transcript filter
  const filteredTranscript = (geeksTranscriptData as SubtitleItem[]).filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleLoadSubtitleIntoStudio = (item: SubtitleItem) => {
    setLiveStartTime(item.offset);
    setLivePauseTime(item.end);
    setLiveResumeDuration(3.0);
    setActiveTab('studio');
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-2xl mx-auto pb-12">
      {/* Dev Lab Top Bar Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-zinc-900/90 to-zinc-900/90 border border-purple-500/40 rounded-3xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/50">
              <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-wide">
                  Lab Dev : « Cyprien - Les geeks »
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase font-bold">
                  Testbench
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Calibrage des cuts au 1/100e de seconde, test des répliques et explorateur de script.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            Fermer le Lab
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-2xl border border-zinc-800/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio & Calibrage ({moments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('play')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'play'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black shadow-md'
                : 'text-zinc-400 hover:text-orange-400 hover:bg-zinc-800/40'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Partie Réelle 100% Geeks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transcript')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'transcript'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sous-titres complets (88)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STUDIO & CALIBRAGE CUT */}
      {/* ========================================================================= */}
      {activeTab === 'studio' && (
        <div className="flex flex-col gap-4">
          {/* Moments Picker Grid */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-3 flex flex-col gap-2 shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span>Choisir un moment extrait de la vidéo ({moments.length} répliques)</span>
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {moments.map((m, idx) => {
                const isSel = idx === selectedMomentIndex;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMoment(idx)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                      isSel
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-purple-400">#{idx + 1}</span>
                      <span className="truncate max-w-[140px]">{m.correctPunchline}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embedded Test Player */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
            <QuotePlayer
              key={`${currentMoment.id}_${liveStartTime}_${livePauseTime}`}
              ref={playerRef}
              videoId={GEEKS_VIDEO_ID}
              startTime={liveStartTime}
              pauseTime={livePauseTime}
              resumeDuration={liveResumeDuration}
              volume={volume}
              isMuted={isMuted}
              onPauseReached={handlePauseReached}
              onRevealFinished={handleRevealFinished}
              onReady={() => setIsPlayerReady(true)}
            />

            {/* Overlay Status */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 backdrop-blur-md text-[11px] font-mono font-bold flex items-center gap-2 pointer-events-none z-20">
              <span
                className={`w-2 h-2 rounded-full ${
                  playbackPhase === 'setup'
                    ? 'bg-amber-400 animate-pulse'
                    : playbackPhase === 'paused'
                    ? 'bg-purple-400'
                    : playbackPhase === 'punchline'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="text-zinc-300">
                {playbackPhase === 'setup' && '▶️ Lecture Amorce (en cours...)'}
                {playbackPhase === 'paused' && '⏸️ CUT EXACT ATTEINT ! (Pause)'}
                {playbackPhase === 'punchline' && '🎬 Révélation Punchline (en cours...)'}
                {playbackPhase === 'idle' && 'Prêt au test'}
              </span>
            </div>
          </div>

          {/* Audio & Video Test Trigger Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePlaySetup}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>1. Tester l'amorce seule</span>
              </button>

              <button
                type="button"
                onClick={handlePlayPunchline}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Tester la punchline</span>
              </button>

              <button
                type="button"
                onClick={handlePlayChain}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-950/50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>3. Enchaînement complet</span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer transition-colors"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 sm:w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Current Subtitle Context Display */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Amorce entendue dans l'extrait
                </span>
                <p className="text-sm sm:text-base font-semibold text-zinc-100 mt-0.5">
                  « {currentMoment.setupPhrase} »
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                {(livePauseTime - liveStartTime).toFixed(2)}s
              </span>
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Réplique exacte à compléter (Punchline)
                </span>
                <p className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5">
                  « {currentMoment.correctPunchline} »
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                {liveResumeDuration.toFixed(2)}s
              </span>
            </div>
          </div>

          {/* Interactive Millisecond Calibrator */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-purple-400" />
                <span>Calibrateur de Timecodes au 1/100e de seconde</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Valeurs par défaut
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                  title="Copier le snippet JSON de ce moment"
                >
                  {hasCopiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copier JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Start Time Adjuster */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Début Amorce</span>
                  <span className="font-mono font-bold text-white">{liveStartTime.toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => adjustStartTime(-0.5)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    -0.5s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustStartTime(-0.1)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustStartTime(0.1)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustStartTime(0.5)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    +0.5s
                  </button>
                </div>
              </div>

              {/* Pause / Cut Time Adjuster (CRITICAL) */}
              <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-bold flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-purple-400" />
                    <span>Point de CUT</span>
                  </span>
                  <span className="font-mono font-black text-purple-300">{livePauseTime.toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => adjustPauseTime(-0.2)}
                    className="flex-1 py-1 rounded bg-purple-900/40 hover:bg-purple-800/50 text-[10px] font-mono font-bold text-purple-200 border border-purple-500/30"
                    title="Avance le cut de 200ms (coupe plus tôt)"
                  >
                    -0.2s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPauseTime(-0.05)}
                    className="flex-1 py-1 rounded bg-purple-900/40 hover:bg-purple-800/50 text-[10px] font-mono font-bold text-purple-200 border border-purple-500/30"
                    title="Avance le cut de 50ms (micro-ajustement anti-fuite sonore)"
                  >
                    -50ms
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPauseTime(0.05)}
                    className="flex-1 py-1 rounded bg-purple-900/40 hover:bg-purple-800/50 text-[10px] font-mono font-bold text-purple-200 border border-purple-500/30"
                    title="Recule le cut de 50ms"
                  >
                    +50ms
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPauseTime(0.2)}
                    className="flex-1 py-1 rounded bg-purple-900/40 hover:bg-purple-800/50 text-[10px] font-mono font-bold text-purple-200 border border-purple-500/30"
                    title="Recule le cut de 200ms"
                  >
                    +0.2s
                  </button>
                </div>
              </div>

              {/* Resume Duration Adjuster */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Durée Révélation</span>
                  <span className="font-mono font-bold text-white">{liveResumeDuration.toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => adjustResumeDuration(-0.5)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    -0.5s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustResumeDuration(-0.1)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustResumeDuration(0.1)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustResumeDuration(0.5)}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-300"
                  >
                    +0.5s
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QCM Options Sandbox Test */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span>Tester le comportement des 4 Choix QCM</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Clique sur un bouton pour tester le feedback
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentMoment.options.map((opt, optIdx) => {
                const isCorrect = opt === currentMoment.correctPunchline;
                const isSelected = testedOption === opt;

                let cardStyle =
                  'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-200';
                if (isSelected) {
                  cardStyle = isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/40'
                    : 'bg-red-950/50 border-red-500 text-red-100 shadow-md shadow-red-950/40';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTestedOption(opt)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${cardStyle}`}
                  >
                    <span className="w-5 h-5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-[10px] font-mono font-bold text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      {optIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {isCorrect && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            1. Vraie réplique
                          </span>
                        )}
                        {!isCorrect && currentMoment.id === 'geeks_super_pouvoirs_voler' && optIdx === 1 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            2. 1 mot qui change (sais ➔ peux)
                          </span>
                        )}
                        {!isCorrect && !(currentMoment.id === 'geeks_super_pouvoirs_voler' && optIdx === 1) && optIdx < 3 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {optIdx + 1}. Réplique culte du sketch
                          </span>
                        )}
                        {!isCorrect && optIdx === 3 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            4. Alternative comique
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold leading-snug">{opt}</p>
                      {isSelected && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Bonne réponse ! (+1 000 pts)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-red-400">Piège sélectionné</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PARTIE REELLE 100% LES GEEKS */}
      {/* ========================================================================= */}
      {activeTab === 'play' && (
        <div className="flex flex-col gap-4">
          <div className="bg-orange-950/30 border border-orange-500/40 rounded-2xl p-3 text-xs text-orange-200 flex items-center justify-between gap-3">
            <span>
              Mode Test actif : toutes les répliques sont tirées exclusivement de la vidéo <strong>« Cyprien - Les geeks »</strong>.
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className="text-orange-400 hover:text-white underline font-semibold shrink-0 cursor-pointer"
            >
              Retour au Studio
            </button>
          </div>

          <QuoteGameView
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
            onBackToBlindtest={onClose}
            customQuestions={moments}
            modeTitle="Test 100% « Les geeks »"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SOUS-TITRES COMPLETS (88 LIGNES) */}
      {/* ========================================================================= */}
      {activeTab === 'transcript' && (
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
            <Search className="w-4 h-4 text-zinc-400 ml-1" />
            <input
              type="text"
              placeholder="Rechercher dans les 88 sous-titres (ex: angry birds, facebook, pc, porn, livre)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none flex-1 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Subtitles List */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 flex flex-col gap-2 max-h-[550px] overflow-y-auto">
            {filteredTranscript.length === 0 ? (
              <p className="text-xs text-zinc-500 p-4 text-center">Aucun sous-titre trouvé pour cette recherche.</p>
            ) : (
              filteredTranscript.map((item) => (
                <div
                  key={item.index}
                  className="bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-purple-300 border border-zinc-700 shrink-0 mt-0.5">
                      {Math.floor(item.offset / 60)}:{(item.offset % 60).toFixed(0).padStart(2, '0')} ({item.duration}s)
                    </span>
                    <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadSubtitleIntoStudio(item)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-bold border border-purple-500/40 transition-all shrink-0 cursor-pointer"
                  >
                    Tester dans Studio
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
