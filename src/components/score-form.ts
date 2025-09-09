import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { BaseComponent, gameStoreContext, GameStore, GamePlayer } from "../utils/index.js";

@customElement("x-score-form")
export class ScoreFormComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: Array })
  players: GamePlayer[] = [];

  @property({ type: String })
  inputValue = "";

  @property({ attribute: false })
  onScoreSubmit?: (playerIndex: number, score: number) => void;

  willUpdate() {
    if (this.gameStore) {
      this.players = this.gameStore.getPlayers();
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
      formData.get("score") || (this.querySelector(".score-input") as HTMLInputElement)?.value;

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
        const scoreInput = this.querySelector(".score-input") as HTMLInputElement;
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
    const toggleButton = this.closest('[data-controller*="toggle-class"]')?.querySelector(
      "[data-toggle-form]"
    );
    if (toggleButton) {
      // Dispatch a click event to trigger the toggle
      const toggleEvent = new Event("click", { bubbles: true });
      toggleButton.dispatchEvent(toggleEvent);
    }
  }

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
      <form class="grid grid-cols-6 gap-x-6" @submit=${this.handleSubmit}>
        <ul class="player-list col-start-1 col-span-2">
          ${this.players.map(
            ({ name, index }) => html`
              <li>
                <label>
                  <input type="radio" name="player" value="${index}" class="player-radio" />
                  ${name}
                </label>
              </li>
            `
          )}
        </ul>
        <div class="col-start-4 col-span-3">
          <div class="p-3 rounded bg-gray-100 text-sm text-gray-700 flex flex-col gap-y-3 mb-3">
            <input
              type="number"
              class="form-input"
              .value=${this.inputValue || ""}
              placeholder="Enter score" />
            <div class="flex justify-around gap-x-3">
              <button
                type="button"
                class="btn-sm btn-secondary-outline flex-1"
                data-value="10"
                @click=${this.handleQuickAdd}>
                +10
              </button>
              <button
                type="button"
                class="btn-sm btn-secondary-outline flex-1"
                data-value="1"
                @click=${this.handleQuickAdd}>
                +1
              </button>
            </div>
          </div>
          <div class="gap-3 flex">
            <button type="button" class="btn btn-secondary-outline col-start-2 flex-1">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary col-start-2 flex-1">Add</button>
          </div>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-score-form": ScoreFormComponent;
  }
}
