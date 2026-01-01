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

  get headerColumnCount() {
    const hasTimeLimit = this.game?.timeLimit;
    const hasTurnTracking = this.game?.hasTurnTracking();

    if (hasTimeLimit && hasTurnTracking) return 3;
    if (hasTurnTracking) return 2;
    return 1;
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
        class="grid grid-cols-2 auto-rows-min md:grid-cols-[1fr_3fr_1fr] md:auto-rows-min lg:grid-rows-1 border-b-2 p-2 gap-y-2 flex-shrink-0 bg-gray-light">
        <a
          href="${this.backUrl}"
          class="col-start-1 row-start-1 self-baseline justify-self-start btn-sm btn-secondary-outline">
          ← Back to Games
        </a>
        <button
          type="button"
          class="col-start-2 row-start-1 self-baseline justify-self-end md:col-start-3 btn-sm btn-secondary"
          @click="${this.handleEditGame}">
          Edit
        </button>
        <div
          class="row-start-2 col-span-2 md:row-start-1 md:col-span-1 md:col-start-2 self-center flex flex-col gap-sm">
          <h1 class="text-center text-3xl font-semibold">${this.title}</h1>
          <div class="grid auto-cols-auto auto-rows-min gap-sm mx-auto w-full max-w-[475px]">
            ${this.startedOn
              ? html`<p class="text-center row-start-1 col-span-${this.headerColumnCount}">
                  ${this.startedOn}
                </p>`
              : nothing}
            ${this.game?.timeLimit ? html`<x-game-timer></x-game-timer>` : nothing}
            ${hasTurnTracking && currentTurnNumber !== null
              ? html`
                  <p class="text-lg whitespace-nowrap text-center font-semibold">
                    Turn ${currentTurnNumber}
                  </p>
                  ${currentPlayerName
                    ? html`
                        <p class="text-base text-center whitespace-nowrap">
                          Current Player: <span class="font-semibold">${currentPlayerName}</span>
                        </p>
                      `
                    : nothing}
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
