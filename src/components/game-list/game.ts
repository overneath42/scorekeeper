import { html } from "lit";
import barba from "@barba/core";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, Game } from "@/utils";
import { type StoredGame } from "@/services";

@customElement("x-game-list-game")
export class GameListGameComponent extends BaseComponent {
  @property({ type: Object })
  game?: StoredGame;

  private selectGame() {
    barba.go(`/pages/play.html?id=${this.game?.id}`);
  }

  private deleteGame(event: Event) {
    event.stopPropagation();

    if (this.game && confirm(`Are you sure you want to delete "${this.game.name}"?`)) {
      this.dispatchEvent(
        new CustomEvent("delete-game", {
          detail: { gameId: this.game.id },
          bubbles: true,
        })
      );
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
    if (!this.game) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div
        class="border-b px-md pb-md first:pt-md hover:bg-blue-50 transition-colors cursor-pointer"
        @click="${this.selectGame}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-semibold text-lg text-gray-dark mb-md">${this.game.name}</h3>

            <!-- Player Scores List -->
            <div class="space-y-1 mb-2 w-min min-w-[150px] p-2 bg-blue-100 rounded-sm">
              ${this.getPlayersWithScores(this.game).map(
                (player) => html`
                  <div
                    class="flex justify-between text-sm pt-1 border-t first:pt-0 first:border-t-0">
                    <span class="text-gray-700">${player.name}</span>
                    <span class="text-gray-900 font-bold">${player.score}</span>
                  </div>
                `
              )}
            </div>

            ${this.game.targetScore
              ? html` <p class="text-xs text-blue-600">Target: ${this.game.targetScore} points</p> `
              : html` <p class="text-xs text-gray-500">Open-ended game</p> `}
          </div>

          <div class="flex items-center gap-2 ml-4">
            <button
              @click="${this.deleteGame}"
              class="w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full flex items-center justify-center"
              title="Delete game">
              🗑️
            </button>
            <div class="text-gray-400">→</div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-list-game": GameListGameComponent;
  }
}
