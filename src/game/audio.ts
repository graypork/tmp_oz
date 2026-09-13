let audioContext: AudioContext | null = null;

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

export function playTimeUpSound(): void {
  const context = getAudioContext();
  if (!context) return;

  tone(context, 783.99, 0, 0.38, 0.12, 'triangle');
  tone(context, 659.25, 0.2, 0.42, 0.11, 'sine');
  tone(context, 523.25, 0.42, 0.62, 0.13, 'sine');
}
