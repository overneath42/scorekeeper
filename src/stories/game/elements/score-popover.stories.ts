import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "@/stories/mock/game-provider.js";
import "@/components/game/elements/score-popover.js";

const meta: Meta = {
  title: "Game/Elements/Score Popover",
  component: "x-score-popover",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A popover component for adding scores to players. Shows a numeric input with quick-add buttons and submit/cancel actions.",
      },
    },
  },
  argTypes: {
    playerIndex: {
      control: "number",
      description: "The index of the player (0-based)",
      defaultValue: 0,
    },
    open: {
      control: "boolean",
      description: "Whether the popover is currently visible",
      defaultValue: false,
    },
  },
  render: (args) => {
    return html`
      <mock-game-provider>
        <div style="position: relative; padding: 2rem;">
          <button
            id="trigger-button"
            style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
            @click=${(e: MouseEvent) => {
              const trigger = e.currentTarget as HTMLElement | null;
              const popover = trigger?.parentElement?.querySelector(
                "x-score-popover"
              ) as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
              if (popover && trigger) {
                popover.showScorePopover(trigger);
              }
            }}>
            Add Score for Player ${args.playerIndex + 1}
          </button>
          <x-score-popover player-index="${args.playerIndex}" ?open=${args.open}>
          </x-score-popover>
        </div>
      </mock-game-provider>
    `;
  },
};

export default meta;
type Story = StoryObj;
 

export const Default: Story = {
  args: {
    playerIndex: 0,
    open: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Default closed popover. Click the button to open it.",
      },
    },
  },
};

export const OpenPopover: Story = {
  args: {
    playerIndex: 0,
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Popover in open state showing the score input interface.",
      },
    },
  },
};

export const DifferentPlayers: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div
          style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 2rem;">
          <div style="position: relative;">
            <button
              style="width: 100%; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
              @click=${(e: MouseEvent) => {
                const trigger = e.currentTarget as HTMLElement | null;
                const popover = trigger?.parentElement?.querySelector(
                  "x-score-popover"
                ) as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                if (popover && trigger) {
                  popover.showScorePopover(trigger);
                }
              }}>
              Alice
            </button>
            <x-score-popover player-index="0"></x-score-popover>
          </div>
          <div style="position: relative;">
            <button
              style="width: 100%; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
              @click=${(e: MouseEvent) => {
                const trigger = e.currentTarget as HTMLElement | null;
                const popover = trigger?.parentElement?.querySelector(
                  "x-score-popover"
                ) as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                if (popover && trigger) {
                  popover.showScorePopover(trigger);
                }
              }}>
              Bob
            </button>
            <x-score-popover player-index="1"></x-score-popover>
          </div>
          <div style="position: relative;">
            <button
              style="width: 100%; padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
              @click=${(e: MouseEvent) => {
                const trigger = e.currentTarget as HTMLElement | null;
                const popover = trigger?.parentElement?.querySelector(
                  "x-score-popover"
                ) as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                if (popover && trigger) {
                  popover.showScorePopover(trigger);
                }
              }}>
              Carol
            </button>
            <x-score-popover player-index="2"></x-score-popover>
          </div>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multiple popovers for different players. Click any button to open the corresponding popover.",
      },
    },
  },
};

export const GameboardContext: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div
          style="max-width: 600px; background: #f9fafb; border-radius: 0.5rem; overflow: hidden;">
          <div style="padding: 1rem; background: #e5e7eb; border-bottom: 1px solid #d1d5db;">
            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151;">
              Game Board
            </h3>
          </div>
          <div
            class="game-detail-grid"
            style="--grid-columns: 3; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e5e7eb;">
            <div style="background: white; position: relative;">
              <div
                style="padding: 0.5rem; text-align: center; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                Alice (40 pts)
              </div>
              <div style="padding: 1rem; text-align: center;">
                <button
                  style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
                  @click=${(e: MouseEvent) => {
                    const trigger = e.currentTarget as HTMLElement | null;
                    const popover = trigger
                      ?.closest(".game-detail-grid")
                      ?.querySelector('x-score-popover[player-index="0"]') as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                    if (popover && trigger) {
                      popover.showScorePopover(trigger);
                    }
                  }}>
                  + Score
                </button>
              </div>
              <x-score-popover player-index="0"></x-score-popover>
            </div>
            <div style="background: white; position: relative;">
              <div
                style="padding: 0.5rem; text-align: center; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                Bob (23 pts)
              </div>
              <div style="padding: 1rem; text-align: center;">
                <button
                  style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
                  @click=${(e: MouseEvent) => {
                    const trigger = e.currentTarget as HTMLElement | null;
                    const popover = trigger
                      ?.closest(".game-detail-grid")
                      ?.querySelector('x-score-popover[player-index="1"]') as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                    if (popover && trigger) {
                      popover.showScorePopover(trigger);
                    }
                  }}>
                  + Score
                </button>
              </div>
              <x-score-popover player-index="1"></x-score-popover>
            </div>
            <div style="background: white; position: relative;">
              <div
                style="padding: 0.5rem; text-align: center; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                Carol (30 pts)
              </div>
              <div style="padding: 1rem; text-align: center;">
                <button
                  style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
                  @click=${(e: MouseEvent) => {
                    const trigger = e.currentTarget as HTMLElement | null;
                    const popover = trigger
                      ?.closest(".game-detail-grid")
                      ?.querySelector('x-score-popover[player-index="2"]') as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                    if (popover && trigger) {
                      popover.showScorePopover(trigger);
                    }
                  }}>
                  + Score
                </button>
              </div>
              <x-score-popover player-index="2"></x-score-popover>
            </div>
          </div>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Score popovers in a realistic game board context with proper grid positioning. The popover will position itself relative to the grid layout.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div style="max-width: 400px; margin: 0 auto;">
          <div
            style="background: #f9fafb; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #374151;">
              Interactive Demo
            </h4>
            <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #6b7280;">
              Click the button below to open the score popover. Try:
            </p>
            <ul
              style="margin: 0 0 1rem 0; padding-left: 1.5rem; font-size: 0.875rem; color: #6b7280;">
              <li>Typing a score directly</li>
              <li>Using the quick-add buttons (+1, +5, +10)</li>
              <li>Pressing Enter to submit</li>
              <li>Pressing Escape to cancel</li>
            </ul>
          </div>
          <div style="position: relative; text-align: center;">
            <button
              style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; font-weight: 500;"
              @click=${(e: MouseEvent) => {
                const trigger = e.currentTarget as HTMLElement | null;
                const popover = trigger?.parentElement?.querySelector(
                  "x-score-popover"
                ) as HTMLElement & { showScorePopover: (trigger: HTMLElement) => void } | null;
                if (popover && trigger) {
                  popover.showScorePopover(trigger);
                }
              }}>
              Add Score for Alice
            </button>
            <x-score-popover player-index="0"></x-score-popover>
          </div>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demonstration of the score popover with usage instructions. Try all the different input methods!",
      },
    },
  },
};
