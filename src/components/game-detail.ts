import { consume } from "@lit/context";
import classNames from "classnames";
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, safeCall } from "../utils";
import type { GameContext } from "../utils/context/game-context.js";
import { gameContext } from "../utils/context/game-context.js";

@customElement("x-game-detail")
export class GameDetailComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: Number })
  maxPlayersPerView = 3;

  @property({ type: Number })
  formHeight = 0;

  private get variableStyles() {
    const gridColumns = this.players.length;
    const playerWidth = this.playerWidth;
    const minWidth =
      this.players.length > this.maxPlayersPerView ? `${this.players.length * 33.333}%` : "100%";
    const formHeightToUse = this.formHeight || 44; // Fallback to 44px

    return `
    --grid-columns: ${gridColumns};
    --player-width: ${playerWidth};
    --min-width: ${minWidth};
    /* Adjusting for padding and margin: 44px (form height) + 20px (padding) */
    --form-height: ${formHeightToUse - (44 + 20)}px;
  `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("form-height-updated", this.handleFormHeightUpdate);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("form-height-updated", this.handleFormHeightUpdate);
  }

  private handleFormHeightUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<{ height: number }>;
    this.formHeight = customEvent.detail.height;
    this.requestUpdate();
  };

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
        <div class="flex-1 overflow-hidden">
          <x-game-header back-url="games.html"></x-game-header>
          <div class="h-full overflow-hidden">${this.renderGame()}</div>
        </div>
      </div>
    `;
  }

  private renderGame() {
    if (!this.hasGame) {
      return html`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <p class="mb-2">No active game</p>
            <a href="new-game.html" class="btn btn-primary">Start a New Game</a>
          </div>
        </div>
      `;
    }

    return html`
      <div class="h-full overflow-hidden">
        <div class="h-full overflow-x-auto overflow-y-hidden snap-x">
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
                    <x-score-list player-index="${player.index}"></x-score-list>
                  </div>
                `
              )}
            </div>
            <!-- Current Scores -->
            ${this.players.map(
              (player, index) => html`
                <div
                  class="${classNames(
                    "player-current-score p-2 border-t flex gap-4 items-baseline",
                    { "border-r": index < this.players.length - 1 }
                  )} ">
                  ${this.game?.isCurrentWinner(player.index)
                    ? html`<span class="text-success font-bold" title="Current Leader"
                        >Leader</span
                      >`
                    : nothing}
                  <span class="text-3xl font-semibold text-gray-dark ml-auto"
                    >${safeCall(this.game?.getPlayerCurrentScore, [player.index]) ?? 0}</span
                  >
                </div>
              `
            )}
          </div>
        </div>
      </div>
      <x-score-form id="score-form"></x-score-form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-detail": GameDetailComponent;
  }
}
