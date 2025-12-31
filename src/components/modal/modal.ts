import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { BaseComponent } from "../../utils/base-component.js";

export interface ModalConfig {
  title?: string | TemplateResult;
  content: string | TemplateResult;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

/**
 * Simple modal component wrapping the native dialog element.
 * Handles display logic only - consumers provide their own content and actions.
 *
 * @example
 * ```typescript
 * modalRef.value?.open({
 *   title: "Confirm",
 *   content: html`
 *     <p>Are you sure?</p>
 *     <div class="flex gap-2 justify-end mt-4">
 *       <button @click=${() => modalRef.value?.close()}>Cancel</button>
 *       <button @click=${handleDelete}>Delete</button>
 *     </div>
 *   `
 * });
 * ```
 */
@customElement("x-modal")
export class ModalComponent extends BaseComponent {
  @property({ type: Object })
  config?: ModalConfig;

  private dialogRef: Ref<HTMLDialogElement> = createRef();

  open(config: ModalConfig): void {
    this.config = config;
    this.updateComplete.then(() => {
      this.dialogRef.value?.showModal();
    });
  }

  close(): void {
    const dialog = this.dialogRef.value;
    if (!dialog) return;

    dialog.close();
    this.config?.onClose?.();
    this.config = undefined;
  }

  isOpen(): boolean {
    return this.dialogRef.value?.hasAttribute("open") ?? false;
  }

  private handleDialogClick = (e: MouseEvent): void => {
    if (this.config?.closeOnBackdrop === false) return;
    if (e.target === e.currentTarget) {
      this.close();
    }
  };

  private handleDialogClose = (): void => {
    this.config?.onClose?.();
    this.config = undefined;
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.config?.closeOnEscape === false) {
      e.preventDefault();
    }
  };

  protected render(): TemplateResult {
    if (!this.config) {
      return html`<dialog ${ref(this.dialogRef)}></dialog>`;
    }

    const sizeClasses = {
      sm: "w-[400px]",
      md: "w-[600px]",
      lg: "w-[800px]",
      xl: "w-[1000px]",
      full: "w-[95vw]",
    };
    const sizeClass = sizeClasses[this.config.size ?? "md"];

    return html`
      <dialog
        ${ref(this.dialogRef)}
        @click=${this.handleDialogClick}
        @close=${this.handleDialogClose}
        @keydown=${this.handleKeyDown}
        class="fixed m-0 p-0 border-0 bg-transparent max-w-full max-h-full backdrop:bg-black backdrop:bg-opacity-50"
      >
        <div
          class="${sizeClass} max-sm:w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-200"
        >
          ${this.config.title
            ? html`
                <div
                  class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0"
                >
                  <h2 class="text-2xl font-bold text-gray-900 m-0">
                    ${this.config.title}
                  </h2>
                  <button
                    type="button"
                    @click=${this.close}
                    class="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none w-8 h-8 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-0 p-0 hover:bg-gray-100 hover:rounded"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              `
            : ""}

          <div class="p-6 overflow-y-auto flex-1 text-gray-700">
            ${this.config.content}
          </div>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-modal": ModalComponent;
  }
}
