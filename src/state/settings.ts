import type { Difficulty, SizeKey } from '../core/types';
import { DIFFICULTIES, SIZE_CONFIGS } from '../core/types';

export interface Settings {
  sfxEnabled: boolean;
  sfxVolume: number; // 0..1
  musicEnabled: boolean;
  musicVolume: number; // 0..1
  showErrors: boolean;
  /** Last board size the player picked on the start screen. */
  lastSize: SizeKey;
  /** Last difficulty the player picked on the start screen. */
  lastDifficulty: Difficulty;
}

export const DEFAULT_SETTINGS: Settings = {
  sfxEnabled: true,
  sfxVolume: 0.7,
  musicEnabled: true,
  musicVolume: 0.35,
  showErrors: true,
  lastSize: '9',
  lastDifficulty: 'easy',
};

const KEY = 'sudoku-pop.settings.v1';

// Only keep fields whose runtime shape matches what the app expects. A stale save
// from a future version or a manual edit that puts e.g. lastSize: "99" would
// otherwise flow into SIZE_CONFIGS[key] and crash the first render.
function sanitizeSettings(raw: unknown): Partial<Settings> {
  if (!raw || typeof raw !== 'object') return {};
  const s = raw as Record<string, unknown>;
  const out: Partial<Settings> = {};
  if (typeof s.sfxEnabled === 'boolean') out.sfxEnabled = s.sfxEnabled;
  if (typeof s.musicEnabled === 'boolean') out.musicEnabled = s.musicEnabled;
  if (typeof s.showErrors === 'boolean') out.showErrors = s.showErrors;
  if (typeof s.sfxVolume === 'number' && s.sfxVolume >= 0 && s.sfxVolume <= 1)
    out.sfxVolume = s.sfxVolume;
  if (typeof s.musicVolume === 'number' && s.musicVolume >= 0 && s.musicVolume <= 1)
    out.musicVolume = s.musicVolume;
  if (typeof s.lastSize === 'string' && s.lastSize in SIZE_CONFIGS)
    out.lastSize = s.lastSize as SizeKey;
  if (DIFFICULTIES.includes(s.lastDifficulty as Difficulty))
    out.lastDifficulty = s.lastDifficulty as Difficulty;
  return out;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...sanitizeSettings(JSON.parse(raw)) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // storage may be unavailable (private mode); settings just won't persist
  }
}
