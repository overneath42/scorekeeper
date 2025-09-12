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
    window.location.href = url.toString();
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
