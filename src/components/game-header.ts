import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { gameStoreContext, GameStore, BaseComponent } from "../utils/index.js";

@customElement("x-game-header")
export class GameHeaderComponent extends BaseComponent {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: String })
  gameTitle: string = "Game Title";

  @property({ type: String })
  backUrl: string = "games.html";

  willUpdate() {
    if (this.gameStore) {
      this.gameTitle = this.gameStore.getGameTitle();
    }
  }

  handleEditGame() {
    window.location.href = "new-game.html";
  }

  render() {
    return html`
      <header class="x-game-header">
        <a href="${this.backUrl}" class="back-link btn-sm btn-secondary-outline">
          ← Back to Games
        </a>
        <button
          type="button"
          class="edit-button btn-sm btn-secondary"
          @click="${this.handleEditGame}">
          Edit
        </button>
        <h1 class="title">${this.gameTitle}</h1>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-header": GameHeaderComponent;
  }
}
