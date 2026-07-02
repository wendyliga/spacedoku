export interface Settings {
  sfxEnabled: boolean;
  sfxVolume: number; // 0..1
  musicEnabled: boolean;
  musicVolume: number; // 0..1
  showErrors: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  sfxEnabled: true,
  sfxVolume: 0.7,
  musicEnabled: true,
  musicVolume: 0.35,
  showErrors: true,
};

const KEY = 'sudoku-pop.settings.v1';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
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
