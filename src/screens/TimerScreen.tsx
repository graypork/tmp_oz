import { useEffect, useRef, useState } from 'react';
import { playCountdownBeep, playTimeUpSound } from '../game/audio';
import {
  TIMER_MUSIC_NORMAL_VOLUME,
  TIMER_MUSIC_PATH,
  getTimerMusicVolume,
  shouldLoopTimerMusic,
} from '../game/timerMusic';
import {
  MAX_TIMER_SECONDS,
  MIN_TIMER_SECONDS,
  TIMER_STEP_SECONDS,
  adjustTimerSeconds,
  formatSeconds,
  isCountdownWarningSecond,
} from '../game/time';

type Props = {
  seconds: number;
  defaultSeconds: number;
  onSecondsChange: (seconds: number) => void;
  onBack: () => void;
};

export function TimerScreen({ seconds, defaultSeconds, onSecondsChange, onBack }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState<'ready' | 'running' | 'finished'>('ready');
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);
  const lastWarningSecondRef = useRef<number | null>(null);
  const timerMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (phase === 'ready') setRemaining(seconds);
  }, [seconds, phase]);


  function getTimerMusic(): HTMLAudioElement {
    if (!timerMusicRef.current) {
      const audio = new Audio(TIMER_MUSIC_PATH);
      audio.preload = 'auto';
      audio.volume = TIMER_MUSIC_NORMAL_VOLUME;
      timerMusicRef.current = audio;
    }
    return timerMusicRef.current;
  }

  function stopTimerMusic() {
    const audio = timerMusicRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = TIMER_MUSIC_NORMAL_VOLUME;
  }

  function startTimerMusic(selectedSeconds: number) {
    const audio = getTimerMusic();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = TIMER_MUSIC_NORMAL_VOLUME;

    const updateLoopMode = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.loop = shouldLoopTimerMusic(selectedSeconds, audio.duration);
      }
    };

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      updateLoopMode();
    } else {
      audio.loop = true;
      audio.onloadedmetadata = updateLoopMode;
    }

    void audio.play().catch(() => {
      // Browser audio permission failures should not block the timer itself.
    });
  }

  useEffect(() => {
    if (phase === 'running' && timerMusicRef.current) {
      timerMusicRef.current.volume = getTimerMusicVolume(remaining);
    }
  }, [phase, remaining]);

  useEffect(() => () => stopTimerMusic(), []);

  function finishTimer() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopTimerMusic();
    setRemaining(0);
    setPhase('finished');
    playTimeUpSound();
  }

  useEffect(() => {
    if (phase !== 'running') return;

    const tick = () => {
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(next);

      if (isCountdownWarningSecond(next) && lastWarningSecondRef.current !== next) {
        lastWarningSecondRef.current = next;
        playCountdownBeep();
      }

      if (next === 0) finishTimer();
    };

    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [phase]);

  function startTimer() {
    finishedRef.current = false;
    lastWarningSecondRef.current = null;
    setRemaining(seconds);
    endAtRef.current = Date.now() + seconds * 1000;
    startTimerMusic(seconds);
    setPhase('running');
  }

  function resetTimer() {
    finishedRef.current = false;
    lastWarningSecondRef.current = null;
    stopTimerMusic();
    setRemaining(seconds);
    setPhase('ready');
  }

  function handleBack() {
    stopTimerMusic();
    onBack();
  }

  function adjust(delta: number) {
    onSecondsChange(adjustTimerSeconds(seconds, delta));
  }

  function resetToDefault() {
    onSecondsChange(defaultSeconds);
  }

  return (
    <main className="timer-screen">
      <button className="secondary-button timer-back" onClick={handleBack}>← 이전으로</button>

      {phase === 'ready' && (
        <>
          <div className="timer-kicker">다음 활동</div>
          <h1>명화 속 우리 아이 찾기</h1>
          <p>시간을 정한 뒤, 아이들과 준비가 되면 시작해주세요.</p>
          <div className="timer-number">{formatSeconds(seconds)}</div>

          <div className="timer-adjust-controls" aria-label="타이머 시간 조절">
            <button
              className="secondary-button timer-adjust-button"
              onClick={() => adjust(-TIMER_STEP_SECONDS)}
              disabled={seconds <= MIN_TIMER_SECONDS}
            >
              −30초
            </button>
            <button
              className="secondary-button timer-adjust-button"
              onClick={() => adjust(TIMER_STEP_SECONDS)}
              disabled={seconds >= MAX_TIMER_SECONDS}
            >
              +30초
            </button>
          </div>

          <button className="timer-reset-default" onClick={resetToDefault} disabled={seconds === defaultSeconds}>
            3분으로 초기화
          </button>

          <button className="primary-button timer-button" onClick={startTimer}>타이머 시작</button>
        </>
      )}

      {phase === 'running' && (
        <>
          <div className="timer-kicker">명화 속 우리 아이를 찾아보세요!</div>
          <div className="timer-number running">{formatSeconds(remaining)}</div>
          <div className="timer-controls">
            <button className="danger-button" onClick={finishTimer}>시간 종료</button>
            <button className="secondary-button" onClick={resetTimer}>타이머 다시 준비</button>
          </div>
        </>
      )}

      {phase === 'finished' && (
        <>
          <div className="timer-finish-icon">✓</div>
          <h1>시간이 끝났어요!</h1>
          <div className="timer-number finished">0:00</div>
          <button className="primary-button" onClick={resetTimer}>같은 시간으로 다시 준비</button>
        </>
      )}
    </main>
  );
}
