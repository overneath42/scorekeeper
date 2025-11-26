import { consume } from "@lit/context";
import { html, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";

@customElement("x-score-popover")
export class ScorePopoverComponent extends BaseComponent {
  /**
   * The injected game context containing players and actions.
   * Provided via Lit's context consumer.
   */
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  /** Index of the player for which the popover is shown (0-based). */
  @property({ type: Number, attribute: "player-index" })
  playerIndex: number = 0;

  /** Whether the popover is currently visible. */
  @property({ type: Boolean })
  open: boolean = false;

  /** Current value of the score input field (string while editing). */
  @state()
  inputValue: string = "";

  /** The DOM element that triggered showing the popover. Used for positioning. */
  @state()
  targetElement?: HTMLElement;

  /** Cached position styles to prevent recalculation during re-renders (fixes keyboard jump bug). */
  private cachedPosition?: Partial<CSSStyleDeclaration>;

  /** Ref to the popover wrapper element. */
  popoverRef: Ref<HTMLDivElement> = createRef();

  /** Ref to the numeric input inside the popover. */
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
    this.cachedPosition = undefined; // Clear cached position when popover closes
  }

  private handleKeydown = (event: KeyboardEvent) => {
    // Keyboard shortcuts: Escape closes, Enter submits.
    if (event.key === "Escape") {
      this.hideScorePopover();
    } else if (event.key === "Enter") {
      event.preventDefault();
      this.handleSubmit();
    }
  };

  private handleInputChange = (event: Event) => {
    // Update the internal inputValue state from the input element.
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  };

  private handleSubmit = () => {
    // Parse the current input and submit as a numeric score. Empty input => 0.
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

  private handleQuickScore = (points: number) => {
    const currentValue = this.inputValue.trim() === "" ? 0 : parseInt(this.inputValue);
    const newValue = isNaN(currentValue) ? points : currentValue + points;
    this.inputValue = newValue.toString();
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

    const popoverStyle = this.targetElement ? this.formatCSSProperties(this.getPopoverStyle()) : "";

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
            @keydown=${this.handleKeydown} />
        </div>

        <div class="mb-4">
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              @click=${() => this.handleQuickScore(1)}>
              +1
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              @click=${() => this.handleQuickScore(5)}>
              +5
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              @click=${() => this.handleQuickScore(10)}>
              +10
            </button>
          </div>
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

  private getPopoverStyle(): Partial<CSSStyleDeclaration> {
    // Return cached position if available (prevents recalculation during re-renders)
    if (this.cachedPosition) {
      return this.cachedPosition;
    }

    // Calculate position and cache it
    if (!this.targetElement) return {};

    const gridContainer = document.querySelector(".game-detail-grid") as HTMLElement;

    let position: Partial<CSSStyleDeclaration>;
    if (!gridContainer) {
      // If the expected grid isn't present, fall back to a simpler positioning calculation.
      position = this.getFallbackStyle();
    } else {
      position = this.getGridBasedStyle(gridContainer);
    }

    // Cache the calculated position
    this.cachedPosition = position;
    return position;
  }

  private getFallbackStyle(): Partial<CSSStyleDeclaration> {
    if (!this.targetElement) return {};

    const targetRect = this.targetElement.getBoundingClientRect();
    const popoverWidth = 256; // min-w-64 = 16rem = 256px
    const viewportWidth = window.innerWidth;

    const top = targetRect.top - 10;
    const left = this.constrainHorizontalPosition(
      targetRect.right - popoverWidth,
      popoverWidth,
      viewportWidth
    );

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      transform: "translateY(-100%)",
    };
  }

  private getGridBasedStyle(gridContainer: HTMLElement): Partial<CSSStyleDeclaration> {
    if (!this.targetElement) return {};

    const containerRect = gridContainer.getBoundingClientRect();
    const targetRect = this.targetElement.getBoundingClientRect();
    const popoverWidth = 256; // min-w-64 = 16rem = 256px
    const viewportWidth = window.innerWidth;

    const top = targetRect.top - 10; // 10px gap above target
    const columnRightEdge = this.getColumnRightEdge(gridContainer, containerRect);
    const left = this.constrainHorizontalPosition(
      columnRightEdge - popoverWidth,
      popoverWidth,
      viewportWidth
    );

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      right: "auto",
      bottom: "auto",
      transform: "translateY(-100%)",
    };
  }

  private getColumnRightEdge(gridContainer: HTMLElement, containerRect: DOMRect): number {
    // Determine the number of columns from the CSS custom property
    const gridColumnsStyle =
      getComputedStyle(gridContainer).getPropertyValue("--grid-columns") || "1";
    const gridColumns = parseInt(gridColumnsStyle);
    const columnWidth = containerRect.width / gridColumns;
    // Right edge of the player's column (container left + columns * width)
    return containerRect.left + (this.playerIndex + 1) * columnWidth;
  }

  private constrainHorizontalPosition(
    left: number,
    popoverWidth: number,
    viewportWidth: number
  ): number {
    const margin = 10;

    if (left < margin) {
      return margin;
    }

    if (left + popoverWidth > viewportWidth - margin) {
      return viewportWidth - popoverWidth - margin;
    }

    return left;
  }

  private formatCSSProperties(styles: Partial<CSSStyleDeclaration>): string {
    // Convert a Partial<CSSStyleDeclaration> into an inline style string.
    return Object.entries(styles)
      .map(([key, value]) => {
        // Convert camelCase keys to kebab-case for CSS
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value}`;
      })
      .join("; ");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-score-popover": ScorePopoverComponent;
  }
}
