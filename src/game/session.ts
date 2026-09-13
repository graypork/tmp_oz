export type AppStage = 'start' | 'game' | 'timer';

export type GamePosition = {
  stage: 'start' | 'game';
  roundIndex: number;
};

export function createFoundState(roundCount: number): Set<string>[] {
  return Array.from({ length: Math.max(0, roundCount) }, () => new Set<string>());
}

export function addFoundAnswer(
  current: ReadonlyArray<ReadonlySet<string>>,
  roundIndex: number,
  answerId: string,
): Set<string>[] {
  return current.map((ids, index) => {
    const next = new Set(ids);
    if (index === roundIndex) next.add(answerId);
    return next;
  });
}

export function previousGamePosition(roundIndex: number): GamePosition {
  if (roundIndex <= 0) return { stage: 'start', roundIndex: 0 };
  return { stage: 'game', roundIndex: roundIndex - 1 };
}
