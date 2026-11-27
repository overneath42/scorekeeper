import { LocalStorageAdapter, StorageAdapter, type Player } from "@/utils";
import { PlayerAssociationStorageService } from "@/services/playerAssociationStorage.js";
import { PlayerTemplateStorageService } from "@/services/playerTemplateStorage.js";

export interface CreatePlayerOptions {
  firstName: string;
  lastName: string;
  displayName?: string;
}

export interface UpdatePlayerOptions {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export class PlayerStorageService {
  private storage: StorageAdapter<Player>;
  private static instance: PlayerStorageService;

  private constructor(storage?: StorageAdapter<Player>) {
    this.storage = storage ?? new LocalStorageAdapter<Player>("scorekeeper-players");
  }

  static initialize(storage: StorageAdapter<Player>): void {
    PlayerStorageService.instance = new PlayerStorageService(storage);
  }

  static getInstance(): PlayerStorageService {
    if (!PlayerStorageService.instance) {
      PlayerStorageService.instance = new PlayerStorageService();
    }
    return PlayerStorageService.instance;
  }

  async createPlayer(options: CreatePlayerOptions): Promise<Player | null> {
    if (isBlank(options.firstName) || isBlank(options.lastName)) return null;

    const now = new Date();
    const player: Player = {
      id: crypto.randomUUID(),
      firstName: options.firstName,
      lastName: options.lastName,
      displayName: options.displayName,
      createdAt: now,
      updatedAt: now,
    };

    const success = await this.storage.set(player.id, player);
    return success ? player : null;
  }

  async getPlayer(id: string): Promise<Player | null> {
    const player = await this.storage.get(id);
    if (!player) return null;
    return {
      ...player,
      createdAt: new Date(player.createdAt),
      updatedAt: new Date(player.updatedAt),
    };
  }

  async getAllPlayers(): Promise<Player[]> {
    const ids = await this.storage.keys();
    const players = await Promise.all(ids.map(id => this.getPlayer(id)));
    return players
      .filter((p): p is Player => p !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updatePlayer(id: string, options: UpdatePlayerOptions): Promise<Player | null> {
    if (options.firstName !== undefined && isBlank(options.firstName)) return null;
    if (options.lastName !== undefined && isBlank(options.lastName)) return null;

    const existing = await this.getPlayer(id);
    if (!existing) return null;

    const updated: Player = {
      ...existing,
      ...options,
      updatedAt: new Date(),
    };

    const success = await this.storage.set(id, updated);
    return success ? updated : null;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const associations = await PlayerAssociationStorageService.getInstance().getAssociationsForPlayer(id);
    if (associations.length > 0) return false;

    const templates = await PlayerTemplateStorageService.getInstance().getAllTemplates();
    if (templates.some(t => t.playerIds.includes(id))) return false;

    return this.storage.remove(id);
  }

  async clearAllPlayers(): Promise<boolean> {
    return this.storage.clear();
  }
}
