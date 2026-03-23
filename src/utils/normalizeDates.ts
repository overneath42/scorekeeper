import type { StoredGame } from "@/services/gameStorage.js";

export function normalizeDates(game: StoredGame): StoredGame {
  return {
    ...game,
    createdAt: new Date(game.createdAt),
    updatedAt: new Date(game.updatedAt),
    lastActiveAt: game.lastActiveAt ? new Date(game.lastActiveAt) : null,
  };
}
