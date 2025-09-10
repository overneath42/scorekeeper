import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { provide } from "@lit/context";
import { gameStore, gameStoreContext, GameStore } from "../utils/game-store.js";
import { BaseComponent } from "../utils/base-component.js";

@customElement("x-game-store-provider")
export class GameStoreProviderComponent extends BaseComponent {
  @provide({ context: gameStoreContext })
  gameStore: GameStore = gameStore;

  connectedCallback() {
    super.connectedCallback();
    // Listen for store changes and trigger re-render to notify consumers
    this.gameStore.addEventListener("statechange", () => {
      console.log("GameStore state changed, updating provider");
      this.requestUpdate();
    });
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
