import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "@/stories/mock/game-provider.js";
import { MockGameProvider } from "@/stories/mock/game-provider.js";
import "@/components/game/elements/header.js";

const meta: Meta = {
  title: "Game/Elements/Header",
  component: "x-game-header",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Game header component displaying game name, creation date, and navigation controls.",
      },
    },
  },
  argTypes: {
    backUrl: {
      control: "text",
      description: "URL for the back navigation button",
      defaultValue: "/",
    },
    gameName: {
      control: "text",
      description: "Name of the game (updates the mock provider)",
      defaultValue: "Friday Night Poker",
    },
    createdAt: {
      control: "date",
      description: "Game creation date (updates the mock provider)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    backUrl: "/",
    gameName: "Friday Night Poker",
    createdAt: new Date("2024-03-15T14:30:00Z").getTime(),
  },
  render: (args) => {
    // Update provider whenever story re-renders (when controls change)
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          createdAt: args.createdAt ? new Date(args.createdAt) : new Date("2024-03-15T14:30:00Z"),
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <x-game-header back-url="${args.backUrl}"></x-game-header>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Default game header with game name, start date, and navigation buttons.",
      },
    },
  },
};

export const CustomBackUrl: Story = {
  args: {
    backUrl: "/dashboard",
    gameName: "Weekly Tournament",
    createdAt: new Date("2024-03-10T10:00:00Z").getTime(),
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          createdAt: args.createdAt ? new Date(args.createdAt) : new Date(),
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <x-game-header back-url="${args.backUrl}"></x-game-header>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Header with custom back URL pointing to dashboard.",
      },
    },
  },
};

export const LongGameName: Story = {
  args: {
    backUrl: "/",
    gameName: "Super Awesome Friday Night Championship Tournament Game with Extra Long Name",
    createdAt: new Date("2024-03-15T14:30:00Z").getTime(),
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName,
          createdAt: args.createdAt ? new Date(args.createdAt) : new Date(),
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <x-game-header back-url="${args.backUrl}"></x-game-header>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Header with very long game name to test text wrapping and layout.",
      },
    },
  },
};

export const NoStartDate: Story = {
  args: {
    backUrl: "/games",
    gameName: "Quick Game",
    createdAt: null,
  },
  render: (args) => {
    setTimeout(() => {
      const provider = document.querySelector("mock-game-provider") as MockGameProvider;
      if (provider) {
        provider.updateGame({
          name: args.gameName || "Quick Game",
          createdAt: undefined,
        });
      }
    }, 0);

    return html`
      <mock-game-provider>
        <x-game-header back-url="${args.backUrl}"></x-game-header>
      </mock-game-provider>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: "Header for a game without a creation date (edge case handling).",
      },
    },
  },
};

export const WithoutGameContext: Story = {
  args: {
    backUrl: "/games",
  },
  decorators: [],
  parameters: {
    docs: {
      description: {
        story: 'Header without game context showing fallback behavior (displays "Untitled Game").',
      },
    },
  },
};
