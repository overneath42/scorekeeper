export interface PlayerTemplate {
  id: string;
  templateName: string;
  defaultName?: string;
  playerIds: string[];
  targetScore: number | null;
  timeLimit: number | null;
  timerBehavior: 'no-winner' | 'highest-score' | null;
  turnTrackingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
