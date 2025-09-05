import { createContext } from "@lit/context";

export interface GamePlayer {
  index: number;
  name: string;
}

export type GameState = {
  gameTitle: string;
  players: GamePlayer[];
  scoringHistory: [number, number][]; // [playerIndex, points]
};

// Create context for the game store
export const gameStoreContext = createContext<GameStore>("game-store");

const SAMPLE_PLAYERS: GamePlayer[] = [
  { index: 0, name: "Justin" },
  { index: 1, name: "Kelly" },
];

const SAMPLE_SCORING_HISTORY: [number, number][] = [
  [0, 10],
  [1, 15],
  [0, 5],
  [1, 20],
  [0, 10],
  [1, 20],
  [0, 1],
  [1, 10],
];

export class GameStore {
  private state: GameState;

  constructor(initialState?: Partial<GameState>) {
    this.state = {
      gameTitle: initialState?.gameTitle || "New Game",
      players: initialState?.players || SAMPLE_PLAYERS,
      scoringHistory: initialState?.scoringHistory || SAMPLE_SCORING_HISTORY,
    };
  }

  // Get current state (immutable copy)
  getState(): GameState {
    return {
      ...this.state,
      players: [...this.state.players],
      scoringHistory: [...this.state.scoringHistory],
    };
  }

  // Actions
  setGameTitle(title: string): void {
    this.state.gameTitle = title;
  }

  setPlayers(players: string[]): void {
    this.state.players = players.map((name, index) => ({ index, name }));
  }

  addScore(playerIndex: number, points: number): void {
    this.state.scoringHistory.push([playerIndex, points]);
  }

  // Computed getters
  getPlayers(): { index: number; name: string }[] {
    return this.state.players;
  }

  getPlayerScores(playerIndex: number): number[] {
    return this.state.scoringHistory
      .filter(([pIndex]) => pIndex === playerIndex)
      .map(([, points]) => points);
  }

  getTotalScore(playerIndex: number): number {
    return this.getPlayerScores(playerIndex).reduce(
      (sum, score) => sum + score,
      0
    );
  }

  getCurrentScores(): { [playerIndex: number]: number } {
    const scores: { [playerIndex: number]: number } = {};
    this.state.players.forEach((player) => {
      scores[player.index] = this.getTotalScore(player.index);
    });
    return scores;
  }

  // Reset game
  resetGame(): void {
    this.state.scoringHistory = [];
  }

  // Clear all data
  clearGame(): void {
    this.state = {
      gameTitle: "New Game",
      players: [],
      scoringHistory: [],
    };
  }
}

// Global store instance
export const gameStore = new GameStore();
