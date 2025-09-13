import { consume } from "@lit/context";
import classNames from "classnames";
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils/index.js";
import { type GameContext, gameContext } from "@/context";
import { GameStorageService } from "@/services";
import { BUTTON_WRAPPER_HEIGHT } from "@/constants";

@customElement("x-gameboard")
export class GameboardComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: Number })
  maxPlayersPerView = 3;

  @property({ type: Number })
  wrapperHeight = 0;

  storage = GameStorageService.getInstance();

  private get variableStyles() {
    const gridColumns = this.players.length;
    const playerWidth = this.playerWidth;

    return `
    --grid-columns: ${gridColumns};
    --player-width: ${playerWidth};
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
            <a href="/pages/new.html" class="btn btn-primary">Start a New Game</a>
          </div>
        </div>
      `;
    }

    return html`
      <div
        class="overflow-x-auto overflow-y-hidden snap-x"
        style="height: calc(100% - ${this.game?.status === "active"
          ? `${BUTTON_WRAPPER_HEIGHT}px`
          : "0px"});">
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
                class="${classNames("", {
                  "border-r": index < this.players.length - 1,
                })}">
                <x-current-score player-index="${player.index}"></x-current-score>
              </div>
            `
          )}
        </div>
      </div>
      ${this.game?.status === "active" ? html`<x-game-score-form></x-game-score-form>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-gameboard": GameboardComponent;
  }
}
