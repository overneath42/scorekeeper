export type ScoreEntry = [number, number];

export interface GamePlayer {
  index: number;
  name: string;
}

export interface Game {
  name: string;
  targetScore: number | null;
  players: GamePlayer[];
  scoringHistory: ScoreEntry[];
  timeLimit: number | null;
  timeRemaining: number | null;
  lastActiveAt: Date | null;
  timerBehavior: 'no-winner' | 'highest-score' | null;
}
