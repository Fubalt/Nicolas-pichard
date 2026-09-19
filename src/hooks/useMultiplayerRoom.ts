'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode } from '@/types/game';
import {
  BattlePlayer,
  BattleRound,
  RoomConfig,
  RoomStatus,
  MultiplayerAction,
} from '@/types/multiplayer';
import {
  generateDeterministicRounds,
  generateRandomRoomCode,
  calculateRoundScore,
} from '@/lib/multiplayerGenerator';

function getCleanTopic(roomCode: string): string {
  return `np-battle-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

export function useMultiplayerRoom() {
  const [isInRoom, setIsInRoom] = useState<boolean>(false);
  const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null);
  const [players, setPlayers] = useState<BattlePlayer[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [myPlayerName, setMyPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [status, setStatus] = useState<RoomStatus>('lobby');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [lastRoundResult, setLastRoundResult] = useState<{
    basePoints: number;
    speedBonus: number;
    totalPoints: number;
    success: boolean;
    attemptIndex: number;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const myPlayerIdRef = useRef<string>('');
  const isHostRef = useRef<boolean>(false);
  const roomConfigRef = useRef<RoomConfig | null>(null);
  const playersRef = useRef<BattlePlayer[]>([]);
  const statusRef = useRef<RoomStatus>('lobby');
  const currentRoundIndexRef = useRef<number>(0);

  myPlayerIdRef.current = myPlayerId;
  isHostRef.current = isHost;
  roomConfigRef.current = roomConfig;
  playersRef.current = players;
  statusRef.current = status;
  currentRoundIndexRef.current = currentRoundIndex;

  const processedRoundsRef = useRef<Set<string>>(new Set());

  // Broadcast action to all participants via ntfy
  const broadcastAction = useCallback(async (action: MultiplayerAction, roomCode: string) => {
    try {
      const topic = getCleanTopic(roomCode);
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
    } catch (e) {
      console.error('Failed to broadcast multiplayer action:', e);
    }
  }, []);

  // Process any received action
  const handleAction = useCallback((action: MultiplayerAction) => {
    switch (action.type) {
      case 'PLAYER_JOIN': {
        setPlayers((prev) => {
          const exists = prev.some((p) => p.id === action.player.id);
          if (exists) return prev;
          const updated = [...prev, action.player];
          // If I am host, respond by broadcasting current room state to keep new joiner in sync
          if (isHostRef.current && roomConfigRef.current) {
            broadcastAction(
              {
                type: 'SYNC_ROOM',
                config: roomConfigRef.current,
                players: updated,
                currentRoundIndex: currentRoundIndexRef.current,
                status: statusRef.current,
              },
              roomConfigRef.current.roomCode
            );
          }
          return updated;
        });
        break;
      }

      case 'SYNC_ROOM': {
        setRoomConfig(action.config);
        setPlayers((prev) => {
          const me = prev.find((p) => p.id === myPlayerIdRef.current);
          if (me && !action.players.some((p) => p.id === me.id)) {
            return [...action.players, me];
          }
          return action.players;
        });
        setCurrentRoundIndex(action.currentRoundIndex);
        setStatus(action.status);
        break;
      }

      case 'START_GAME': {
        processedRoundsRef.current.clear();
        setStatus('playing');
        setCurrentRoundIndex(0);
        setLastRoundResult(null);
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            score: 0,
            hasFinishedRound: false,
            roundScore: 0,
          }))
        );
        break;
      }

      case 'ROUND_FINISHED': {
        const key = `${action.playerId}_${action.roundIndex}`;
        if (processedRoundsRef.current.has(key)) {
          // Already counted this round for this player
          break;
        }
        processedRoundsRef.current.add(key);

        setPlayers((prev) =>
          prev.map((p) => {
            if (p.id === action.playerId) {
              return {
                ...p,
                score: p.score + action.pointsEarned,
                hasFinishedRound: true,
                roundScore: action.pointsEarned,
                lastAttemptUsed: action.attemptIndex,
                lastTimeSpent: action.timeSpent,
              };
            }
            return p;
          })
        );
        break;
      }

      case 'NEXT_ROUND': {
        setCurrentRoundIndex(action.nextRoundIndex);
        setStatus('playing');
        setLastRoundResult(null);
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            hasFinishedRound: false,
            roundScore: 0,
          }))
        );
        break;
      }

      case 'FINISH_GAME': {
        setStatus('finished');
        break;
      }

      case 'REPLAY_BATTLE': {
        processedRoundsRef.current.clear();
        if (roomConfigRef.current) {
          const updatedConfig: RoomConfig = {
            ...roomConfigRef.current,
            rounds: action.newRounds,
          };
          setRoomConfig(updatedConfig);
        }
        setStatus('lobby');
        setCurrentRoundIndex(0);
        setLastRoundResult(null);
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            score: 0,
            hasFinishedRound: false,
            roundScore: 0,
          }))
        );
        break;
      }

      case 'PLAYER_LEAVE': {
        setPlayers((prev) => prev.filter((p) => p.id !== action.playerId));
        break;
      }
    }
  }, [broadcastAction]);

  // Connect real-time SSE listener
  const connectSSE = useCallback(
    (code: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const topic = getCleanTopic(code);
      const url = `https://ntfy.sh/${topic}/sse`;
      const es = new EventSource(url);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message' && data.message) {
            const action: MultiplayerAction = JSON.parse(data.message);
            handleAction(action);
          }
        } catch (e) {}
      };

      eventSourceRef.current = es;

      // Also poll existing messages on initial connect to populate room state immediately
      fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`)
        .then((res) => res.text())
        .then((text) => {
          const lines = text.trim().split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.event === 'message' && data.message) {
                const action: MultiplayerAction = JSON.parse(data.message);
                handleAction(action);
              }
            } catch (err) {}
          }
        })
        .catch(() => {});
    },
    [handleAction]
  );

  // Create a new room
  const createRoom = useCallback(
    (pseudo: string, totalRounds: number, mode: GameMode) => {
      const code = generateRandomRoomCode();
      const myId = `player_${Math.random().toString(36).substring(2, 9)}`;
      const rounds = generateDeterministicRounds(code, totalRounds, mode);

      const hostPlayer: BattlePlayer = {
        id: myId,
        name: pseudo.trim() || 'Hôte',
        isHost: true,
        score: 0,
      };

      const config: RoomConfig = {
        roomCode: code,
        hostId: myId,
        totalRounds,
        mode,
        rounds,
      };

      setMyPlayerId(myId);
      setMyPlayerName(pseudo.trim() || 'Hôte');
      setIsHost(true);
      setRoomConfig(config);
      setPlayers([hostPlayer]);
      setStatus('lobby');
      setCurrentRoundIndex(0);
      setIsInRoom(true);

      connectSSE(code);

      // Broadcast SYNC_ROOM after a brief moment so broker records it
      setTimeout(() => {
        broadcastAction(
          {
            type: 'SYNC_ROOM',
            config,
            players: [hostPlayer],
            currentRoundIndex: 0,
            status: 'lobby',
          },
          code
        );
      }, 100);

      return code;
    },
    [connectSSE, broadcastAction]
  );

  // Join an existing room
  const joinRoom = useCallback(
    (code: string, pseudo: string) => {
      const cleanCode = code.toUpperCase().trim();
      const myId = `player_${Math.random().toString(36).substring(2, 9)}`;

      const newPlayer: BattlePlayer = {
        id: myId,
        name: pseudo.trim() || 'Joueur',
        isHost: false,
        score: 0,
      };

      setMyPlayerId(myId);
      setMyPlayerName(pseudo.trim() || 'Joueur');
      setIsHost(false);
      setIsInRoom(true);
      setStatus('lobby');

      connectSSE(cleanCode);

      // Announce arrival to the room
      setTimeout(() => {
        broadcastAction(
          {
            type: 'PLAYER_JOIN',
            player: newPlayer,
          },
          cleanCode
        );
      }, 200);
    },
    [connectSSE, broadcastAction]
  );

  // Start game (Host only)
  const startGame = useCallback(() => {
    if (!roomConfig || !isHost) return;
    broadcastAction({ type: 'START_GAME' }, roomConfig.roomCode);
    handleAction({ type: 'START_GAME' });
  }, [roomConfig, isHost, broadcastAction, handleAction]);

  // Finish current round for current player
  const finishCurrentRound = useCallback(
    (success: boolean, attemptIndex: number, elapsedSeconds: number) => {
      if (!roomConfig) return;

      const scoreDetails = calculateRoundScore(attemptIndex, success, elapsedSeconds);
      setLastRoundResult({
        ...scoreDetails,
        success,
        attemptIndex,
      });

      const action: MultiplayerAction = {
        type: 'ROUND_FINISHED',
        playerId: myPlayerId,
        roundIndex: currentRoundIndex,
        success,
        attemptIndex,
        timeSpent: elapsedSeconds,
        pointsEarned: scoreDetails.totalPoints,
      };

      broadcastAction(action, roomConfig.roomCode);
      handleAction(action);

      setStatus('round_recap');
    },
    [roomConfig, myPlayerId, currentRoundIndex, broadcastAction, handleAction]
  );

  // Advance to next round (or finish battle)
  const nextRound = useCallback(() => {
    if (!roomConfig) return;
    const nextIdx = currentRoundIndex + 1;

    if (nextIdx >= roomConfig.totalRounds) {
      const action: MultiplayerAction = { type: 'FINISH_GAME' };
      broadcastAction(action, roomConfig.roomCode);
      handleAction(action);
      return;
    }

    const action: MultiplayerAction = {
      type: 'NEXT_ROUND',
      nextRoundIndex: nextIdx,
    };

    broadcastAction(action, roomConfig.roomCode);
    handleAction(action);
  }, [roomConfig, currentRoundIndex, broadcastAction, handleAction]);

  // Replay a new battle in the same room with new random rounds
  const replayBattle = useCallback(() => {
    if (!roomConfig || !isHost) return;
    const newSeed = `${roomConfig.roomCode}-${Date.now()}`;
    const newRounds = generateDeterministicRounds(newSeed, roomConfig.totalRounds, roomConfig.mode);

    const action: MultiplayerAction = {
      type: 'REPLAY_BATTLE',
      newRounds,
    };

    broadcastAction(action, roomConfig.roomCode);
    handleAction(action);
  }, [roomConfig, isHost, broadcastAction, handleAction]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (roomConfig && myPlayerId) {
      broadcastAction({ type: 'PLAYER_LEAVE', playerId: myPlayerId }, roomConfig.roomCode);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsInRoom(false);
    setRoomConfig(null);
    setPlayers([]);
    setStatus('lobby');
    setLastRoundResult(null);
  }, [roomConfig, myPlayerId, broadcastAction]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const currentRound: BattleRound | null =
    roomConfig && roomConfig.rounds[currentRoundIndex] ? roomConfig.rounds[currentRoundIndex] : null;

  return {
    isInRoom,
    roomConfig,
    players,
    myPlayerId,
    myPlayerName,
    isHost,
    status,
    currentRoundIndex,
    currentRound,
    lastRoundResult,
    createRoom,
    joinRoom,
    startGame,
    finishCurrentRound,
    nextRound,
    replayBattle,
    leaveRoom,
  };
}
