import { BaseController } from "stimulus-library";

export default class GameListController extends BaseController {
  static targets = ["item"];

  declare readonly itemTargets: HTMLElement[];

  connect() {
    console.log("GameListController connected");
    this.setupGameItems();
  }

  private setupGameItems() {
    const gameItems = this.el.querySelectorAll("x-game-item");
    gameItems.forEach((item, index) => {
      item.setAttribute("tabindex", "0");

      item.addEventListener("keydown", (event: Event) => {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          item.dispatchEvent(new Event("click"));
        }
      });
    });
  }

  refresh() {
    this.setupGameItems();
  }
}
