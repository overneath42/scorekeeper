import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { gameStoreContext, GameStore, BaseComponent } from "../utils/index.js";

@customElement("x-game-player-name")
export class GamePlayerNameComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  @property({ type: String })
  playerName: string = "";

  willUpdate() {
    if (this.gameStore) {
      const player = this.gameStore
        .getPlayers()
        .find((p) => p.index === this.playerIndex);
      this.playerName = player?.name || `Player ${this.playerIndex + 1}`;
    }
  }

  render() {
    return html`${this.playerName}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-player-name": GamePlayerNameComponent;
  }
}
