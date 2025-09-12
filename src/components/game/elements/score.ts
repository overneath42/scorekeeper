import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils/index.js";

@customElement("x-game-score")
export class GameScoreComponent extends BaseComponent {
  @property({ type: Number, attribute: 'score' })
  score: number = 0;

  @property({ type: Number, attribute: 'increment' })
  increment?: number;

  @property({ type: Boolean, attribute: "is-current-score" })
  isCurrentScore: boolean = false;

  render() {
    const incrementText =
      this.increment !== undefined
        ? this.increment >= 0
          ? `+${this.increment}`
          : `${this.increment}`
        : null;

    return html`
      <div class="x-score">
        <span class="total-score">${this.score}</span>
        ${incrementText ? html`<span class="increment">${incrementText}</span>` : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-score": GameScoreComponent;
  }
}
