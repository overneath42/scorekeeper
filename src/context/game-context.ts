import { createContext } from "@lit/context";
import type { Game } from "@/types/index.js";
import { StoredGame } from "@/services";

export interface GameContext extends StoredGame {
  createNewGame: (name: string, targetScore: number, players: string[]) => Promise<void>;
  addScore: (playerIndex: number, score: number) => Promise<void>;
  updateGame: (game: Game) => Promise<void>;
  getPlayerScoringHistory: (playerIndex: number) => number[];
  getPlayerCurrentScore: (playerIndex: number) => number;
  isCurrentWinner: (playerIndex: number) => boolean;
  loadGameById: (gameId: string) => Promise<void>;
  isTied: boolean;

  // Turn tracking methods
  canPlayerScore: (playerIndex: number) => boolean;
  getCurrentPlayerIndex: () => number | null;
  getCurrentTurnNumber: () => number | null;
  hasTurnTracking: () => boolean;
}

export const gameContext = createContext<GameContext>(Symbol("game-context"));
