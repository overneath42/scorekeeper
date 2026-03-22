import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { BaseComponent, parseTimeLimit, type GameTemplate } from "@/utils";
import { gameListContext, type GameListContext } from "@/context";
import { GameStorageService, StoredGame, TemplateStorageService } from "@/services";
import type { ModalComponent } from "@/components/modal/modal.js";
import type { SaveTemplateModalComponent } from "./save-template-modal.js";
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
  timerBehavior: "no-winner" | "highest-score" | null = null;

  @property({ type: Boolean })
  @state()
  turnTrackingEnabled: boolean = false;

  @property({ type: String, attribute: "context" })
  context: GameFormContext = "create";

  @state()
  templates: GameTemplate[] = [];

  @state()
  selectedTemplateId: string = "";

  @state()
  templateToDelete: GameTemplate | null = null;

  get storage() { return GameStorageService.getInstance(); }
  templateStorage = TemplateStorageService.getInstance();

  private saveTemplateModalRef: Ref<SaveTemplateModalComponent> = createRef();
  private deleteModalRef: Ref<ModalComponent> = createRef();

  get isEditMode() {
    return this.context === "edit";
  }

  get canChangePlayers() {
    return (this.game?.scoringHistory ?? []).length === 0;
  }

  get canChangeTimeSettings() {
    return (this.game?.scoringHistory ?? []).length === 0;
  }

  get canChangeTurnTracking() {
    return (this.game?.scoringHistory ?? []).length === 0;
  }

  private get templateFieldsValid(): boolean {
    const hasPlayers = this.players.length >= 1;
    const targetScoreValid = this.targetScore === null || this.targetScore > 0;
    const timeValid = !this.isTimedGame || this.hours > 0 || this.minutes > 0;
    const timerBehaviorValid =
      !this.isTimedGame || this.targetScore === null || this.timerBehavior !== null;
    return hasPlayers && targetScoreValid && timeValid && timerBehaviorValid;
  }

  private get formIsValid(): boolean {
    return this.templateFieldsValid && this.gameName.trim().length > 0;
  }

  connectedCallback() {
    super.connectedCallback();
    void this.templateStorage.getAllTemplates().then(templates => {
      this.templates = templates;
    });
    if (this.context === "edit") {
      void this.populateForm();
    }
  }

  private async populateForm() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
      const storedGame = await this.storage.getStoredGame(id);

      if (storedGame) {
        this.game = storedGame;
        this.gameName = storedGame.name;
        this.targetScore = storedGame.targetScore;
        this.players = storedGame.players.map((player) => player.name);

        // Populate time-related fields
        if (storedGame.timeLimit) {
          this.isTimedGame = true;
          const { hours, minutes } = parseTimeLimit(storedGame.timeLimit);
          this.hours = hours;
          this.minutes = minutes;
          this.timerBehavior = storedGame.timerBehavior;
        }

        // Populate turn tracking
        this.turnTrackingEnabled = storedGame.turnTrackingEnabled ?? false;
      } else {
        console.warn(`No stored game found with ID: ${id}`);
      }
    }
  }

  private resetFormToDefaults() {
    this.players = ["Player 1"];
    this.targetScore = null;
    this.isTimedGame = false;
    this.hours = 0;
    this.minutes = 0;
    this.timerBehavior = null;
    this.turnTrackingEnabled = false;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.formIsValid) return;

    switch (this.context) {
      case "create":
        void this.handleCreateSubmit();
        break;
      case "edit":
        void this.handleEditSubmit();
        break;
      default:
        console.warn(`Unknown form context: ${this.context}`);
    }
  }

  private async handleCreateSubmit() {
    const timeLimit = this.isTimedGame ? this.hours * 3600 + this.minutes * 60 : null;
    const timerBehavior = this.isTimedGame && this.targetScore !== null ? this.timerBehavior : null;

    const game = await this.storage.createGame(
      this.gameName,
      this.players,
      this.targetScore,
      timeLimit,
      timerBehavior,
      this.turnTrackingEnabled
    );
    await this.gameList?.addGame(game);
    this.redirectToGameboard(game.id);
  }

  private async handleEditSubmit() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
      const existingGame = await this.storage.getStoredGame(id);

      if (existingGame) {
        const timeLimit = this.isTimedGame ? this.hours * 3600 + this.minutes * 60 : null;
        const timerBehavior =
          this.isTimedGame && this.targetScore !== null ? this.timerBehavior : null;

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
          turnTrackingEnabled: this.turnTrackingEnabled,
          updatedAt: new Date(),
        };

        await this.storage.saveGame(updatedGame);
        await this.gameList?.updateGame(updatedGame);
        this.redirectToGameboard(updatedGame.id);
      } else {
        console.warn(`No stored game found with ID: ${id}`);
      }
    }
  }

  private handleTemplateSelect(e: CustomEvent<{ templateId: string }>) {
    this.selectedTemplateId = e.detail.templateId;

    if (!this.selectedTemplateId) {
      this.resetFormToDefaults();
      return;
    }

    void this.templateStorage.getTemplate(this.selectedTemplateId).then(template => {
      if (!template) return;

      this.players = [...template.players];
      this.targetScore = template.targetScore;
      this.isTimedGame = template.timeLimit !== null && template.timeLimit > 0;
      if (this.isTimedGame && template.timeLimit) {
        const { hours, minutes } = parseTimeLimit(template.timeLimit);
        this.hours = hours;
        this.minutes = minutes;
      } else {
        this.hours = 0;
        this.minutes = 0;
      }
      this.timerBehavior = template.timerBehavior;
      this.turnTrackingEnabled = template.turnTrackingEnabled;
    });
  }

  private handleDeleteTemplateClick() {
    if (!this.selectedTemplateId) return;
    void this.templateStorage.getTemplate(this.selectedTemplateId).then(template => {
      if (!template) return;

      this.templateToDelete = template;
      this.deleteModalRef.value?.open({
        title: "Delete Template",
        content: html`
          <p class="mb-4">
            Are you sure you want to delete the template "${template.templateName}"? This action
            cannot be undone.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click=${() => this.deleteModalRef.value?.close()}
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              @click=${() => this.confirmDeleteTemplate()}
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete
            </button>
          </div>
        `,
        size: "sm",
        onClose: () => {
          this.templateToDelete = null;
        },
      });
    });
  }

  private confirmDeleteTemplate() {
    if (!this.templateToDelete) return;
    void this.templateStorage.deleteTemplate(this.templateToDelete.id);
    this.templateToDelete = null;
    this.selectedTemplateId = "";
    this.resetFormToDefaults();
    void this.templateStorage.getAllTemplates().then(templates => {
      this.templates = templates;
    });
    this.deleteModalRef.value?.close();
  }

  private handleOpenSaveTemplateModal() {
    this.saveTemplateModalRef.value?.open();
  }

  private handleSaveTemplate(e: CustomEvent) {
    const { templateName } = e.detail;
    const timeLimit = this.isTimedGame ? this.hours * 3600 + this.minutes * 60 : null;
    const timerBehavior = this.isTimedGame && this.targetScore !== null ? this.timerBehavior : null;

    void this.templateStorage.createTemplate({
      templateName,
      players: this.players,
      targetScore: this.targetScore,
      timeLimit,
      timerBehavior,
      turnTrackingEnabled: this.turnTrackingEnabled,
    }).then(template => {
      if (template) {
        void this.templateStorage.getAllTemplates().then(templates => {
          this.templates = templates;
        });
        this.saveTemplateModalRef.value?.close();
      } else {
        this.saveTemplateModalRef.value?.showSaveError();
      }
    });
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
      this.timerBehavior = "highest-score";
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
    this.timerBehavior = input.value as "no-winner" | "highest-score";
  }

  private handleTurnTrackingToggle(e: Event) {
    const input = e.target as HTMLInputElement;
    this.turnTrackingEnabled = input.checked;
  }

  private redirectToGameboard(gameId: string) {
    const url = new URL("/pages/play.html", window.location.href);
    url.searchParams.set("id", gameId);
    barba.go(url.toString());
  }

  render() {
    return html`
      <div class="h-full overflow-hidden flex flex-col" @save-template="${this.handleSaveTemplate}">
        <form @submit="${this.handleSubmit}" class="flex-1 overflow-hidden flex flex-col gap-md">
          <div class="px-md flex-1 overflow-y-auto">
            <!-- Game Name Field -->
            <div class="form-group pt-md">
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

            <!-- Template Selector (create mode only, when templates exist) -->
            ${this.context === "create" && this.templates.length > 0
              ? html`
                  <div class="form-group">
                    <label class="form-label">Start from Template</label>
                    <div class="flex gap-2 items-center">
                      <x-template-select
                        class="flex-1"
                        .templates=${this.templates}
                        .selectedTemplateId=${this.selectedTemplateId}
                        @template-select=${this.handleTemplateSelect}>
                      </x-template-select>
                      ${this.selectedTemplateId
                        ? html`
                            <button
                              type="button"
                              @click="${this.handleDeleteTemplateClick}"
                              class="btn btn-error"
                              title="Delete template">
                              Delete
                            </button>
                          `
                        : ""}
                    </div>
                  </div>

                  <div class="flex items-center gap-4 my-md">
                    <div class="flex-1 border-t border-gray-300"></div>
                    <span class="text-sm font-medium text-gray-500">OR</span>
                    <div class="flex-1 border-t border-gray-300"></div>
                  </div>
                `
              : ""}

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              <!-- Section A: Basic Fields -->
              <div class="md:col-span-1 lg:col-span-1 space-y-0">
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

                <!-- Section B fields for medium screens only -->
                <div class="md:block lg:hidden">
                  <!-- Turn Tracking Field -->
                  <div class="form-group">
                    <label
                      class="flex items-center gap-2 ${this.canChangeTurnTracking
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"}">
                      <input
                        type="checkbox"
                        id="turn-tracking"
                        name="turnTracking"
                        .checked=${this.turnTrackingEnabled}
                        ?disabled=${!this.canChangeTurnTracking}
                        @change="${this.handleTurnTrackingToggle}"
                        class="w-4 h-4" />
                      <span class="form-label mb-0">Turn-based Scoring</span>
                    </label>
                    <p class="form-help-text">Players take turns scoring in order</p>
                    ${!this.canChangeTurnTracking
                      ? html`
                          <p class="form-help-text text-orange-600">
                            Turn tracking cannot be changed after scoring begins
                          </p>
                        `
                      : ""}
                  </div>
                  <!-- Timed Game Field -->
                  <div class="form-group">
                    <label
                      class="flex items-center gap-2 ${this.canChangeTimeSettings
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"}">
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
                    ${!this.canChangeTimeSettings
                      ? html`
                          <p class="form-help-text text-orange-600">
                            Timer settings cannot be changed after scoring begins
                          </p>
                        `
                      : ""}
                  </div>
                  ${this.isTimedGame
                    ? html`
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
                        ${this.targetScore !== null
                          ? html`
                              <!-- Timer Behavior Field -->
                              <div class="form-group">
                                <label class="form-label">If time expires with no winner</label>
                                <div class="flex flex-col gap-2">
                                  <label
                                    class="flex items-center gap-2 ${this.canChangeTimeSettings
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed opacity-50"}">
                                    <input
                                      type="radio"
                                      name="timerBehavior"
                                      value="highest-score"
                                      .checked=${this.timerBehavior === "highest-score"}
                                      ?disabled=${!this.canChangeTimeSettings}
                                      @change="${this.handleTimerBehaviorChange}"
                                      class="w-4 h-4" />
                                    <span>Highest Score Wins</span>
                                  </label>
                                  <label
                                    class="flex items-center gap-2 ${this.canChangeTimeSettings
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed opacity-50"}">
                                    <input
                                      type="radio"
                                      name="timerBehavior"
                                      value="no-winner"
                                      .checked=${this.timerBehavior === "no-winner"}
                                      ?disabled=${!this.canChangeTimeSettings}
                                      @change="${this.handleTimerBehaviorChange}"
                                      class="w-4 h-4" />
                                    <span>No Winner</span>
                                  </label>
                                </div>
                              </div>
                            `
                          : ""}
                      `
                    : ""}
                </div>
              </div>

              <!-- Section B: Checkbox & Options (large screens only) -->
              <div class="hidden lg:block space-y-0">
                <!-- Turn Tracking Field -->
                <div class="form-group">
                  <label
                    class="flex items-center gap-2 ${this.canChangeTurnTracking
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"}">
                    <input
                      type="checkbox"
                      id="turn-tracking-lg"
                      name="turnTracking"
                      .checked=${this.turnTrackingEnabled}
                      ?disabled=${!this.canChangeTurnTracking}
                      @change="${this.handleTurnTrackingToggle}"
                      class="w-4 h-4" />
                    <span class="form-label mb-0">Turn-based Scoring</span>
                  </label>
                  <p class="form-help-text">Players take turns scoring in order</p>
                  ${!this.canChangeTurnTracking
                    ? html`
                        <p class="form-help-text text-orange-600">
                          Turn tracking cannot be changed after scoring begins
                        </p>
                      `
                    : ""}
                </div>
                <!-- Timed Game Field -->
                <div class="form-group">
                  <label
                    class="flex items-center gap-2 ${this.canChangeTimeSettings
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"}">
                    <input
                      type="checkbox"
                      id="timed-game-lg"
                      name="timedGame"
                      .checked=${this.isTimedGame}
                      ?disabled=${!this.canChangeTimeSettings}
                      @change="${this.handleTimedGameToggle}"
                      class="w-4 h-4" />
                    <span class="form-label mb-0">Timed Game</span>
                  </label>
                  ${!this.canChangeTimeSettings
                    ? html`
                        <p class="form-help-text text-orange-600">
                          Timer settings cannot be changed after scoring begins
                        </p>
                      `
                    : ""}
                </div>
                ${this.isTimedGame
                  ? html`
                      <!-- Time Limit Fields -->
                      <div class="form-group">
                        <label class="form-label">Time Limit</label>
                        <div class="flex gap-2">
                          <div class="flex-1">
                            <input
                              type="number"
                              id="hours-lg"
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
                              id="minutes-lg"
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
                      ${this.targetScore !== null
                        ? html`
                            <!-- Timer Behavior Field -->
                            <div class="form-group">
                              <label class="form-label">If time expires with no winner</label>
                              <div class="flex flex-col gap-2">
                                <label
                                  class="flex items-center gap-2 ${this.canChangeTimeSettings
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"}">
                                  <input
                                    type="radio"
                                    name="timerBehavior"
                                    value="highest-score"
                                    .checked=${this.timerBehavior === "highest-score"}
                                    ?disabled=${!this.canChangeTimeSettings}
                                    @change="${this.handleTimerBehaviorChange}"
                                    class="w-4 h-4" />
                                  <span>Highest Score Wins</span>
                                </label>
                                <label
                                  class="flex items-center gap-2 ${this.canChangeTimeSettings
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"}">
                                  <input
                                    type="radio"
                                    name="timerBehavior"
                                    value="no-winner"
                                    .checked=${this.timerBehavior === "no-winner"}
                                    ?disabled=${!this.canChangeTimeSettings}
                                    @change="${this.handleTimerBehaviorChange}"
                                    class="w-4 h-4" />
                                  <span>No Winner</span>
                                </label>
                              </div>
                            </div>
                          `
                        : ""}
                    `
                  : ""}
              </div>

              <!-- Section C: Player List -->
              <div class="md:col-span-1 lg:col-span-1">
                <x-game-detail-player-list
                  .players="${this.players}"
                  ?disable-editing="${!this.canChangePlayers}"
                  @players-changed="${this.handlePlayersChanged}"></x-game-detail-player-list>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-md mt-auto border-t flex flex-col gap-2 md:flex-row md:justify-end">
            <button
              type="button"
              ?disabled="${!this.templateFieldsValid}"
              @click="${this.handleOpenSaveTemplateModal}"
              class="w-full md:w-auto btn btn-secondary">
              Save As Template
            </button>
            <button
              ?disabled="${!this.formIsValid}"
              type="submit"
              class="w-full md:w-auto btn btn-primary">
              ${this.isEditMode ? "Update Game" : "Create Game"}
            </button>
          </div>
        </form>

        <x-save-template-modal ${ref(this.saveTemplateModalRef)}></x-save-template-modal>
        <x-modal ${ref(this.deleteModalRef)}></x-modal>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-detail-form": GameDetailFormComponent;
  }
}
