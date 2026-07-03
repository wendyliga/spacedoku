# Spacedoku

A space-themed, fully client-side sudoku game — pixel-art nebula backdrop,
animated sprites, interface-bleep sound effects, ambient cosmic soundtrack.
No server, no accounts, no tracking — just a static page you can host anywhere.

See [PLAN.md](./PLAN.md) for the full requirements, architecture, and progress log.

## Features

- **Customizable new game**: 4×4, 6×6, or 9×9 boards × Easy/Medium/Hard/Expert.
- Every puzzle is generated on-device with a **guaranteed unique solution**.
- **Telescope hints** fill the selected cell (or the smartest next cell) when you're stuck.
- Pencil-mark notes (Scan), undo (Rewind), erase (Vaporize), collision alerts,
  mission clock, and a stardust-shower win screen.
- **Ship sounds** from a real interface-bleep sample library with per-action
  variation, plus a **generative ambient soundtrack** (Web Audio API) — toggles
  and volume sliders in the Control deck.
- Pixel-art nebula, drifting planets, and animated astronaut/alien sprites.
- Bundled Orbitron + Exo 2 fonts (OFL-licensed, served locally — no CDN calls).

## Asset credits

- Space Runner sprites — Matt Walkden (CC0)
- Space background pack — ansimuz (CC0)
- Interface bleeps — BLEEOOP sound library
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
