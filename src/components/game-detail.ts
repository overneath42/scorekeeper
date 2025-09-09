import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, GameStore, gameStoreContext } from "../utils";

@customElement("x-game-detail")
export class GameDetailComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  get players() {
    return this.gameStore?.getPlayers() || [];
  }

  get maxPlayersPerView() {
    return 3;
  }

  get playerWidth() {
    const playerCount = Math.min(this.players.length, this.maxPlayersPerView);
    return `${100 / playerCount}%`;
  }

  render() {
    if (!this.gameStore || this.players.length === 0) {
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
        <div
          class="h-full overflow-x-auto overflow-y-hidden"
          style="scroll-snap-type: x mandatory;">
          <div
            class="grid h-full"
            style="
              grid-template-columns: repeat(${this.players.length}, minmax(${this
              .playerWidth}, 1fr));
              grid-template-rows: min-content 1fr;
              min-width: ${this.players.length > this.maxPlayersPerView
              ? `${this.players.length * 33.333}%`
              : "100%"};
            ">
            <!-- Player Headers (Sticky) -->
            ${this.players.map(
              (player, index) => html`
                <div
                  class="sticky top-0 py-2 border-b ${index < this.players.length - 1
                    ? "border-r"
                    : ""} text-center text-gray font-semibold uppercase bg-white z-10"
                  style="
                  grid-column: ${index + 1};
                  grid-row: 1;
                  scroll-snap-align: start;
                  ${index === 0 ? "" : "padding-left: 0.5rem;"}
                ">
                  <x-game-player-name player-index="${player.index}"></x-game-player-name>
                </div>
              `
            )}
            <!-- Score Lists -->
            ${this.players.map(
              (player, index) => html`
                <div
                  class="overflow-y-auto pt-2 ${index < this.players.length - 1 ? "border-r" : ""}"
                  style="
                  grid-column: ${index + 1};
                  grid-row: 2;
                  ${index === 0 ? "" : "padding-left: 0.5rem;"}
                ">
                  <x-score-list player-index="${player.index}"></x-score-list>
                </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-detail": GameDetailComponent;
  }
}
