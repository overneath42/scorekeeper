import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent, loadTemplate } from "../utils/index.js";

@customElement("x-score-form")
export class ScoreFormComponent extends BaseComponent {
  @property({ type: Array })
  players: string[] = [];

  @property({ type: Function })
  onScoreSubmit?: (playerIndex: number, score: number) => void;

  async connectedCallback() {
    super.connectedCallback();

    try {
      const templateContent = await loadTemplate(
        "/templates/score-form.template.html"
      );
      this.loadTemplate(templateContent);
    } catch (error) {
      console.error("Error loading template:", error);
    }

    this.renderPlayers();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (oldValue !== newValue && this.innerHTML) {
      this.renderPlayers();
    }
  }

  private renderPlayers() {
    const playerList = this.querySelector(".player-list");
    if (!playerList) return;

    let playerRadios = "";

    this.players.forEach((playerName, index) => {
      const playerId = `player-${index + 1}`;
      playerRadios += `
        <li>
          <input type="radio" name="player" id="${playerId}" value="${index}" />
          <label for="${playerId}">${playerName}</label>
        </li>
      `;
    });

    playerList.innerHTML = playerRadios;
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
    const scoreInput = this.querySelector(".score-input") as HTMLInputElement;

    if (scoreInput) {
      const currentValue = parseInt(scoreInput.value) || 0;
      scoreInput.value = (currentValue + value).toString();
    }
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
        // Call the callback if provided
        if (this.onScoreSubmit) {
          this.onScoreSubmit(playerIndex, score);
        } else {
          // Placeholder callback
          console.log(
            `Score submitted for player ${playerIndex + 1} (${
              this.players[playerIndex]
            }): ${score} points`
          );
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
    return html`${this.templateContent}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-score-form": ScoreFormComponent;
  }
}
