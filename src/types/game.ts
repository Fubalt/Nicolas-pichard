export interface VideoItem {
  id: string;
  title: string;
  duration?: number;
  durationInSeconds: number;
  year?: number;
  views?: string;
}

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

export interface GuessResult {
  attemptIndex: number;
  type: 'success' | 'incorrect' | 'skipped';
  guessedTitle?: string;
  tierDuration: number;
}

export interface GameState {
  currentVideo: VideoItem | null;
  startTime: number;
  currentAttempt: number;
  status: GameStatus;
  guesses: GuessResult[];
  isPlaying: boolean;
  currentSnippetProgress: number; // 0 to 1
  currentElapsed: number; // in seconds
  playerReady: boolean;
}
