import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "@/stories/mock/game-provider.js";
import { MockGameProvider } from "@/stories/mock/game-provider.js";
import "@/components/game/elements/current-score.js";

const meta: Meta = {
  title: "Game/Elements/Current Score",
  component: "x-current-score",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A current score component that displays the current total score for a player, with leader/winner status indication.",
      },
    },
  },
  argTypes: {
    playerIndex: {
      control: "number",
      description: "The index of the player",
      defaultValue: 0,
    },
  },
  render: (args) => {
    return html`
      <mock-game-provider>
        <x-current-score player-index="${args.playerIndex}"></x-current-score>
      </mock-game-provider>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const Leader: Story = {
  args: {
    playerIndex: 0,
  },
  parameters: {
    docs: {
      description: {
        story: "Player is currently in the lead during an active game.",
      },
    },
  },
};

export const Winner: Story = {
  args: {
    playerIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const provider = canvasElement.querySelector("mock-game-provider") as MockGameProvider;

    provider.updateGame({
      status: "completed",
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Player has won the completed game, showing 'Winner!' instead of 'Leader'.",
      },
    },
  },
};

export const NonLeader: Story = {
  args: {
    playerIndex: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Player is not currently leading, showing only the score.",
      },
    },
  },
};

export const GameboardContext: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div
          style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; max-width: 600px; background: #e5e7eb;">
          <div style="background: white;">
            <div
              style="padding: 0.5rem; text-align: center; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              Alice
            </div>
            <x-current-score player-index="0"></x-current-score>
          </div>
          <div style="background: white;">
            <div
              style="padding: 0.5rem; text-align: center; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              Bob
            </div>
            <x-current-score player-index="1"></x-current-score>
          </div>
          <div style="background: white;">
            <div
              style="padding: 0.5rem; text-align: center; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              Carol
            </div>
            <x-current-score player-index="2"></x-current-score>
          </div>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Multiple current scores in a gameboard-like layout showing typical usage context.",
      },
    },
  },
};

export const CompletedGameComparison: Story = {
  render: () => {
    return html`
      <mock-game-provider>
        <div
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 400px;">
          <div style="background: #f9fafb; border-radius: 0.5rem; overflow: hidden;">
            <div
              style="padding: 0.5rem; text-align: center; font-weight: 600; background: #e5e7eb; border-bottom: 1px solid #d1d5db;">
              Winner
            </div>
            <x-current-score player-index="0"></x-current-score>
          </div>
          <div style="background: #f9fafb; border-radius: 0.5rem; overflow: hidden;">
            <div
              style="padding: 0.5rem; text-align: center; font-weight: 600; background: #e5e7eb; border-bottom: 1px solid #d1d5db;">
              Runner-up
            </div>
            <x-current-score player-index="1"></x-current-score>
          </div>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Completed game showing winner vs non-winner comparison.",
      },
    },
  },
};
