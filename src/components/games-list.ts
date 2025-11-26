import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { gameListContext, type GameListContext } from "@/context";
import { BaseComponent } from "@/utils";

@customElement("x-games-list")
export class GamesListComponent extends BaseComponent {
  @consume({ context: gameListContext, subscribe: true })
  @property({ attribute: false })
  gameList?: GameListContext;

  private handleDeleteGame(event: CustomEvent) {
    const gameId = event.detail.gameId;
    this.gameList?.removeGame(gameId);
    this.requestUpdate();
  }

  render() {
    if (!this.gameList) {
      return html`<div class="text-center text-gray-500">Loading games...</div>`;
    }

    const games = this.gameList.getAllGames();

    if (games.length === 0) {
      return html`
        <div class="text-center py-8">
          <div class="text-gray-500 mb-4">No games yet</div>
          <a href="/pages/new.html" class="btn-sm btn-primary">Create Your First Game</a>
        </div>
      `;
    }

    // Split games into In Progress (active + paused) and Completed
    const inProgressGames = games
      .filter((game) => game.status === "active" || game.status === "paused")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const completedGames = games
      .filter((game) => game.status === "completed")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return html`
      <div
        class="h-full flex flex-col md:flex-row"
        @delete-game="${this.handleDeleteGame}">
        <!-- In Progress Section -->
        <div class="flex flex-col flex-[1.5] md:flex-1 min-h-0 border-b md:border-b-0 md:border-r">
          <h2 class="text-lg font-semibold px-md py-sm bg-gray-100 border-b sticky top-0 z-10">
            In Progress
          </h2>
          <div class="flex-1 overflow-y-auto">
            ${inProgressGames.length === 0
              ? html`<div class="text-center py-8 text-gray-500">No games in progress</div>`
              : html`<div class="space-y-md">
                  ${inProgressGames.map(
                    (game) => html` <x-game-list-game .game="${game}"></x-game-list-game> `
                  )}
                </div>`}
          </div>
        </div>

        <!-- Completed Section -->
        <div class="flex flex-col flex-1 min-h-0">
          <h2 class="text-lg font-semibold px-md py-sm bg-gray-100 border-b sticky top-0 z-10">
            Completed
          </h2>
          <div class="flex-1 overflow-y-auto">
            ${completedGames.length === 0
              ? html`<div class="text-center py-8 text-gray-500">No completed games</div>`
              : html`<div class="space-y-md">
                  ${completedGames.map(
                    (game) => html` <x-game-list-game .game="${game}"></x-game-list-game> `
                  )}
                </div>`}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-games-list": GamesListComponent;
  }
}
