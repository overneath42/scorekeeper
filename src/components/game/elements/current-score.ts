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
    return classNames("text-3xl lg:text-5xl font-semibold text-gray-dark ml-auto pb-sm", {
      "text-success": isWinner,
    });
  }

  /** Class for the container element */
  private getContainerClass(isGameComplete: boolean, isCurrentTurn: boolean, hasTurnTracking: boolean): string {
    return classNames("player-current-score border-t bg-gray-light flex gap-4 items-baseline", {
      "cursor-not-allowed opacity-50": isGameComplete || (hasTurnTracking && !isCurrentTurn),
      "cursor-pointer hover:bg-gray-200 transition-colors": !isGameComplete && (!hasTurnTracking || isCurrentTurn),
      // Highlight current player's turn
      "bg-yellow-50": hasTurnTracking && isCurrentTurn && !isGameComplete,
    });
  }

  /** Handle score click to show popover */
  private handleScoreClick = () => {
    // Block popover if this player cannot score (turn enforcement)
    if (this.game && !this.game.canPlayerScore(this.playerIndex)) {
      return;
    }

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

  /** Handle quick score button click */
  private handleQuickScore = (value: number) => {
    return (e: Event) => {
      e.stopPropagation();
      if (this.game && this.game.canPlayerScore(this.playerIndex)) {
        this.game.addScore(this.playerIndex, value);
      }
    };
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

    // Turn tracking state
    const hasTurnTracking = this.game?.hasTurnTracking() ?? false;
    const isCurrentTurn = this.game?.canPlayerScore(this.playerIndex) ?? false;

    // Quick score mode
    const quickScoreValues = this.game?.quickScoreValues ?? [];
    const hasQuickScore = quickScoreValues.length > 0;

    // Dynamic title based on turn state
    let title = hasQuickScore ? "" : "Tap to add score";
    if (isGameComplete) {
      title = "Game is complete - scoring disabled";
    } else if (hasTurnTracking && !isCurrentTurn) {
      title = "Not your turn";
    }

    // If quick score mode, render buttons layout
    if (hasQuickScore) {
      return html`
        <div
          ${ref(this.scoreRef)}
          class="${this.getContainerClass(isGameComplete, isCurrentTurn, hasTurnTracking)} flex-col !cursor-default"
          title="${title}"
        >
          <div class="flex items-baseline gap-2 justify-between w-full">
            ${this.renderLabel(label, isWinner, isTied)}
            <span class="${this.getScoreClass(isWinner)}">${currentScore}</span>
          </div>
          <div class="flex gap-2 mt-2 justify-center w-full">
            ${quickScoreValues.map(
              (value) => html`
                <button
                  class="${classNames(
                    "px-4 py-2 rounded font-bold transition-colors flex-1 min-w-[60px]",
                    {
                      "bg-blue-500 hover:bg-blue-600 text-white": value > 0,
                      "bg-gray-400 hover:bg-gray-500 text-white": value < 0,
                      "opacity-50 cursor-not-allowed": isGameComplete || (hasTurnTracking && !isCurrentTurn),
                    }
                  )}"
                  @click=${this.handleQuickScore(value)}
                  ?disabled=${isGameComplete || (hasTurnTracking && !isCurrentTurn)}
                  title="${value > 0 ? `Add ${value}` : `Remove ${Math.abs(value)}`}"
                >
                  ${value > 0 ? "+" : ""}${value}
                </button>
              `
            )}
          </div>
        </div>
      `;
    }

    // Default mode with popover
    return html`
      <div
        ${ref(this.scoreRef)}
        class="${this.getContainerClass(isGameComplete, isCurrentTurn, hasTurnTracking)}"
        @click=${(isGameComplete || (hasTurnTracking && !isCurrentTurn)) ? undefined : this.handleScoreClick}
        title="${title}"
      >
        ${this.renderLabel(label, isWinner, isTied)}
        <span class="${this.getScoreClass(isWinner)}">${currentScore}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-current-score": CurrentScoreComponent;
  }
}
