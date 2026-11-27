import { describe, it, expect, beforeEach } from "vitest";
import type { PlayerAssociation } from "@/utils";
import { PlayerAssociationStorageService } from "@/services/playerAssociationStorage.js";
import { MemoryStorageAdapter } from "@/services/test-utils/memory-storage-adapter.js";

describe("PlayerAssociationStorageService", () => {
  beforeEach(() => {
    PlayerAssociationStorageService.initialize(new MemoryStorageAdapter<PlayerAssociation>());
  });

  it("rejects a duplicate turnOrder within the same game", async () => {
    const service = PlayerAssociationStorageService.getInstance();

    const first = await service.createAssociation({ gameId: "game-1", playerId: "player-1", turnOrder: 0 });
    expect(first).not.toBeNull();

    const duplicate = await service.createAssociation({ gameId: "game-1", playerId: "player-2", turnOrder: 0 });
    expect(duplicate).toBeNull();
  });

  it("rejects a player already associated with the same game", async () => {
    const service = PlayerAssociationStorageService.getInstance();

    const first = await service.createAssociation({ gameId: "game-1", playerId: "player-1", turnOrder: 0 });
    expect(first).not.toBeNull();

    const duplicate = await service.createAssociation({ gameId: "game-1", playerId: "player-1", turnOrder: 1 });
    expect(duplicate).toBeNull();
  });

  it("renumbers remaining associations contiguously after removal", async () => {
    const service = PlayerAssociationStorageService.getInstance();

    const a = await service.createAssociation({ gameId: "game-1", playerId: "player-1", turnOrder: 0 });
    const b = await service.createAssociation({ gameId: "game-1", playerId: "player-2", turnOrder: 1 });
    const c = await service.createAssociation({ gameId: "game-1", playerId: "player-3", turnOrder: 2 });

    expect(a && b && c).toBeTruthy();

    const removed = await service.removeAssociation(a!.id);
    expect(removed).toBe(true);

    const remaining = await service.getAssociationsForGame("game-1");
    expect(remaining.map(r => r.playerId)).toEqual(["player-2", "player-3"]);
    expect(remaining.map(r => r.turnOrder)).toEqual([0, 1]);
  });
});
