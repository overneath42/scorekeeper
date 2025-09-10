import { createContext } from "@lit/context";

// Test Date
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

/**
 * Represents a single score entry for a player.
 *
 * @property {number} 0 - The index of the player.
 * @property {number} 1 - The points scored by the player.
 */
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
}

export type GameState = {
  activeGame: Game | null;
  gamesList: Game[];
};

export const gameStoreContext = createContext<GameStore>("game-store");

const SAMPLE_GAME: Game = {
  name: "Sample Game",
  targetScore: 100,
  players: SAMPLE_PLAYERS,
  scoringHistory: SAMPLE_SCORING_HISTORY,
};

export class GameStore extends EventTarget {
  private state: GameState;

  constructor(initialState?: Partial<GameState>) {
    super();
    this.state = {
      activeGame: initialState?.activeGame || SAMPLE_GAME,
      gamesList: initialState?.gamesList || [SAMPLE_GAME],
    };
  }

  // Get current state (immutable copy)
  getState(): GameState {
    return {
      ...this.state,
      activeGame: this.state.activeGame ? { ...this.state.activeGame } : null,
    };
  }

  // Actions
  setActiveGame(game: Game): void {
    this.state.activeGame = game;
    this.dispatchEvent(new CustomEvent("statechange", { detail: { action: "setActiveGame" } }));
  }

  setGameTitle(title: string): void {
    this.state.activeGame = this.state.activeGame
      ? { ...this.state.activeGame, name: title }
      : null;
    this.dispatchEvent(
      new CustomEvent("statechange", { detail: { action: "setGameTitle", title } })
    );
  }

  setPlayers(players: GamePlayer[]): void {
    this.state.activeGame = this.state.activeGame ? { ...this.state.activeGame, players } : null;
    this.dispatchEvent(new CustomEvent("statechange", { detail: { action: "setPlayers" } }));
  }

  addGame(game: Game): void {
    this.state.gamesList = [...this.state.gamesList, game];
  }

  addScore(playerIndex: number, points: number): void {
    this.state.activeGame = this.state.activeGame
      ? {
          ...this.state.activeGame,
          scoringHistory: [...this.state.activeGame.scoringHistory, [playerIndex, points]],
        }
      : null;
    this.dispatchEvent(
      new CustomEvent("statechange", { detail: { action: "addScore", playerIndex, points } })
    );
  }

  // Computed getters
  getActiveGame(): Game | null {
    return this.state.activeGame;
  }

  getGameTitle(): string {
    return this.state.activeGame ? this.state.activeGame.name : "No Game";
  }

  getPlayers(): { index: number; name: string }[] {
    return this.state.activeGame ? this.state.activeGame.players : [];
  }

  getPlayerScores(playerIndex: number): number[] {
    return this.state.activeGame
      ? this.state.activeGame.scoringHistory
          .filter(([pIndex]: [number, number]) => pIndex === playerIndex)
          .map(([, points]: [number, number]) => points)
      : [];
  }

  getTotalScore(playerIndex: number): number {
    return this.getPlayerScores(playerIndex).reduce((sum, score) => sum + score, 0);
  }

  getCurrentScores(): { [playerIndex: number]: number } {
    const scores: { [playerIndex: number]: number } = {};
    this.state.activeGame?.players.forEach((player) => {
      scores[player.index] = this.getTotalScore(player.index);
    });
    return scores;
  }

  getGamesList(): Game[] {
    return [...this.state.gamesList];
  }

  clearActiveGame(): void {
    this.state.activeGame = null;
    this.dispatchEvent(new CustomEvent("statechange", { detail: { action: "clearActiveGame" } }));
  }

  // Reset game
  resetGame(): void {
    if (!this.state.activeGame) return;

    this.state.activeGame = {
      ...this.state.activeGame,
      scoringHistory: [],
    };
    this.dispatchEvent(new CustomEvent("statechange", { detail: { action: "resetGame" } }));
  }

  // Clear all data
  clearGame(): void {
    this.state.activeGame = null;
    this.dispatchEvent(new CustomEvent("statechange", { detail: { action: "clearGame" } }));
  }
}

// Global store instance
export const gameStore = new GameStore();
