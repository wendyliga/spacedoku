// Save/resume the in-progress game so a reload doesn't lose progress.

import type { GameState } from './gameReducer';
import { newGameState } from './gameReducer';
import type { Puzzle } from '../core/types';

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
    const saved = JSON.parse(raw) as SavedGame;
    const expectedLen = saved.puzzle.givens.length;
    if (saved.cells.length !== expectedLen || saved.notes.length !== expectedLen) return null;
    const state = newGameState(saved.puzzle, saved.elapsedSeconds);
    return {
      ...state,
      cells: saved.cells,
      notes: saved.notes,
      mistakes: saved.mistakes,
      hintsUsed: saved.hintsUsed,
      hintedCells: saved.hintedCells ?? [],
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
