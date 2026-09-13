import test from 'node:test';
import assert from 'node:assert/strict';
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from '../src/editor/editorDraft.ts';
import type { GameConfig } from '../src/types.ts';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const fallback: GameConfig = {
  timerSeconds: 120,
  rounds: [{ id: 'r1', title: 'R1', adaptedImage: '/a.png', originalImage: '/o.png', answers: [] }],
};

test('saved editor draft is restored instead of fallback config', () => {
  const storage = new MemoryStorage();
  const draft: GameConfig = { ...fallback, timerSeconds: 90 };
  saveEditorDraft(storage, draft);
  assert.deepEqual(loadEditorDraft(storage, fallback), draft);
});

test('malformed editor draft falls back to bundled config', () => {
  const storage = new MemoryStorage();
  storage.setItem('anthony-browne-editor-draft', '{bad json');
  assert.deepEqual(loadEditorDraft(storage, fallback), fallback);
});

test('clearing editor draft restores fallback config', () => {
  const storage = new MemoryStorage();
  saveEditorDraft(storage, { ...fallback, timerSeconds: 60 });
  clearEditorDraft(storage);
  assert.deepEqual(loadEditorDraft(storage, fallback), fallback);
});
