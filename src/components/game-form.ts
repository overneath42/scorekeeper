import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, Game, GameStore, gameStoreContext } from "../utils";

interface GameData {
  name: string;
  targetScore: number | null;
  players: string[];
}

@customElement("x-game-form")
export class GameFormComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: Array })
  players: string[] = ["Player 1", "Player 2"];

  @property({ type: String })
  gameName: string = "";

  @property({ type: Number })
  targetScore: number | null = null;

  @property({ attribute: false })
  onSubmit?: (gameData: GameData) => void;

  @property({ type: Boolean })
  isEditMode: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.populateFromActiveGame();
  }

  willUpdate() {
    if (this.gameStore && !this.isEditMode) {
      this.populateFromActiveGame();
    }
  }

  private populateFromActiveGame() {
    if (this.gameStore) {
      const activeGame = this.gameStore.getActiveGame();
      if (activeGame) {
        this.isEditMode = true;
        this.gameName = activeGame.name;
        this.targetScore = activeGame.targetScore;
        this.players = activeGame.players.map((player) => player.name);
      } else {
        this.isEditMode = false;
        // Reset to defaults when no active game
        this.gameName = "";
        this.targetScore = null;
        this.players = ["Player 1", "Player 2"];
      }
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.formIsValid) return;

    if (this.isEditMode) {
      // Update existing game
      this.handleEditSubmit();
    } else {
      // Create new game
      this.handleCreateSubmit();
    }
  }

  private handleCreateSubmit() {
    const newGame: Game = {
      name: this.gameName,
      targetScore: this.targetScore,
      players: this.players.map((name, index) => ({
        index,
        name,
      })),
      scoringHistory: [],
    };

    if (this.gameStore) {
      this.gameStore.addGame(newGame);
      this.gameStore.setActiveGame(newGame);
    }

    // Navigate to game detail
    window.location.href = "game-detail.html";
  }

  private handleEditSubmit() {
    if (this.gameStore) {
      // Update the active game with new details
      this.gameStore.setGameTitle(this.gameName);

      // Update players, preserving existing player indices if possible
      const updatedPlayers = this.players.map((name, index) => ({
        index,
        name,
      }));
      this.gameStore.setPlayers(updatedPlayers);

      // Update target score by reconstructing the active game
      const activeGame = this.gameStore.getActiveGame();
      if (activeGame) {
        const updatedGame: Game = {
          ...activeGame,
          targetScore: this.targetScore,
        };
        this.gameStore.setActiveGame(updatedGame);
      }
    }

    // Navigate back to game detail
    window.location.href = "game-detail.html";
  }

  private handlePlayersChanged(e: CustomEvent) {
    this.players = e.detail.players;
  }

  private handleGameNameInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.gameName = input.value;
  }

  private handleTargetScoreInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.targetScore = input.value ? parseInt(input.value) : null;
  }

  private get formIsValid(): boolean {
    const isValid =
      this.players.length >= 2 &&
      this.gameName.trim().length > 0 &&
      (this.targetScore === null || this.targetScore > 0);

    return isValid;
  }

  render() {
    return html`
      <form @submit="${this.handleSubmit}">
        <!-- Game Name Field -->
        <div class="form-group">
          <label for="game-name" class="form-label"> Game Name </label>
          <input
            type="text"
            id="game-name"
            name="name"
            .value="${this.gameName}"
            @input="${this.handleGameNameInput}"
            required
            class="form-input"
            placeholder="Enter game name" />
        </div>

        <!-- Target Score Field -->
        <div class="form-group">
          <label for="target-score" class="form-label"> Target Score </label>
          <input
            type="number"
            id="target-score"
            name="targetScore"
            min="1"
            step="1"
            class="form-input"
            placeholder="e.g. 500"
            .value=${this.targetScore !== null ? String(this.targetScore) : ""}
            @input="${this.handleTargetScoreInput}" />
          <p class="form-help-text">Optional - leave blank for open-ended games</p>
        </div>

        <!-- Players Field -->
        <x-player-list
          .players="${this.players}"
          @players-changed="${this.handlePlayersChanged}"></x-player-list>

        <!-- Submit Button -->
        <div class="pt-4 mt-4 border-t">
          <button ?disabled="${!this.formIsValid}" type="submit" class="w-full btn btn-primary">
            ${this.isEditMode ? "Update Game" : "Create Game"}
          </button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-form": GameFormComponent;
  }
}
