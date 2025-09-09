import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "../utils";

@customElement("x-player-list")
export class PlayerListComponent extends BaseComponent {
  @property({ type: Array })
  players: string[] = ["Player 1", "Player 2"];

  private addPlayer() {
    const newPlayerNumber = this.players.length + 1;
    this.players = [...this.players, `Player ${newPlayerNumber}`];
    this.dispatchEvent(
      new CustomEvent("players-changed", {
        detail: { players: this.players },
        bubbles: true,
      })
    );
  }

  private removePlayer(index: number) {
    if (this.players.length > 2) {
      // Keep minimum 2 players
      this.players = this.players.filter((_, i) => i !== index);
      this.dispatchEvent(
        new CustomEvent("players-changed", {
          detail: { players: this.players },
          bubbles: true,
        })
      );
    }
  }

  private updatePlayerName(index: number, name: string) {
    this.players = this.players.map((player, i) =>
      i === index ? name : player
    );

    this.dispatchEvent(
      new CustomEvent("players-changed", {
        detail: { players: this.players },
        bubbles: true,
      })
    );
  }

  render() {
    return html`
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Players</label>
        <ol class="space-y-2">
          ${this.players.map(
            (player, index) => html`
              <li class="flex items-center gap-2">
                <span class="w-6 text-sm text-gray-500">${index + 1}.</span>
                <input
                  type="text"
                  value="${player}"
                  @input="${(e: Event) =>
                    this.updatePlayerName(
                      index,
                      (e.target as HTMLInputElement).value
                    )}"
                  class="flex-1 form-input"
                  placeholder="Player name"
                />
                ${this.players.length > 2
                  ? html`
                      <button
                        type="button"
                        @click="${() => this.removePlayer(index)}"
                        class="w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full flex items-center justify-center"
                        title="Remove player"
                      >
                        ×
                      </button>
                    `
                  : nothing}
              </li>
            `
          )}
        </ol>
        <button
          type="button"
          @click="${this.addPlayer}"
          class="btn-sm btn-primary-outline"
        >
          + Add Player
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-player-list": PlayerListComponent;
  }
}
