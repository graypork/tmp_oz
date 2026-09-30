export const TIMER_MUSIC_PATH = '/audio/timer-music.mp3';
export const TIMER_MUSIC_NORMAL_VOLUME = 0.42;
export const TIMER_MUSIC_DIMMED_VOLUME = 0.16;

export function shouldLoopTimerMusic(timerSeconds: number, trackDurationSeconds: number): boolean {
  return timerSeconds > trackDurationSeconds;
}

export function getTimerMusicVolume(remainingSeconds: number): number {
  if (remainingSeconds <= 0) return 0;
  if (remainingSeconds <= 10) return TIMER_MUSIC_DIMMED_VOLUME;
  return TIMER_MUSIC_NORMAL_VOLUME;
}
