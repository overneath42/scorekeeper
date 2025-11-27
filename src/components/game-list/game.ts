import { html, nothing } from "lit";
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

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  private get hasTargetScore(): boolean {
    return this.game?.targetScore !== undefined && this.game?.targetScore !== null;
  }

  private get targetScoreMessage(): string {
    if (!this.game || this.game.targetScore === undefined || this.game.targetScore === null) {
      return "Open-Ended Game";
    }
    return `Points To Win: ${this.game.targetScore}`;
  }

  private get currentPlayerName(): string | null {
    if (!this.game?.turnTrackingEnabled) return null;
    if (this.game.currentPlayerIndex === undefined || this.game.currentPlayerIndex === null) return null;
    const currentPlayer = this.game.players[this.game.currentPlayerIndex];
    return currentPlayer?.name ?? null;
  }

  render() {
    if (!this.game) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div
        class="border-b px-md pb-md first:pt-md hover:bg-blue-50 transition-colors cursor-pointer"
        @click="${this.selectGame}">
        <div class="grid grid-cols-[1fr_auto] auto-rows-min items-start">
          <div class="col-start-1 col-span-1">
            <div class="flex gap-md justify-between items-center">
              <h3 class="font-semibold text-lg text-gray-dark">${this.game.name}</h3>
            </div>
            <div class="flex gap-md items-baseline mb-sm">
              <p class="text-xs ${this.hasTargetScore ? "text-primary" : "text-gray-500"}">
                ${this.targetScoreMessage}
              </p>
              ${this.currentPlayerName
                ? html`
                    <p class="text-xs text-blue-600 font-medium">
                      Current: ${this.currentPlayerName}
                    </p>
                  `
                : nothing}
              ${this.game.timeLimit
                ? html`
                    <p
                      class="text-xs ${this.game.timeRemaining && this.game.timeRemaining > 0
                        ? "text-warning"
                        : "text-error"} flex items-baseline gap-1">
                      <svg
                        class="w-3 h-3 relative top-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ${this.game.timeRemaining && this.game.timeRemaining > 0
                        ? html`${this.formatTime(this.game.timeRemaining)} remaining`
                        : html`Time expired`}
                    </p>
                  `
                : nothing}
            </div>
          </div>
          <div
            class="col-start-1 row-start-2 col-span-2 grid grid-cols-[repeat(auto-fit,minmax(33.3%,1fr))] gap-lg py-sm border-t border-t-gray w-full">
            ${this.getPlayersWithScores(this.game).map(
              (player) => html`
                <div class="flex justify-between text-sm pt-1">
                  <span class="text-gray-700">${player.name}</span>
                  <span class="text-gray-900 font-bold">${player.score}</span>
                </div>
              `
            )}
          </div>
          <div class="col-start-2 row-start-1 row-span-2 flex items-center gap-2 ml-4">
            <button
              @click="${this.deleteGame}"
              class="btn btn-sm btn-error rounded-full flex items-center justify-center"
              title="Delete game">
              Delete
            </button>
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
