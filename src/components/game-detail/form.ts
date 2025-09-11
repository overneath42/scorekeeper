import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property, state } from "lit/decorators.js";
import { BaseComponent } from "@/utils";
import { gameListContext, type GameListContext } from "@/context";
import { GameStorageService } from "@/services";

type GameFormContext = "create" | "edit";

@customElement("x-game-detail-form")
export class GameDetailFormComponent extends BaseComponent {
  @consume({ context: gameListContext, subscribe: true })
  @property({ attribute: false })
  gameList?: GameListContext;

  @property({ type: Array })
  @state()
  players: string[] = ["Player 1", "Player 2"];

  @property({ type: String })
  @state()
  gameName: string = "";

  @property({ type: Number })
  @state()
  targetScore: number | null = null;

  @property({ type: String, attribute: "context" })
  context: GameFormContext = "create";

  storage = GameStorageService.getInstance();

  get isEditMode() {
    return this.context === "edit";
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.context === "edit") {
      this.populateForm();
    }
  }

  private populateForm() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
      const storedGame = this.storage.getStoredGame(id);

      if (storedGame) {
        this.gameName = storedGame.name;
        this.targetScore = storedGame.targetScore;
        this.players = storedGame.players.map((player) => player.name);
      } else {
        console.warn(`No stored game found with ID: ${id}`);
      }
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.formIsValid) return;

    switch (this.context) {
      case "create":
        this.handleCreateSubmit();
        break;
      case "edit":
        this.handleEditSubmit();
        break;
      default:
        console.warn(`Unknown form context: ${this.context}`);
    }
  }

  private handleCreateSubmit() {
    const game = this.storage.createGame(this.gameName, this.players, this.targetScore);
    this.gameList?.addGame(game);
    this.redirectToGameboard(game.id);
  }

  private handleEditSubmit() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
      const existingGame = this.storage.getStoredGame(id);

      if (existingGame) {
        const updatedGame = {
          ...existingGame,
          name: this.gameName,
          targetScore: this.targetScore,
          players: this.players.map((playerName, index) => ({
            index,
            name: playerName,
          })),
          updatedAt: new Date(),
        };

        this.storage.saveGame(updatedGame);
        this.gameList?.updateGame(updatedGame);
        this.redirectToGameboard(updatedGame.id);
      } else {
        console.warn(`No stored game found with ID: ${id}`);
      }
    }
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

  private redirectToGameboard(gameId: string) {
    const url = new URL("play.html", window.location.href);
    url.searchParams.set("id", gameId);
    window.location.href = url.toString();
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
      <form @submit="${this.handleSubmit}" class="h-full flex flex-col gap-4">
        <div class="px-md">
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
          <x-game-detail-player-list
            .players="${this.players}"
            @players-changed="${this.handlePlayersChanged}"></x-game-detail-player-list>
        </div>

        <!-- Submit Button -->
        <div class="p-md mt-auto border-t">
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
    "x-game-detail-form": GameDetailFormComponent;
  }
}
