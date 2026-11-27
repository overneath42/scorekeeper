import { LocalStorageAdapter, StorageAdapter, type PlayerTemplate } from "@/utils";

export interface CreatePlayerTemplateOptions {
  templateName: string;
  defaultName?: string;
  playerIds: string[];
  targetScore: number | null;
  timeLimit: number | null;
  timerBehavior: 'no-winner' | 'highest-score' | null;
  turnTrackingEnabled: boolean;
}

export interface UpdatePlayerTemplateOptions {
  templateName?: string;
  defaultName?: string;
  playerIds?: string[];
  targetScore?: number | null;
  timeLimit?: number | null;
  timerBehavior?: 'no-winner' | 'highest-score' | null;
  turnTrackingEnabled?: boolean;
}

export class PlayerTemplateStorageService {
  private storage: StorageAdapter<PlayerTemplate>;
  private static instance: PlayerTemplateStorageService;

  private constructor(storage?: StorageAdapter<PlayerTemplate>) {
    this.storage = storage ?? new LocalStorageAdapter<PlayerTemplate>("scorekeeper-player-templates");
  }

  static initialize(storage: StorageAdapter<PlayerTemplate>): void {
    PlayerTemplateStorageService.instance = new PlayerTemplateStorageService(storage);
  }

  static getInstance(): PlayerTemplateStorageService {
    if (!PlayerTemplateStorageService.instance) {
      PlayerTemplateStorageService.instance = new PlayerTemplateStorageService();
    }
    return PlayerTemplateStorageService.instance;
  }

  async createTemplate(options: CreatePlayerTemplateOptions): Promise<PlayerTemplate | null> {
    if (options.playerIds.length === 0) return null;
    if (await this.hasTemplateName(options.templateName)) return null;

    const now = new Date();
    const template: PlayerTemplate = {
      id: crypto.randomUUID(),
      templateName: options.templateName,
      defaultName: options.defaultName,
      playerIds: options.playerIds,
      targetScore: options.targetScore,
      timeLimit: options.timeLimit,
      timerBehavior: options.timerBehavior,
      turnTrackingEnabled: options.turnTrackingEnabled,
      createdAt: now,
      updatedAt: now,
    };

    const success = await this.storage.set(template.id, template);
    return success ? template : null;
  }

  async getTemplate(id: string): Promise<PlayerTemplate | null> {
    const template = await this.storage.get(id);
    if (!template) return null;
    return {
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt),
    };
  }

  async getAllTemplates(): Promise<PlayerTemplate[]> {
    const ids = await this.storage.keys();
    const templates = await Promise.all(ids.map(id => this.getTemplate(id)));
    return templates
      .filter((t): t is PlayerTemplate => t !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updateTemplate(id: string, options: UpdatePlayerTemplateOptions): Promise<PlayerTemplate | null> {
    const existing = await this.getTemplate(id);
    if (!existing) return null;

    if (options.playerIds && options.playerIds.length === 0) return null;

    if (options.templateName && options.templateName.trim().toLowerCase() !== existing.templateName.trim().toLowerCase()) {
      if (await this.hasTemplateName(options.templateName)) return null;
    }

    const updated: PlayerTemplate = {
      ...existing,
      ...options,
      updatedAt: new Date(),
    };

    const success = await this.storage.set(id, updated);
    return success ? updated : null;
  }

  async removePlayerFromTemplate(templateId: string, playerId: string): Promise<PlayerTemplate | null> {
    const existing = await this.getTemplate(templateId);
    if (!existing) return null;

    const playerIds = existing.playerIds.filter(id => id !== playerId);

    const updated: PlayerTemplate = {
      ...existing,
      playerIds,
      updatedAt: new Date(),
    };

    const success = await this.storage.set(templateId, updated);
    return success ? updated : null;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.storage.remove(id);
  }

  async clearAllTemplates(): Promise<boolean> {
    return this.storage.clear();
  }

  async hasTemplateName(name: string): Promise<boolean> {
    const normalized = name.trim().toLowerCase();
    const templates = await this.getAllTemplates();
    return templates.some(
      (t) => t.templateName.trim().toLowerCase() === normalized
    );
  }
}
