import { html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";

export class BaseComponent extends LitElement {
  @property({ type: String, attribute: "class" })
  additionalClasses: string = "";

  constructor() {
    super();
  }

  // Disable Shadow DOM so global Tailwind styles work
  createRenderRoot() {
    return this;
  }

  protected render(): TemplateResult {
    return html``;
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.additionalClasses) {
      this.classList.add(...this.additionalClasses.split(" "));
    }
  }
}
