import { CSSResult, html, LitElement, TemplateResult } from "lit";

export class BaseComponent extends LitElement {
  protected templateContent: string = "";

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

  protected loadTemplate(template: string): void {
    this.templateContent = template;
    this.renderTemplate();
  }

  private renderTemplate(): void {
    this.innerHTML = this.templateContent;
  }

  static styles?: CSSResult | CSSResult[];

  connectedCallback(): void {
    super.connectedCallback();
    this.classList.add("web-component");
  }
}
