'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoItem, GameStatus, GuessResult, GameMode } from '@/types/game';
import { CYPRIEN_ALL_VIDEOS, CYPRIEN_CLASSIC_VIDEOS, getRandomGameVideo } from '@/data/videos';
import { ATTEMPT_DURATIONS } from '@/constants/game';
import { normalizeTitle, matchesSearch } from '@/lib/utils';
import { YouTubePlayer, YouTubePlayerRef } from '@/components/YouTubePlayer';
import { TimelineProgressBar } from '@/components/TimelineProgressBar';
import { GuessHistory } from '@/components/GuessHistory';
import { GuessInput } from '@/components/GuessInput';
import { ActionControls } from '@/components/ActionControls';
import { EndGameCard } from '@/components/EndGameCard';
import { Header } from '@/components/Header';
import { RulesModal } from '@/components/RulesModal';
import { Sparkles, History, Gamepad2, Swords, MessageSquareQuote, FlaskConical } from 'lucide-react';

import { useMultiplayerRoom } from '@/hooks/useMultiplayerRoom';
import { CreateJoinRoom } from '@/components/multiplayer/CreateJoinRoom';
import { BattleLobby } from '@/components/multiplayer/BattleLobby';
import { BattleHeader } from '@/components/multiplayer/BattleHeader';
import { BattleRoundRecap } from '@/components/multiplayer/BattleRoundRecap';
import { BattlePodium } from '@/components/multiplayer/BattlePodium';
import { QuoteGameView } from '@/components/quotes/QuoteGameView';
import { GeeksDevLab } from '@/components/dev/GeeksDevLab';

export default function Home() {
  // Navigation Mode: Solo vs Battle vs Quotes vs Dev
  const [mainTab, setMainTab] = useState<'solo' | 'battle' | 'quotes' | 'dev'>('solo');
  const [initialRoomParam, setInitialRoomParam] = useState<string>('');

  // Solo Mode State
  const [gameMode, setGameMode] = useState<GameMode>('all');
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [startTime, setStartTime] = useState<number>(10);

  // Common In-Game State (Shared between Solo & Battle Round)
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [snippetProgress, setSnippetProgress] = useState<number>(0);
  const [snippetElapsed, setSnippetElapsed] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const playerRef = useRef<YouTubePlayerRef>(null);
  const battleRoundStartTimeRef = useRef<number>(0);

  // Multiplayer Hook
  const mp = useMultiplayerRoom();

  const currentSoloCatalog = gameMode === 'classic' ? CYPRIEN_CLASSIC_VIDEOS : CYPRIEN_ALL_VIDEOS;

  // Check URL query parameters for ?room=CODE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInitialRoomParam(roomParam);
        setMainTab('battle');
      }
    }
  }, []);

  const startNewSoloGame = useCallback((targetMode?: GameMode) => {
    if (playerRef.current) {
      playerRef.current.pauseSnippet();
    }
    const mode = targetMode ?? gameMode;
    const { video, startTime: newStartTime } = getRandomGameVideo({ mode });
    setCurrentVideo(video);
    setStartTime(newStartTime);
    setCurrentAttempt(0);
    setGameStatus('ready');
    setGuesses([]);
    setIsPlaying(false);
    setSnippetProgress(0);
    setSnippetElapsed(0);
  }, [gameMode]);

  // Initialize solo game on mount and restore saved mode if any
  useEffect(() => {
    let initialMode: GameMode = 'all';
    try {
      const saved = localStorage.getItem('nicolas_pichard_game_mode') as GameMode;
      if (saved === 'all' || saved === 'classic') {
        initialMode = saved;
        setGameMode(saved);
      }
    } catch (e) {}
    startNewSoloGame(initialMode);
  }, []);

  // When battle status enters 'playing', reset round player state
  useEffect(() => {
    if (mainTab === 'battle' && mp.status === 'playing' && mp.currentRound) {
      battleRoundStartTimeRef.current = Date.now();
      setCurrentAttempt(0);
      setGameStatus('ready');
      setGuesses([]);
      setIsPlaying(false);
      setSnippetProgress(0);
      setSnippetElapsed(0);
      if (playerRef.current) {
        playerRef.current.pauseSnippet();
      }
    }
  }, [mainTab, mp.status, mp.currentRoundIndex]);

  const handleSelectSoloMode = (newMode: GameMode) => {
    if (newMode === gameMode) return;
    setGameMode(newMode);
    try {
      localStorage.setItem('nicolas_pichard_game_mode', newMode);
    } catch (e) {}
    startNewSoloGame(newMode);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      if (volume === 0) setVolume(60);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  // Compute active video and catalog based on active mode
  const activeVideo =
    mainTab === 'battle' ? mp.currentRound?.video ?? null : currentVideo;
  const activeStartTime =
    mainTab === 'battle' ? mp.currentRound?.startTime ?? 10 : startTime;
  const activeCatalog =
    mainTab === 'battle'
      ? mp.roomConfig?.mode === 'classic'
        ? CYPRIEN_CLASSIC_VIDEOS
        : CYPRIEN_ALL_VIDEOS
      : currentSoloCatalog;

  const handleTogglePlay = () => {
    if (!playerRef.current || !activeVideo) return;
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    if (isPlaying) {
      playerRef.current.pauseSnippet();
    } else {
      setGameStatus('playing');
      playerRef.current.playSnippet();
    }
  };

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameStatus, playerReady, activeVideo]);

  const handleSkip = () => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    if (playerRef.current && isPlaying) {
      playerRef.current.pauseSnippet();
    }

    const currentDuration = ATTEMPT_DURATIONS[currentAttempt];
    const newGuesses: GuessResult[] = [
      ...guesses,
      {
        attemptIndex: currentAttempt,
        type: 'skipped',
        tierDuration: currentDuration,
      },
    ];
    setGuesses(newGuesses);

    if (currentAttempt + 1 >= 4) {
      // Defeat
      setGameStatus('lost');
      if (mainTab === 'battle') {
        const elapsedSec = (Date.now() - battleRoundStartTimeRef.current) / 1000;
        mp.finishCurrentRound(false, currentAttempt, elapsedSec);
      }
    } else {
      const nextAttempt = currentAttempt + 1;
      const nextDuration = ATTEMPT_DURATIONS[nextAttempt];
      setCurrentAttempt(nextAttempt);
      setTimeout(() => {
        playerRef.current?.playContinuation(currentDuration, nextDuration);
      }, 50);
    }
  };

  const handleGuess = (guessedTitle: string) => {
    if (!activeVideo || gameStatus === 'won' || gameStatus === 'lost') return;
    if (playerRef.current && isPlaying) {
      playerRef.current.pauseSnippet();
    }

    const normGuess = normalizeTitle(guessedTitle);
    const normTarget = normalizeTitle(activeVideo.title);

    const isCorrect =
      matchesSearch(activeVideo.title, guessedTitle) ||
      matchesSearch(guessedTitle, activeVideo.title) ||
      normGuess === normTarget ||
      (normGuess.length >= 4 && normTarget.includes(normGuess)) ||
      (normTarget.length >= 4 && normGuess.includes(normTarget));

    const currentDuration = ATTEMPT_DURATIONS[currentAttempt];

    if (isCorrect) {
      // Victory!
      const newGuesses: GuessResult[] = [
        ...guesses,
        {
          attemptIndex: currentAttempt,
          type: 'success',
          guessedTitle,
          tierDuration: currentDuration,
        },
      ];
      setGuesses(newGuesses);
      setGameStatus('won');
      if (mainTab === 'battle') {
        const elapsedSec = (Date.now() - battleRoundStartTimeRef.current) / 1000;
        mp.finishCurrentRound(true, currentAttempt, elapsedSec);
      }
    } else {
      // Incorrect
      const newGuesses: GuessResult[] = [
        ...guesses,
        {
          attemptIndex: currentAttempt,
          type: 'incorrect',
          guessedTitle,
          tierDuration: currentDuration,
        },
      ];
      setGuesses(newGuesses);

      if (currentAttempt + 1 >= 4) {
        // Lost after 4 attempts
        setGameStatus('lost');
        if (mainTab === 'battle') {
          const elapsedSec = (Date.now() - battleRoundStartTimeRef.current) / 1000;
          mp.finishCurrentRound(false, currentAttempt, elapsedSec);
        }
      } else {
        const nextAttempt = currentAttempt + 1;
        const nextDuration = ATTEMPT_DURATIONS[nextAttempt];
        setCurrentAttempt(nextAttempt);
        setTimeout(() => {
          playerRef.current?.playContinuation(currentDuration, nextDuration);
        }, 50);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={() => (mainTab === 'solo' ? startNewSoloGame() : setMainTab('solo'))}
        totalVideos={activeCatalog.length}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 flex flex-col gap-5">
        {/* Top Mode Switcher: Solo vs Battle Multi vs Répliques Cultes */}
        <div className="flex items-center justify-center w-full">
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-2xl flex items-center gap-1 w-full max-w-md shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                if (playerRef.current && isPlaying) playerRef.current.pauseSnippet();
                setMainTab('solo');
              }}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'solo'
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-zinc-300" />
              <span>Solo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (playerRef.current && isPlaying) playerRef.current.pauseSnippet();
                setMainTab('battle');
              }}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'battle'
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-orange-400 hover:bg-zinc-800/40'
              }`}
            >
              <Swords
                className={`w-3.5 h-3.5 ${
                  mainTab === 'battle' ? 'text-zinc-950' : 'text-orange-400'
                }`}
              />
              <span>Battle</span>
              {mp.isInRoom && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (playerRef.current && isPlaying) playerRef.current.pauseSnippet();
                setMainTab('quotes');
              }}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'quotes'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/40'
              }`}
            >
              <MessageSquareQuote
                className={`w-3.5 h-3.5 ${
                  mainTab === 'quotes' ? 'text-zinc-950' : 'text-amber-400'
                }`}
              />
              <span>Répliques</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                NEW
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (playerRef.current && isPlaying) playerRef.current.pauseSnippet();
                setMainTab('dev');
              }}
              className={`py-2 px-2 sm:px-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'dev'
                  ? 'bg-purple-600 text-white shadow-md font-black shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-purple-300 hover:bg-zinc-800/40'
              }`}
              title="Outil de test Dev dédié à la vidéo « Les geeks »"
            >
              <FlaskConical
                className={`w-3.5 h-3.5 ${
                  mainTab === 'dev' ? 'text-white' : 'text-purple-400'
                }`}
              />
              <span className="hidden xs:inline sm:inline">Lab Dev</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
                Geeks
              </span>
            </button>
          </div>
        </div>

        {/* ----------------- SOLO MODE ----------------- */}
        {mainTab === 'solo' && (
          <>
            {/* Game Mode Selector */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-2xl flex items-center gap-1 w-full shadow-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleSelectSoloMode('all')}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all select-none cursor-pointer ${
                    gameMode === 'all'
                      ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      gameMode === 'all' ? 'text-amber-400' : 'text-zinc-500'
                    }`}
                  />
                  <span>Toutes les époques ({CYPRIEN_ALL_VIDEOS.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSoloMode('classic')}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all select-none cursor-pointer ${
                    gameMode === 'classic'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/40 border border-orange-500/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <History
                    className={`w-3.5 h-3.5 ${
                      gameMode === 'classic' ? 'text-amber-200' : 'text-zinc-500'
                    }`}
                  />
                  <span>Classique ≤ 2016 ({CYPRIEN_CLASSIC_VIDEOS.length})</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 font-medium text-center">
                {gameMode === 'classic'
                  ? "📼 Époque culte : du « DESSIN » (déc. 2016) au « McDonald's » (2010)"
                  : "🌟 Catalogue complet : toutes les vidéos de 2010 à aujourd'hui"}
              </p>
            </div>

            {/* Video Player */}
            {activeVideo && (
              <YouTubePlayer
                key={`solo-${activeVideo.id}-${activeStartTime}`}
                ref={playerRef}
                videoId={activeVideo.id}
                startTime={activeStartTime}
                currentAttempt={currentAttempt}
                gameStatus={gameStatus}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                volume={volume}
                isMuted={isMuted}
                onTogglePlay={handleTogglePlay}
                onReady={() => setPlayerReady(true)}
                onProgressUpdate={(prog, elapsed) => {
                  setSnippetProgress(prog);
                  setSnippetElapsed(elapsed);
                }}
                onSnippetEnd={() => {
                  setIsPlaying(false);
                }}
              />
            )}

            {/* Timeline Progress Bar */}
            <TimelineProgressBar
              currentAttempt={currentAttempt}
              currentSnippetProgress={snippetProgress}
              currentElapsed={snippetElapsed}
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />

            {/* Guess History */}
            <GuessHistory
              guesses={guesses}
              currentAttempt={currentAttempt}
              gameStatus={gameStatus}
            />

            {/* In-Game Controls */}
            {gameStatus !== 'won' && gameStatus !== 'lost' ? (
              <div className="flex flex-col gap-4 mt-2">
                <ActionControls
                  currentAttempt={currentAttempt}
                  gameStatus={gameStatus}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onSkip={handleSkip}
                  disabled={!playerReady}
                />

                <GuessInput
                  catalog={activeCatalog}
                  onGuess={handleGuess}
                  disabled={!playerReady}
                  placeholder="Tape le nom d'une vidéo (ex: Technophobe, Les geeks...)"
                />

                <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
                  <span>Astuce : [Espace] pour Lancer / Pause</span>
                  <span>Micro-extraits calibrés</span>
                </div>
              </div>
            ) : (
              /* End Game Card */
              activeVideo && (
                <EndGameCard
                  video={activeVideo}
                  startTime={activeStartTime}
                  gameStatus={gameStatus}
                  guesses={guesses}
                  gameMode={gameMode}
                  onPlayAgain={() => startNewSoloGame()}
                  onPlayFullVideo={() => playerRef.current?.playFull()}
                />
              )
            )}
          </>
        )}

        {/* ----------------- MULTIPLAYER BATTLE MODE ----------------- */}
        {mainTab === 'battle' && (
          <>
            {/* Step 1: Not in room -> Create or Join */}
            {!mp.isInRoom && (
              <CreateJoinRoom
                initialRoomCode={initialRoomParam}
                onCreateRoom={(pseudo, totalRounds, mode) => {
                  mp.createRoom(pseudo, totalRounds, mode);
                }}
                onJoinRoom={(code, pseudo) => {
                  mp.joinRoom(code, pseudo);
                }}
                onBackToSolo={() => setMainTab('solo')}
              />
            )}

            {/* Step 2: In Room & Lobby */}
            {mp.isInRoom && mp.roomConfig && mp.status === 'lobby' && (
              <BattleLobby
                roomConfig={mp.roomConfig}
                players={mp.players}
                myPlayerId={mp.myPlayerId}
                isHost={mp.isHost}
                onStartGame={mp.startGame}
                onLeaveRoom={mp.leaveRoom}
              />
            )}

            {/* Step 3: In Room & Playing a Round */}
            {mp.isInRoom && mp.roomConfig && mp.status === 'playing' && mp.currentRound && (
              <div className="flex flex-col gap-4">
                <BattleHeader
                  currentRoundIndex={mp.currentRoundIndex}
                  totalRounds={mp.roomConfig.totalRounds}
                  roomCode={mp.roomConfig.roomCode}
                  players={mp.players}
                  myPlayerId={mp.myPlayerId}
                  onLeaveRoom={mp.leaveRoom}
                />

                {/* Video Player for this Battle Round */}
                <YouTubePlayer
                  key={`battle-${mp.currentRound.video.id}-${mp.currentRound.startTime}`}
                  ref={playerRef}
                  videoId={mp.currentRound.video.id}
                  startTime={mp.currentRound.startTime}
                  currentAttempt={currentAttempt}
                  gameStatus={gameStatus}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  volume={volume}
                  isMuted={isMuted}
                  onTogglePlay={handleTogglePlay}
                  onReady={() => setPlayerReady(true)}
                  onProgressUpdate={(prog, elapsed) => {
                    setSnippetProgress(prog);
                    setSnippetElapsed(elapsed);
                  }}
                  onSnippetEnd={() => {
                    setIsPlaying(false);
                  }}
                />

                <TimelineProgressBar
                  currentAttempt={currentAttempt}
                  currentSnippetProgress={snippetProgress}
                  currentElapsed={snippetElapsed}
                  isPlaying={isPlaying}
                  volume={volume}
                  isMuted={isMuted}
                  onVolumeChange={handleVolumeChange}
                  onToggleMute={handleToggleMute}
                />

                <GuessHistory
                  guesses={guesses}
                  currentAttempt={currentAttempt}
                  gameStatus={gameStatus}
                />

                <div className="flex flex-col gap-4 mt-2">
                  <ActionControls
                    currentAttempt={currentAttempt}
                    gameStatus={gameStatus}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    onSkip={handleSkip}
                    disabled={!playerReady}
                  />

                  <GuessInput
                    catalog={activeCatalog}
                    onGuess={handleGuess}
                    disabled={!playerReady}
                    placeholder="Tape le nom d'une vidéo (ex: Technophobe, Les geeks...)"
                  />

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
                    <span>⚡ Trouve vite pour le bonus de vitesse !</span>
                    <span>Même timecode pour tous</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Round Recap */}
            {mp.isInRoom && mp.roomConfig && mp.status === 'round_recap' && mp.currentRound && (
              <div className="flex flex-col gap-4">
                <BattleHeader
                  currentRoundIndex={mp.currentRoundIndex}
                  totalRounds={mp.roomConfig.totalRounds}
                  roomCode={mp.roomConfig.roomCode}
                  players={mp.players}
                  myPlayerId={mp.myPlayerId}
                  onLeaveRoom={mp.leaveRoom}
                />

                <BattleRoundRecap
                  roundIndex={mp.currentRoundIndex}
                  totalRounds={mp.roomConfig.totalRounds}
                  currentRound={mp.currentRound}
                  players={mp.players}
                  myPlayerId={mp.myPlayerId}
                  isHost={mp.isHost}
                  lastRoundResult={mp.lastRoundResult}
                  onNextRound={mp.nextRound}
                  onLeaveRoom={mp.leaveRoom}
                />
              </div>
            )}

            {/* Step 5: Final Podium */}
            {mp.isInRoom && mp.roomConfig && mp.status === 'finished' && (
              <BattlePodium
                players={mp.players}
                myPlayerId={mp.myPlayerId}
                isHost={mp.isHost}
                roomConfig={mp.roomConfig}
                onReplay={mp.replayBattle}
                onLeaveRoom={mp.leaveRoom}
              />
            )}
          </>
        )}

        {/* ----------------- QUOTES MODE (COMPLÈTE LA RÉPLIQUE) ----------------- */}
        {mainTab === 'quotes' && (
          <QuoteGameView
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onBackToBlindtest={() => setMainTab('solo')}
            onOpenDevLab={() => setMainTab('dev')}
          />
        )}

        {/* ----------------- DEV LAB (CYPRIEN - LES GEEKS) ----------------- */}
        {mainTab === 'dev' && (
          <GeeksDevLab
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onClose={() => setMainTab('quotes')}
          />
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Footer */}
      <footer className="w-full py-4 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <p>Nicolas Pichard</p>
      </footer>
    </div>
  );
}
