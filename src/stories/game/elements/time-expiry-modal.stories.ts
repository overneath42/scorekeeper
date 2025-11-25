import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "@/stories/mock/game-provider.js";
import "@/components/game/elements/time-expiry-modal.js";

const meta: Meta = {
  title: "Game/Elements/Time Expiry Modal",
  component: "x-time-expiry-modal",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A modal that appears when a timed game expires. Shows the winner (or no winner) based on the game rules and final scores.",
      },
    },
  },
  render: () => {
    return html`
      <mock-game-provider>
        <x-time-expiry-modal></x-time-expiry-modal>
      </mock-game-provider>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const WinnerByScore: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div style="padding: 2rem; text-align: center;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            Simulates time expiring with Alice as the winner (highest score: 40 pts)
          </p>
          <button
            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: 500;"
            @click=${(e: MouseEvent) => {
              const modal = (e.target as HTMLElement)?.parentElement?.querySelector(
                "x-time-expiry-modal"
              );
              if (modal) {
                modal.dispatchEvent(
                  new CustomEvent("time-expired", {
                    detail: {
                      hasWinner: true,
                      playerScores: [40, 23, 30], // Alice: 40, Bob: 23, Carol: 30
                    },
                    bubbles: true,
                    composed: true,
                  })
                );
              }
            }}>
            Trigger Time Expiry (Winner)
          </button>
        </div>
        <x-time-expiry-modal></x-time-expiry-modal>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal showing when time expires and there is a clear winner. Alice wins with the highest score.",
      },
    },
  },
};

export const NoWinner: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div style="padding: 2rem; text-align: center;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            Simulates time expiring with no winner (target score not met, "No Winner" selected)
          </p>
          <button
            style="padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: 500;"
            @click=${(e: MouseEvent) => {
              const modal = (e.target as HTMLElement)?.parentElement?.querySelector(
                "x-time-expiry-modal"
              );
              if (modal) {
                modal.dispatchEvent(
                  new CustomEvent("time-expired", {
                    detail: {
                      hasWinner: false,
                      playerScores: [40, 23, 30],
                    },
                    bubbles: true,
                    composed: true,
                  })
                );
              }
            }}>
            Trigger Time Expiry (No Winner)
          </button>
        </div>
        <x-time-expiry-modal></x-time-expiry-modal>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal showing when time expires with no winner. This happens when a target score is set, no one met it, and the game was configured with "No Winner" behavior.',
      },
    },
  },
};

export const TieGame: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div style="padding: 2rem; text-align: center;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            Simulates time expiring with a tie (Alice and Carol both have 40 pts)
          </p>
          <button
            style="padding: 0.75rem 1.5rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: 500;"
            @click=${(e: MouseEvent) => {
              const modal = (e.target as HTMLElement)?.parentElement?.querySelector(
                "x-time-expiry-modal"
              );
              if (modal) {
                modal.dispatchEvent(
                  new CustomEvent("time-expired", {
                    detail: {
                      hasWinner: true,
                      playerScores: [40, 23, 40], // Alice: 40, Bob: 23, Carol: 40 (tie)
                    },
                    bubbles: true,
                    composed: true,
                  })
                );
              }
            }}>
            Trigger Time Expiry (Tie)
          </button>
        </div>
        <x-time-expiry-modal></x-time-expiry-modal>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Modal showing when time expires with multiple players tied for the highest score.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div style="max-width: 600px; margin: 0 auto;">
          <div
            style="background: #f9fafb; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #374151;">
              Time Expiry Modal Demo
            </h4>
            <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #6b7280;">
              This modal appears when a timed game reaches zero. Try different scenarios:
            </p>
          </div>

          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <div style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
              <h5 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                Clear Winner
              </h5>
              <p style="margin: 0 0 1rem 0; font-size: 0.75rem; color: #6b7280;">
                Alice: 40, Bob: 23, Carol: 30
              </p>
              <button
                style="width: 100%; padding: 0.5rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;"
                @click=${() => {
                  const modal = document.querySelector("x-time-expiry-modal");
                  if (modal) {
                    modal.dispatchEvent(
                      new CustomEvent("time-expired", {
                        detail: { hasWinner: true, playerScores: [40, 23, 30] },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }
                }}>
                Show Modal
              </button>
            </div>

            <div style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
              <h5 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                No Winner
              </h5>
              <p style="margin: 0 0 1rem 0; font-size: 0.75rem; color: #6b7280;">
                Target not met
              </p>
              <button
                style="width: 100%; padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;"
                @click=${() => {
                  const modal = document.querySelector("x-time-expiry-modal");
                  if (modal) {
                    modal.dispatchEvent(
                      new CustomEvent("time-expired", {
                        detail: { hasWinner: false, playerScores: [40, 23, 30] },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }
                }}>
                Show Modal
              </button>
            </div>

            <div style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
              <h5 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                Tie Game
              </h5>
              <p style="margin: 0 0 1rem 0; font-size: 0.75rem; color: #6b7280;">
                Alice: 40, Bob: 23, Carol: 40
              </p>
              <button
                style="width: 100%; padding: 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;"
                @click=${() => {
                  const modal = document.querySelector("x-time-expiry-modal");
                  if (modal) {
                    modal.dispatchEvent(
                      new CustomEvent("time-expired", {
                        detail: { hasWinner: true, playerScores: [40, 23, 40] },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }
                }}>
                Show Modal
              </button>
            </div>

            <div style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
              <h5 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                Close Victory
              </h5>
              <p style="margin: 0 0 1rem 0; font-size: 0.75rem; color: #6b7280;">
                Alice: 50, Bob: 49, Carol: 48
              </p>
              <button
                style="width: 100%; padding: 0.5rem; background: #8b5cf6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;"
                @click=${() => {
                  const modal = document.querySelector("x-time-expiry-modal");
                  if (modal) {
                    modal.dispatchEvent(
                      new CustomEvent("time-expired", {
                        detail: { hasWinner: true, playerScores: [50, 49, 48] },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }
                }}>
                Show Modal
              </button>
            </div>
          </div>

          <div
            style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: 0.5rem; border: 1px solid #fbbf24;">
            <p style="margin: 0; font-size: 0.875rem; color: #92400e;">
              <strong>Note:</strong> Click any button above to see the modal. Press Escape or Enter to
              close, or click the "View Final Scores" button.
            </p>
          </div>
        </div>
        <x-time-expiry-modal></x-time-expiry-modal>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo with multiple scenarios to explore different time expiry outcomes. Test all the variations!",
      },
    },
  },
};

export const LowScores: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div style="padding: 2rem; text-align: center;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            Game with low scores - Bob wins with only 5 points
          </p>
          <button
            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: 500;"
            @click=${(e: MouseEvent) => {
              const modal = (e.target as HTMLElement)?.parentElement?.querySelector(
                "x-time-expiry-modal"
              );
              if (modal) {
                modal.dispatchEvent(
                  new CustomEvent("time-expired", {
                    detail: {
                      hasWinner: true,
                      playerScores: [2, 5, 3],
                    },
                    bubbles: true,
                    composed: true,
                  })
                );
              }
            }}>
            Trigger Time Expiry
          </button>
        </div>
        <x-time-expiry-modal></x-time-expiry-modal>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal showing time expiry in a low-scoring game where the winner has only a few points.",
      },
    },
  },
};
