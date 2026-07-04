// Save/resume the in-progress game so a reload doesn't lose progress.

import type { GameState } from './gameReducer';
import { newGameState } from './gameReducer';
import type { Puzzle, SizeKey } from '../core/types';
import { DIFFICULTIES, SIZE_CONFIGS } from '../core/types';

const KEY = 'sudoku-pop.game.v1';

interface SavedGame {
  puzzle: Puzzle;
  cells: number[];
  notes: number[];
  mistakes: number;
  hintsUsed: number;
  hintedCells: number[];
  elapsedSeconds: number;
}

function isInt(n: unknown, min: number, max: number): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;
}

function isCellArray(arr: unknown, len: number, max: number): arr is number[] {
  return Array.isArray(arr) && arr.length === len && arr.every((v) => isInt(v, 0, max));
}

// Detect saves corrupted by manual edits, cross-version drift, or partial writes.
// Returning null triggers a fresh game rather than a mid-render crash.
function validSavedGame(x: unknown): x is SavedGame {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  const p = s.puzzle as Record<string, unknown> | undefined;
  if (!p || typeof p !== 'object') return false;
  const cfg = SIZE_CONFIGS[p.sizeKey as SizeKey];
  if (!cfg) return false;
  if (!DIFFICULTIES.includes(p.difficulty as (typeof DIFFICULTIES)[number])) return false;
  const total = cfg.size * cfg.size;
  const notesMax = (1 << cfg.size) - 1;
  if (!isCellArray(p.givens, total, cfg.size)) return false;
  if (!isCellArray(p.solution, total, cfg.size)) return false;
  if (!isCellArray(s.cells, total, cfg.size)) return false;
  if (!isCellArray(s.notes, total, notesMax)) return false;
  if (!isInt(s.mistakes, 0, Number.MAX_SAFE_INTEGER)) return false;
  if (!isInt(s.hintsUsed, 0, Number.MAX_SAFE_INTEGER)) return false;
  if (!isInt(s.elapsedSeconds, 0, Number.MAX_SAFE_INTEGER)) return false;
  const hinted = s.hintedCells ?? [];
  if (!Array.isArray(hinted) || !hinted.every((v) => isInt(v, 0, total - 1))) return false;
  return true;
}

export function saveGame(state: GameState): void {
  if (state.status !== 'playing') {
    clearSavedGame();
    return;
  }
  const saved: SavedGame = {
    puzzle: state.puzzle,
    cells: state.cells,
    notes: state.notes,
    mistakes: state.mistakes,
    hintsUsed: state.hintsUsed,
    hintedCells: state.hintedCells,
    elapsedSeconds: state.elapsedSeconds,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // best-effort only
  }
}

export function loadSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!validSavedGame(parsed)) {
      clearSavedGame();
      return null;
    }
    const state = newGameState(parsed.puzzle, parsed.elapsedSeconds);
    return {
      ...state,
      cells: parsed.cells,
      notes: parsed.notes,
      mistakes: parsed.mistakes,
      hintsUsed: parsed.hintsUsed,
      hintedCells: parsed.hintedCells ?? [],
    };
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
