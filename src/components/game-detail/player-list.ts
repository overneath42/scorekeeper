import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils";

@customElement("x-game-detail-player-list")
export class GameDetailPlayerListComponent extends BaseComponent {
  @property({ type: Array })
  players: string[] = ["Player 1", "Player 2"];

  @property({ type: Boolean, attribute: "disable-editing" })
  disableEditing: boolean = false;

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
    this.players = this.players.map((player, i) => (i === index ? name : player));

    this.dispatchEvent(
      new CustomEvent("players-changed", {
        detail: { players: this.players },
        bubbles: true,
      })
    );
  }

  render() {
    return html`
      <div class="space-y-md">
        <label class="block form-label">Players</label>
        <ol class="space-y-sm">
          ${this.players.map(
            (player, index) => html`
              <li class="flex items-center gap-2">
                <span class="w-6 text-sm text-gray-500">${index + 1}.</span>
                <input
                  type="text"
                  value="${player}"
                  @input="${(e: Event) =>
                    this.updatePlayerName(index, (e.target as HTMLInputElement).value)}"
                  class="flex-1 form-input"
                  placeholder="Player name" />
                ${this.players.length > 2 && !this.disableEditing
                  ? html`
                      <button
                        type="button"
                        @click="${() => this.removePlayer(index)}"
                        class="w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full flex items-center justify-center"
                        title="Remove player">
                        ×
                      </button>
                    `
                  : nothing}
              </li>
            `
          )}
        </ol>
        ${!this.disableEditing
          ? html`
              <button type="button" @click="${this.addPlayer}" class="btn-sm btn-primary-outline">
                + Add Player
              </button>
            `
          : html`<p class="py-sm px-md rounded bg-warning-light text-sm text-warning-dark">
              Players cannot be added after scoring has begun.
            </p>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-detail-player-list": GameDetailPlayerListComponent;
  }
}
