import { consume } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";

@customElement("x-game-scores")
export class GameScoresComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  get scores(): number[] {
    if (!this.game) return [];
    if (typeof this.game.getPlayerScoringHistory !== "function") return [];

    return this.game.getPlayerScoringHistory(this.playerIndex) ?? [];
  }

  /**
   * Whether this player's most recent entry is the last score entered in the
   * whole game and can therefore be corrected. Only active games are editable.
   */
  private get canEditLastEntry(): boolean {
    if (this.game?.status !== "active") return false;
    const lastEntry = this.game?.getLastScoreEntry?.();
    return !!lastEntry && lastEntry.playerIndex === this.playerIndex;
  }

  private handleEditLastScore(event: Event, currentValue: number) {
    event.stopPropagation();
    const popover = document.querySelector("x-score-popover") as
      | (HTMLElement & { playerIndex: number; showEditPopover(el: HTMLElement, value: number): void })
      | null;
    if (popover) {
      popover.playerIndex = this.playerIndex;
      popover.showEditPopover(event.currentTarget as HTMLElement, currentValue);
    }
  }

  render() {
    let runningTotal = 0;
    const scores = this.scores;
    const lastIndex = scores.length - 1;
    const canEditLastEntry = this.canEditLastEntry;

    return html`
      ${repeat(
        scores,
        (score, index) => `${index}-${score}`,
        (score, index) => {
          runningTotal += score;
          const isCurrentScore = index === lastIndex;
          const isEditable = canEditLastEntry && index === lastIndex;

          return html`
            <div
              class="score-list-item ${isEditable ? "score-list-item--editable" : ""}"
              title="${isEditable ? "Edit last score" : ""}"
              @click="${isEditable ? (e: Event) => this.handleEditLastScore(e, score) : undefined}">
              <x-game-score
                score="${runningTotal}"
                increment="${score}"
                ?is-current-score="${isCurrentScore}"
                ?editable="${isEditable}">
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
