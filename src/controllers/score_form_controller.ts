import { BaseController } from "stimulus-library";

export default class ScoreFormController extends BaseController {
  declare readonly buttonTarget: HTMLButtonElement;
  declare readonly subheaderTarget: HTMLElement;
  declare transformClass: string;

  static targets = ["button", "subheader"];
  static classes = ["transform"];

  openForm() {
    this.el.classList.toggle(this.transformClass);
    this.buttonTarget.classList.add("opacity-0", "pointer-events-none");
    this.subheaderTarget.classList.add("opacity-100");
  }

  //   static outlets = ["toggle-class"];
  //   declare readonly buttonTarget: HTMLButtonElement;
  //   declare readonly hasButtonTarget: boolean;
  //   declare readonly toggleClassOutlets: any[];
  //   declare readonly hasToggleClassOutlet: boolean;
  //   connect() {
  //     // Listen for form events from the x-score-form component
  //     this.element.addEventListener("form-opened", this.handleFormOpened.bind(this));
  //     this.element.addEventListener("form-closed", this.handleFormClosed.bind(this));
  //     this.element.addEventListener("form-cancelled", this.handleFormCancelled.bind(this));
  //   }
  //   disconnect() {
  //     // Clean up event listeners
  //     this.element.removeEventListener("form-opened", this.handleFormOpened.bind(this));
  //     this.element.removeEventListener("form-closed", this.handleFormClosed.bind(this));
  //     this.element.removeEventListener("form-cancelled", this.handleFormCancelled.bind(this));
  //   }
  //   // Called when the "Update Score" button is clicked
  //   openForm() {
  //     if (this.hasButtonTarget) {
  //       this.buttonTarget.disabled = true;
  //       this.buttonTarget.textContent = "Form Open...";
  //     }
  //     // Dispatch form-opened event for the x-score-form to receive
  //     const formElement = this.element.querySelector("x-score-form");
  //     if (formElement) {
  //       formElement.dispatchEvent(
  //         new CustomEvent("form-opened", {
  //           bubbles: true,
  //           detail: { controller: this },
  //         })
  //       );
  //     }
  //   }
  //   private handleFormOpened() {
  //     // Form is now visible, keep button disabled
  //     if (this.hasButtonTarget) {
  //       this.buttonTarget.disabled = true;
  //       this.buttonTarget.textContent = "Form Open...";
  //     }
  //   }
  //   private handleFormClosed() {
  //     // Form was submitted and closed, re-enable button
  //     this.enableButton();
  //   }
  //   private handleFormCancelled() {
  //     // Form was cancelled and closed, re-enable button
  //     this.enableButton();
  //   }
  //   private enableButton() {
  //     if (this.hasButtonTarget) {
  //       this.buttonTarget.disabled = false;
  //       this.buttonTarget.textContent = "Update Score";
  //     }
  //   }
  //   // Legacy method - keeping for backward compatibility
  //   scoreSubmitted(event: CustomEvent) {
  //     const { playerIndex, score } = event.detail;
  //     // Handle the score submission if needed
  //     console.log(`Score form controller received: Player ${playerIndex}, Score ${score}`);
  //     // Toggle the form visibility using the outlet
  //     if (this.hasToggleClassOutlet) {
  //       this.toggleClassOutlets.forEach((outlet) => {
  //         if (outlet.toggle && typeof outlet.toggle === "function") {
  //           outlet.toggle();
  //         }
  //       });
  //     }
  //   }
}
