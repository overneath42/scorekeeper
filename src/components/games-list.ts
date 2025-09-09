import { html } from "lit";
import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, Game, GameStore, gameStoreContext } from "../utils";

@customElement("x-games-list")
export class GamesListComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  private selectGame(game: Game) {
    if (this.gameStore) {
      this.gameStore.setActiveGame(game);
    }

    // Navigate to game detail view
    window.location.href = "game-detail.html";
  }

  private deleteGame(game: Game, event: Event) {
    event.stopPropagation(); // Prevent game selection when clicking delete

    if (confirm(`Are you sure you want to delete "${game.name}"?`)) {
      // TODO: Add deleteGame method to GameStore
      console.log("Delete game:", game.name);
    }
  }

  private getPlayersWithScores(game: Game) {
    const hasScores = game.scoringHistory.length > 0;

    if (!hasScores) {
      return game.players
        .map((player) => ({
          ...player,
          score: 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    // Get current scores for each player
    const scores: { [playerIndex: number]: number } = {};
    game.players.forEach((player) => {
      scores[player.index] = game.scoringHistory
        .filter(([pIndex]) => pIndex === player.index)
        .reduce((sum, [, points]) => sum + points, 0);
    });

    // Return players with scores, sorted by score (highest first)
    return game.players
      .map((player) => ({
        ...player,
        score: scores[player.index],
      }))
      .sort((a, b) => b.score - a.score);
  }

  render() {
    if (!this.gameStore) {
      return html`<div class="text-center text-gray-500">Loading games...</div>`;
    }

    const games = this.gameStore.getGamesList();

    if (games.length === 0) {
      return html`
        <div class="text-center py-8">
          <div class="text-gray-500 mb-4">No games yet</div>
          <a href="new-game.html" class="btn-sm btn-primary">Create Your First Game</a>
        </div>
      `;
    }

    return html`
      <div class="space-y-3">
        ${games.map(
          (game) => html`
            <div
              class="border-b p-4 hover:bg-blue-50 transition-colors cursor-pointer"
              @click="${() => this.selectGame(game)}">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 mb-2">${game.name}</h3>

                  <!-- Player Scores List -->
                  <div class="space-y-1 mb-2 w-min min-w-[150px] p-2 bg-blue-100 rounded">
                    ${this.getPlayersWithScores(game).map(
                      (player) => html`
                        <div
                          class="flex justify-between text-sm pt-1 border-t first:pt-0 first:border-t-0">
                          <span class="text-gray-700">${player.name}</span>
                          <span class="text-gray-900 font-bold">${player.score}</span>
                        </div>
                      `
                    )}
                  </div>

                  ${game.targetScore
                    ? html`
                        <p class="text-xs text-blue-600">Target: ${game.targetScore} points</p>
                      `
                    : html` <p class="text-xs text-gray-500">Open-ended game</p> `}
                </div>

                <div class="flex items-center gap-2 ml-4">
                  <button
                    @click="${(e: Event) => this.deleteGame(game, e)}"
                    class="w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full flex items-center justify-center"
                    title="Delete game">
                    🗑️
                  </button>
                  <div class="text-gray-400">→</div>
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-games-list": GamesListComponent;
  }
}
