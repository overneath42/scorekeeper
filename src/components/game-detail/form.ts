import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property, state } from "lit/decorators.js";
import { BaseComponent } from "@/utils";
import { gameListContext, type GameListContext } from "@/context";
import { GameStorageService, StoredGame } from "@/services";
import barba from "@barba/core";

type GameFormContext = "create" | "edit";

@customElement("x-game-detail-form")
export class GameDetailFormComponent extends BaseComponent {
  @consume({ context: gameListContext, subscribe: true })
  @property({ attribute: false })
  gameList?: GameListContext;

  @property({ type: Object })
  @state()
  game: StoredGame | null = null;

  @property({ type: Array })
  @state()
  players: string[] = ["Player 1"];

  @property({ type: String })
  @state()
  gameName: string = "";

  @property({ type: Number })
  @state()
  targetScore: number | null = null;

  @property({ type: Boolean })
  @state()
  isTimedGame: boolean = false;

  @property({ type: Number })
  @state()
  hours: number = 0;

  @property({ type: Number })
  @state()
  minutes: number = 0;

  @property({ type: String })
  @state()
  timerBehavior: 'no-winner' | 'highest-score' | null = null;

  @property({ type: String, attribute: "context" })
  context: GameFormContext = "create";

  storage = GameStorageService.getInstance();

  get isEditMode() {
    return this.context === "edit";
  }

  get canChangePlayers() {
    return (this.game?.scoringHistory ?? []).length === 0;
  }

  get canChangeTimeSettings() {
    return (this.game?.scoringHistory ?? []).length === 0;
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
        this.game = storedGame;
        this.gameName = storedGame.name;
        this.targetScore = storedGame.targetScore;
        this.players = storedGame.players.map((player) => player.name);

        // Populate time-related fields
        if (storedGame.timeLimit) {
          this.isTimedGame = true;
          const totalMinutes = Math.floor(storedGame.timeLimit / 60);
          this.hours = Math.floor(totalMinutes / 60);
          this.minutes = totalMinutes % 60;
          this.timerBehavior = storedGame.timerBehavior;
        }
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
    const timeLimit = this.isTimedGame
      ? (this.hours * 3600) + (this.minutes * 60)
      : null;
    const timerBehavior = this.isTimedGame && this.targetScore !== null
      ? this.timerBehavior
      : null;

    const game = this.storage.createGame(
      this.gameName,
      this.players,
      this.targetScore,
      timeLimit,
      timerBehavior
    );
    this.gameList?.addGame(game);
    this.redirectToGameboard(game.id);
  }

  private handleEditSubmit() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
      const existingGame = this.storage.getStoredGame(id);

      if (existingGame) {
        const timeLimit = this.isTimedGame
          ? (this.hours * 3600) + (this.minutes * 60)
          : null;
        const timerBehavior = this.isTimedGame && this.targetScore !== null
          ? this.timerBehavior
          : null;

        const updatedGame = {
          ...existingGame,
          name: this.gameName,
          targetScore: this.targetScore,
          players: this.players.map((playerName, index) => ({
            index,
            name: playerName,
          })),
          timeLimit,
          timeRemaining: timeLimit,
          timerBehavior,
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

  private handleTimedGameToggle(e: Event) {
    const input = e.target as HTMLInputElement;
    this.isTimedGame = input.checked;
    if (!this.isTimedGame) {
      this.hours = 0;
      this.minutes = 0;
      this.timerBehavior = null;
    } else if (this.targetScore !== null && this.timerBehavior === null) {
      // Default to 'highest-score' when enabling timed game with target score
      this.timerBehavior = 'highest-score';
    }
  }

  private handleHoursInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.hours = input.value ? parseInt(input.value) : 0;
  }

  private handleMinutesInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.minutes = input.value ? parseInt(input.value) : 0;
  }

  private handleTimerBehaviorChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.timerBehavior = input.value as 'no-winner' | 'highest-score';
  }

  private redirectToGameboard(gameId: string) {
    const url = new URL("/pages/play.html", window.location.href);
    url.searchParams.set("id", gameId);
    barba.go(url.toString());
  }

  private get formIsValid(): boolean {
    const hasPlayers = this.players.length >= 2;
    const hasName = this.gameName.trim().length > 0;
    const targetScoreValid = this.targetScore === null || this.targetScore > 0;
    const timeValid = !this.isTimedGame || (this.hours > 0 || this.minutes > 0);
    const timerBehaviorValid = !this.isTimedGame || this.targetScore === null || this.timerBehavior !== null;

    return hasPlayers && hasName && targetScoreValid && timeValid && timerBehaviorValid;
  }

  render() {
    return html`
      <form @submit="${this.handleSubmit}" class="h-full overflow-hidden flex flex-col gap-md">
        <div class="px-md flex-1 overflow-y-auto">
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
          <!-- Timed Game Field -->
          <div class="form-group">
            <label class="flex items-center gap-2 ${this.canChangeTimeSettings ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}">
              <input
                type="checkbox"
                id="timed-game"
                name="timedGame"
                .checked=${this.isTimedGame}
                ?disabled=${!this.canChangeTimeSettings}
                @change="${this.handleTimedGameToggle}"
                class="w-4 h-4" />
              <span class="form-label mb-0">Timed Game</span>
            </label>
            ${!this.canChangeTimeSettings ? html`
              <p class="form-help-text text-orange-600">Timer settings cannot be changed after scoring begins</p>
            ` : ''}
          </div>
          ${this.isTimedGame ? html`
            <!-- Time Limit Fields -->
            <div class="form-group">
              <label class="form-label">Time Limit</label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <input
                    type="number"
                    id="hours"
                    name="hours"
                    min="0"
                    step="1"
                    class="form-input"
                    placeholder="Hours"
                    ?disabled=${!this.canChangeTimeSettings}
                    .value=${this.hours > 0 ? String(this.hours) : ""}
                    @input="${this.handleHoursInput}" />
                </div>
                <div class="flex-1">
                  <input
                    type="number"
                    id="minutes"
                    name="minutes"
                    min="0"
                    max="59"
                    step="1"
                    class="form-input"
                    placeholder="Minutes"
                    ?disabled=${!this.canChangeTimeSettings}
                    .value=${this.minutes > 0 ? String(this.minutes) : ""}
                    @input="${this.handleMinutesInput}" />
                </div>
              </div>
              <p class="form-help-text">Enter at least 1 minute</p>
            </div>
            ${this.targetScore !== null ? html`
              <!-- Timer Behavior Field -->
              <div class="form-group">
                <label class="form-label">If time expires with no winner</label>
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-2 ${this.canChangeTimeSettings ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}">
                    <input
                      type="radio"
                      name="timerBehavior"
                      value="highest-score"
                      .checked=${this.timerBehavior === 'highest-score'}
                      ?disabled=${!this.canChangeTimeSettings}
                      @change="${this.handleTimerBehaviorChange}"
                      class="w-4 h-4" />
                    <span>Highest Score Wins</span>
                  </label>
                  <label class="flex items-center gap-2 ${this.canChangeTimeSettings ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}">
                    <input
                      type="radio"
                      name="timerBehavior"
                      value="no-winner"
                      .checked=${this.timerBehavior === 'no-winner'}
                      ?disabled=${!this.canChangeTimeSettings}
                      @change="${this.handleTimerBehaviorChange}"
                      class="w-4 h-4" />
                    <span>No Winner</span>
                  </label>
                </div>
              </div>
            ` : ''}
          ` : ''}
          <!-- Players Field -->
          <x-game-detail-player-list
            .players="${this.players}"
            ?disable-editing="${!this.canChangePlayers}"
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
