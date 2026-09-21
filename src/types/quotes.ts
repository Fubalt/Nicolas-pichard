export interface QuoteQuestion {
  id: string;
  videoId: string;
  videoTitle: string;
  contextDescription: string;
  startTime: number;
  pauseTime: number;
  resumeDuration: number;
  setupPhrase: string;
  correctPunchline: string;
  options: string[];
  explanation?: string;
}

export type QuoteGameStatus =
  | 'ready'
  | 'playing_setup'
  | 'waiting_answer'
  | 'revealing'
  | 'finished';

export interface QuoteAnswerRecord {
  question: QuoteQuestion;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}
