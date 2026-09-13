import type { Point } from './game/geometry';

export type AnswerArea = {
  id: string;
  label: string;
  polygon: Point[];
  leftMarker: Point;
  rightMarker: Point;
};

export type GameRound = {
  id: string;
  title: string;
  adaptedImage: string;
  originalImage: string;
  answers: AnswerArea[];
};

export type GameConfig = {
  timerSeconds: number;
  rounds: GameRound[];
};
