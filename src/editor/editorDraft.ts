import type { GameConfig } from '../types.ts';

export const EDITOR_DRAFT_KEY = 'anthony-browne-editor-draft';

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function looksLikeGameConfig(value: unknown): value is GameConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GameConfig>;
  return typeof candidate.timerSeconds === 'number' && Array.isArray(candidate.rounds);
}

export function loadEditorDraft(storage: StorageLike, fallback: GameConfig): GameConfig {
  const raw = storage.getItem(EDITOR_DRAFT_KEY);
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return looksLikeGameConfig(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveEditorDraft(storage: StorageLike, config: GameConfig): void {
  storage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(config));
}

export function clearEditorDraft(storage: StorageLike): void {
  storage.removeItem(EDITOR_DRAFT_KEY);
}
