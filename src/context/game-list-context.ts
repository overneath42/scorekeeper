import { StoredGame } from "@/services";
import { createContext } from "@lit/context";

export interface GameListContext {
  games: StoredGame[];
  getAllGames(): StoredGame[];
  addGame(game: StoredGame): void;
  removeGame(id: string): void;
  updateGame(game: StoredGame): void;
  clearGames(): void;
}

export const gameListContext = createContext<GameListContext>(Symbol("game-list-context"));
