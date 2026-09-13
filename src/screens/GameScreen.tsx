import { useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { GameConfig } from '../types';
import type { Point } from '../game/geometry';
import { clampPoint, clientToNormalized } from '../game/coordinates';
import { resolvePointer, shouldConfirmAdvance } from '../game/gameLogic';
import { playCorrectSound } from '../game/audio';
import { MarkerOverlay } from '../components/MarkerOverlay';
import { PaintingPane } from '../components/PaintingPane';

type WrongMarker = { id: number; point: Point };

type Props = {
  config: GameConfig;
  roundIndex: number;
  foundIds: ReadonlySet<string>;
  onFound: (answerId: string) => void;
  onAdvance: () => void;
  onBack: () => void;
};

export function GameScreen({ config, roundIndex, foundIds, onFound, onAdvance, onBack }: Props) {
  const [wrongMarkers, setWrongMarkers] = useState<WrongMarker[]>([]);
  const wrongId = useRef(0);

  const round = config.rounds[roundIndex];
  const totalAnswers = round.answers.length;
  const roundComplete = totalAnswers > 0 && foundIds.size === totalAnswers;
  const progressDots = useMemo(
    () => Array.from({ length: totalAnswers }, (_, index) => index < foundIds.size),
    [foundIds.size, totalAnswers],
  );

  function handleLeftPointer(event: PointerEvent<HTMLDivElement>) {
    if (roundComplete) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const point = clampPoint(clientToNormalized(event.clientX, event.clientY, rect));
    const resolution = resolvePointer(point, round.answers, new Set(foundIds));

    if (resolution.kind === 'already-found') return;

    if (resolution.kind === 'new-correct') {
      playCorrectSound();
      onFound(resolution.answer.id);
      return;
    }

    const id = ++wrongId.current;
    setWrongMarkers((current) => [...current, { id, point }]);
    window.setTimeout(() => {
      setWrongMarkers((current) => current.filter((marker) => marker.id !== id));
    }, 760);
  }

  function requestAdvance() {
    if (shouldConfirmAdvance(foundIds.size, totalAnswers)) {
      const confirmed = window.confirm('아직 다 찾지 못했어요. 다음으로 넘어갈까요?');
      if (!confirmed) return;
    }
    onAdvance();
  }

  const nextLabel = roundIndex === config.rounds.length - 1 ? '다음 활동으로 넘어가기' : '다음 명화로 넘어가기';

  return (
    <main className="screen game-screen">
      <div className="screen-nav">
        <button className="secondary-button back-button" onClick={onBack}>← 이전으로</button>
      </div>

      <header className="game-header">
        <div>
          <div className="eyebrow">틀린 그림 찾기 · {roundIndex + 1}/{config.rounds.length}</div>
          <h1>두 그림에서 달라진 곳을 찾아보세요!</h1>
        </div>
        <div className="progress" aria-label={`${foundIds.size}개 찾음, 전체 ${totalAnswers}개`}>
          {progressDots.map((found, index) => (
            <span key={index} className={`progress-dot ${found ? 'found' : ''}`}>{found ? '✓' : index + 1}</span>
          ))}
        </div>
      </header>

      <div className="paintings-grid">
        <PaintingPane title="각색된 명화 · 여기를 터치해요" image={round.adaptedImage} interactive onPointerDown={handleLeftPointer}>
          <MarkerOverlay answers={round.answers} foundIds={new Set(foundIds)} side="left" wrongMarkers={wrongMarkers} />
        </PaintingPane>
        <PaintingPane title="원본 명화" image={round.originalImage}>
          <MarkerOverlay answers={round.answers} foundIds={new Set(foundIds)} side="right" wrongMarkers={wrongMarkers} />
        </PaintingPane>
      </div>

      {round.answers.length === 0 && (
        <div className="notice">이 라운드에는 아직 정답 영역이 설정되지 않았어요.</div>
      )}

      {!roundComplete && (
        <div className="game-advance">
          <button className="secondary-button" onClick={requestAdvance}>{nextLabel}</button>
        </div>
      )}

      {roundComplete && (
        <div className="completion-overlay" role="dialog" aria-modal="true" aria-labelledby="completion-title">
          <div className="completion-modal">
            <div className="completion-check">✓</div>
            <h2 id="completion-title">모두 찾았어요!</h2>
            <p>정답을 모두 찾았습니다. 다음으로 넘어가 주세요.</p>
            <div className="completion-actions">
              <button className="secondary-button" onClick={onBack}>← 이전으로</button>
              <button className="primary-button completion-next" onClick={onAdvance}>{nextLabel}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
