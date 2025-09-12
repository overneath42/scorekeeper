import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { MockGameProvider } from "@/stories/mock/game-provider.js";
import "@/stories/mock/game-provider.js";
import "@/components/game/elements/score-form.js";
import "@/components/game/elements/score.js";

const meta: Meta = {
  title: "Game/Elements/ScoreForm",
  component: "x-game-score-form",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Interactive score form component that allows adding scores for players with quick-add buttons and player selection.",
      },
    },
  },
  argTypes: {
    gameName: {
      control: "text",
      description: "Name of the game (updates the mock provider)",
      defaultValue: "Score Form Demo",
    },
    playerCount: {
      control: { type: "range", min: 2, max: 6, step: 1 },
      description: "Number of players in the game",
      defaultValue: 3,
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    gameName: "Score Form Demo",
    playerCount: 3,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = Array.from({ length: args.playerCount }, (_, i) => ({
          index: i,
          name: ["Alice", "Bob", "Carol", "David", "Eve", "Frank"][i] || `Player ${i + 1}`,
        }));

        provider.updateGame({
          name: args.gameName,
          players,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="height: 400px; position: relative; border: 1px solid #e5e7eb; overflow: hidden;">
          <div style="padding: 1rem; height: calc(100% - 44px);">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; color: #374151;">
              ${args.gameName}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
              Click "Update Score" button below to open the score form.
            </p>
          </div>
          <x-game-score-form></x-game-score-form>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Default score form with player selection and score input fields.",
      },
    },
  },
};

export const TwoPlayers: Story = {
  args: {
    gameName: "Two Player Game",
    playerCount: 2,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          players: [
            { index: 0, name: "Player 1" },
            { index: 1, name: "Player 2" },
          ],
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="height: 400px; position: relative; border: 1px solid #e5e7eb; overflow: hidden;">
          <div style="padding: 1rem; height: calc(100% - 44px);">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; color: #374151;">
              ${args.gameName}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
              Minimal two-player setup for quick games.
            </p>
          </div>
          <x-game-score-form></x-game-score-form>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Score form with minimal two-player setup.",
      },
    },
  },
};

export const SixPlayers: Story = {
  args: {
    gameName: "Tournament Game",
    playerCount: 6,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          players: [
            { index: 0, name: "Alice" },
            { index: 1, name: "Bob" },
            { index: 2, name: "Carol" },
            { index: 3, name: "David" },
            { index: 4, name: "Eve" },
            { index: 5, name: "Frank" },
          ],
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="height: 450px; position: relative; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb;">
          <div style="padding: 1rem; height: calc(100% - 44px);">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; color: #374151;">
              ${args.gameName}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
              Maximum player count showing scrollable player list.
            </p>
          </div>
          <x-game-score-form></x-game-score-form>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Score form with maximum six players to test layout with many options.",
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    gameName: "Mobile Game",
    playerCount: 3,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          players: [
            { index: 0, name: "Alice" },
            { index: 1, name: "Bob" },
            { index: 2, name: "Carol" },
          ],
        });
      }
    }, 0);

    return html`
      <div style="width: 375px; margin: 0 auto; border: 1px solid #e5e7eb;">
        <mock-game-provider>
          <div style="height: 400px; position: relative; background: #f9fafb;">
            <div style="padding: 1rem; height: calc(100% - 44px);">
              <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #374151;">
                ${args.gameName}
              </h3>
              <p style="margin: 0; color: #6b7280; font-size: 0.75rem;">
                Mobile-optimized score form layout.
              </p>
            </div>
            <x-game-score-form></x-game-score-form>
          </div>
        </mock-game-provider>
      </div>
    `;
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Score form optimized for mobile devices showing responsive grid layout.",
      },
    },
  },
};

export const InGameContext: Story = {
  args: {
    gameName: "Active Game Session",
    playerCount: 4,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          players: [
            { index: 0, name: "Alice" },
            { index: 1, name: "Bob" },
            { index: 2, name: "Carol" },
            { index: 3, name: "David" },
          ],
          scoringHistory: [
            [0, 10],
            [1, 15],
            [0, 8],
            [2, 12],
            [1, -5],
            [3, 20],
          ],
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="height: 500px; position: relative; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb;">
          <!-- Mock game scores above form -->
          <div
            style="padding: 1rem; height: calc(100% - 44px); display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
            <div
              style="background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);">
              <h4
                style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                Alice
              </h4>
              <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #059669;">18 pts</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Last: +8</p>
            </div>
            <div
              style="background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);">
              <h4
                style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                Bob
              </h4>
              <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #dc2626;">10 pts</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Last: -5</p>
            </div>
            <div
              style="background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);">
              <h4
                style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                Carol
              </h4>
              <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #7c3aed;">12 pts</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Last: +12</p>
            </div>
            <div
              style="background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);">
              <h4
                style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">
                David
              </h4>
              <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #059669;">20 pts</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Last: +20</p>
            </div>
          </div>
          <x-game-score-form></x-game-score-form>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Score form shown in complete game context with existing player scores above.",
      },
    },
  },
};

export const FormInteractions: Story = {
  args: {
    gameName: "Interactive Demo",
    playerCount: 3,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          players: [
            { index: 0, name: "Alice" },
            { index: 1, name: "Bob" },
            { index: 2, name: "Carol" },
          ],
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="height: 400px; position: relative; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb;">
          <div style="padding: 1rem; height: calc(100% - 44px);">
            <div
              style="background: #fef3cd; border: 1px solid #f59e0b; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
              <p style="margin: 0; color: #92400e; font-size: 0.875rem;">
                <strong>Interactive Demo:</strong> Click "Update Score" → Select a player → Enter
                score or use +1/+10 buttons → Click "Add"
              </p>
            </div>
            <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; color: #374151;">
              ${args.gameName}
            </h3>
            <ul style="margin: 0; padding-left: 1rem; color: #6b7280; font-size: 0.875rem;">
              <li>Form slides up when activated</li>
              <li>Quick-add buttons increment current value</li>
              <li>Player selection highlights in blue</li>
              <li>Form validates player and score selection</li>
            </ul>
          </div>
          <x-game-score-form></x-game-score-form>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing all form features and behaviors.",
      },
    },
  },
};
