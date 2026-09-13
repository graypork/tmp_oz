import rawConfig from './gameConfig.json';
import type { GameConfig } from '../types';

export const bundledGameConfig = rawConfig as GameConfig;

const PREVIEW_KEY = 'anthony-browne-game-preview-config';

export function loadGameConfig(): GameConfig {
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1') {
      const preview = window.localStorage.getItem(PREVIEW_KEY);
      if (preview) {
        try {
          return JSON.parse(preview) as GameConfig;
        } catch {
          // Fall back to bundled data if local draft is malformed.
        }
      }
    }
  }
  return bundledGameConfig;
}

export function savePreviewConfig(config: GameConfig): void {
  window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(config));
}
