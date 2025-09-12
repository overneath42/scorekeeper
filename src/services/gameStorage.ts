import { LocalStorageAdapter, type Game, type GamePlayer, type ScoreEntry } from "@/utils";

export interface StoredGame extends Game {
  id: string;
  timecode: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "completed" | "paused";
}

export interface GameSummary {
  id: string;
  name: string;
  playerCount: number;
  status: "active" | "completed" | "paused";
  createdAt: Date;
  updatedAt: Date;
  currentScores: number[];
}

export class GameStorageService {
  private storage: LocalStorageAdapter<StoredGame>;
  private static instance: GameStorageService;

  private constructor() {
    // TODO: eventually it would be great to make this user-configurable, so we can eventually
    // expose it to other storage backends (IndexedDB, remote API, etc)
    this.storage = new LocalStorageAdapter<StoredGame>("scorekeeper");
  }

  static getInstance(): GameStorageService {
    if (!GameStorageService.instance) {
      GameStorageService.instance = new GameStorageService();
    }
    return GameStorageService.instance;
  }

  saveGame(storedGame: StoredGame): boolean {
    const gameToSave = {
      ...storedGame,
      updatedAt: new Date(),
    };
    return this.storage.set(storedGame.id, gameToSave);
  }

  getStoredGame(gameId: string): StoredGame | null {
    const game = this.storage.get(gameId);
    if (game) {
      return {
        ...game,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt),
      };
    }
    return null;
  }

  getAllStoredGames(): StoredGame[] {
    const gameIds = this.storage.keys();
    return gameIds
      .map((id) => this.getStoredGame(id))
      .filter((game): game is StoredGame => game !== null)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getGameSummaries(): GameSummary[] {
    return this.getAllStoredGames().map((storedGame) => {
      const currentScores = this.calculatePlayerScores(storedGame);
      return {
        id: storedGame.id,
        name: storedGame.name,
        playerCount: storedGame.players.length,
        status: storedGame.status,
        createdAt: storedGame.createdAt,
        updatedAt: storedGame.updatedAt,
        currentScores,
      };
    });
  }

  deleteGame(gameId: string): boolean {
    return this.storage.remove(gameId);
  }

  createGame(name: string, playerNames: string[], targetScore: number | null = null): StoredGame {
    const now = new Date();
    const id = generateUUID();
    const timecode = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const players: GamePlayer[] = playerNames.map((name, index) => ({
      index,
      name,
    }));

    const storedGame: StoredGame = {
      id,
      timecode,
      name,
      players,
      targetScore,
      scoringHistory: [],
      createdAt: now,
      updatedAt: now,
      status: "active",
    };

    this.saveGame(storedGame);
    return storedGame;
  }

  addScore(gameId: string, playerIndex: number, score: number): boolean {
    const storedGame = this.getStoredGame(gameId);
    if (!storedGame) return false;

    if (playerIndex < 0 || playerIndex >= storedGame.players.length) return false;

    const scoreEntry: ScoreEntry = [playerIndex, score];
    storedGame.scoringHistory.push(scoreEntry);
    return this.saveGame(storedGame);
  }

  updateGameStatus(gameId: string, status: StoredGame["status"]): boolean {
    const storedGame = this.getStoredGame(gameId);
    if (!storedGame) return false;

    storedGame.status = status;
    return this.saveGame(storedGame);
  }

  updateGame(gameId: string, gameData: Partial<Game>): boolean {
    const storedGame = this.getStoredGame(gameId);
    if (!storedGame) return false;

    Object.assign(storedGame, gameData);
    return this.saveGame(storedGame);
  }

  calculatePlayerScores(storedGame: StoredGame): number[] {
    const scores = new Array(storedGame.players.length).fill(0);
    storedGame.scoringHistory.forEach(([playerIndex, score]) => {
      if (playerIndex >= 0 && playerIndex < scores.length) {
        scores[playerIndex] += score;
      }
    });
    return scores;
  }

  getPlayerScoringHistory(storedGame: StoredGame, playerIndex: number): number[] {
    return storedGame.scoringHistory
      .filter(([pIndex]) => pIndex === playerIndex)
      .map(([, score]) => score);
  }

  toGameContext(storedGame: StoredGame): Game {
    return {
      name: storedGame.name,
      targetScore: storedGame.targetScore,
      players: storedGame.players,
      scoringHistory: storedGame.scoringHistory,
    };
  }

  fromGameContext(game: Game, gameId?: string): StoredGame {
    const existingGame = gameId ? this.getStoredGame(gameId) : null;
    const now = new Date();

    return {
      ...game,
      id: gameId || `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: existingGame?.createdAt || now,
      updatedAt: now,
      status: existingGame?.status || "active",
    };
  }

  clearAllGames(): boolean {
    return this.storage.clear();
  }
}

/**
 * Generates a simple UUID v4 string.
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
