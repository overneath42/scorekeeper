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

  // Turn tracking (optional - only present in new games with feature enabled)
  turnTrackingEnabled?: boolean;    // Feature flag
  currentPlayerIndex?: number;      // 0-based index of whose turn it is
  currentTurnNumber?: number;       // 1-based turn counter for display

  // Quick score mode (optional)
  quickScoreValues?: number[];      // If set, show as prominent quick buttons (e.g., [1, -1] or [1, 2, 5])
  hideHistory?: boolean;            // If true, hide the detailed score history (show totals only)
}
