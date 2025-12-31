import barba from "@barba/core";
import {
  slideUpFormTransition,
  slideDownFormTransition,
  slideLeftTransition,
  slideRightTransition,
} from "./transitions/index.js";
import { GameStorageService } from "./services/index.js";

export function initBarba() {
  barba.init({
    transitions: [
      slideUpFormTransition,
      slideDownFormTransition,
      slideLeftTransition,
      slideRightTransition,
    ],
  });

  // Save timer state before navigation to ensure game list shows current values
  barba.hooks.before(() => {
    const gameProvider = document.querySelector("x-game-provider") as any;
    if (gameProvider && gameProvider.game && gameProvider.currentGameId) {
      const { game, currentGameId } = gameProvider;
      if (game.timeRemaining !== null && game.timeRemaining !== undefined) {
        const storage = GameStorageService.getInstance();
        storage.updateTimeRemaining(currentGameId, game.timeRemaining);
      }
    }
  });
}
