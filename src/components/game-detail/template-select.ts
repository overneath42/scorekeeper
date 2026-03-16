import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { BaseComponent, formatTemplateSummary, type GameTemplate } from "@/utils";

@customElement("x-template-select")
export class TemplateSelectComponent extends BaseComponent {
  @property({ type: Array })
  templates: GameTemplate[] = [];

  @property({ type: String })
  selectedTemplateId: string = "";

  @state()
  private isOpen: boolean = false;

  @state()
  private searchQuery: string = "";

  @state()
  private highlightedIndex: number = -1;

  private get filteredTemplates(): GameTemplate[] {
    if (!this.searchQuery) return this.templates;
    const query = this.searchQuery.toLowerCase();
    return this.templates.filter((t) => {
      const name = t.templateName.toLowerCase();
      const summary = formatTemplateSummary(t).toLowerCase();
      return name.includes(query) || summary.includes(query);
    });
  }

  private get selectedTemplate(): GameTemplate | undefined {
    return this.templates.find((t) => t.id === this.selectedTemplateId);
  }

  private boundHandleOutsideClick = this.handleOutsideClick.bind(this);

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.boundHandleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this.boundHandleOutsideClick);
  }

  private handleOutsideClick(e: MouseEvent) {
    if (!this.isOpen) return;
    if (!this.contains(e.target as Node)) {
      this.close();
    }
  }

  private toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open() {
    this.isOpen = true;
    this.searchQuery = "";
    this.highlightedIndex = -1;
    this.updateComplete.then(() => {
      const input = this.querySelector<HTMLInputElement>(".template-search-input");
      input?.focus();
    });
  }

  private close() {
    this.isOpen = false;
    this.searchQuery = "";
    this.highlightedIndex = -1;
  }

  private handleSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.highlightedIndex = -1;
  }

  private handleKeydown(e: KeyboardEvent) {
    // Total items: "No Template" option (index 0) + filtered templates
    const totalItems = this.filteredTemplates.length + 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.highlightedIndex = (this.highlightedIndex + 1) % totalItems;
        this.scrollHighlightedIntoView();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.highlightedIndex = this.highlightedIndex <= 0 ? totalItems - 1 : this.highlightedIndex - 1;
        this.scrollHighlightedIntoView();
        break;
      case "Enter":
        e.preventDefault();
        if (this.highlightedIndex >= 0) {
          if (this.highlightedIndex === 0) {
            this.selectTemplate("");
          } else {
            const template = this.filteredTemplates[this.highlightedIndex - 1];
            if (template) this.selectTemplate(template.id);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        this.close();
        break;
    }
  }

  private scrollHighlightedIntoView() {
    this.updateComplete.then(() => {
      const highlighted = this.querySelector<HTMLElement>('[data-highlighted="true"]');
      highlighted?.scrollIntoView({ block: "nearest" });
    });
  }

  private selectTemplate(templateId: string) {
    this.dispatchEvent(
      new CustomEvent("template-select", {
        detail: { templateId },
        bubbles: true,
        composed: true,
      })
    );
    this.close();
  }

  render() {
    const selected = this.selectedTemplate;

    return html`
      <div class="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded="${this.isOpen}"
          aria-haspopup="listbox"
          aria-controls="template-listbox"
          class="form-input w-full text-left flex items-center justify-between gap-2"
          @click="${this.toggle}"
        >
          <div class="flex-1 min-w-0">
            ${selected ? html`
              <div class="font-semibold truncate">${selected.templateName}</div>
              <div class="text-sm text-gray-500 truncate">${formatTemplateSummary(selected)}</div>
            ` : html`
              <span class="text-gray-400">Search Templates...</span>
            `}
          </div>
          <svg class="w-4 h-4 shrink-0 text-gray-400 transition-transform ${this.isOpen ? "rotate-180" : ""}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        ${this.isOpen ? html`
          <div class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div class="p-2 border-b border-gray-100">
              <input
                type="text"
                class="template-search-input w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Type to filter..."
                .value="${this.searchQuery}"
                @input="${this.handleSearchInput}"
                @keydown="${this.handleKeydown}"
              />
            </div>
            <ul
              id="template-listbox"
              role="listbox"
              class="max-h-60 overflow-y-auto"
            >
              <li
                role="option"
                aria-selected="${this.selectedTemplateId === ""}"
                data-highlighted="${this.highlightedIndex === 0}"
                class="px-3 py-2 cursor-pointer text-sm text-gray-500 italic hover:bg-gray-50 ${classMap({ "bg-primary/10": this.highlightedIndex === 0 })}"
                @click="${() => this.selectTemplate("")}"
              >
                No Template
              </li>
              ${this.filteredTemplates.map((t, i) => {
                const itemIndex = i + 1;
                const isHighlighted = this.highlightedIndex === itemIndex;
                const isSelected = this.selectedTemplateId === t.id;
                return html`
                  <li
                    role="option"
                    aria-selected="${isSelected}"
                    data-highlighted="${isHighlighted}"
                    class="px-3 py-2 cursor-pointer hover:bg-gray-50 ${classMap({ "bg-primary/10": isHighlighted })}"
                    @click="${() => this.selectTemplate(t.id)}"
                  >
                    <div class="font-semibold text-sm">${t.templateName}</div>
                    <div class="text-xs text-gray-500">${formatTemplateSummary(t)}</div>
                  </li>
                `;
              })}
              ${this.filteredTemplates.length === 0 && this.searchQuery ? html`
                <li class="px-3 py-2 text-sm text-gray-400 italic">No matching templates</li>
              ` : nothing}
            </ul>
          </div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-template-select": TemplateSelectComponent;
  }
}
