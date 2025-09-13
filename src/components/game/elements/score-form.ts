import { consume } from "@lit/context";
import classNames from "classnames";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { gameContext, type GameContext } from "@/context";
import { BaseComponent } from "@/utils";
import { BUTTON_HEIGHT, BUTTON_WRAPPER_HEIGHT } from "@/constants";

@customElement("x-game-score-form")
export class GameScoreFormComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  game?: GameContext;

  @property({ type: String })
  inputValue = "";

  @property({ type: Number })
  selectedPlayerIndex: number | null = null;

  @property({ attribute: false })
  onScoreSubmit?: (playerIndex: number, score: number) => void;

  formRef: Ref<HTMLFormElement> = createRef();

  private get players() {
    return this.game?.players || [];
  }

  private handleQuickAdd = (event: Event) => {
    const button = event.target as HTMLButtonElement;
    const value = parseInt(button.dataset.value || "0");
    this.inputValue = (parseInt(this.inputValue || "0") + value).toString();
  };

  private handleSubmit = (event: Event) => {
    event.preventDefault();

    if (this.selectedPlayerIndex !== null && this.inputValue) {
      const playerIndex = this.selectedPlayerIndex;
      const score = parseInt(this.inputValue);

      if (!isNaN(playerIndex) && !isNaN(score)) {
        this.game?.addScore(playerIndex, score);
        this.clearForm();
        this.toggleFormVisibility(false);
      }
    } else {
      console.warn("Please select a player and enter a score");
    }
  };

  private handlePlayerChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.selectedPlayerIndex = input ? parseInt(input.value) : null;
  };

  private handleCancel = (event: Event) => {
    event.preventDefault();
    this.clearForm();
    this.toggleFormVisibility(false);
  };

  private toggleFormVisibility = (isVisible: boolean) => {
    const form = this.querySelector("[data-score-form-wrapper]") as HTMLDivElement;
    const button = this.querySelector("[data-form-toggle]") as HTMLButtonElement;
    const subheader = this.querySelector("[data-form-subheader]") as HTMLParagraphElement;

    form?.style.setProperty(
      "transform",
      isVisible ? `translateY(calc(-100% + ${BUTTON_WRAPPER_HEIGHT}px))` : "translateY(0)"
    );

    button.style.opacity = isVisible ? "0" : "1";
    button.style.pointerEvents = isVisible ? "none" : "auto";
    subheader.style.opacity = isVisible ? "1" : "0";
    subheader.style.pointerEvents = isVisible ? "auto" : "none";
  };

  private clearForm() {
    this.inputValue = "";
    this.selectedPlayerIndex = null;
    this.formRef.value?.reset();
  }

  render() {
    return html`
      <div
        class="border-t-2 absolute left-0 w-full bg-white transition-transform flex flex-col px-3 pb-md"
        style="top: calc(100% - ${BUTTON_WRAPPER_HEIGHT}px);"
        data-score-form-wrapper>
        <div
          class="flex items-center justify-center relative"
          style="padding: ${BUTTON_WRAPPER_HEIGHT -
          BUTTON_HEIGHT}px 0; height: ${BUTTON_WRAPPER_HEIGHT}px;">
          <button
            type="button"
            class="btn btn-primary w-full h-[${BUTTON_HEIGHT}px] transition-opacity toggle-form"
            data-form-toggle
            @click=${() => this.toggleFormVisibility(true)}>
            Update Score
          </button>
          <p
            data-form-subheader
            class="text-base text-gray font-semibold opacity-0 uppercase absolute pointer-events-none">
            Update Score
          </p>
        </div>
        <form class="grid grid-cols-6 gap-x-6" @submit=${this.handleSubmit} ${ref(this.formRef)}>
          <ul class="player-list border rounded-sm h-min col-start-1 col-span-3">
            ${this.players.map(
              ({ name, index }) => html`
                <li
                  class="${classNames("p-2 border-t first:border-t-0 block", {
                    "bg-blue-50": this.selectedPlayerIndex === index,
                  })}">
                  <label>
                    <input
                      type="radio"
                      name="player"
                      value="${index}"
                      class="player-radio"
                      @change=${this.handlePlayerChange}
                      ?checked=${this.selectedPlayerIndex === index} />
                    <span class="cursor-pointer">${name}</span>
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
                @input=${(e: Event) => {
                  const input = e.target as HTMLInputElement;
                  this.inputValue = input.value;
                }}
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
              <button
                type="button"
                class="btn h-full btn-secondary-outline col-start-2 flex-1"
                @click="${this.handleCancel}">
                Cancel
              </button>
              <button type="submit" class="btn h-full btn-primary col-start-2 flex-1">Add</button>
            </div>
          </div>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-score-form": GameScoreFormComponent;
  }
}
