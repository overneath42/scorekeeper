import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils/index.js";

@customElement("x-game-score")
export class GameScoreComponent extends BaseComponent {
  @property({ type: Number, attribute: "score" })
  score: number = 0;

  @property({ type: Number, attribute: "increment" })
  increment?: number;

  @property({ type: Boolean, attribute: "is-current-score" })
  isCurrentScore: boolean = false;

  /** When true, shows an edit cue indicating this entry can be corrected. */
  @property({ type: Boolean, attribute: "editable" })
  editable: boolean = false;

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
        ${incrementText || this.editable
          ? html`<span class="increment-wrap">
              ${incrementText ? html`<span class="increment">${incrementText}</span>` : ""}
              ${this.editable
                ? html`<span class="edit-indicator" aria-hidden="true">✎</span>`
                : ""}
            </span>`
          : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-score": GameScoreComponent;
  }
}
