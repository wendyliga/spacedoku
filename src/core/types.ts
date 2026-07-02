// Pure data types for the sudoku core. No React, no DOM.

/** 0 means empty; values are 1..size. Row-major, length = size * size. */
export type Grid = number[];

export interface SizeConfig {
  /** Board side length (and number of symbols). */
  size: number;
  /** Box width in cells (columns per box). */
  boxW: number;
  /** Box height in cells (rows per box). */
  boxH: number;
}

export type SizeKey = '4' | '6' | '9';

export const SIZE_CONFIGS: Record<SizeKey, SizeConfig> = {
  '4': { size: 4, boxW: 2, boxH: 2 },
  '6': { size: 6, boxW: 3, boxH: 2 },
  '9': { size: 9, boxW: 3, boxH: 3 },
};

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

/**
 * Target number of given clues per size/difficulty. The generator removes
 * clues only while the puzzle stays uniquely solvable, so these are floors
 * it aims for, not guarantees.
 */
export const GIVENS_TARGET: Record<SizeKey, Record<Difficulty, number>> = {
  '4': { easy: 10, medium: 8, hard: 7, expert: 5 },
  '6': { easy: 24, medium: 19, hard: 15, expert: 12 },
  '9': { easy: 42, medium: 34, hard: 28, expert: 24 },
};

export interface Puzzle {
  sizeKey: SizeKey;
  difficulty: Difficulty;
  /** Clues; 0 = cell the player must fill. */
  givens: Grid;
  /** The unique solution. */
  solution: Grid;
}
