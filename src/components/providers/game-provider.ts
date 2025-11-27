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
  private timerInterval: number | null = null;
  private lastSaveTime: number = 0;
  private isPageVisible: boolean = true;

  connectedCallback() {
    super.connectedCallback();
    // Set up Page Visibility API listener
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    this.isPageVisible = !document.hidden;
  };

  private startTimer() {
    // Only start timer if game has a time limit, is active, and has remaining time
    if (!this.game.timeLimit || this.game.status !== "active" || !this.game.timeRemaining || this.game.timeRemaining <= 0) {
      return;
    }

    // Don't start if already running
    if (this.timerInterval !== null) {
      return;
    }

    // Update lastActiveAt when starting timer
    if (this.currentGameId) {
      this.storage.updateLastActiveAt(this.currentGameId, new Date());
    }

    this.timerInterval = window.setInterval(() => this.tickTimer(), 1000);
  }

  private stopTimer() {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private tickTimer() {
    // Only tick if page is visible, game is active, and has time remaining
    if (!this.isPageVisible || this.game.status !== "active" || !this.game.timeRemaining || this.game.timeRemaining <= 0) {
      return;
    }

    // Decrement time remaining and trigger reactivity by reassigning the game object
    this.game = {
      ...this.game,
      timeRemaining: this.game.timeRemaining - 1
    };

    // Save to storage every 5 seconds
    const now = Date.now();
    if (now - this.lastSaveTime >= 5000) {
      if (this.currentGameId && this.game.timeRemaining !== null) {
        this.storage.updateTimeRemaining(this.currentGameId, this.game.timeRemaining);
        this.storage.updateLastActiveAt(this.currentGameId, new Date());
      }
      this.lastSaveTime = now;
    }

    // Check for time expiry
    if (this.game.timeRemaining !== null && this.game.timeRemaining <= 0) {
      this.handleTimeExpiry();
    }
  }

  private handleTimeExpiry() {
    this.stopTimer();

    if (!this.currentGameId) return;

    // Save final time remaining (0)
    this.storage.updateTimeRemaining(this.currentGameId, 0);

    // Determine winner based on rules
    const playerScores = this.storage.calculatePlayerScores(this.game);
    const maxScore = Math.max(...playerScores);
    let hasWinner = false;

    if (this.game.targetScore) {
      // Check if anyone met the target score
      const someoneMetTarget = playerScores.some(score => score >= this.game.targetScore!);

      if (someoneMetTarget) {
        hasWinner = true;
      } else {
        // No one met target - apply timer behavior
        if (this.game.timerBehavior === 'highest-score') {
          hasWinner = maxScore > 0;
        } else {
          // 'no-winner' behavior
          hasWinner = false;
        }
      }
    } else {
      // No target score - highest score wins
      hasWinner = maxScore > 0;
    }

    // Mark game as completed
    this.storage.updateGameStatus(this.currentGameId, "completed");

    // Reload game to reflect completion status
    const finalGame = this.storage.getStoredGame(this.currentGameId);
    if (finalGame) {
      this.loadGame(finalGame);
    }

    // Dispatch custom event for time expiry modal
    this.dispatchEvent(new CustomEvent('time-expired', {
      bubbles: true,
      composed: true,
      detail: { hasWinner, playerScores }
    }));
  }

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
        // Check if game should be completed based on target score
        if (updatedGame.targetScore && updatedGame.status === "active") {
          const playerScores = this.storage.calculatePlayerScores(updatedGame);
          const hasWinner = playerScores.some(
            (playerScore) => playerScore >= updatedGame.targetScore!
          );

          if (hasWinner) {
            this.storage.updateGameStatus(this.currentGameId, "completed");
            const finalGame = this.storage.getStoredGame(this.currentGameId);
            if (finalGame) {
              this.loadGame(finalGame);
              return;
            }
          }
        }

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

  private getCurrentWinners = (): GamePlayer[] => {
    if (!this.game) return [];

    const scores = this.game.players.map((player) => this.getPlayerCurrentScore(player.index));
    const maxScore = Math.max(...scores);
    return this.game.players.filter(
      (player) => this.getPlayerCurrentScore(player.index) === maxScore && maxScore > 0
    );
  };

  private isCurrentWinner = (playerIndex: number): boolean => {
    return this.getCurrentWinners().some((player) => player.index === playerIndex);
  };

  private get gameIsTied(): boolean {
    const currentWinners = this.getCurrentWinners();
    return currentWinners.length > 1;
  }

  // Turn tracking methods
  private hasTurnTracking = (): boolean => {
    return this.game.turnTrackingEnabled === true;
  };

  private getCurrentPlayerIndex = (): number | null => {
    if (!this.hasTurnTracking()) return null;
    return this.game.currentPlayerIndex ?? null;
  };

  private getCurrentTurnNumber = (): number | null => {
    if (!this.hasTurnTracking()) return null;
    return this.game.currentTurnNumber ?? null;
  };

  private canPlayerScore = (playerIndex: number): boolean => {
    // Completed games: no scoring
    if (this.game.status === "completed") return false;

    // No turn tracking: anyone can score
    if (!this.hasTurnTracking()) return true;

    // Turn tracking: only current player can score
    return this.getCurrentPlayerIndex() === playerIndex;
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
    // Stop existing timer before loading new game
    this.stopTimer();

    this.game = {
      ...storedGame,
      createNewGame: this.createNewGame,
      updateGame: this.updateGame,
      addScore: this.addScore,
      getPlayerScoringHistory: this.getPlayerScoringHistory,
      getPlayerCurrentScore: this.getPlayerCurrentScore,
      isCurrentWinner: this.isCurrentWinner,
      loadGameById: this.loadGameById,
      isTied: this.gameIsTied,
      // Turn tracking methods
      canPlayerScore: this.canPlayerScore,
      getCurrentPlayerIndex: this.getCurrentPlayerIndex,
      getCurrentTurnNumber: this.getCurrentTurnNumber,
      hasTurnTracking: this.hasTurnTracking,
    };

    // Start timer if this is a timed, active game
    if (storedGame.timeLimit && storedGame.status === "active" && storedGame.timeRemaining && storedGame.timeRemaining > 0) {
      this.startTimer();
    }

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
    timeLimit: null,
    timeRemaining: null,
    lastActiveAt: null,
    timerBehavior: null,
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
    isTied: this.gameIsTied,
    // Turn tracking methods
    canPlayerScore: this.canPlayerScore,
    getCurrentPlayerIndex: this.getCurrentPlayerIndex,
    getCurrentTurnNumber: this.getCurrentTurnNumber,
    hasTurnTracking: this.hasTurnTracking,
  };

  render() {
    return html`<slot></slot>`;
  }
}
