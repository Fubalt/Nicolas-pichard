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
  options: string[]; // 1 exact subtitle + 3 deceptive declensions to create doubt
}

export type QuoteGameStatus =
  | 'ready'
  | 'waiting_qcm'
  | 'revealing'
  | 'finished';

export interface QuoteAnswerRecord {
  question: QuoteQuestion;
  selectedOption: string;
  isCorrect: boolean;
  pointsEarned: number;
}
