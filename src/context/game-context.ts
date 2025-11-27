import { createContext } from "@lit/context";
import type { Game } from "@/types/index.js";
import { StoredGame } from "@/services";

export interface GameContext extends StoredGame {
  createNewGame: (name: string, targetScore: number, players: string[]) => void;
  addScore: (playerIndex: number, score: number) => void;
  updateGame: (game: Game) => void;
  getPlayerScoringHistory: (playerIndex: number) => number[];
  getPlayerCurrentScore: (playerIndex: number) => number;
  isCurrentWinner: (playerIndex: number) => boolean;
  loadGameById: (gameId: string) => void;
  isTied: boolean;

  // Turn tracking methods
  canPlayerScore: (playerIndex: number) => boolean;
  getCurrentPlayerIndex: () => number | null;
  getCurrentTurnNumber: () => number | null;
  hasTurnTracking: () => boolean;
}

export const gameContext = createContext<GameContext>(Symbol("game-context"));
