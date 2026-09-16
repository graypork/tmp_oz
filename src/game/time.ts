export const TIMER_STEP_SECONDS = 30;
export const MIN_TIMER_SECONDS = 30;
export const MAX_TIMER_SECONDS = 600;

export function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function clampTimerSeconds(seconds: number): number {
  return Math.min(MAX_TIMER_SECONDS, Math.max(MIN_TIMER_SECONDS, Math.round(seconds)));
}

export function adjustTimerSeconds(seconds: number, deltaSeconds: number): number {
  return clampTimerSeconds(seconds + deltaSeconds);
}

export function isCountdownWarningSecond(seconds: number): boolean {
  return Number.isInteger(seconds) && seconds >= 1 && seconds <= 10;
}
