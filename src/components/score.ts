import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "../utils/index.js";

@customElement("x-score")
export class ScoreComponent extends BaseComponent {
  @property({ type: Number })
  score: number = 0;

  @property({ type: Number })
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
    "x-score": ScoreComponent;
  }
}
