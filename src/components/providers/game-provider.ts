import { provide } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent, type Game, type GamePlayer } from "@/utils";
import { GameStorageService, type StoredGame } from "@/services";

const now = new Date();

@customElement("x-game-provider")
export class GameProviderComponent extends BaseComponent {
  private get storage() {
    return GameStorageService.getInstance();
  }
  private currentGameId: string | null = null;
  private timerInterval: number | null = null;
  private lastSaveTime: number = 0;
  private isPageVisible: boolean = true;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer(true);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    this.isPageVisible = !document.hidden;
  };

  private startTimer() {
    if (!this.game.timeLimit || this.game.status !== "active" || !this.game.timeRemaining || this.game.timeRemaining <= 0) {
      return;
    }

    if (this.timerInterval !== null) {
      return;
    }

    if (this.currentGameId) {
      void this.storage.updateLastActiveAt(this.currentGameId, new Date());
    }

    this.timerInterval = window.setInterval(() => this.tickTimer(), 1000);
  }

  private stopTimer(withFinalSave: boolean = false) {
    if (this.timerInterval !== null) {
      if (withFinalSave && this.currentGameId && this.game.timeRemaining !== null) {
        void this.storage.updateTimeRemaining(this.currentGameId, this.game.timeRemaining);
      }

      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private tickTimer() {
    if (!this.isPageVisible || this.game.status !== "active" || !this.game.timeRemaining || this.game.timeRemaining <= 0) {
      return;
    }

    this.game = {
      ...this.game,
      timeRemaining: this.game.timeRemaining - 1
    };

    const now = Date.now();
    if (now - this.lastSaveTime >= 5000) {
      if (this.currentGameId && this.game.timeRemaining !== null) {
        void this.storage.updateTimeRemaining(this.currentGameId, this.game.timeRemaining);
        void this.storage.updateLastActiveAt(this.currentGameId, new Date());
      }
      this.lastSaveTime = now;
    }

    if (this.game.timeRemaining !== null && this.game.timeRemaining <= 0) {
      void this.handleTimeExpiry();
    }
  }

  private async handleTimeExpiry() {
    this.stopTimer();

    if (!this.currentGameId) return;

    await this.storage.updateTimeRemaining(this.currentGameId, 0);

    const playerScores = this.storage.calculatePlayerScores(this.game);
    const maxScore = Math.max(...playerScores);
    let hasWinner = false;

    if (this.game.targetScore) {
      const someoneMetTarget = playerScores.some(score => score >= this.game.targetScore!);

      if (someoneMetTarget) {
        hasWinner = true;
      } else {
        if (this.game.timerBehavior === 'highest-score') {
          hasWinner = maxScore > 0;
        } else {
          hasWinner = false;
        }
      }
    } else {
      hasWinner = maxScore > 0;
    }

    await this.storage.updateGameStatus(this.currentGameId, "completed");

    const finalGame = await this.storage.getStoredGame(this.currentGameId);
    if (finalGame) {
      this.loadGame(finalGame);
    }

    this.dispatchEvent(new CustomEvent('time-expired', {
      bubbles: true,
      composed: true,
      detail: { hasWinner, playerScores }
    }));
  }

  private createNewGame = async (name: string, targetScore: number, players: string[]) => {
    const storedGame = await this.storage.createGame(name, players, targetScore);
    this.currentGameId = storedGame.id;
    this.loadGame(storedGame);
  };

  private updateGame = async (game: Game) => {
    if (this.currentGameId) {
      await this.storage.updateGame(this.currentGameId, game);
      const updatedGame = await this.storage.getStoredGame(this.currentGameId);
      if (updatedGame) {
        this.loadGame(updatedGame);
      }
    }
  };

  private addScore = async (playerIndex: number, score: number) => {
    if (this.currentGameId) {
      await this.storage.addScore(this.currentGameId, playerIndex, score);
      const updatedGame = await this.storage.getStoredGame(this.currentGameId);

      if (updatedGame) {
        if (updatedGame.targetScore && updatedGame.status === "active") {
          const playerScores = this.storage.calculatePlayerScores(updatedGame);
          const hasWinner = playerScores.some(
            (playerScore) => playerScore >= updatedGame.targetScore!
          );

          if (hasWinner) {
            await this.storage.updateGameStatus(this.currentGameId, "completed");
            const finalGame = await this.storage.getStoredGame(this.currentGameId);
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
    const scores = this.storage.calculatePlayerScores(this.game);
    return scores[playerIndex] || 0;
  };

  private getPlayerScoringHistory = (playerIndex: number): number[] => {
    return this.storage.getPlayerScoringHistory(this.game, playerIndex);
  };

  private getCurrentWinners = (): GamePlayer[] => {
    if (!this.game) return [];
    const scores = this.storage.calculatePlayerScores(this.game);
    const maxScore = Math.max(...scores);
    return this.game.players.filter(
      (player) => scores[player.index] === maxScore && maxScore > 0
    );
  };

  private isCurrentWinner = (playerIndex: number): boolean => {
    return this.getCurrentWinners().some((player) => player.index === playerIndex);
  };

  private get gameIsTied(): boolean {
    const currentWinners = this.getCurrentWinners();
    return currentWinners.length > 1;
  }

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
    if (this.game.status === "completed") return false;
    if (!this.hasTurnTracking()) return true;
    return this.getCurrentPlayerIndex() === playerIndex;
  };

  private loadGame = (storedGame: StoredGame) => {
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
      canPlayerScore: this.canPlayerScore,
      getCurrentPlayerIndex: this.getCurrentPlayerIndex,
      getCurrentTurnNumber: this.getCurrentTurnNumber,
      hasTurnTracking: this.hasTurnTracking,
    };

    if (storedGame.timeLimit && storedGame.status === "active" && storedGame.timeRemaining && storedGame.timeRemaining > 0) {
      this.startTimer();
    }

    this.requestUpdate();
  };

  loadGameById = async (gameId: string) => {
    const storedGame = await this.storage.getStoredGame(gameId);
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
    createNewGame: this.createNewGame,
    updateGame: this.updateGame,
    addScore: this.addScore,
    getPlayerScoringHistory: this.getPlayerScoringHistory,
    getPlayerCurrentScore: this.getPlayerCurrentScore,
    isCurrentWinner: this.isCurrentWinner,
    loadGameById: this.loadGameById,
    isTied: this.gameIsTied,
    canPlayerScore: this.canPlayerScore,
    getCurrentPlayerIndex: this.getCurrentPlayerIndex,
    getCurrentTurnNumber: this.getCurrentTurnNumber,
    hasTurnTracking: this.hasTurnTracking,
  };

  render() {
    return html`<slot></slot>`;
  }
}
