import { provide } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils";
import { type GameListContext, gameListContext } from "@/context";
import { GameStorageService, type StoredGame } from "@/services";

@customElement("x-game-list-provider")
export class GameListProviderComponent extends BaseComponent {
  private storage = GameStorageService.getInstance();

  private getAllGames = () => {
    return this.storage.getAllStoredGames();
  };

  private addGame = (game: StoredGame) => {
    this.storage.saveGame(game);
    this.requestUpdate();
  };

  private removeGame = (id: string) => {
    this.storage.deleteGame(id);
    this.requestUpdate();
  };

  private updateGame = (updatedGame: StoredGame) => {
    this.storage.saveGame(updatedGame);
    this.requestUpdate();
  };

  private clearGames = () => {
    this.storage.clearAllGames();
    this.requestUpdate();
  };

  connectedCallback() {
    super.connectedCallback();
    this.gameList.games = this.storage.getAllStoredGames();
    console.log("Loaded games:", this.gameList.games);
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
