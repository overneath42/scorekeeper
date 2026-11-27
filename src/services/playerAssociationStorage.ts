import { LocalStorageAdapter, StorageAdapter, type PlayerAssociation } from "@/utils";

export interface CreateAssociationOptions {
  gameId: string;
  playerId: string;
  turnOrder: number;
}

export class PlayerAssociationStorageService {
  private storage: StorageAdapter<PlayerAssociation>;
  private static instance: PlayerAssociationStorageService;

  private constructor(storage?: StorageAdapter<PlayerAssociation>) {
    this.storage = storage ?? new LocalStorageAdapter<PlayerAssociation>("scorekeeper-player-associations");
  }

  static initialize(storage: StorageAdapter<PlayerAssociation>): void {
    PlayerAssociationStorageService.instance = new PlayerAssociationStorageService(storage);
  }

  static getInstance(): PlayerAssociationStorageService {
    if (!PlayerAssociationStorageService.instance) {
      PlayerAssociationStorageService.instance = new PlayerAssociationStorageService();
    }
    return PlayerAssociationStorageService.instance;
  }

  async createAssociation(options: CreateAssociationOptions): Promise<PlayerAssociation | null> {
    const existingForGame = await this.getAssociationsForGame(options.gameId);

    if (existingForGame.some(a => a.turnOrder === options.turnOrder)) return null;
    if (existingForGame.some(a => a.playerId === options.playerId)) return null;

    const association: PlayerAssociation = {
      id: crypto.randomUUID(),
      gameId: options.gameId,
      playerId: options.playerId,
      turnOrder: options.turnOrder,
    };

    const success = await this.storage.set(association.id, association);
    return success ? association : null;
  }

  async getAssociation(id: string): Promise<PlayerAssociation | null> {
    return this.storage.get(id);
  }

  async getAllAssociations(): Promise<PlayerAssociation[]> {
    const ids = await this.storage.keys();
    const associations = await Promise.all(ids.map(id => this.storage.get(id)));
    return associations.filter((a): a is PlayerAssociation => a !== null);
  }

  async getAssociationsForGame(gameId: string): Promise<PlayerAssociation[]> {
    const all = await this.getAllAssociations();
    return all
      .filter(a => a.gameId === gameId)
      .sort((a, b) => a.turnOrder - b.turnOrder);
  }

  async getAssociationsForPlayer(playerId: string): Promise<PlayerAssociation[]> {
    const all = await this.getAllAssociations();
    return all.filter(a => a.playerId === playerId);
  }

  async removeAssociation(id: string): Promise<boolean> {
    const association = await this.getAssociation(id);
    if (!association) return false;

    const success = await this.storage.remove(id);
    if (!success) return false;

    const remaining = await this.getAssociationsForGame(association.gameId);
    await Promise.all(
      remaining.map((a, index) =>
        a.turnOrder === index ? Promise.resolve(true) : this.storage.set(a.id, { ...a, turnOrder: index })
      )
    );

    return true;
  }

  async clearAll(): Promise<boolean> {
    return this.storage.clear();
  }
}
