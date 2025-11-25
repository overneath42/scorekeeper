import { consume } from "@lit/context";
import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";

@customElement("x-time-expiry-modal")
export class TimeExpiryModalComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @state()
  open: boolean = false;

  @state()
  hasWinner: boolean = false;

  @state()
  playerScores: number[] = [];

  modalRef: Ref<HTMLDivElement> = createRef();

  connectedCallback(): void {
    super.connectedCallback();
    // Listen for time-expired event from game provider
    document.addEventListener('time-expired', this.handleTimeExpired as (event: Event) => void);
    this.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('time-expired', this.handleTimeExpired as (event: Event) => void);
    this.removeEventListener("keydown", this.handleKeydown);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("open")) {
      if (this.open) {
        const modalElement = this.modalRef.value as HTMLElement & { showPopover(): void };
        modalElement?.showPopover();
      } else {
        const modalElement = this.modalRef.value as HTMLElement & { hidePopover(): void };
        modalElement?.hidePopover();
      }
    }
  }

  private handleTimeExpired = (event: CustomEvent) => {
    this.hasWinner = event.detail.hasWinner;
    this.playerScores = event.detail.playerScores;
    this.open = true;
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Enter") {
      this.closeModal();
    }
  };

  private closeModal = () => {
    this.open = false;
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

  protected render(): TemplateResult {
    if (!this.open) {
      return html``;
    }

    return html`
      <div
        ${ref(this.modalRef)}
        popover="manual"
        class="bg-white border-2 border-gray-300 rounded-xl shadow-2xl p-8 z-50 max-w-md"
        style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        @click=${(e: Event) => e.stopPropagation()}>

        <!-- Clock Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold mb-2 ${this.hasWinner ? 'text-success' : 'text-gray-700'}">
            ${this.getWinnerMessage()}
          </h2>
          <p class="text-lg text-gray-600">
            ${this.getSubMessage()}
          </p>
        </div>

        <!-- Message -->
        <p class="text-center text-gray-500 mb-6">
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

      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        style="display: ${this.open ? 'block' : 'none'}"
        @click=${this.closeModal}>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-time-expiry-modal": TimeExpiryModalComponent;
  }
}
