import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { BaseComponent } from "@/utils/index.js";
import { gameContext, type GameContext } from "@/context";
import barba from "@barba/core";

@customElement("x-game-header")
export class GameHeaderComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  @property({ attribute: false })
  game?: GameContext;

  @property({ type: String, attribute: "back-url" })
  backUrl: string = "/";

  get title() {
    return this.game?.name || "Untitled Game";
  }

  get startedOn() {
    if (!this.game || !this.game.createdAt || !this.game.updatedAt) return "";

    let date;

    switch (this.game.status) {
      case "active":
        date = this.game.createdAt;
        break;
      case "completed":
        date = this.game.updatedAt;
        break;
      default:
        date = this.game.createdAt;
        break;
    }

    const dateString = new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (this.game.status === "completed") {
      return `Completed on ${dateString}`;
    }

    return `Started on ${dateString}`;
  }

  handleEditGame() {
    const url = new URL("edit.html", window.location.href);
    if (this.game && this.game.id) {
      url.searchParams.set("id", this.game.id);
    }
    barba.go(url.toString());
  }

  render() {
    // Turn tracking info
    const hasTurnTracking = this.game?.hasTurnTracking() ?? false;
    const currentTurnNumber = this.game?.getCurrentTurnNumber();
    const currentPlayerIndex = this.game?.getCurrentPlayerIndex();
    const currentPlayerName =
      currentPlayerIndex !== null &&
      currentPlayerIndex !== undefined &&
      this.game?.players?.[currentPlayerIndex]
        ? this.game.players[currentPlayerIndex].name
        : null;

    return html`
      <header
        class="grid grid-cols-2 grid-rows-2 lg:grid-cols-3 lg:grid-rows-1 border-b-2 p-2 gap-y-2 flex-shrink-0 bg-gray-light">
        <a
          href="${this.backUrl}"
          class="col-start-1 row-start-1 self-baseline justify-self-start btn-sm btn-secondary-outline">
          ← Back to Games
        </a>
        <button
          type="button"
          class="col-start-2 row-start-1 self-baseline justify-self-end lg:col-start-3 btn-sm btn-secondary"
          @click="${this.handleEditGame}">
          Edit
        </button>
        <div class="row-start-2 col-span-2 lg:row-start-1 lg:col-span-1 lg:col-start-2 self-center flex flex-col gap-sm">
          <h1 class="text-center text-3xl font-semibold">${this.title}</h1>
          <div class="flex justify-center items-center gap-md lg:gap-lg">
            ${this.startedOn ? html`<p class="text-center">${this.startedOn}</p>` : nothing}
            ${this.game?.timeLimit ? html`<x-game-timer></x-game-timer>` : nothing}
            ${hasTurnTracking && currentTurnNumber !== null
              ? html`
                  <div class="flex items-center gap-sm">
                    <p class="text-lg whitespace-nowrap font-semibold">Turn ${currentTurnNumber}</p>
                    ${currentPlayerName
                      ? html`
                          <p class="text-base  whitespace-nowrap">Current Player: ${currentPlayerName}</p>
                        `
                      : nothing}
                  </div>
                `
              : nothing}
          </div>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-header": GameHeaderComponent;
  }
}
