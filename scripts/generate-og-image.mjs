#!/usr/bin/env node
// Rasterizes public/og-image.svg into a 1200x630 PNG at public/og-image.png.
// Run manually (or via `npm run generate:og`) whenever the SVG source changes;
// the PNG is checked in so social crawlers see a stable file.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const svgPath = path.join(root, 'public', 'og-image.svg');
const pngPath = path.join(root, 'public', 'og-image.png');

const svg = await readFile(svgPath);
const png = await sharp(svg, { density: 200 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(pngPath, png);
console.log(`Wrote ${pngPath} (${png.length.toLocaleString()} bytes)`);
