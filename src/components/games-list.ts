import { html, LitElement } from "lit";
import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { gameListContext, type GameListContext } from "@/context";

@customElement("x-games-list")
export class GamesListComponent extends LitElement {
  @consume({ context: gameListContext, subscribe: true })
  @property({ attribute: false })
  gameList?: GameListContext;

  createRenderRoot() {
    return this;
  }

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

    return html`
      <div class="space-y-md" @delete-game="${this.handleDeleteGame}">
        ${games.map((game) => html` <x-game-list-game .game="${game}"></x-game-list-game> `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-games-list": GamesListComponent;
  }
}
