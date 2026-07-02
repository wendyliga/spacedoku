import { describe, expect, it } from 'vitest';
import {
  candidateList,
  countSolutions,
  generatePuzzle,
  isCellValid,
  isSolved,
  pickHintCell,
  solve,
} from './sudoku';
import { DIFFICULTIES, GIVENS_TARGET, SIZE_CONFIGS, type SizeKey } from './types';

// Deterministic rng so test runs are reproducible.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function assertValidComplete(grid: number[], sizeKey: SizeKey): void {
  const cfg = SIZE_CONFIGS[sizeKey];
  expect(grid.length).toBe(cfg.size * cfg.size);
  for (let i = 0; i < grid.length; i++) {
    expect(grid[i]).toBeGreaterThanOrEqual(1);
    expect(grid[i]).toBeLessThanOrEqual(cfg.size);
    expect(isCellValid(grid, i, cfg)).toBe(true);
  }
}

describe('solve', () => {
  it.each(['4', '6', '9'] as SizeKey[])('fills an empty %s×%s grid completely', (key) => {
    const cfg = SIZE_CONFIGS[key];
    const grid = solve(new Array(cfg.size * cfg.size).fill(0), cfg, makeRng(1));
    expect(grid).not.toBeNull();
    assertValidComplete(grid!, key);
  });

  it('returns null for a contradictory grid', () => {
    const cfg = SIZE_CONFIGS['4'];
    const grid = new Array(16).fill(0);
    grid[0] = 1;
    grid[1] = 1; // same row conflict
    expect(solve(grid, cfg)).toBeNull();
  });
});

describe('generatePuzzle', () => {
  const cases = (['4', '6', '9'] as SizeKey[]).flatMap((key) =>
    DIFFICULTIES.map((d) => [key, d] as const),
  );

  it.each(cases)('generates a unique-solution %s×%s %s puzzle', (key, difficulty) => {
    const cfg = SIZE_CONFIGS[key];
    const puzzle = generatePuzzle(key, difficulty, makeRng(42));

    assertValidComplete(puzzle.solution, key);
    expect(countSolutions(puzzle.givens, cfg, 2)).toBe(1);

    // Every given matches the solution.
    for (let i = 0; i < puzzle.givens.length; i++) {
      if (puzzle.givens[i] !== 0) expect(puzzle.givens[i]).toBe(puzzle.solution[i]);
    }

    // Difficulty is honored loosely: never fewer givens than the target.
    const givenCount = puzzle.givens.filter((v) => v !== 0).length;
    expect(givenCount).toBeGreaterThanOrEqual(GIVENS_TARGET[key][difficulty]);
  });

  it('produces harder puzzles with fewer or equal givens than easier ones (same seed)', () => {
    const easy = generatePuzzle('9', 'easy', makeRng(7)).givens.filter((v) => v !== 0).length;
    const expert = generatePuzzle('9', 'expert', makeRng(7)).givens.filter((v) => v !== 0).length;
    expect(expert).toBeLessThanOrEqual(easy);
  });
});

describe('candidates & hints', () => {
  it('lists exactly the values not present in peers', () => {
    const cfg = SIZE_CONFIGS['4'];
    const puzzle = generatePuzzle('4', 'easy', makeRng(3));
    const empty = puzzle.givens.findIndex((v) => v === 0);
    const cands = candidateList(puzzle.givens, empty, cfg);
    expect(cands).toContain(puzzle.solution[empty]);
  });

  it('pickHintCell returns a cell that does not match the solution', () => {
    const cfg = SIZE_CONFIGS['6'];
    const puzzle = generatePuzzle('6', 'medium', makeRng(9));
    const cell = pickHintCell(puzzle.givens, puzzle.solution, cfg);
    expect(cell).toBeGreaterThanOrEqual(0);
    expect(puzzle.givens[cell]).not.toBe(puzzle.solution[cell]);
  });

  it('pickHintCell returns -1 on a solved board', () => {
    const puzzle = generatePuzzle('4', 'easy', makeRng(5));
    expect(pickHintCell(puzzle.solution, puzzle.solution, SIZE_CONFIGS['4'])).toBe(-1);
  });
});

describe('isSolved', () => {
  it('accepts the solution and rejects anything else', () => {
    const puzzle = generatePuzzle('4', 'easy', makeRng(11));
    expect(isSolved(puzzle.solution, puzzle.solution)).toBe(true);
    expect(isSolved(puzzle.givens, puzzle.solution)).toBe(false);
  });
});
