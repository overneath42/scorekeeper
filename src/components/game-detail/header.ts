import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseComponent } from "@/utils";

@customElement("x-game-detail-header")
export class GameDetailHeaderComponent extends BaseComponent {
  @property({ type: String, attribute: "context" })
  context: "create" | "edit" = "edit";

  private get isEditMode() {
    return this.context === "edit";
  }

  private get gameId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  private get pageTitle() {
    return this.isEditMode ? "Modify Game" : "New Game";
  }

  private get backButtonLabel() {
    return this.isEditMode ? "Back to Game" : "Back to All Games";
  }

  private get backButtonHref() {
    return this.isEditMode && this.gameId ? `/pages/play.html?id=${this.gameId}` : "/";
  }

  render() {
    return html`
      <header class="flex-shrink-0 pt-safe-area-top pb-md px-md flex flex-col-reverse gap-2">
        <h1 id="page-title" class="text-4xl font-bold text-gray-900">${this.pageTitle}</h1>
        <a href="${this.backButtonHref}" class="btn-sm btn-secondary mb-sm self-start"
          >&larr; ${this.backButtonLabel}</a
        >
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-game-detail-header": GameDetailHeaderComponent;
  }
}
