import { parseTimeLimit } from "./time.js";
import type { GameTemplate } from "../types/index.js";

export function formatTemplateSummary(template: GameTemplate): string {
  const parts: string[] = [];

  if (template.targetScore !== null) {
    parts.push(`Target Score: ${template.targetScore}`);
  }

  if (template.timeLimit !== null && template.timeLimit > 0) {
    const { hours, minutes } = parseTimeLimit(template.timeLimit);
    const timeParts: string[] = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    const behavior = template.timerBehavior === "highest-score"
      ? "highest score wins"
      : "no winner";
    parts.push(`Timed Game: ${timeParts.join(" ")}, ${behavior}`);
  }

  if (template.players.length > 0) {
    const maxDisplay = 3;
    const displayed = template.players.slice(0, maxDisplay);
    const remaining = template.players.length - maxDisplay;
    let playerStr = `${template.players.length} Player${template.players.length !== 1 ? "s" : ""}: ${displayed.join(", ")}`;
    if (remaining > 0) {
      playerStr += ` + ${remaining} more`;
    }
    parts.push(playerStr);
  }

  return parts.join(" \u2022 ");
}
