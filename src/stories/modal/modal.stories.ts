import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import "@/components/modal/modal.js";
import type { ModalComponent } from "@/components/modal/modal.js";

const meta: Meta = {
  title: "Components/Modal",
  component: "x-modal",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A simple modal component based on the HTML5 <dialog> element. Handles display and basic interactions - consumers provide their own content and action buttons.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const ConfirmationDialog: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div>
        <x-modal ${ref(modalRef)}></x-modal>
        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Delete Game",
              content: html`
                <p class="mb-4">
                  Are you sure you want to delete this game? This action cannot
                  be undone.
                </p>
                <div class="flex gap-2 justify-end">
                  <button
                    @click=${() => modalRef.value?.close()}
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    @click=${() => {
                      console.log("Delete confirmed");
                      modalRef.value?.close();
                    }}
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Confirmation Dialog
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "A simple confirmation dialog. Actions are rendered as part of the content.",
      },
    },
  },
};

export const FormModal: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const name = formData.get("playerName")?.toString();

      if (!name || name.trim().length === 0) {
        alert("Player name is required");
        return;
      }

      console.log("Form submitted:", {
        name: formData.get("playerName"),
        color: formData.get("playerColor"),
      });
      modalRef.value?.close();
    };

    return html`
      <div>
        <x-modal ${ref(modalRef)}></x-modal>
        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Edit Player Name",
              closeOnBackdrop: false,
              content: html`
                <form @submit=${handleSubmit} class="space-y-4">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Player Name
                    </label>
                    <input
                      type="text"
                      name="playerName"
                      value="Alice"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Player Color
                    </label>
                    <input
                      type="color"
                      name="playerColor"
                      value="#3b82f6"
                      class="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div class="flex gap-2 justify-end">
                    <button
                      type="button"
                      @click=${() => modalRef.value?.close()}
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Form Modal
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "A modal containing a form. The form handles its own validation and submission.",
      },
    },
  },
};

export const CustomContent: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div>
        <x-modal ${ref(modalRef)}></x-modal>
        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Game Actions",
              content: html`
                <p class="text-gray-700 mb-4">
                  Choose an action for this game:
                </p>
                <div class="flex gap-2 flex-wrap">
                  <button
                    @click=${() => {
                      console.log("Export clicked");
                      modalRef.value?.close();
                    }}
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Export
                  </button>
                  <button
                    @click=${() => {
                      console.log("Reset clicked");
                      modalRef.value?.close();
                    }}
                    class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Reset Scores
                  </button>
                  <button
                    @click=${() => {
                      console.log("Archive clicked");
                      modalRef.value?.close();
                    }}
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Archive
                  </button>
                  <button
                    @click=${() => modalRef.value?.close()}
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Custom Content Modal
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "A modal with completely custom content layout. You have full control.",
      },
    },
  },
};

export const DifferentSizes: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div class="flex flex-wrap gap-2">
        <x-modal ${ref(modalRef)}></x-modal>

        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Small Modal",
              size: "sm",
              content: html`
                <p class="mb-4">This is a small modal (400px width).</p>
                <button
                  @click=${() => modalRef.value?.close()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  OK
                </button>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Small
        </button>

        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Medium Modal",
              size: "md",
              content: html`
                <p class="mb-4">
                  This is a medium modal (600px width). This is the default
                  size.
                </p>
                <button
                  @click=${() => modalRef.value?.close()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  OK
                </button>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Medium (Default)
        </button>

        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Large Modal",
              size: "lg",
              content: html`
                <p class="mb-4">
                  This is a large modal (800px width). Good for more complex
                  content.
                </p>
                <button
                  @click=${() => modalRef.value?.close()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  OK
                </button>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Large
        </button>

        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Extra Large Modal",
              size: "xl",
              content: html`
                <p class="mb-4">
                  This is an extra large modal (1000px width). Perfect for
                  detailed content or wide layouts.
                </p>
                <button
                  @click=${() => modalRef.value?.close()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  OK
                </button>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Extra Large
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstration of different modal sizes: sm (400px), md (600px), lg (800px), and xl (1000px).",
      },
    },
  },
};

export const NoTitle: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div>
        <x-modal ${ref(modalRef)}></x-modal>
        <button
          @click=${() => {
            modalRef.value?.open({
              content: html`
                <div class="text-center">
                  <div class="text-6xl mb-4">🎉</div>
                  <h3 class="text-xl font-bold mb-2">Congratulations!</h3>
                  <p class="mb-4">You've won the game!</p>
                  <button
                    @click=${() => modalRef.value?.close()}
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Awesome!
                  </button>
                </div>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Modal Without Title
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "A modal without a title. Useful for celebration messages, etc.",
      },
    },
  },
};

export const WithCallbacks: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div>
        <x-modal ${ref(modalRef)}></x-modal>
        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Modal with Callback",
              content: html`
                <p class="mb-4">
                  This modal has an onClose callback. Check the console when
                  you close it!
                </p>
                <button
                  @click=${() => modalRef.value?.close()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  Close
                </button>
              `,
              onClose: () => {
                console.log("Modal was closed!");
              },
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Modal with Callback
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal with an onClose callback. Open the browser console to see the message.",
      },
    },
  },
};

export const DisableBackdropClose: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div>
        <x-modal ${ref(modalRef)}></x-modal>
        <button
          @click=${() => {
            modalRef.value?.open({
              title: "Important Notice",
              closeOnBackdrop: false,
              closeOnEscape: false,
              content: html`
                <p class="mb-4">
                  This modal cannot be closed by clicking the backdrop or
                  pressing Escape. You must click the button.
                </p>
                <button
                  @click=${() => modalRef.value?.close()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  I Understand
                </button>
              `,
            });
          }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Modal (No Backdrop/ESC Close)
        </button>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal that cannot be closed by clicking backdrop or pressing Escape.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const modalRef: Ref<ModalComponent> = createRef();

    return html`
      <div style="max-width: 500px;">
        <x-modal ${ref(modalRef)}></x-modal>

        <div class="bg-gray-50 p-6 rounded-lg mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Interactive Modal Demo
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            This modal demonstrates the key features:
          </p>
          <ul class="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>
              Press
              <kbd
                class="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs"
                >Escape</kbd
              >
              to close
            </li>
            <li>Click the backdrop (outside the modal) to close</li>
            <li>
              Keyboard navigation with
              <kbd
                class="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs"
                >Tab</kbd
              >
            </li>
            <li>Simple, composable API</li>
          </ul>
          <button
            @click=${() => {
              modalRef.value?.open({
                title: "Welcome to the Modal Component",
                content: html`
                  <div class="space-y-3">
                    <p class="text-gray-700">
                      This is a simple modal component built on the HTML5
                      <code class="px-1 py-0.5 bg-gray-100 rounded text-sm"
                        >&lt;dialog&gt;</code
                      >
                      element.
                    </p>
                    <div
                      class="bg-blue-50 border border-blue-200 rounded-lg p-3"
                    >
                      <h4 class="font-semibold text-blue-900 text-sm mb-1">
                        Key Features:
                      </h4>
                      <ul class="text-sm text-blue-800 space-y-1">
                        <li>✓ Native focus trap and keyboard handling</li>
                        <li>✓ Customizable content (Lit templates)</li>
                        <li>✓ Size variants (sm, md, lg, xl, full)</li>
                        <li>✓ Full accessibility support</li>
                        <li>✓ Simple, composable API</li>
                      </ul>
                    </div>
                    <button
                      @click=${() => modalRef.value?.close()}
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                    >
                      Got it!
                    </button>
                  </div>
                `,
                onClose: () => console.log("Modal closed"),
              });
            }}
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Try the Modal
          </button>
        </div>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "A comprehensive interactive demo showing modal features with instructions.",
      },
    },
  },
};
