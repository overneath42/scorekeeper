import { consume } from "@lit/context";
import classNames from "classnames";
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, safeCall } from "@/utils/index.js";
import { type GameContext, gameContext } from "@/context";
import { GameStorageService } from "@/services";
import { createRef, ref, Ref } from "lit/directives/ref.js";

@customElement("x-gameboard")
export class GameboardComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: Number })
  maxPlayersPerView = 3;

  @property({ type: Number })
  wrapperHeight = 0;

  wrapperRef: Ref<HTMLDivElement> = createRef();
  storage = GameStorageService.getInstance();

  private get variableStyles() {
    const gridColumns = this.players.length;
    const playerWidth = this.playerWidth;
    const minWidth =
      this.players.length > this.maxPlayersPerView ? `${this.players.length * 33.333}%` : "100%";
    const wrapperHeightToUse = this.wrapperHeight || 44; // Fallback to 44px

    return `
    --grid-columns: ${gridColumns};
    --player-width: ${playerWidth};
    /*--min-width: ${minWidth}; */
    --form-height: ${wrapperHeightToUse - 44}px;
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.handleSetGame();
  }

  private handleSetGame() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id && this.game) {
      this.game.loadGameById(id);
    } else {
      console.warn("No game ID provided in URL");
    }
  }

  get players() {
    return this.game?.players || [];
  }

  get playerWidth() {
    if (!this.players.length) return "100%";

    const playerCount = Math.min(this.players.length, this.maxPlayersPerView);
    return `${100 / playerCount}%`;
  }

  get hasGame() {
    return !!this.game && this.players.length > 0;
  }

  render() {
    return html`
      <div class="flex flex-col h-full w-full">
        <div class="flex-1 flex flex-col overflow-hidden">
          <x-game-header back-url="/"></x-game-header>
          <div class="overflow-hidden flex-1">${this.renderGame()}</div>
        </div>
      </div>
    `;
  }

  private renderGame() {
    if (!this.hasGame) {
      return html`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center space-y-md">
            <p class="mb-sm font-semibold">No active game</p>
            <a href="new.html" class="btn btn-primary">Start a New Game</a>
          </div>
        </div>
      `;
    }

    return html`
      <div class="overflow-x-auto overflow-y-hidden snap-x h-[calc(100%-44px)]">
        <div class="game-detail-grid" style=${this.variableStyles}>
          <!-- Player Headers (Sticky) -->
          ${this.players.map(
            (player, index) => html`
              <div
                class=${classNames(
                  "player-header sticky top-0 py-2 border-b text-center text-gray font-semibold uppercase bg-white z-10",
                  { "border-r": index < this.players.length - 1 }
                )}
                data-index=${index}>
                ${player.name}
              </div>
            `
          )}
          <div class="player-score-lists">
            ${this.players.map(
              (player, index) => html`
                <div
                  class=${classNames("player-score-list", {
                    "border-r": index < this.players.length - 1,
                  })}
                  data-index=${index}>
                  <x-game-scores player-index="${player.index}"></x-game-scores>
                </div>
              `
            )}
          </div>
          <!-- Current Scores -->
          ${this.players.map(
            (player, index) => html`
              <div
                class="${classNames("player-current-score p-2 border-t flex gap-4 items-baseline", {
                  "border-r": index < this.players.length - 1,
                })} ">
                ${this.game?.isCurrentWinner(player.index)
                  ? html`<span class="text-success font-bold" title="Current Leader">Leader</span>`
                  : nothing}
                <span class="text-3xl font-semibold text-gray-dark ml-auto"
                  >${safeCall(this.game?.getPlayerCurrentScore, [player.index]) ?? 0}</span
                >
              </div>
            `
          )}
        </div>
      </div>
      <x-game-score-form></x-game-score-form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-gameboard": GameboardComponent;
  }
}
