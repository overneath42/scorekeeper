import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { consume } from "@lit/context";
import { BaseComponent, gameStoreContext, GameStore } from "../utils/index.js";

@customElement("x-score-list")
export class ScoreListComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: Array })
  scores: number[] = [];

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  @property({ type: String, attribute: "class" })
  additionalClasses: string = "";

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("x-score-list");

    if (this.additionalClasses) {
      this.classList.add(...this.additionalClasses.split(" "));
    }
  }

  willUpdate() {
    if (this.gameStore) {
      this.scores = this.gameStore.getPlayerScores(this.playerIndex);
    }
  }

  // Method to add a new score
  addScore(score: number) {
    this.scores = [...this.scores, score];
    this.requestUpdate();
  }

  // Method to reset scores
  resetScores() {
    this.scores = [];
    this.requestUpdate();
  }

  // Method to get current total
  getTotalScore(): number {
    return this.scores.reduce((sum, score) => sum + score, 0);
  }

  render() {
    let runningTotal = 0;
    const lastIndex = this.scores.length - 1;

    return html`
      ${repeat(
        this.scores,
        (score, index) => `${index}-${score}`,
        (score, index) => {
          runningTotal += score;
          const isCurrentScore = index === lastIndex;

          return html`
            <div class="score-list-item">
              <x-score
                score="${runningTotal}"
                increment="${score}"
                ?is-current-score="${isCurrentScore}"
              >
              </x-score>
            </div>
          `;
        }
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-score-list": ScoreListComponent;
  }
}
