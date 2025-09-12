import { provide } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent, type Game, type GamePlayer } from "@/utils";
import { GameStorageService, type StoredGame } from "@/services";

const now = new Date();

@customElement("x-game-provider")
export class GameProviderComponent extends BaseComponent {
  private storage = GameStorageService.getInstance();
  private currentGameId: string | null = null;

  private createNewGame = (name: string, targetScore: number, players: string[]) => {
    const storedGame = this.storage.createGame(name, players, targetScore);
    this.currentGameId = storedGame.id;
    this.loadGame(storedGame);
  };

  private updateGame = (game: Game) => {
    if (this.currentGameId) {
      this.storage.updateGame(this.currentGameId, game);
      const updatedGame = this.storage.getStoredGame(this.currentGameId);
      if (updatedGame) {
        this.loadGame(updatedGame);
      }
    }
  };

  private addScore = (playerIndex: number, score: number) => {
    if (this.currentGameId) {
      this.storage.addScore(this.currentGameId, playerIndex, score);
      const updatedGame = this.storage.getStoredGame(this.currentGameId);
      if (updatedGame) {
        this.loadGame(updatedGame);
      }
    }
  };

  private getPlayerCurrentScore = (playerIndex: number): number => {
    if (this.currentGameId) {
      const storedGame = this.storage.getStoredGame(this.currentGameId);
      if (storedGame) {
        const scores = this.storage.calculatePlayerScores(storedGame);
        return scores[playerIndex] || 0;
      }
    }
    return 0;
  };

  private getPlayerScoringHistory = (playerIndex: number): number[] => {
    if (this.currentGameId) {
      const storedGame = this.storage.getStoredGame(this.currentGameId);
      if (storedGame) {
        return this.storage.getPlayerScoringHistory(storedGame, playerIndex);
      }
    }
    return [];
  };

  private getCurrentWinner = (): GamePlayer[] => {
    const scores = this.game.players.map((player) => this.getPlayerCurrentScore(player.index));
    const maxScore = Math.max(...scores);
    return this.game.players.filter(
      (player) => this.getPlayerCurrentScore(player.index) === maxScore && maxScore > 0
    );
  };

  private isCurrentWinner = (playerIndex: number): boolean => {
    return this.getCurrentWinner().some((player) => player.index === playerIndex);
  };

  /**
   * Loads a stored game into the current game state, attaching relevant game methods to the loaded object.
   *
   * @param storedGame - The game data to load, typically retrieved from storage.
   *
   * This method sets the `game` property to the loaded game data and binds core game manipulation methods
   * (such as creating a new game, updating the game, adding scores, retrieving player scoring history and current score,
   * checking for the current winner, and loading a game by ID) to the loaded game object. After updating the game state,
   * it triggers a UI update by calling `requestUpdate()`.
   */
  private loadGame = (storedGame: StoredGame) => {
    this.game = {
      ...storedGame,
      createNewGame: this.createNewGame,
      updateGame: this.updateGame,
      addScore: this.addScore,
      getPlayerScoringHistory: this.getPlayerScoringHistory,
      getPlayerCurrentScore: this.getPlayerCurrentScore,
      isCurrentWinner: this.isCurrentWinner,
      loadGameById: this.loadGameById,
    };
    this.requestUpdate();
  };

  /**
   * Loads a game by its unique identifier.
   *
   * Retrieves the stored game data associated with the provided `gameId` from storage.
   * If the game exists, sets the current game ID and loads the game into the application state.
   *
   * @param gameId - The unique identifier of the game to load.
   */
  loadGameById = (gameId: string) => {
    const storedGame = this.storage.getStoredGame(gameId);
    if (storedGame) {
      this.currentGameId = gameId;
      this.loadGame(storedGame);
    }
  };

  @provide({ context: gameContext })
  @property({ type: Object, attribute: false })
  game: GameContext = {
    id: "",
    timecode: "",
    name: "",
    targetScore: null,
    players: [],
    scoringHistory: [],
    createdAt: now,
    updatedAt: now,
    status: "active",
    // For easy testing/development, uncomment to start with sample data
    // ...SAMPLE_GAME,
    createNewGame: this.createNewGame,
    updateGame: this.updateGame,
    addScore: this.addScore,
    getPlayerScoringHistory: this.getPlayerScoringHistory,
    getPlayerCurrentScore: this.getPlayerCurrentScore,
    isCurrentWinner: this.isCurrentWinner,
    loadGameById: this.loadGameById,
  };

  render() {
    return html`<slot></slot>`;
  }
}
