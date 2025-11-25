import { html, LitElement } from "lit";
import { provide } from "@lit/context";
import { customElement } from "lit/decorators.js";
import { gameContext, type GameContext } from "@/context/game-context.js";
import { StoredGame } from "@/services";

@customElement("mock-game-provider")
export class MockGameProvider extends LitElement {
  @provide({ context: gameContext })
  game: GameContext;

  constructor() {
    super();
    this.game = this.createMockGame();
  }

  createMockGame(): GameContext {
    const mockGame: GameContext = {
      id: "story-game-1",
      timecode: "20240101-120000",
      createdAt: new Date("2024-01-01T12:00:00Z"),
      updatedAt: new Date("2024-01-01T12:30:00Z"),
      status: "active",
      name: "Story Game",
      targetScore: 100,
      timeLimit: null,
      timeRemaining: null,
      lastActiveAt: null,
      timerBehavior: null,
      isTied: false,
      players: [
        { index: 0, name: "Alice" },
        { index: 1, name: "Bob" },
        { index: 2, name: "Carol" },
      ],
      scoringHistory: [
        [0, 10], // Alice: 10
        [1, 15], // Bob: 15
        [0, 8], // Alice: 8
        [2, 12], // Carol: 12
        [1, -5], // Bob: -5
        [0, 22], // Alice: 22
        [2, 18], // Carol: 18
        [1, 13], // Bob: 13
      ],
      createNewGame: () => {},
      addScore: () => {},
      updateGame: () => {},
      getPlayerScoringHistory: (playerIndex: number): number[] => {
        return mockGame.scoringHistory
          .filter(([pIndex]) => pIndex === playerIndex)
          .map(([, score]) => score);
      },
      getPlayerCurrentScore: (playerIndex: number): number => {
        return mockGame.scoringHistory
          .filter(([pIndex]) => pIndex === playerIndex)
          .reduce((total, [, score]) => total + score, 0);
      },
      isCurrentWinner: (playerIndex: number): boolean => {
        const currentScore = mockGame.getPlayerCurrentScore(playerIndex);
        const otherScores = [0, 1, 2]
          .filter((i) => i !== playerIndex)
          .map((i) => mockGame.getPlayerCurrentScore(i));
        return currentScore > Math.max(...otherScores);
      },
      loadGameById: () => {},
    };
    return mockGame;
  }

  updateGame(updates: Partial<StoredGame>) {
    this.game = { ...this.game, ...updates };
    this.requestUpdate();
  }

  render() {
    return html`<slot></slot>`;
  }
}
