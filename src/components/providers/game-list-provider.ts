import { provide } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils";
import { type GameListContext, gameListContext } from "@/context";
import { GameStorageService, type StoredGame } from "@/services";

@customElement("x-game-list-provider")
export class GameListProviderComponent extends BaseComponent {
  private get storage() {
    return GameStorageService.getInstance();
  }

  private getAllGames = async () => {
    return this.storage.getAllStoredGames();
  };

  private addGame = async (game: StoredGame) => {
    await this.storage.saveGame(game);
    this.gameList.games = await this.storage.getAllStoredGames();
    this.requestUpdate();
  };

  private removeGame = async (id: string) => {
    await this.storage.deleteGame(id);
    this.gameList.games = await this.storage.getAllStoredGames();
    this.requestUpdate();
  };

  private updateGame = async (updatedGame: StoredGame) => {
    await this.storage.saveGame(updatedGame);
    this.gameList.games = await this.storage.getAllStoredGames();
    this.requestUpdate();
  };

  private clearGames = async () => {
    await this.storage.clearAllGames();
    this.gameList.games = await this.storage.getAllStoredGames();
    this.requestUpdate();
  };

  private handleSyncComplete = async () => {
    this.gameList.games = await this.storage.getAllStoredGames();
    this.requestUpdate();
  };

  connectedCallback() {
    super.connectedCallback();
    void (async () => {
      this.gameList.games = await this.storage.getAllStoredGames();
      this.requestUpdate();
    })();
    window.addEventListener("scorekeeper:sync-complete", this.handleSyncComplete);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("scorekeeper:sync-complete", this.handleSyncComplete);
  }

  @provide({ context: gameListContext })
  @property({ type: Object, attribute: false })
  gameList: GameListContext = {
    games: [],
    getAllGames: this.getAllGames,
    addGame: this.addGame,
    removeGame: this.removeGame,
    updateGame: this.updateGame,
    clearGames: this.clearGames,
  };

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-list-provider": GameListProviderComponent;
  }
}
