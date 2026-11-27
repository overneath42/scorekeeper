import { describe, it, expect, beforeEach } from "vitest";
import type { PlayerTemplate } from "@/utils";
import { PlayerTemplateStorageService } from "@/services/playerTemplateStorage.js";
import { MemoryStorageAdapter } from "@/services/test-utils/memory-storage-adapter.js";

describe("PlayerTemplateStorageService", () => {
  beforeEach(() => {
    PlayerTemplateStorageService.initialize(new MemoryStorageAdapter<PlayerTemplate>());
  });

  it("rejects an empty playerIds list", async () => {
    const service = PlayerTemplateStorageService.getInstance();

    const template = await service.createTemplate({
      templateName: "Empty Template",
      playerIds: [],
      targetScore: null,
      timeLimit: null,
      timerBehavior: null,
      turnTrackingEnabled: false,
    });

    expect(template).toBeNull();
  });

  it("rejects a duplicate template name (case-insensitive)", async () => {
    const service = PlayerTemplateStorageService.getInstance();

    const first = await service.createTemplate({
      templateName: "Game Night",
      playerIds: ["player-1"],
      targetScore: null,
      timeLimit: null,
      timerBehavior: null,
      turnTrackingEnabled: false,
    });
    expect(first).not.toBeNull();

    const duplicate = await service.createTemplate({
      templateName: "game night",
      playerIds: ["player-2"],
      targetScore: null,
      timeLimit: null,
      timerBehavior: null,
      turnTrackingEnabled: false,
    });
    expect(duplicate).toBeNull();
  });

  it("rejects a duplicate template name that differs only by surrounding whitespace", async () => {
    const service = PlayerTemplateStorageService.getInstance();

    const first = await service.createTemplate({
      templateName: "Game Night ",
      playerIds: ["player-1"],
      targetScore: null,
      timeLimit: null,
      timerBehavior: null,
      turnTrackingEnabled: false,
    });
    expect(first).not.toBeNull();

    expect(await service.hasTemplateName("Game Night")).toBe(true);
  });

  it("re-indexes playerIds contiguously after removePlayerFromTemplate", async () => {
    const service = PlayerTemplateStorageService.getInstance();

    const template = await service.createTemplate({
      templateName: "Poker Night",
      playerIds: ["player-1", "player-2", "player-3"],
      targetScore: null,
      timeLimit: null,
      timerBehavior: null,
      turnTrackingEnabled: true,
    });
    expect(template).not.toBeNull();

    const updated = await service.removePlayerFromTemplate(template!.id, "player-2");
    expect(updated).not.toBeNull();
    expect(updated?.playerIds).toEqual(["player-1", "player-3"]);
  });
});
