import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { MockGameProvider } from "@/stories/mock/game-provider.js";
import "@/stories/mock/game-provider.js";
import "@/components/game/elements/player-name.js";

const meta: Meta = {
  title: "Game/Elements/PlayerName",
  component: "x-game-player-name",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Simple player name component that displays a player's name from the game context based on player index.",
      },
    },
  },
  argTypes: {
    playerIndex: {
      control: { type: "range", min: 0, max: 5, step: 1 },
      description: "Index of the player whose name to display",
      defaultValue: 0,
    },
    playerNames: {
      control: "object",
      description: "Array of player names (updates the mock provider)",
      defaultValue: ["Alice", "Bob", "Carol", "David"],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    playerIndex: 0,
    playerNames: ["Alice", "Bob", "Carol", "David"],
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = args.playerNames.map((name: string, index: number) => ({
          index,
          name,
        }));

        provider.updateGame({
          players,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb;">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6b7280;">
            Player ${args.playerIndex}:
          </p>
          <span style="font-size: 1.25rem; font-weight: 600; color: #374151;">
            <x-game-player-name player-index="${args.playerIndex}"></x-game-player-name>
          </span>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Default player name display with interactive player index control.",
      },
    },
  },
};

export const AllPlayers: Story = {
  args: {
    playerNames: ["Alice", "Bob", "Carol", "David", "Eve"],
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = args.playerNames.map((name: string, index: number) => ({
          index,
          name,
        }));

        provider.updateGame({
          players,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          ${args.playerNames.map(
            (_: string, index: number) => html`
              <div
                style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: white; text-align: center;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.75rem; color: #6b7280;">
                  Player ${index + 1}
                </p>
                <span style="font-size: 1rem; font-weight: 600; color: #374151;">
                  <x-game-player-name player-index="${index}"></x-game-player-name>
                </span>
              </div>
            `
          )}
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Display all players in a grid layout showing each player name component.",
      },
    },
  },
};

export const WithoutGameContext: Story = {
  args: {
    playerIndex: 0,
  },
  render: (args) => html`
    <div
      style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #fef3cd;">
      <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #92400e;">
        <strong>No Game Context:</strong> Falls back to default naming
      </p>
      <span style="font-size: 1.25rem; font-weight: 600; color: #374151;">
        <x-game-player-name player-index="${args.playerIndex}"></x-game-player-name>
      </span>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Player name component without game context showing fallback behavior ("Player N").',
      },
    },
  },
};

export const InvalidPlayerIndex: Story = {
  args: {
    playerIndex: 10,
    playerNames: ["Alice", "Bob"],
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = args.playerNames.map((name: string, index: number) => ({
          index,
          name,
        }));

        provider.updateGame({
          players,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #fef2f2;">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #dc2626;">
            <strong>Invalid Index:</strong> Player index ${args.playerIndex} not found (only 2
            players exist)
          </p>
          <span style="font-size: 1.25rem; font-weight: 600; color: #374151;">
            <x-game-player-name player-index="${args.playerIndex}"></x-game-player-name>
          </span>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Player name component with invalid player index showing graceful fallback.",
      },
    },
  },
};

export const CustomPlayerNames: Story = {
  args: {
    playerIndex: 0,
    playerNames: ["🎯 Ace", "🎲 Lucky", "🃏 Joker", "🏆 Champion"],
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = args.playerNames.map((name: string, index: number) => ({
          index,
          name,
        }));

        provider.updateGame({
          players,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          ${args.playerNames.map(
            (name: string, index: number) => html`
              <div
                style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); text-align: center; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);">
                <span style="font-size: 1.25rem; font-weight: 600; color: #374151;">
                  <x-game-player-name player-index="${index}"></x-game-player-name>
                </span>
              </div>
            `
          )}
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Player names with emojis and special characters showing flexibility.",
      },
    },
  },
};

export const InScoreboardContext: Story = {
  args: {
    playerNames: ["Alice", "Bob", "Carol"],
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = args.playerNames.map((name: string, index: number) => ({
          index,
          name,
        }));

        provider.updateGame({
          players,
          scoringHistory: [
            [0, 25],
            [1, 30],
            [2, 18],
            [0, 15],
            [1, -5],
            [2, 22],
          ],
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div
          style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <div style="background: #f9fafb; padding: 1rem; border-bottom: 1px solid #e5e7eb;">
            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151;">
              Game Scoreboard
            </h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr);">
            ${args.playerNames.map(
              (_: string, index: number) => html`
                <div
                  style="padding: 1.5rem; text-align: center; ${index < args.playerNames.length - 1
                    ? "border-right: 1px solid #e5e7eb;"
                    : ""}">
                  <div
                    style="font-size: 1rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                    <x-game-player-name player-index="${index}"></x-game-player-name>
                  </div>
                  <div
                    style="font-size: 1.75rem; font-weight: bold; color: ${index === 0
                      ? "#059669"
                      : index === 1
                      ? "#dc2626"
                      : "#7c3aed"};">
                    ${index === 0 ? "40" : index === 1 ? "25" : "40"} pts
                  </div>
                  <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                    Last: ${index === 0 ? "+15" : index === 1 ? "-5" : "+22"}
                  </div>
                </div>
              `
            )}
          </div>
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Player name components used in a realistic scoreboard layout context.",
      },
    },
  },
};

export const LongPlayerNames: Story = {
  args: {
    playerIndex: 0,
    playerNames: ["Alexander The Great Conqueror", "Bob", "Catherine The Magnificent Player", "D"],
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        const players = args.playerNames.map((name: string, index: number) => ({
          index,
          name,
        }));

        provider.updateGame({
          players,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          ${args.playerNames.map(
            (name: string, index: number) => html`
              <div
                style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: white; min-height: 80px; display: flex; align-items: center; justify-content: center; text-align: center;">
                <div>
                  <p style="margin: 0 0 0.25rem 0; font-size: 0.75rem; color: #6b7280;">
                    Player ${index + 1}
                  </p>
                  <span
                    style="font-size: 1rem; font-weight: 600; color: #374151; word-break: break-word; line-height: 1.2;">
                    <x-game-player-name player-index="${index}"></x-game-player-name>
                  </span>
                </div>
              </div>
            `
          )}
        </div>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Player names of varying lengths showing text wrapping and layout handling.",
      },
    },
  },
};
