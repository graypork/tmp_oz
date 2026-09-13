import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { AnswerArea, GameConfig } from '../types';
import type { Point } from '../game/geometry';
import { polygonCentroid } from '../game/geometry';
import { clampPoint, clientToNormalized } from '../game/coordinates';
import { savePreviewConfig } from '../config/gameConfig';
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from './editorDraft';

type DragState =
  | { type: 'vertex'; answerId: string; vertexIndex: number }
  | { type: 'polygon'; answerId: string; start: Point; original: Point[] }
  | { type: 'right-marker'; answerId: string }
  | null;

type Props = { initialConfig: GameConfig };

function cloneConfig(config: GameConfig): GameConfig {
  return JSON.parse(JSON.stringify(config)) as GameConfig;
}

export function EditorScreen({ initialConfig }: Props) {
  const [config, setConfig] = useState<GameConfig>(() => loadEditorDraft(window.localStorage, cloneConfig(initialConfig)));
  const [roundIndex, setRoundIndex] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [message, setMessage] = useState('파란 영역은 실제 정답 판정 범위입니다.');
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const round = config.rounds[roundIndex];
  const selected = round.answers.find((answer) => answer.id === selectedId) ?? null;
  const jsonText = useMemo(() => JSON.stringify(config, null, 2), [config]);

  useEffect(() => {
    saveEditorDraft(window.localStorage, config);
  }, [config]);

  function updateRoundAnswers(updater: (answers: AnswerArea[]) => AnswerArea[]) {
    setConfig((current) => ({
      ...current,
      rounds: current.rounds.map((item, index) =>
        index === roundIndex ? { ...item, answers: updater(item.answers) } : item
      ),
    }));
  }

  function normalizedFromEvent(event: { clientX: number; clientY: number }, element: HTMLElement): Point {
    return clampPoint(clientToNormalized(event.clientX, event.clientY, element.getBoundingClientRect()));
  }

  function startAnswer() {
    setDrawing(true);
    setDrawingPoints([]);
    setSelectedId(null);
    setMessage('왼쪽 그림에서 정답 외곽을 따라 점을 3개 이상 찍으세요.');
  }

  function finishAnswer() {
    if (drawingPoints.length < 3) {
      setMessage('도형을 만들려면 점이 최소 3개 필요합니다.');
      return;
    }
    const center = polygonCentroid(drawingPoints);
    const id = `${round.id}-answer-${Date.now()}`;
    const answer: AnswerArea = {
      id,
      label: `정답 ${round.answers.length + 1}`,
      polygon: drawingPoints,
      leftMarker: center,
      rightMarker: center,
    };
    updateRoundAnswers((answers) => [...answers, answer]);
    setSelectedId(id);
    setDrawing(false);
    setDrawingPoints([]);
    setMessage('도형 생성 완료. 점이나 도형을 드래그해 범위를 조정하고, 오른쪽 그림에서 O 위치를 지정하세요.');
  }

  function cancelDrawing() {
    setDrawing(false);
    setDrawingPoints([]);
    setMessage('새 정답 만들기를 취소했습니다.');
  }

  function handleLeftPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!leftRef.current) return;
    const point = normalizedFromEvent(event, leftRef.current);
    if (drawing) {
      setDrawingPoints((current) => [...current, point]);
      return;
    }
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!drag) return;

    if (drag.type === 'vertex' || drag.type === 'polygon') {
      const element = leftRef.current;
      if (!element) return;
      const point = normalizedFromEvent({ clientX, clientY }, element);

      updateRoundAnswers((answers) => answers.map((answer) => {
        if (answer.id !== drag.answerId) return answer;

        if (drag.type === 'vertex') {
          const polygon = answer.polygon.map((vertex, index) => index === drag.vertexIndex ? point : vertex);
          return { ...answer, polygon, leftMarker: polygonCentroid(polygon) };
        }

        const dx = point.x - drag.start.x;
        const dy = point.y - drag.start.y;
        const proposed = drag.original.map((vertex) => ({ x: vertex.x + dx, y: vertex.y + dy }));
        const minX = Math.min(...proposed.map((p) => p.x));
        const maxX = Math.max(...proposed.map((p) => p.x));
        const minY = Math.min(...proposed.map((p) => p.y));
        const maxY = Math.max(...proposed.map((p) => p.y));
        const adjustX = minX < 0 ? -minX : maxX > 1 ? 1 - maxX : 0;
        const adjustY = minY < 0 ? -minY : maxY > 1 ? 1 - maxY : 0;
        const polygon = proposed.map((vertex) => ({ x: vertex.x + adjustX, y: vertex.y + adjustY }));
        return { ...answer, polygon, leftMarker: polygonCentroid(polygon) };
      }));
      return;
    }

    if (drag.type === 'right-marker') {
      const element = rightRef.current;
      if (!element) return;
      const point = normalizedFromEvent({ clientX, clientY }, element);
      updateRoundAnswers((answers) => answers.map((answer) =>
        answer.id === drag.answerId ? { ...answer, rightMarker: point } : answer
      ));
    }
  }

  function endDrag() {
    setDrag(null);
  }

  function handleRightClick(event: ReactPointerEvent<HTMLDivElement>) {
    if (!selectedId || !rightRef.current) return;
    const point = normalizedFromEvent(event, rightRef.current);
    updateRoundAnswers((answers) => answers.map((answer) =>
      answer.id === selectedId ? { ...answer, rightMarker: point } : answer
    ));
  }

  function deleteSelected() {
    if (!selectedId) return;
    updateRoundAnswers((answers) => answers.filter((answer) => answer.id !== selectedId));
    setSelectedId(null);
    setMessage('선택한 정답 영역을 삭제했습니다.');
  }

  async function copyJson() {
    await navigator.clipboard.writeText(jsonText);
    setMessage('JSON을 클립보드에 복사했습니다.');
  }

  function downloadJson() {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gameConfig.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('gameConfig.json을 다운로드했습니다.');
  }

  function previewGame() {
    savePreviewConfig(config);
    window.location.href = '/?preview=1';
  }

  function resetDraft() {
    const confirmed = window.confirm('임시저장한 편집 내용을 지우고 현재 프로젝트 설정으로 되돌릴까요?');
    if (!confirmed) return;
    clearEditorDraft(window.localStorage);
    setConfig(cloneConfig(initialConfig));
    setRoundIndex(0);
    setDrawing(false);
    setDrawingPoints([]);
    setSelectedId(null);
    setMessage('임시저장을 초기화하고 프로젝트에 포함된 설정으로 되돌렸습니다.');
  }

  function changeRound(index: number) {
    setRoundIndex(index);
    setDrawing(false);
    setDrawingPoints([]);
    setSelectedId(null);
  }

  return (
    <main
      className="editor-screen"
      onPointerMove={(event) => moveDrag(event.clientX, event.clientY)}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <header className="editor-header">
        <div>
          <div className="eyebrow">개발자 전용 · 배포판에서는 숨김</div>
          <h1>정답 영역 편집기</h1>
          <p>{message}</p>
        </div>
        <div className="editor-actions">
          <button className="secondary-button" onClick={copyJson}>JSON 복사</button>
          <button className="secondary-button" onClick={downloadJson}>JSON 다운로드</button>
          <button className="secondary-button" onClick={resetDraft}>임시저장 초기화</button>
          <button className="primary-button" onClick={previewGame}>게임 미리보기</button>
        </div>
      </header>

      <div className="round-tabs">
        {config.rounds.map((item, index) => (
          <button key={item.id} className={index === roundIndex ? 'active' : ''} onClick={() => changeRound(index)}>
            {item.title}
          </button>
        ))}
      </div>

      <div className="editor-toolbar">
        {!drawing ? (
          <button className="primary-button" onClick={startAnswer}>+ 새 정답 영역</button>
        ) : (
          <>
            <button className="primary-button" onClick={finishAnswer}>도형 완성 ({drawingPoints.length}점)</button>
            <button className="secondary-button" onClick={cancelDrawing}>취소</button>
            <button className="secondary-button" onClick={() => setDrawingPoints((points) => points.slice(0, -1))}>마지막 점 취소</button>
          </>
        )}
        <button className="danger-button" disabled={!selectedId} onClick={deleteSelected}>선택 영역 삭제</button>
      </div>

      <div className="paintings-grid editor-grid">
        <section className="painting-pane">
          <h2>각색된 명화 · 정답 범위 설정</h2>
          <div ref={leftRef} className={`painting-frame editor-canvas ${drawing ? 'drawing' : ''}`} onPointerDown={handleLeftPointerDown}>
            <img src={round.adaptedImage} alt="각색된 명화" draggable={false} />
            <svg className="editor-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              {round.answers.map((answer) => (
                <g key={answer.id}>
                  <polygon
                    points={answer.polygon.map((p) => `${p.x * 1000},${p.y * 1000}`).join(' ')}
                    className={`answer-polygon ${answer.id === selectedId ? 'selected' : ''}`}
                    onPointerDown={(event) => {
                      if (drawing) return;
                      event.stopPropagation();
                      setSelectedId(answer.id);
                      const element = leftRef.current;
                      if (!element) return;
                      const start = normalizedFromEvent(event, element);
                      setDrag({ type: 'polygon', answerId: answer.id, start, original: answer.polygon });
                    }}
                  />
                  {answer.id === selectedId && answer.polygon.map((point, vertexIndex) => (
                    <circle
                      key={vertexIndex}
                      cx={point.x * 1000}
                      cy={point.y * 1000}
                      r="13"
                      className="vertex-handle"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setDrag({ type: 'vertex', answerId: answer.id, vertexIndex });
                      }}
                    />
                  ))}
                  <circle cx={answer.leftMarker.x * 1000} cy={answer.leftMarker.y * 1000} r="27" className="editor-marker-ring" />
                </g>
              ))}
              {drawingPoints.length > 0 && (
                <>
                  <polyline points={drawingPoints.map((p) => `${p.x * 1000},${p.y * 1000}`).join(' ')} className="drawing-line" />
                  {drawingPoints.map((point, index) => <circle key={index} cx={point.x * 1000} cy={point.y * 1000} r="11" className="drawing-point" />)}
                </>
              )}
            </svg>
          </div>
          <div className="answer-list">
            {round.answers.map((answer, index) => (
              <button key={answer.id} className={answer.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(answer.id)}>
                {index + 1}. {answer.label}
              </button>
            ))}
          </div>
        </section>

        <section className="painting-pane">
          <h2>원본 명화 · 선택한 정답의 O 위치</h2>
          <div ref={rightRef} className="painting-frame editor-canvas" onPointerDown={handleRightClick}>
            <img src={round.originalImage} alt="원본 명화" draggable={false} />
            {selected && (
              <div
                className="editor-right-marker"
                style={{ left: `${selected.rightMarker.x * 100}%`, top: `${selected.rightMarker.y * 100}%` }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setDrag({ type: 'right-marker', answerId: selected.id });
                }}
              />
            )}
          </div>
          <p className="editor-help">정답을 선택한 뒤 오른쪽 그림을 클릭하거나 빨간 O를 드래그하세요.</p>
        </section>
      </div>

      <details className="json-panel">
        <summary>현재 JSON 보기</summary>
        <pre>{jsonText}</pre>
      </details>
    </main>
  );
}
