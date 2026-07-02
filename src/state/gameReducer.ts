import type { Puzzle } from '../core/types';
import { SIZE_CONFIGS } from '../core/types';
import { isSolved, pickHintCell } from '../core/sudoku';

export interface GameState {
  puzzle: Puzzle;
  cells: number[]; // current board, includes givens
  notes: number[]; // bitmask of pencil marks per cell
  selected: number; // -1 = none
  notesMode: boolean;
  mistakes: number;
  hintsUsed: number;
  hintedCells: number[]; // cells filled by hints (for styling)
  elapsedSeconds: number;
  status: 'playing' | 'won';
  /** Last event, consumed by the UI for sounds/animations. */
  lastEvent: GameEvent | null;
  history: HistoryEntry[];
}

export interface GameEvent {
  kind: 'place' | 'error' | 'erase' | 'note' | 'hint' | 'win' | 'undo';
  cell: number;
  seq: number; // monotonic, so identical consecutive events still trigger effects
}

interface HistoryEntry {
  cell: number;
  prevValue: number;
  prevNotes: number;
}

export type GameAction =
  | { type: 'replace'; state: GameState }
  | { type: 'select'; cell: number }
  | { type: 'input'; value: number }
  | { type: 'erase' }
  | { type: 'toggleNotes' }
  | { type: 'undo' }
  | { type: 'hint' }
  | { type: 'tick' };

let eventSeq = 0;

function event(kind: GameEvent['kind'], cell: number): GameEvent {
  return { kind, cell, seq: ++eventSeq };
}

export function newGameState(puzzle: Puzzle, elapsedSeconds = 0): GameState {
  return {
    puzzle,
    cells: puzzle.givens.slice(),
    notes: new Array(puzzle.givens.length).fill(0),
    selected: -1,
    notesMode: false,
    mistakes: 0,
    hintsUsed: 0,
    hintedCells: [],
    elapsedSeconds,
    status: 'playing',
    lastEvent: null,
    history: [],
  };
}

function clearNotesForPeers(state: GameState, cell: number, value: number): number[] {
  const cfg = SIZE_CONFIGS[state.puzzle.sizeKey];
  const size = cfg.size;
  const notes = state.notes.slice();
  const row = Math.floor(cell / size);
  const col = cell % size;
  const bit = 1 << (value - 1);
  for (let i = 0; i < notes.length; i++) {
    const r = Math.floor(i / size);
    const c = i % size;
    const sameBox =
      Math.floor(r / cfg.boxH) === Math.floor(row / cfg.boxH) &&
      Math.floor(c / cfg.boxW) === Math.floor(col / cfg.boxW);
    if (r === row || c === col || sameBox) notes[i] &= ~bit;
  }
  return notes;
}

function place(state: GameState, cell: number, value: number, viaHint: boolean): GameState {
  const { puzzle } = state;
  const cells = state.cells.slice();
  const history = [...state.history, { cell, prevValue: cells[cell], prevNotes: state.notes[cell] }];
  cells[cell] = value;

  const correct = puzzle.solution[cell] === value;
  const notes = correct ? clearNotesForPeers({ ...state, cells }, cell, value) : state.notes.slice();
  notes[cell] = 0;

  const won = isSolved(cells, puzzle.solution);
  return {
    ...state,
    cells,
    notes,
    history,
    mistakes: state.mistakes + (correct ? 0 : 1),
    hintsUsed: state.hintsUsed + (viaHint ? 1 : 0),
    hintedCells: viaHint ? [...state.hintedCells, cell] : state.hintedCells,
    status: won ? 'won' : 'playing',
    lastEvent: won ? event('win', cell) : event(viaHint ? 'hint' : correct ? 'place' : 'error', cell),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'replace') return action.state;
  if (state.status === 'won') return state;

  switch (action.type) {
    case 'select':
      return { ...state, selected: action.cell };

    case 'toggleNotes':
      return { ...state, notesMode: !state.notesMode };

    case 'tick':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'input': {
      const cell = state.selected;
      if (cell < 0 || state.puzzle.givens[cell] !== 0) return state;
      if (state.notesMode) {
        if (state.cells[cell] !== 0) return state;
        const notes = state.notes.slice();
        const history = [
          ...state.history,
          { cell, prevValue: state.cells[cell], prevNotes: notes[cell] },
        ];
        notes[cell] ^= 1 << (action.value - 1);
        return { ...state, notes, history, lastEvent: event('note', cell) };
      }
      if (state.cells[cell] === action.value) return state;
      return place(state, cell, action.value, false);
    }

    case 'erase': {
      const cell = state.selected;
      if (cell < 0 || state.puzzle.givens[cell] !== 0) return state;
      if (state.cells[cell] === 0 && state.notes[cell] === 0) return state;
      const cells = state.cells.slice();
      const notes = state.notes.slice();
      const history = [
        ...state.history,
        { cell, prevValue: cells[cell], prevNotes: notes[cell] },
      ];
      cells[cell] = 0;
      notes[cell] = 0;
      return { ...state, cells, notes, history, lastEvent: event('erase', cell) };
    }

    case 'undo': {
      const entry = state.history[state.history.length - 1];
      if (!entry) return state;
      const cells = state.cells.slice();
      const notes = state.notes.slice();
      cells[entry.cell] = entry.prevValue;
      notes[entry.cell] = entry.prevNotes;
      return {
        ...state,
        cells,
        notes,
        history: state.history.slice(0, -1),
        selected: entry.cell,
        lastEvent: event('undo', entry.cell),
      };
    }

    case 'hint': {
      const cfg = SIZE_CONFIGS[state.puzzle.sizeKey];
      // Prefer the selected cell if it's editable and not already correct.
      let cell = state.selected;
      const usable =
        cell >= 0 &&
        state.puzzle.givens[cell] === 0 &&
        state.cells[cell] !== state.puzzle.solution[cell];
      if (!usable) cell = pickHintCell(state.cells, state.puzzle.solution, cfg);
      if (cell < 0) return state;
      const next = place(state, cell, state.puzzle.solution[cell], true);
      return { ...next, selected: cell };
    }
  }
}
