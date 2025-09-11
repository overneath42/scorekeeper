import { consume } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent, safeCall } from "@/utils";

@customElement("x-game-scores")
export class GameScoresComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  get scores(): number[] {
    if (!this.game) return [];
    if (typeof this.game.getPlayerScoringHistory !== "function") return [];

    return safeCall(this.game.getPlayerScoringHistory, [this.playerIndex], []) ?? [];
  }

  render() {
    let runningTotal = 0;
    const scores = this.scores;
    const lastIndex = scores.length - 1;

    return html`
      ${repeat(
        scores,
        (score, index) => `${index}-${score}`,
        (score, index) => {
          runningTotal += score;
          const isCurrentScore = index === lastIndex;

          return html`
            <div class="score-list-item">
              <x-game-score
                score="${runningTotal}"
                increment="${score}"
                ?is-current-score="${isCurrentScore}">
              </x-game-score>
            </div>
          `;
        }
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-scores": GameScoresComponent;
  }
}
