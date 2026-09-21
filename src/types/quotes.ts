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
  options: string[]; // 4 exact subtitle quotes (1 correct + 3 real distractors)
}

export type QuoteGameStatus =
  | 'ready'
  | 'playing_setup'
  | 'waiting_manual'
  | 'waiting_qcm'
  | 'revealing'
  | 'finished';

export interface QuoteAnswerRecord {
  question: QuoteQuestion;
  userText?: string;
  selectedOption?: string;
  isCorrect: boolean;
  method: 'manual' | 'qcm' | 'failed';
  pointsEarned: number;
}
