import { BaseController } from "stimulus-library";

export default class GameDetailController extends BaseController {
  static targets = ["gameDetail"];

  declare readonly gameDetailTarget: HTMLElement;

  connect() {
    console.log("GameDetailController connected");
    this.initializeGameDetail();
  }

  private initializeGameDetail() {
    const gameDetailComponent = this.el.querySelector("x-game-detail");
    if (gameDetailComponent) {
      this.setupKeyboardNavigation();
    }
  }

  private setupKeyboardNavigation() {
    const buttons = this.element.querySelectorAll("button");
    buttons.forEach((button, index) => {
      button.addEventListener("keydown", (event: Event) => {
        const keyEvent = event as KeyboardEvent;

        if (keyEvent.key === "ArrowRight" || keyEvent.key === "ArrowLeft") {
          keyEvent.preventDefault();
          const nextIndex =
            keyEvent.key === "ArrowRight"
              ? (index + 1) % buttons.length
              : (index - 1 + buttons.length) % buttons.length;
          (buttons[nextIndex] as HTMLElement).focus();
        }
      });
    });
  }

  goBack() {
    window.history.back();
  }
}
