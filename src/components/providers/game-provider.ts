import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { provide } from "@lit/context";
import { gameContext } from "../../utils/context/game-context.js";
import type { GameContext } from "../../utils/context/game-context.js";
import type { Game, GamePlayer, ScoreEntry } from "../../types/index.js";
import { BaseComponent } from "../../utils/base-component.js";

// Test Data!
const SAMPLE_PLAYERS: GamePlayer[] = [
  { index: 0, name: "Justin" },
  { index: 1, name: "Kelly" },
];

const SAMPLE_SCORING_HISTORY: ScoreEntry[] = [
  [0, 10],
  [1, 15],
  [0, 5],
  [1, 20],
  [0, 10],
  [1, 20],
  [0, 1],
  [1, 10],
];

const SAMPLE_GAME: Game = {
  name: "Sample Game",
  targetScore: 100,
  players: SAMPLE_PLAYERS,
  scoringHistory: SAMPLE_SCORING_HISTORY,
};

@customElement("x-game-provider")
export class GameProviderComponent extends BaseComponent {
  private updateGame = (game: Game) => {
    this.game = {
      ...this.game,
      ...game,
    };
  };

  private addScore = (playerIndex: number, score: number) => {
    this.game = {
      ...this.game,
      scoringHistory: [...this.game.scoringHistory, [playerIndex, score]],
    };
  };

  private getPlayerCurrentScore = (playerIndex: number): number => {
    const playerScores = this.getPlayerScoringHistory(playerIndex);
    return playerScores.length > 0 ? playerScores.reduce((a, b) => a + b, 0) : 0;
  };

  private getPlayerScoringHistory = (playerIndex: number): number[] => {
    return this.game.scoringHistory
      .filter(([pIndex]: ScoreEntry) => pIndex === playerIndex)
      .map(([, points]: ScoreEntry) => points);
  };

  private getCurrentWinner = (): GamePlayer[] => {
    const scores = this.game.players.map((player) => this.getPlayerCurrentScore(player.index));
    const maxScore = Math.max(...scores);
    return this.game.players.filter(
      (player) => this.getPlayerCurrentScore(player.index) === maxScore && maxScore > 0
    );
  };

  private isCurrentWinner = (playerIndex: number): boolean => {
    return this.getCurrentWinner().some((player) => player.index === playerIndex);
  };

  @provide({ context: gameContext })
  @property({ type: Object, attribute: false })
  game: GameContext = {
    ...SAMPLE_GAME,
    updateGame: this.updateGame,
    addScore: this.addScore,
    getPlayerScoringHistory: this.getPlayerScoringHistory,
    getPlayerCurrentScore: this.getPlayerCurrentScore,
    isCurrentWinner: this.isCurrentWinner,
  };

  render() {
    return html`<slot></slot>`;
  }
}
