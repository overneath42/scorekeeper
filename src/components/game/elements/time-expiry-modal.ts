import { consume } from "@lit/context";
import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";
import type { ModalComponent } from "@/components/modal/modal.js";

@customElement("x-time-expiry-modal")
export class TimeExpiryModalComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  private hasWinner: boolean = false;
  private playerScores: number[] = [];
  private modalRef: Ref<ModalComponent> = createRef();

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('time-expired', this.handleTimeExpired as (event: Event) => void);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('time-expired', this.handleTimeExpired as (event: Event) => void);
  }

  private handleTimeExpired = (event: CustomEvent) => {
    this.hasWinner = event.detail.hasWinner;
    this.playerScores = event.detail.playerScores;
    this.openModal();
  };

  private openModal = () => {
    this.modalRef.value?.open({
      content: this.renderContent(),
      size: "sm",
    });
  };

  private closeModal = () => {
    this.modalRef.value?.close();
  };

  private getWinnerMessage(): string {
    if (!this.game) return "";

    if (!this.hasWinner) {
      return "No Winner";
    }

    const maxScore = Math.max(...this.playerScores);
    const winners = this.game.players.filter(
      (player) => this.playerScores[player.index] === maxScore
    );

    if (winners.length === 1) {
      return `${winners[0].name} Wins!`;
    } else {
      return `Tie: ${winners.map(w => w.name).join(', ')}`;
    }
  }

  private getSubMessage(): string {
    if (!this.hasWinner) {
      return "Time expired with no winner";
    }

    const maxScore = Math.max(...this.playerScores);
    return `Final Score: ${maxScore}`;
  }

  private renderContent(): TemplateResult {
    return html`
      <div class="text-center">
        <!-- Clock Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <div class="mb-6">
          <h2 class="text-3xl font-bold mb-2 ${this.hasWinner ? 'text-success' : 'text-gray-700'}">
            ${this.getWinnerMessage()}
          </h2>
          <p class="text-lg text-gray-600">
            ${this.getSubMessage()}
          </p>
        </div>

        <!-- Message -->
        <p class="text-gray-500 mb-6">
          Time has expired. The game is now complete.
        </p>

        <!-- Close Button -->
        <button
          type="button"
          class="w-full px-4 py-3 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          @click=${this.closeModal}>
          View Final Scores
        </button>
      </div>
    `;
  }

  protected render(): TemplateResult {
    return html`<x-modal ${ref(this.modalRef)}></x-modal>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-time-expiry-modal": TimeExpiryModalComponent;
  }
}
