# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                        # Vite dev server (port 5173, or $PORT)
npm test                           # vitest run (tests live in src/core/sudoku.test.ts)
npx vitest run -t "test name"      # run a single test by name
npm run build                      # ./build.sh — type-check + vite build into ./dist
./build.sh --base=/spacedoku/      # extra args pass through to vite build
npm run preview                    # serve the built dist/ locally
```

`npm run build` delegates to `build.sh`, which injects `VITE_GITHUB_REPO_URL`, `VITE_BUILD_COMMIT`, and `VITE_BUILD_COMMIT_SHORT` from git before running `build:site` (`tsc -b && vite build`). There is no linter configured; `tsc -b` is the only static check.

## What this is

A fully client-side, space-themed sudoku game (React 18 + TypeScript + Vite + plain CSS). No server, no accounts, no network calls at runtime — fonts, sprites, and sound samples are all bundled, and `vite.config.ts` sets `base: './'` so the built `dist/` works from any subdirectory on a static host.

## Architecture

Data flows one way: pure core → reducer → App orchestration → presentational components, with audio and localStorage as side effects handled only in `App.tsx`.

- **`src/core/`** — pure sudoku logic, no React/DOM imports (enforced by convention; keep it that way). `sudoku.ts` implements the solver, uniqueness checker, and generator using candidate bitmasks (bit `v-1` set = value `v` allowed). The generator builds a full random solution, then removes clues in random order, keeping each removal only while `countSolutions(...) === 1` — uniqueness is guaranteed, the `GIVENS_TARGET` counts in `types.ts` are only floors it aims for. Board sizes (4×4, 6×6, 9×9) are driven by `SIZE_CONFIGS`; nothing hardcodes 9. This is the only part of the codebase with unit tests.

- **`src/state/`** — `gameReducer.ts` holds all gameplay rules (input, notes, erase, undo history, hints, mistakes, win detection). Its `GameState.lastEvent` field (`{kind, cell, seq}`) is how gameplay communicates outward: the reducer records the event, and an effect in `App.tsx` consumes it to play sounds. `seq` is monotonic so identical consecutive events still re-trigger effects. `storage.ts` / `settings.ts` persist to localStorage under `sudoku-pop.*.v1` keys, all wrapped in try/catch so a blocked storage never breaks the game.

- **`src/components/App.tsx`** — the single orchestrator: owns the screen state (`start` / `game` / `credits` + win/settings overlays), the game reducer, keyboard controls, the 1-second clock tick, autosave-on-change, and the audio-unlock-on-first-gesture listener. Other components are presentational and receive `dispatch`/callbacks.

- **`src/audio/audio.ts`** — a singleton `AudioEngine` (exported as `audio`). SFX are real .wav samples bundled via `import.meta.glob('../assets/sfx/*.wav')`, decoded once, picked randomly from per-action pools with slight detune. Music is synthesized live with the Web Audio API (no music files shipped). The engine must be `unlock()`ed from a user gesture (browser autoplay policy) — App.tsx already handles this globally.

Game persistence detail: an in-progress game autosaves on every state change and is offered as "Resume" on the start screen; winning (or starting fresh from the win screen) clears the save.
