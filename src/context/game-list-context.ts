import { StoredGame } from "@/services";
import { createContext } from "@lit/context";

export interface GameListContext {
  games: StoredGame[];
  getAllGames(): Promise<StoredGame[]>;
  addGame(game: StoredGame): Promise<void>;
  removeGame(id: string): Promise<void>;
  updateGame(game: StoredGame): Promise<void>;
  clearGames(): Promise<void>;
}

export const gameListContext = createContext<GameListContext>(Symbol("game-list-context"));
