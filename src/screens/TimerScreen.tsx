import { useEffect, useRef, useState } from 'react';
import { playTimeUpSound } from '../game/audio';
import { formatSeconds } from '../game/time';

type Props = {
  seconds: number;
  onBack: () => void;
};

export function TimerScreen({ seconds, onBack }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState<'ready' | 'running' | 'finished'>('ready');
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);

  function finishTimer() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setRemaining(0);
    setPhase('finished');
    playTimeUpSound();
  }

  useEffect(() => {
    if (phase !== 'running') return;

    const tick = () => {
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) finishTimer();
    };

    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [phase]);

  function startTimer() {
    finishedRef.current = false;
    setRemaining(seconds);
    endAtRef.current = Date.now() + seconds * 1000;
    setPhase('running');
  }

  function resetTimer() {
    finishedRef.current = false;
    setRemaining(seconds);
    setPhase('ready');
  }

  return (
    <main className="timer-screen">
      <button className="secondary-button timer-back" onClick={onBack}>← 이전으로</button>

      {phase === 'ready' && (
        <>
          <div className="timer-kicker">다음 활동</div>
          <h1>명화 속 우리 아이 찾기</h1>
          <p>아이들과 준비가 되면 버튼을 눌러주세요.</p>
          <div className="timer-number">{formatSeconds(seconds)}</div>
          <button className="primary-button timer-button" onClick={startTimer}>2분 시작</button>
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
          <button className="primary-button" onClick={resetTimer}>다시 2분 준비</button>
        </>
      )}
    </main>
  );
}
