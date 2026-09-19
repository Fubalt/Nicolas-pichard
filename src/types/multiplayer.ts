import { VideoItem, GameMode } from './game';

export type RoomStatus = 'lobby' | 'playing' | 'round_recap' | 'finished';

export interface BattlePlayer {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  hasFinishedRound?: boolean;
  roundScore?: number;
  lastAttemptUsed?: number;
  lastTimeSpent?: number;
}

export interface BattleRound {
  roundIndex: number;
  video: VideoItem;
  startTime: number;
}

export interface RoomConfig {
  roomCode: string;
  hostId: string;
  totalRounds: number;
  mode: GameMode;
  rounds: BattleRound[];
}

export type MultiplayerAction =
  | { type: 'PLAYER_JOIN'; player: BattlePlayer }
  | { type: 'PLAYER_LEAVE'; playerId: string }
  | { type: 'SYNC_ROOM'; config: RoomConfig; players: BattlePlayer[]; currentRoundIndex: number; status: RoomStatus }
  | { type: 'START_GAME' }
  | {
      type: 'ROUND_FINISHED';
      playerId: string;
      roundIndex: number;
      success: boolean;
      attemptIndex: number;
      timeSpent: number;
      pointsEarned: number;
    }
  | { type: 'NEXT_ROUND'; nextRoundIndex: number }
  | { type: 'FINISH_GAME' }
  | { type: 'REPLAY_BATTLE'; newRounds: BattleRound[] };
