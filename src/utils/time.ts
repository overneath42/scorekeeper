export function parseTimeLimit(totalSeconds: number): { hours: number; minutes: number } {
  const totalMinutes = Math.floor(totalSeconds / 60);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}
