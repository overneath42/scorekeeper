import { LocalStorageAdapter, StorageAdapter, type Game, type GamePlayer, type ScoreEntry } from "@/utils";
import { normalizeDates } from "@/utils/normalizeDates.js";

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
  private storage: StorageAdapter<StoredGame>;
  private static instance: GameStorageService;

  private constructor(storage?: StorageAdapter<StoredGame>) {
    this.storage = storage ?? new LocalStorageAdapter<StoredGame>("scorekeeper");
  }

  static initialize(storage: StorageAdapter<StoredGame>): void {
    GameStorageService.instance = new GameStorageService(storage);
  }

  static getInstance(): GameStorageService {
    if (!GameStorageService.instance) {
      GameStorageService.instance = new GameStorageService();
    }
    return GameStorageService.instance;
  }

  async saveGame(storedGame: StoredGame): Promise<boolean> {
    const gameToSave = {
      ...storedGame,
      updatedAt: new Date(),
    };
    return this.storage.set(storedGame.id, gameToSave);
  }

  async getStoredGame(gameId: string): Promise<StoredGame | null> {
    const game = await this.storage.get(gameId);
    if (game) {
      return normalizeDates(game);
    }
    return null;
  }

  async getAllStoredGames(): Promise<StoredGame[]> {
    let games: StoredGame[];
    if (this.storage.getAll) {
      const raw = await this.storage.getAll();
      games = raw.map(normalizeDates);
    } else {
      const ids = await this.storage.keys();
      games = (await Promise.all(ids.map(id => this.getStoredGame(id))))
        .filter((g): g is StoredGame => g !== null);
    }
    return games.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getGameSummaries(): Promise<GameSummary[]> {
    const games = await this.getAllStoredGames();
    return games.map((storedGame) => {
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

  async deleteGame(gameId: string): Promise<boolean> {
    return this.storage.remove(gameId);
  }

  async createGame(
    name: string,
    playerNames: string[],
    targetScore: number | null = null,
    timeLimit: number | null = null,
    timerBehavior: 'no-winner' | 'highest-score' | null = null,
    turnTrackingEnabled: boolean = true
  ): Promise<StoredGame> {
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
      timeLimit,
      timeRemaining: timeLimit,
      lastActiveAt: null,
      timerBehavior,
      createdAt: now,
      updatedAt: now,
      status: "active",
      turnTrackingEnabled,
      currentPlayerIndex: turnTrackingEnabled ? 0 : undefined,
      currentTurnNumber: turnTrackingEnabled ? 1 : undefined,
    };

    await this.saveGame(storedGame);
    return storedGame;
  }

  async addScore(gameId: string, playerIndex: number, score: number): Promise<boolean> {
    const storedGame = await this.getStoredGame(gameId);
    if (!storedGame) return false;

    if (playerIndex < 0 || playerIndex >= storedGame.players.length) return false;

    if (storedGame.turnTrackingEnabled && storedGame.currentPlayerIndex !== playerIndex) {
      console.warn(
        `Turn validation failed: expected player ${storedGame.currentPlayerIndex}, got ${playerIndex}`
      );
      return false;
    }

    const scoreEntry: ScoreEntry = [playerIndex, score];
    storedGame.scoringHistory.push(scoreEntry);

    if (storedGame.turnTrackingEnabled) {
      const nextPlayerIndex = (playerIndex + 1) % storedGame.players.length;
      storedGame.currentPlayerIndex = nextPlayerIndex;

      if (nextPlayerIndex === 0) {
        storedGame.currentTurnNumber = (storedGame.currentTurnNumber ?? 1) + 1;
      }
    }

    return this.saveGame(storedGame);
  }

  async updateGameStatus(gameId: string, status: StoredGame["status"]): Promise<boolean> {
    const storedGame = await this.getStoredGame(gameId);
    if (!storedGame) return false;

    storedGame.status = status;
    return this.saveGame(storedGame);
  }

  async updateGame(gameId: string, gameData: Partial<Game>): Promise<boolean> {
    const storedGame = await this.getStoredGame(gameId);
    if (!storedGame) return false;

    Object.assign(storedGame, gameData);
    return this.saveGame(storedGame);
  }

  async updateTimeRemaining(gameId: string, timeRemaining: number): Promise<boolean> {
    const storedGame = await this.getStoredGame(gameId);
    if (!storedGame) return false;

    storedGame.timeRemaining = timeRemaining;
    return this.saveGame(storedGame);
  }

  async updateLastActiveAt(gameId: string, timestamp: Date): Promise<boolean> {
    const storedGame = await this.getStoredGame(gameId);
    if (!storedGame) return false;

    storedGame.lastActiveAt = timestamp;
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
      timeLimit: storedGame.timeLimit,
      timeRemaining: storedGame.timeRemaining,
      lastActiveAt: storedGame.lastActiveAt,
      timerBehavior: storedGame.timerBehavior,
    };
  }

  async fromGameContext(game: Game, gameId?: string): Promise<StoredGame> {
    const existingGame = gameId ? await this.getStoredGame(gameId) : null;
    const now = new Date();

    return {
      ...game,
      id: gameId || generateUUID(),
      timecode:
        existingGame?.timecode ||
        `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: existingGame?.createdAt || now,
      updatedAt: now,
      status: existingGame?.status || "active",
    };
  }

  async clearAllGames(): Promise<boolean> {
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
