// Solver, uniqueness checker, and puzzle generator.
// Uses candidate bitmasks: bit (v-1) set means value v is allowed.

import type { Difficulty, Grid, Puzzle, SizeConfig, SizeKey } from './types';
import { GIVENS_TARGET, SIZE_CONFIGS } from './types';

export function idx(row: number, col: number, size: number): number {
  return row * size + col;
}

export function boxIndex(row: number, col: number, cfg: SizeConfig): number {
  const boxesPerRow = cfg.size / cfg.boxW;
  return Math.floor(row / cfg.boxH) * boxesPerRow + Math.floor(col / cfg.boxW);
}

/** All peer cell indices (same row, column, or box) for each cell. */
export function buildPeers(cfg: SizeConfig): number[][] {
  const { size } = cfg;
  const peers: number[][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const set = new Set<number>();
      for (let k = 0; k < size; k++) {
        set.add(idx(r, k, size));
        set.add(idx(k, c, size));
      }
      const br = Math.floor(r / cfg.boxH) * cfg.boxH;
      const bc = Math.floor(c / cfg.boxW) * cfg.boxW;
      for (let dr = 0; dr < cfg.boxH; dr++) {
        for (let dc = 0; dc < cfg.boxW; dc++) {
          set.add(idx(br + dr, bc + dc, size));
        }
      }
      set.delete(idx(r, c, size));
      peers.push([...set]);
    }
  }
  return peers;
}

const peersCache = new Map<string, number[][]>();

export function peersFor(cfg: SizeConfig): number[][] {
  const key = `${cfg.size}-${cfg.boxW}x${cfg.boxH}`;
  let p = peersCache.get(key);
  if (!p) {
    p = buildPeers(cfg);
    peersCache.set(key, p);
  }
  return p;
}

/** Bitmask of candidate values for a cell given the current grid. */
export function candidatesAt(grid: Grid, cell: number, cfg: SizeConfig): number {
  const all = (1 << cfg.size) - 1;
  let mask = all;
  for (const p of peersFor(cfg)[cell]) {
    const v = grid[p];
    if (v !== 0) mask &= ~(1 << (v - 1));
  }
  return mask;
}

/** Candidate values (1..size) as an array, for hints/notes. */
export function candidateList(grid: Grid, cell: number, cfg: SizeConfig): number[] {
  const mask = candidatesAt(grid, cell, cfg);
  const out: number[] = [];
  for (let v = 1; v <= cfg.size; v++) {
    if (mask & (1 << (v - 1))) out.push(v);
  }
  return out;
}

/** True if placing/keeping grid[cell] causes no row/col/box conflict. */
export function isCellValid(grid: Grid, cell: number, cfg: SizeConfig): boolean {
  const v = grid[cell];
  if (v === 0) return true;
  for (const p of peersFor(cfg)[cell]) {
    if (grid[p] === v) return false;
  }
  return true;
}

function popcount(n: number): number {
  let c = 0;
  while (n) {
    n &= n - 1;
    c++;
  }
  return c;
}

/**
 * Count solutions up to `limit` (default 2, enough to test uniqueness).
 * Picks the most-constrained empty cell first, which keeps this fast.
 */
export function countSolutions(grid: Grid, cfg: SizeConfig, limit = 2): number {
  const work = grid.slice();
  let count = 0;

  const step = (): void => {
    if (count >= limit) return;
    let best = -1;
    let bestMask = 0;
    let bestCount = cfg.size + 1;
    for (let i = 0; i < work.length; i++) {
      if (work[i] !== 0) continue;
      const mask = candidatesAt(work, i, cfg);
      const n = popcount(mask);
      if (n === 0) return; // dead end
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 1) break;
      }
    }
    if (best === -1) {
      count++;
      return;
    }
    for (let v = 1; v <= cfg.size; v++) {
      if (!(bestMask & (1 << (v - 1)))) continue;
      work[best] = v;
      step();
      work[best] = 0;
      if (count >= limit) return;
    }
  };

  step();
  return count;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Fill an empty (or partial) grid into a complete solution. Returns null if unsolvable. */
export function solve(grid: Grid, cfg: SizeConfig, rng: () => number = Math.random): Grid | null {
  const work = grid.slice();

  const step = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = cfg.size + 1;
    for (let i = 0; i < work.length; i++) {
      if (work[i] !== 0) continue;
      const mask = candidatesAt(work, i, cfg);
      const n = popcount(mask);
      if (n === 0) return false;
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 1) break;
      }
    }
    if (best === -1) return true;
    const values: number[] = [];
    for (let v = 1; v <= cfg.size; v++) {
      if (bestMask & (1 << (v - 1))) values.push(v);
    }
    shuffle(values, rng);
    for (const v of values) {
      work[best] = v;
      if (step()) return true;
      work[best] = 0;
    }
    return false;
  };

  return step() ? work : null;
}

/**
 * Generate a puzzle with a unique solution.
 * Strategy: build a full random solution, then remove clues in random order,
 * keeping each removal only if the puzzle still has exactly one solution.
 * Stops once the difficulty's target number of givens is reached.
 */
export function generatePuzzle(
  sizeKey: SizeKey,
  difficulty: Difficulty,
  rng: () => number = Math.random,
): Puzzle {
  const cfg = SIZE_CONFIGS[sizeKey];
  const total = cfg.size * cfg.size;
  const solution = solve(new Array(total).fill(0), cfg, rng);
  if (!solution) throw new Error('failed to generate a full solution');

  const target = GIVENS_TARGET[sizeKey][difficulty];
  const givens = solution.slice();
  let remaining = total;
  const order = shuffle(
    Array.from({ length: total }, (_, i) => i),
    rng,
  );
  for (const cell of order) {
    if (remaining <= target) break;
    const saved = givens[cell];
    givens[cell] = 0;
    if (countSolutions(givens, cfg, 2) === 1) {
      remaining--;
    } else {
      givens[cell] = saved;
    }
  }

  return { sizeKey, difficulty, givens, solution };
}

/** True when every cell is filled and matches the solution. */
export function isSolved(cells: Grid, solution: Grid): boolean {
  for (let i = 0; i < solution.length; i++) {
    if (cells[i] !== solution[i]) return false;
  }
  return true;
}

/**
 * Pick a good cell to hint: an empty (or wrong) cell with the fewest
 * candidates — the one a stuck player is most likely to need.
 */
export function pickHintCell(cells: Grid, solution: Grid, cfg: SizeConfig): number {
  let best = -1;
  let bestCount = Infinity;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === solution[i]) continue;
    // Count candidates as if the cell were empty (it may hold a wrong value).
    const work = cells[i] === 0 ? cells : cells.map((v, j) => (j === i ? 0 : v));
    const n = candidateList(work, i, cfg).length;
    if (n < bestCount) {
      best = i;
      bestCount = n;
      if (n <= 1) break;
    }
  }
  return best;
}
