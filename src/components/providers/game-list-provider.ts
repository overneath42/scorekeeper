import { provide } from "@lit/context";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils";
import { type GameListContext, gameListContext } from "@/context";
import { type StoredGame } from "@/services";

@customElement("x-game-list-provider")
export class GameListProviderComponent extends BaseComponent {
  private getAllGames = () => {
    return this.gameList.games;
  };

  private addGame = (game: StoredGame) => {
    this.gameList.games = [...this.gameList.games, game];
    this.requestUpdate();
  };

  private removeGame = (id: string) => {
    this.gameList.games = this.gameList.games.filter(game => game.id !== id);
    this.requestUpdate();
  };

  private updateGame = (updatedGame: StoredGame) => {
    this.gameList.games = this.gameList.games.map(game => 
      game.id === updatedGame.id ? updatedGame : game
    );
    this.requestUpdate();
  };

  private clearGames = () => {
    this.gameList.games = [];
    this.requestUpdate();
  };

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
