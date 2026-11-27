import { describe, it, expect, beforeEach } from "vitest";
import type { Player, PlayerAssociation, PlayerTemplate } from "@/utils";
import { PlayerStorageService } from "@/services/playerStorage.js";
import { PlayerAssociationStorageService } from "@/services/playerAssociationStorage.js";
import { PlayerTemplateStorageService } from "@/services/playerTemplateStorage.js";
import { MemoryStorageAdapter } from "@/services/test-utils/memory-storage-adapter.js";

describe("PlayerStorageService", () => {
  beforeEach(() => {
    PlayerStorageService.initialize(new MemoryStorageAdapter<Player>());
    PlayerAssociationStorageService.initialize(new MemoryStorageAdapter<PlayerAssociation>());
    PlayerTemplateStorageService.initialize(new MemoryStorageAdapter<PlayerTemplate>());
  });

  it("creates a player with firstName and lastName", async () => {
    const player = await PlayerStorageService.getInstance().createPlayer({
      firstName: "Ada",
      lastName: "Lovelace",
    });

    expect(player).not.toBeNull();
    expect(player?.firstName).toBe("Ada");
    expect(player?.lastName).toBe("Lovelace");
    expect(player?.id).toBeTruthy();
    expect(player?.createdAt).toBeInstanceOf(Date);
    expect(player?.updatedAt).toBeInstanceOf(Date);
  });

  it.each([
    { firstName: "", lastName: "Lovelace" },
    { firstName: "Ada", lastName: "" },
    { firstName: "   ", lastName: "Lovelace" },
    { firstName: "Ada", lastName: "   " },
  ])("rejects creating a player with a blank name: %o", async (options) => {
    const service = PlayerStorageService.getInstance();

    const player = await service.createPlayer(options);

    expect(player).toBeNull();
    expect(await service.getAllPlayers()).toHaveLength(0);
  });

  it.each([{ firstName: "" }, { lastName: "  " }])(
    "rejects updating a player to a blank name: %o",
    async (options) => {
      const service = PlayerStorageService.getInstance();
      const player = await service.createPlayer({ firstName: "Ada", lastName: "Lovelace" });

      const updated = await service.updatePlayer(player!.id, options);

      expect(updated).toBeNull();
      const stored = await service.getPlayer(player!.id);
      expect(stored?.firstName).toBe("Ada");
      expect(stored?.lastName).toBe("Lovelace");
    }
  );

  it("blocks deletion while referenced by an association", async () => {
    const playerService = PlayerStorageService.getInstance();
    const associationService = PlayerAssociationStorageService.getInstance();

    const player = await playerService.createPlayer({ firstName: "Grace", lastName: "Hopper" });
    expect(player).not.toBeNull();

    const association = await associationService.createAssociation({
      gameId: "game-1",
      playerId: player!.id,
      turnOrder: 0,
    });
    expect(association).not.toBeNull();

    const deleted = await playerService.deletePlayer(player!.id);
    expect(deleted).toBe(false);

    const stillExists = await playerService.getPlayer(player!.id);
    expect(stillExists).not.toBeNull();
  });

  it("blocks deletion while referenced by a player template", async () => {
    const playerService = PlayerStorageService.getInstance();
    const templateService = PlayerTemplateStorageService.getInstance();

    const player = await playerService.createPlayer({ firstName: "Alan", lastName: "Turing" });
    expect(player).not.toBeNull();

    const template = await templateService.createTemplate({
      templateName: "Cribbage Night",
      playerIds: [player!.id],
      targetScore: 121,
      timeLimit: null,
      timerBehavior: null,
      turnTrackingEnabled: true,
    });
    expect(template).not.toBeNull();

    const deleted = await playerService.deletePlayer(player!.id);
    expect(deleted).toBe(false);
  });

  it("succeeds once the player is unreferenced", async () => {
    const playerService = PlayerStorageService.getInstance();
    const associationService = PlayerAssociationStorageService.getInstance();

    const player = await playerService.createPlayer({ firstName: "Margaret", lastName: "Hamilton" });
    expect(player).not.toBeNull();

    const association = await associationService.createAssociation({
      gameId: "game-1",
      playerId: player!.id,
      turnOrder: 0,
    });
    expect(association).not.toBeNull();

    await associationService.removeAssociation(association!.id);

    const deleted = await playerService.deletePlayer(player!.id);
    expect(deleted).toBe(true);

    const gone = await playerService.getPlayer(player!.id);
    expect(gone).toBeNull();
  });
});
