import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";

@customElement("x-game-player-name")
export class GamePlayerNameComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  @property({ attribute: false })
  game?: GameContext;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  get playerName() {
    if (this.playerIndex < 0) return "Unknown Player";
    if (this.playerIndex >= (this.game?.players.length || 0)) return "Unknown Player";

    return this.game?.players[this.playerIndex]?.name || `Player ${this.playerIndex + 1}`;
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
