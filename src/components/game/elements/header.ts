import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { BaseComponent } from "@/utils/index.js";
import { gameContext, type GameContext } from "@/context";

@customElement("x-game-header")
export class GameHeaderComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  @property({ attribute: false })
  game?: GameContext;

  @property({ type: String })
  backUrl: string = "games.html";

  get title() {
    return this.game?.name || "Untitled Game";
  }

  get startedOn() {
    if (!this.game || !this.game.createdAt) return "";

    const dateString = new Date(this.game.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return `Started on ${dateString}`;
  }

  handleEditGame() {
    window.location.href = "new-game.html";
  }

  render() {
    return html`
      <header
        class="grid grid-cols-2 grid-rows-2 border-b-2 p-2 gap-y-2 flex-shrink-0 bg-gray-light">
        <a
          href="${this.backUrl}"
          class="col-start-1 row-start-1 self-baseline justify-self-start btn-sm btn-secondary-outline">
          ← Back to Games
        </a>
        <button
          type="button"
          class="col-start-2 row-start-1 self-baseline justify-self-end btn-sm btn-secondary"
          @click="${this.handleEditGame}">
          Edit
        </button>
        <h1 class="row-start-2 col-span-2 text-center text-3xl font-semibold">${this.title}</h1>
        ${this.startedOn ? html`<p class="text-center col-span-2">${this.startedOn}</p>` : nothing}
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-header": GameHeaderComponent;
  }
}
