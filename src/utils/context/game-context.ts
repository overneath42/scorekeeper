import { createContext } from "@lit/context";
import type { Game } from "../../types/index.js";

export interface GameContext extends Game {
  addScore: (playerIndex: number, score: number) => void;
  updateGame: (game: Game) => void;
  getPlayerScoringHistory: (playerIndex: number) => number[];
  getPlayerCurrentScore: (playerIndex: number) => number;
  isCurrentWinner: (playerIndex: number) => boolean;
}

export const gameContext = createContext<GameContext>(Symbol("game-context"));
