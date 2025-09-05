import { Controller } from '@hotwired/stimulus';

export default class ScoreFormController extends Controller {
  static outlets = ['toggle-class'];

  declare readonly toggleClassOutlets: any[];
  declare readonly hasToggleClassOutlet: boolean;

  scoreSubmitted(event: CustomEvent) {
    const { playerIndex, score } = event.detail;
    
    // Handle the score submission if needed
    console.log(`Score form controller received: Player ${playerIndex}, Score ${score}`);
    
    // Toggle the form visibility using the outlet
    if (this.hasToggleClassOutlet) {
      this.toggleClassOutlets.forEach(outlet => {
        if (outlet.toggle && typeof outlet.toggle === 'function') {
          outlet.toggle();
        }
      });
    }
  }
}