import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import type { ModalComponent } from "../../components/modal/modal.js";

/**
 * Examples showing how to use the simplified modal component.
 * The modal is just a presentation layer - you provide the content and logic.
 */
@customElement("modal-examples")
export class ModalExamples extends LitElement {
  private modalRef: Ref<ModalComponent> = createRef();

  // Example 1: Simple confirmation dialog
  private showSimpleConfirm(): void {
    this.modalRef.value?.open({
      title: "Delete Game?",
      content: html`
        <p class="mb-4">This action cannot be undone.</p>
        <div class="flex gap-2 justify-end">
          <button
            @click=${() => this.modalRef.value?.close()}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click=${() => this.handleDelete()}
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      `,
      size: "sm",
    });
  }

  // Example 2: Form inside modal
  private showFormModal(): void {
    this.modalRef.value?.open({
      title: "Create New Game",
      content: html`
        <form @submit=${this.handleFormSubmit} id="game-form">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Game Name</label>
            <input
              type="text"
              name="name"
              required
              class="w-full px-3 py-2 border rounded"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Players</label>
            <input
              type="number"
              name="players"
              min="2"
              required
              class="w-full px-3 py-2 border rounded"
            />
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click=${() => this.modalRef.value?.close()}
              class="px-4 py-2 bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
              Create
            </button>
          </div>
        </form>
      `,
      closeOnBackdrop: false, // Don't close on backdrop for forms
    });
  }

  // Example 3: Content without title
  private showContentOnly(): void {
    this.modalRef.value?.open({
      content: html`
        <div class="text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-xl font-bold mb-2">Congratulations!</h3>
          <p class="mb-4">You've won the game!</p>
          <button
            @click=${() => this.modalRef.value?.close()}
            class="px-6 py-2 bg-green-600 text-white rounded"
          >
            Awesome!
          </button>
        </div>
      `,
    });
  }

  // Example 4: Complex content with state
  private showComplexContent(): void {
    let selectedOption = "option1";

    const content = (): TemplateResult => html`
      <div>
        <p class="mb-4">Choose an option:</p>
        <div class="space-y-2 mb-4">
          ${["option1", "option2", "option3"].map(
            (opt) => html`
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="option"
                  value=${opt}
                  ?checked=${opt === selectedOption}
                  @change=${() => {
                    selectedOption = opt;
                    // Re-render modal content
                    this.modalRef.value?.open({
                      title: "Select Option",
                      content: content(),
                    });
                  }}
                />
                ${opt}
              </label>
            `
          )}
        </div>
        <div class="flex gap-2 justify-end">
          <button
            @click=${() => this.modalRef.value?.close()}
            class="px-4 py-2 bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            @click=${() => this.handleOptionSelect(selectedOption)}
            class="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    `;

    this.modalRef.value?.open({
      title: "Select Option",
      content: content(),
    });
  }

  // Example handlers
  private handleDelete(): void {
    console.log("Deleting...");
    this.modalRef.value?.close();
  }

  private handleFormSubmit(e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    console.log("Form data:", Object.fromEntries(formData));
    this.modalRef.value?.close();
  }

  private handleOptionSelect(option: string): void {
    console.log("Selected:", option);
    this.modalRef.value?.close();
  }

  render(): TemplateResult {
    return html`
      <div class="p-8 space-y-4">
        <h1 class="text-2xl font-bold mb-4">Modal Examples</h1>

        <button
          @click=${this.showSimpleConfirm}
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Simple Confirm
        </button>

        <button
          @click=${this.showFormModal}
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Form Modal
        </button>

        <button
          @click=${this.showContentOnly}
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Content Only
        </button>

        <button
          @click=${this.showComplexContent}
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Complex Content
        </button>

        <x-modal ${ref(this.modalRef)}></x-modal>
      </div>
    `;
  }
}
