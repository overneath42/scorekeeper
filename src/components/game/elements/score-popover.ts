import { consume } from "@lit/context";
import { html, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";

@customElement("x-score-popover")
export class ScorePopoverComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  @property({ type: Boolean })
  open: boolean = false;

  @state()
  inputValue: string = "";

  @state()
  targetElement?: HTMLElement;

  popoverRef: Ref<HTMLDivElement> = createRef();
  inputRef: Ref<HTMLInputElement> = createRef();

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.handleKeydown);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("open")) {
      if (this.open) {
        const popoverElement = this.popoverRef.value as HTMLElement & { showPopover(): void };
        popoverElement?.showPopover();
        // Focus input when popover opens
        setTimeout(() => {
          this.inputRef.value?.focus();
        }, 0);
      } else {
        const popoverElement = this.popoverRef.value as HTMLElement & { hidePopover(): void };
        popoverElement?.hidePopover();
        this.inputValue = "";
      }
    }
  }

  showScorePopover(targetElement: HTMLElement) {
    this.targetElement = targetElement;
    this.open = true;
  }

  hideScorePopover() {
    this.open = false;
    this.targetElement = undefined;
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.hideScorePopover();
    } else if (event.key === "Enter") {
      event.preventDefault();
      this.handleSubmit();
    }
  };

  private handleInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  };

  private handleSubmit = () => {
    const score = this.inputValue.trim() === "" ? 0 : parseInt(this.inputValue);

    if (isNaN(score)) {
      console.warn("Invalid score entered");
      return;
    }

    this.game?.addScore(this.playerIndex, score);
    this.hideScorePopover();
  };

  private handleCancel = () => {
    this.hideScorePopover();
  };

  private get buttonText(): string {
    return this.inputValue.trim() === "" ? "Skip" : "Score";
  }

  private get playerName(): string {
    return this.game?.players?.[this.playerIndex]?.name || `Player ${this.playerIndex + 1}`;
  }

  protected render(): TemplateResult {
    if (!this.open) {
      return html``;
    }

    const popoverStyle = this.targetElement ? this.getPopoverStyle() : "";

    return html`
      <div
        ${ref(this.popoverRef)}
        popover="manual"
        class="bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-64"
        style="${popoverStyle}"
        @click=${(e: Event) => e.stopPropagation()}>
        <div class="mb-3">
          <h3 class="font-semibold text-gray-800 mb-1">Add Score</h3>
          <p class="text-sm text-gray-600">${this.playerName}</p>
        </div>

        <div class="mb-4">
          <input
            ${ref(this.inputRef)}
            type="number"
            inputmode="numeric"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter score"
            .value=${this.inputValue}
            @input=${this.handleInputChange}
            @keydown=${this.handleKeydown}
          />
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            @click=${this.handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click=${this.handleSubmit}>
            ${this.buttonText}
          </button>
        </div>
      </div>
    `;
  }

  private getPopoverStyle(): string {
    if (!this.targetElement) return "";

    const targetRect = this.targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const popoverWidth = 256; // min-w-64 = 16rem = 256px

    // Position above the target element
    const top = targetRect.top - 10; // 10px gap above target

    // Center horizontally on the target, but keep within viewport
    let left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);

    // Ensure popover stays within viewport
    if (left < 10) {
      left = 10;
    } else if (left + popoverWidth > viewportWidth - 10) {
      left = viewportWidth - popoverWidth - 10;
    }

    return `position: fixed; top: ${top}px; left: ${left}px; transform: translateY(-100%);`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-score-popover": ScorePopoverComponent;
  }
}