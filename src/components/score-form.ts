import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import {
  BaseComponent,
  gameStoreContext,
  GameStore,
  GamePlayer,
} from "../utils/index.js";

@customElement("x-score-form")
export class ScoreFormComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: Array })
  players: GamePlayer[] = [];

  @property({ type: String })
  inputValue = "";

  @property({ type: Function })
  onScoreSubmit?: (playerIndex: number, score: number) => void;

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }

  willUpdate() {
    if (this.gameStore) {
      this.players = this.gameStore.getPlayers();
    }
  }

  private setupEventListeners() {
    // Quick add buttons (+10, +1)
    const quickAddButtons = this.querySelectorAll(".quick-add");
    quickAddButtons.forEach((button) => {
      button.addEventListener("click", this.handleQuickAdd.bind(this));
    });

    // Form submission
    const form = this.querySelector(".score-form") as HTMLFormElement;
    if (form) {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    // Toggle form visibility (if needed)
    const toggleButton = this.querySelector(".toggle-form");
    if (toggleButton) {
      toggleButton.addEventListener("click", this.handleToggleForm.bind(this));
    }
  }

  private handleQuickAdd = (event: Event) => {
    const button = event.target as HTMLButtonElement;
    const value = parseInt(button.dataset.value || "0");
    this.inputValue = (parseInt(this.inputValue || "0") + value).toString();
  };

  private handleSubmit = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const selectedPlayer = formData.get("player");
    const scoreValue =
      formData.get("score") ||
      (this.querySelector(".score-input") as HTMLInputElement)?.value;

    if (selectedPlayer !== null && scoreValue) {
      const playerIndex = parseInt(selectedPlayer.toString());
      const score = parseInt(scoreValue.toString());

      if (!isNaN(playerIndex) && !isNaN(score)) {
        // Add score to the store: THIS IS NOT WORKING YET
        this.gameStore?.addScore(playerIndex, score);

        // Call the callback if provided (for backward compatibility)
        if (this.onScoreSubmit) {
          this.onScoreSubmit(playerIndex, score);
        }

        // Reset form
        form.reset();
        const scoreInput = this.querySelector(
          ".score-input"
        ) as HTMLInputElement;
        if (scoreInput) scoreInput.value = "";

        // Trigger the toggle method on the parent ToggleClassController
        this.triggerToggle();
      }
    } else {
      console.warn("Please select a player and enter a score");
    }
  };

  private triggerToggle() {
    // Find the closest element with a toggle-class controller
    const toggleButton = this.closest(
      '[data-controller*="toggle-class"]'
    )?.querySelector("[data-toggle-form]");
    if (toggleButton) {
      // Dispatch a click event to trigger the toggle
      const toggleEvent = new Event("click", { bubbles: true });
      toggleButton.dispatchEvent(toggleEvent);
    }
  }

  private handleToggleForm = () => {
    const form = this.querySelector(".score-form") as HTMLElement;
    if (form) {
      form.style.display = form.style.display === "none" ? "grid" : "none";
    }
  };

  // Public method to set the submit callback
  setSubmitCallback(callback: (playerIndex: number, score: number) => void) {
    this.onScoreSubmit = callback;
  }

  // Public method to clear the form
  clearForm() {
    const form = this.querySelector(".score-form") as HTMLFormElement;
    if (form) {
      form.reset();
      const scoreInput = this.querySelector(".score-input") as HTMLInputElement;
      if (scoreInput) scoreInput.value = "";
    }
  }

  render() {
    return html`
      <form
        class="grid grid-cols-2 auto-rows-min gap-x-6 gap-y-3 score-form"
        @submit=${this.handleSubmit}
      >
        <ul class="player-list row-span-3">
          ${this.players.map(
            ({ name, index }) => html`
              <li>
                <label>
                  <input
                    type="radio"
                    name="player"
                    value="${index}"
                    class="player-radio"
                  />
                  ${name}
                </label>
              </li>
            `
          )}
        </ul>
        <input
          type="number"
          class="border-2 border-gray-300 p-2 col-start-2 score-input"
          .value=${this.inputValue || ""}
          placeholder="Enter score"
        />
        <div class="col-start-2 flex justify-around gap-3 quick-buttons">
          <button
            type="button"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 quick-add"
            data-value="10"
            @click=${this.handleQuickAdd}
          >
            +10
          </button>
          <button
            type="button"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 quick-add"
            data-value="1"
            @click=${this.handleQuickAdd}
          >
            +1
          </button>
        </div>
        <button
          type="submit"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 col-start-2 submit-score"
        >
          Add Points
        </button>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-score-form": ScoreFormComponent;
  }
}
