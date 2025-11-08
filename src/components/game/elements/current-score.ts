import classNames from "classnames";
import { consume } from "@lit/context";
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { type GameContext, gameContext } from "@/context";
import { BaseComponent, safeCall } from "@/utils/index.js";

@customElement("x-current-score")
export class CurrentScoreComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  @property({ type: Object })
  game?: GameContext;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  scoreRef: Ref<HTMLElement> = createRef();
  /** Whether this player is currently a winner/leader */
  private isCurrentWinner(): boolean {
    return !!this.game?.isCurrentWinner(this.playerIndex);
  }

  /** Current score for this player */
  private getCurrentScore(): number {
    return safeCall(this.game?.getPlayerCurrentScore, [this.playerIndex]) ?? 0;
  }

  /** Compute the label given pre-computed state */
  private computeLabel(isWinner: boolean, isTied: boolean, isGameComplete: boolean): string {
    if (isTied) return "Tied";
    if (!isWinner) return "";
    return isGameComplete ? "Winner!" : "Leader";
  }

  /** Class for the label element */
  private getWinnerLabelClass(isWinner: boolean, isTied: boolean): string {
    return classNames("font-bold", {
      "text-success": isWinner && !isTied,
      "text-warning": isWinner && isTied,
    });
  }

  /** Class for the score element */
  private getScoreClass(isWinner: boolean): string {
    return classNames("text-3xl lg:text-5xl font-semibold text-gray-dark ml-auto cursor-pointer hover:opacity-75 transition-opacity", {
      "text-success": isWinner,
    });
  }

  /** Handle score click to show popover */
  private handleScoreClick = () => {
    if (this.scoreRef.value) {
      const popover = document.querySelector("x-score-popover") as {
        playerIndex: number;
        showScorePopover(targetElement: HTMLElement): void;
      } | null;
      if (popover) {
        popover.playerIndex = this.playerIndex;
        popover.showScorePopover(this.scoreRef.value);
      }
    }
  };

  /** Render the winner/leader/tied label */
  private renderLabel(label: string, isWinner: boolean, isTied: boolean) {
    if (!label) return nothing;
    return html`<span class="${this.getWinnerLabelClass(isWinner, isTied)}" title="${label}">${label}</span>`;
  }

  render() {
    const isWinner = this.isCurrentWinner();
    const isTied = this.game?.isTied ?? false;
    const isGameComplete = this.game?.status === "completed";
    const label = this.computeLabel(isWinner, isTied, isGameComplete);
    const currentScore = this.getCurrentScore();

    return html`
      <div class="player-current-score px-sm pt-md pb-lg border-t bg-gray-light flex gap-4 items-baseline">
        ${this.renderLabel(label, isWinner, isTied)}
        <span
          ${ref(this.scoreRef)}
          class="${this.getScoreClass(isWinner)}"
          @click=${this.handleScoreClick}
          title="Tap to add score"
        >${currentScore}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-current-score": CurrentScoreComponent;
  }
}
