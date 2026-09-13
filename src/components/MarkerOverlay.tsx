import type { AnswerArea } from '../types';
import type { Point } from '../game/geometry';

type WrongMarker = { id: number; point: Point };

type Props = {
  answers: AnswerArea[];
  foundIds: Set<string>;
  side: 'left' | 'right';
  wrongMarkers: WrongMarker[];
};

export function MarkerOverlay({ answers, foundIds, side, wrongMarkers }: Props) {
  return (
    <div className="marker-layer" aria-hidden="true">
      {answers
        .filter((answer) => foundIds.has(answer.id))
        .map((answer) => {
          const marker = side === 'left' ? answer.leftMarker : answer.rightMarker;
          return (
            <div
              key={answer.id}
              className="marker correct-marker"
              style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
            />
          );
        })}

      {wrongMarkers.map((wrong) => (
        <div
          key={`${side}-${wrong.id}`}
          className="marker wrong-marker"
          style={{ left: `${wrong.point.x * 100}%`, top: `${wrong.point.y * 100}%` }}
        >
          ×
        </div>
      ))}
    </div>
  );
}
