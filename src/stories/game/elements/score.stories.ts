import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "@/components/game/elements/score.js";

const meta: Meta = {
  title: "Game/Elements/Score",
  component: "x-game-score",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A game score component that displays a score value with optional increment display.",
      },
    },
  },
  argTypes: {
    score: {
      control: "number",
      description: "The total score to display",
      defaultValue: 0,
    },
    increment: {
      control: "number",
      description: "The increment value to show (positive or negative)",
    },
    isCurrentScore: {
      control: "boolean",
      description: "Whether this is the current/latest score",
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    score: 25,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic score display without increment.",
      },
    },
  },
};

export const WithPositiveIncrement: Story = {
  args: {
    score: 35,
    increment: 10,
  },
  parameters: {
    docs: {
      description: {
        story: "Score with positive increment showing the points gained.",
      },
    },
  },
};

export const WithNegativeIncrement: Story = {
  args: {
    score: 15,
    increment: -10,
  },
  parameters: {
    docs: {
      description: {
        story: "Score with negative increment showing points lost.",
      },
    },
  },
};

export const CurrentScore: Story = {
  args: {
    score: 42,
    increment: 7,
    isCurrentScore: true,
  },
  parameters: {
    docs: {
      description: {
        story: "The current/latest score with special styling emphasis.",
      },
    },
  },
};

export const ZeroScore: Story = {
  args: {
    score: 0,
  },
  parameters: {
    docs: {
      description: {
        story: "Starting score of zero.",
      },
    },
  },
};

export const LargeScore: Story = {
  args: {
    score: 9999,
    increment: 150,
  },
  parameters: {
    docs: {
      description: {
        story: "Large score values to test layout.",
      },
    },
  },
};

export const ScoreList: Story = {
  render: () => html`
    <div style="width: 200px; background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #374151;">
        Player 1
      </h3>
      <div style="space-y-0">
        <x-game-score score="10" increment="10"></x-game-score>
        <x-game-score score="25" increment="15"></x-game-score>
        <x-game-score score="20" increment="-5"></x-game-score>
        <x-game-score score="42" increment="22" is-current-score></x-game-score>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "Multiple scores in a list showing typical usage context.",
      },
    },
  },
};

export const MultiplePlayersComparison: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 600px;">
      <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
        <h4 style="margin: 0 0 1rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
          Alice
        </h4>
        <x-game-score score="35" increment="10" is-current-score></x-game-score>
      </div>
      <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
        <h4 style="margin: 0 0 1rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
          Bob
        </h4>
        <x-game-score score="28" increment="8"></x-game-score>
      </div>
      <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
        <h4 style="margin: 0 0 1rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
          Carol
        </h4>
        <x-game-score score="31" increment="-4"></x-game-score>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "Comparison of scores across multiple players in a game context.",
      },
    },
  },
};
