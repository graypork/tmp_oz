let audioContext: AudioContext | null = null;

export const COUNTDOWN_BEEP_VOLUME = 0.15;
export const TIME_UP_BEEP_VOLUME = 0.1625;

const TIME_UP_GROUPS = 5;
const TIME_UP_BEEPS_PER_GROUP = 5;
const TIME_UP_BEEP_SPACING_SECONDS = 0.09;
const TIME_UP_GROUP_SPACING_SECONDS = 0.72;

export function createTimeUpBeepSchedule(): number[] {
  const schedule: number[] = [];

  for (let group = 0; group < TIME_UP_GROUPS; group += 1) {
    const groupStart = group * TIME_UP_GROUP_SPACING_SECONDS;
    for (let beep = 0; beep < TIME_UP_BEEPS_PER_GROUP; beep += 1) {
      schedule.push(groupStart + beep * TIME_UP_BEEP_SPACING_SECONDS);
    }
  }

  return schedule;
}

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

function tone(
  context: AudioContext,
  frequency: number,
  startsIn: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + startsIn;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

export function playCorrectSound(): void {
  const context = getAudioContext();
  if (!context) return;

  tone(context, 523.25, 0, 0.24, 0.11, 'sine');
  tone(context, 659.25, 0.115, 0.25, 0.115, 'sine');
  tone(context, 783.99, 0.23, 0.34, 0.13, 'triangle');
}

export function playCountdownBeep(): void {
  const context = getAudioContext();
  if (!context) return;

  tone(context, 880, 0, 0.1, COUNTDOWN_BEEP_VOLUME, 'square');
}

export function playTimeUpSound(): void {
  const context = getAudioContext();
  if (!context) return;

  for (const startsIn of createTimeUpBeepSchedule()) {
    tone(context, 988, startsIn, 0.065, TIME_UP_BEEP_VOLUME, 'square');
  }
}
