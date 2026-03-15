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

  private constructor() {
    this.storage = new LocalStorageAdapter<GameTemplate>("scorekeeper-templates");
  }

  static getInstance(): TemplateStorageService {
    if (!TemplateStorageService.instance) {
      TemplateStorageService.instance = new TemplateStorageService();
    }
    return TemplateStorageService.instance;
  }

  createTemplate(options: CreateTemplateOptions): GameTemplate | null {
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

    const success = this.storage.set(template.id, template);
    return success ? template : null;
  }

  getTemplate(id: string): GameTemplate | null {
    const template = this.storage.get(id);
    if (!template) return null;
    return {
      ...template,
      createdAt: new Date(template.createdAt),
    };
  }

  getAllTemplates(): GameTemplate[] {
    return this.storage.keys()
      .map((id) => this.getTemplate(id))
      .filter((t): t is GameTemplate => t !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  deleteTemplate(id: string): boolean {
    return this.storage.remove(id);
  }

  hasTemplateName(name: string): boolean {
    const normalized = name.trim().toLowerCase();
    return this.getAllTemplates().some(
      (t) => t.templateName.toLowerCase() === normalized
    );
  }
}
