import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { provide } from "@lit/context";
import { gameStore, gameStoreContext, GameStore } from "../utils/game-store.js";

@customElement("x-game-store-provider")
export class GameStoreProviderComponent extends LitElement {
  @provide({ context: gameStoreContext })
  gameStore: GameStore = gameStore;

  createRenderRoot() {
    return this;
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-store-provider": GameStoreProviderComponent;
  }
}
