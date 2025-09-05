import { property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { GameStore, gameStoreContext } from "./game-store.js";
import { BaseComponent } from "./base-component.js";

// Interface for context-consuming components
export interface ContextConsumer {
  gameStore?: GameStore;
}

// Mixin for components that need to consume the game store context
export function WithGameStoreContext<
  T extends new (...args: any[]) => BaseComponent
>(Base: T): T & (new (...args: any[]) => ContextConsumer) {
  class GameStoreConsumerComponent extends Base implements ContextConsumer {
    constructor(...args: any[]) {
      super(...args);
    }

    @consume({ context: gameStoreContext, subscribe: true })
    @property({ attribute: false })
    gameStore?: GameStore;
  }

  return GameStoreConsumerComponent as T &
    (new (...args: any[]) => ContextConsumer);
}

// Decorator for consuming game store context
export function consumeGameStore(target: any, propertyKey: string) {
  consume({ context: gameStoreContext, subscribe: true })(target, propertyKey);
}
