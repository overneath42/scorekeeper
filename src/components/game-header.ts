import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { gameStoreContext, GameStore } from "../utils/index.js";

@customElement("x-game-header")
export class GameHeaderComponent extends LitElement {
  @consume({ context: gameStoreContext, subscribe: true })
  @property({ attribute: false })
  gameStore?: GameStore;

  @property({ type: String })
  gameTitle: string = "Game Title";

  @property({ type: String })
  backUrl: string = "games.html";

  createRenderRoot() {
    return this;
  }

  willUpdate() {
    if (this.gameStore) {
      this.gameTitle = this.gameStore.getState().gameTitle;
    }
  }

  render() {
    return html`
      <header class="x-game-header">
        <a href="${this.backUrl}" class="back-link"> ← Back to Games </a>
        <button type="button" class="edit-button">Edit</button>
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
