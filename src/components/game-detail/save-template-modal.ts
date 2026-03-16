import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { BaseComponent } from "@/utils";
import { TemplateStorageService } from "@/services";

@customElement("x-save-template-modal")
export class SaveTemplateModalComponent extends BaseComponent {
  @state() templateName = "";
  @state() isDuplicate = false;
  @state() saveError = false;

  private dialogRef: Ref<HTMLDialogElement> = createRef();
  private templateStorage = TemplateStorageService.getInstance();

  open(): void {
    this.templateName = "";
    this.isDuplicate = false;
    this.saveError = false;
    this.updateComplete.then(() => {
      this.dialogRef.value?.showModal();
    });
  }

  close(): void {
    const dialog = this.dialogRef.value;
    if (!dialog) return;

    dialog.close();

    const onTransitionEnd = () => {
      dialog.removeEventListener("transitionend", onTransitionEnd);
    };
    dialog.addEventListener("transitionend", onTransitionEnd);
  }

  private handleInput(e: Event): void {
    this.templateName = (e.target as HTMLInputElement).value;
    this.isDuplicate = this.templateName.trim().length > 0 &&
      this.templateStorage.hasTemplateName(this.templateName.trim());
    this.saveError = false;
  }

  private handleSave(): void {
    if (!this.templateName.trim()) return;
    this.dispatchEvent(new CustomEvent("save-template", {
      detail: { templateName: this.templateName.trim() },
      bubbles: true,
    }));
  }

  showSaveError(): void {
    this.saveError = true;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    }
  };

  private handleDialogCancel = (e: Event): void => {
    e.preventDefault();
  };

  render() {
    return html`
      <dialog
        ${ref(this.dialogRef)}
        @cancel=${this.handleDialogCancel}
        @keydown=${this.handleKeyDown}
        class="fixed m-0 p-0 border-0 bg-transparent max-w-full max-h-full w-full h-full flex items-center justify-center">
        <div class="w-[400px] max-sm:w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-200">
          <div class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 class="text-2xl font-bold text-gray-900 m-0">Save As Template</h2>
            <button
              type="button"
              @click=${this.close}
              class="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none w-8 h-8 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-0 p-0 hover:bg-gray-100 hover:rounded"
              aria-label="Close">
              ×
            </button>
          </div>
          <div class="p-6 overflow-y-auto flex-1 text-gray-700">
            <div class="form-group">
              <label for="template-name-input" class="form-label">Template Name</label>
              <input
                type="text"
                id="template-name-input"
                class="form-input"
                placeholder="e.g. Cribbage, Yahtzee"
                .value=${this.templateName}
                @input=${this.handleInput}
                autocomplete="off" />
              ${this.isDuplicate ? html`
                <p class="form-help-text text-orange-600 mt-1">A template with this name already exists.</p>
              ` : ''}
              ${this.saveError ? html`
                <p class="form-help-text text-red-600 mt-1">Failed to save template. Storage may be full.</p>
              ` : ''}
            </div>
            <div class="flex gap-2 justify-end mt-4">
              <button
                type="button"
                @click=${this.close}
                class="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                @click=${this.handleSave}
                ?disabled=${!this.templateName.trim()}
                class="btn btn-primary">
                Save Template
              </button>
            </div>
          </div>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-save-template-modal": SaveTemplateModalComponent;
  }
}
