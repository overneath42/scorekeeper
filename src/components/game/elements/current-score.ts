import classNames from "classnames";
import { consume } from "@lit/context";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type GameContext, gameContext } from "@/context";
import { safeCall } from "@/utils/index.js";

@customElement("x-current-score")
export class CurrentScoreComponent extends LitElement {
  @consume({ context: gameContext, subscribe: true })
  @property({ type: Object })
  game?: GameContext;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  createRenderRoot() {
    return this;
  }

  render() {
    const isWinner = this.game?.isCurrentWinner(this.playerIndex);
    const isGameComplete = this.game?.status === "completed";
    const currentScore = safeCall(this.game?.getPlayerCurrentScore, [this.playerIndex]) ?? 0;

    return html`
      <div class="player-current-score p-2 border-t flex gap-4 items-baseline">
        ${isWinner
          ? html`<span
              class="text-success font-bold"
              title="${isGameComplete ? "Winner!" : "Current Leader"}">
              ${isGameComplete ? "Winner!" : "Leader"}
            </span>`
          : nothing}
        <span
          class="${classNames("text-3xl font-semibold text-gray-dark ml-auto", {
            "text-success": isWinner,
          })}"
          >${currentScore}</span
        >
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-current-score": CurrentScoreComponent;
  }
}
