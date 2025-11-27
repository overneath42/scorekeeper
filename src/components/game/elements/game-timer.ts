import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { BaseComponent } from "@/utils/index.js";
import { gameContext, type GameContext } from "@/context";

@customElement("x-game-timer")
export class GameTimerComponent extends BaseComponent {
  @consume({ context: gameContext, subscribe: true })
  @property({ attribute: false })
  game?: GameContext;

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  render() {
    // Only show timer if game has a time limit
    if (!this.game || !this.game.timeLimit) {
      return html``;
    }

    const timeRemaining = this.game.timeRemaining ?? 0;
    const isExpired = timeRemaining <= 0;
    const isLowTime = timeRemaining > 0 && timeRemaining <= 60; // Last minute warning

    return html`
      <div class="text-center">
        <div class="flex items-center justify-center gap-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-mono text-lg font-semibold ${isExpired ? 'text-red-600' : isLowTime ? 'text-orange-500' : ''}">
            ${isExpired ? 'Time Expired' : this.formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-timer": GameTimerComponent;
  }
}
