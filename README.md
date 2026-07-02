# Sudoku Pop! 🎉

A playful, fully client-side sudoku game. No server, no accounts, no tracking —
just a static page you can host anywhere.

See [PLAN.md](./PLAN.md) for the full requirements, architecture, and progress log.

## Features

- **Customizable new game**: 4×4, 6×6, or 9×9 boards × Easy/Medium/Hard/Expert.
- Every puzzle is generated on-device with a **guaranteed unique solution**.
- **Hints** fill the selected cell (or the smartest next cell) when you're stuck.
- Pencil-mark notes, undo, erase, mistake highlighting, timer, win confetti.
- **Sound effects & background music**, synthesized live with the Web Audio API
  (zero audio assets) — toggles and volume sliders in Settings.
- Progress and settings persist in `localStorage`; an interrupted game can be resumed.
- Keyboard play: arrows move, `1–9` fill, `Backspace` erases, `N` notes, `H` hint, `U`/`Ctrl+Z` undo.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # solver/generator unit tests
```

## Deploy

```bash
npm run build
```

Upload the `dist/` folder to any static host (GitHub Pages, Netlify, Cloudflare
Pages, S3, nginx…). Asset paths are relative, so it works from any subdirectory.

## Stack

Vite · React 18 · TypeScript · plain CSS · Web Audio API · Vitest
