import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "@/stories/mock/game-provider.js";
import "@/components/game/elements/scores.js";
import "@/components/game/elements/score.js";

const meta: Meta = {
  title: "Game/Elements/Scores",
  component: "x-game-scores",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A score list component that displays all scores for a specific player, showing running totals and increments.",
      },
    },
  },
  argTypes: {
    playerIndex: {
      control: "number",
      description: "The index of the player whose scores to display",
      defaultValue: 0,
    },
  },
  decorators: [(story) => html` <mock-game-provider> ${story()} </mock-game-provider> `],
};

export default meta;
type Story = StoryObj;

export const Player1Scores: Story = {
  args: {
    playerIndex: 0,
  },
  parameters: {
    docs: {
      description: {
        story: "Score history for Player 1 (Alice) showing progression from 10 → 18 → 40.",
      },
    },
  },
};

export const Player2Scores: Story = {
  args: {
    playerIndex: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Score history for Player 2 (Bob) showing progression including a negative score: 15 → 10 → 23.",
      },
    },
  },
};

export const Player3Scores: Story = {
  args: {
    playerIndex: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "Score history for Player 3 (Carol) with two scores: 12 → 30.",
      },
    },
  },
};

export const EmptyScores: Story = {
  args: {
    playerIndex: 3, // Non-existent player
  },
  parameters: {
    docs: {
      description: {
        story: "Empty score list for a player with no scoring history.",
      },
    },
  },
};

export const InGameContext: Story = {
  render: () => html`
    <mock-game-provider>
      <div
        style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 800px;">
        <div style="background: #f9fafb; padding: 1.5rem; border-radius: 0.75rem;">
          <div
            style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151;">Alice</h3>
            <span style="font-size: 0.875rem; color: #6b7280;">Total: 40</span>
          </div>
          <x-game-scores player-index="0"></x-game-scores>
        </div>

        <div style="background: #f9fafb; padding: 1.5rem; border-radius: 0.75rem;">
          <div
            style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151;">Bob</h3>
            <span style="font-size: 0.875rem; color: #6b7280;">Total: 23</span>
          </div>
          <x-game-scores player-index="1"></x-game-scores>
        </div>

        <div style="background: #f9fafb; padding: 1.5rem; border-radius: 0.75rem;">
          <div
            style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151;">Carol</h3>
            <span style="font-size: 0.875rem; color: #6b7280;">Total: 30</span>
          </div>
          <x-game-scores player-index="2"></x-game-scores>
        </div>
      </div>
    </mock-game-provider>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "All player score lists shown together as they would appear in the actual game interface.",
      },
    },
  },
};
