import { LocalStorageAdapter, StorageAdapter, type GameTemplate } from "@/utils";

export interface CreateTemplateOptions {
  templateName: string;
  players: string[];
  targetScore: number | null;
  timeLimit: number | null;
  timerBehavior: 'no-winner' | 'highest-score' | null;
  turnTrackingEnabled: boolean;
}

export class TemplateStorageService {
  private storage: StorageAdapter<GameTemplate>;
  private static instance: TemplateStorageService;

  private constructor(storage?: StorageAdapter<GameTemplate>) {
    this.storage = storage ?? new LocalStorageAdapter<GameTemplate>("scorekeeper-templates");
  }

  static initialize(storage: StorageAdapter<GameTemplate>): void {
    TemplateStorageService.instance = new TemplateStorageService(storage);
  }

  static getInstance(): TemplateStorageService {
    if (!TemplateStorageService.instance) {
      TemplateStorageService.instance = new TemplateStorageService();
    }
    return TemplateStorageService.instance;
  }

  async createTemplate(options: CreateTemplateOptions): Promise<GameTemplate | null> {
    const template: GameTemplate = {
      id: crypto.randomUUID(),
      templateName: options.templateName,
      players: options.players,
      targetScore: options.targetScore,
      timeLimit: options.timeLimit,
      timerBehavior: options.timerBehavior,
      turnTrackingEnabled: options.turnTrackingEnabled,
      createdAt: new Date(),
    };

    const success = await this.storage.set(template.id, template);
    return success ? template : null;
  }

  async getTemplate(id: string): Promise<GameTemplate | null> {
    const template = await this.storage.get(id);
    if (!template) return null;
    return {
      ...template,
      createdAt: new Date(template.createdAt),
    };
  }

  async getAllTemplates(): Promise<GameTemplate[]> {
    const ids = await this.storage.keys();
    const templates = await Promise.all(ids.map(id => this.getTemplate(id)));
    return templates
      .filter((t): t is GameTemplate => t !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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
      (t) => t.templateName.toLowerCase() === normalized
    );
  }
}
