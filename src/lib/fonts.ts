/**
 * FONTS FOR ARTWORK
 * =================
 * Loads the club's typefaces and turns words into shapes.
 *
 * WHY WE DRAW TEXT AS SHAPES
 * --------------------------
 * An SVG that merely *names* a font is not self-contained. Open it anywhere
 * that does not have that font installed — a print shop's computer, a browser
 * loading it as an image — and the text silently renders in whatever is
 * available instead. You find out when the banner comes back from the printers
 * set in Times New Roman.
 *
 * So every word in the artwork is converted to its outline: actual curves, with
 * no font dependency at all. This is the same thing print shops mean when they
 * ask you to "convert text to outlines", and it is why our banner files can be
 * handed to anybody.
 *
 * The cost is that the text is no longer selectable or editable in the finished
 * file. For a printed banner that is exactly what you want.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import opentype from 'opentype.js';
import { decompress } from 'wawoff2';

/** The four faces the artwork uses. */
const SOURCES = {
  'display-400': '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2',
  'display-700': '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2',
  'mono-400': '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
  'mono-700': '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2',
} as const;

export type FaceName = keyof typeof SOURCES;

/** Unpacked TrueType copies live here; opentype cannot read .woff2 either. */
const CACHE_DIR = path.join('node_modules', '.cache', 'dev-club-fonts');

/**
 * Faces being loaded, keyed by name.
 *
 * We cache the PROMISE rather than the finished font, and that detail matters.
 * A banner outlines a dozen pieces of text at once, so a dozen calls arrive
 * here simultaneously. Caching only the result means every one of them sees an
 * empty cache and starts its own unpack — several writers and readers on the
 * same file at the same time. The reader that wins gets a half-written font,
 * and you get a banner with letters missing from it. Caching the promise means
 * the first call does the work and the rest wait for it.
 */
const loading = new Map<FaceName, Promise<opentype.Font>>();

/** Loads one face, unpacking it from .woff2 the first time. */
function face(name: FaceName): Promise<opentype.Font> {
  const inFlight = loading.get(name);
  if (inFlight) return inFlight;

  const promise = loadFace(name);
  loading.set(name, promise);
  return promise;
}

async function loadFace(name: FaceName): Promise<opentype.Font> {
  await mkdir(CACHE_DIR, { recursive: true });
  const target = path.join(CACHE_DIR, `${name}.ttf`);

  if (!existsSync(target)) {
    const woff2 = await readFile(path.join('node_modules', SOURCES[name]));
    await writeFile(target, Buffer.from(await decompress(woff2)));
  }

  const buffer = await readFile(target);
  // opentype wants a plain ArrayBuffer, not Node's Buffer view of one.
  return opentype.parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  );
}

/** One stretch of text in a single colour. */
export interface Run {
  text: string;
  fill: string;
}

export interface TextOptions {
  x: number;
  y: number;
  size: number;
  family: 'display' | 'mono';
  weight?: 400 | 700;
  /** Where x refers to: the left edge, the centre, or the right edge. */
  anchor?: 'start' | 'middle' | 'end';
}

/**
 * Draws one or more coloured runs of text as SVG paths, laid out on one line.
 *
 * Runs let a single line carry more than one colour — the wordmark is gold,
 * grey and off-white — while still being measured and centred as a whole.
 */
export async function outlineText(runs: Run[], options: TextOptions): Promise<string> {
  const { family, weight = 400, anchor = 'start' } = options;
  const font = await face(`${family}-${weight}` as FaceName);

  /**
   * Round the position and size before handing them over.
   *
   * This is not tidiness, it is a real bug fix. Our layout is written in
   * fractions of the canvas — H * 0.17 and so on — and floating point makes
   * that 408.00000000000006 rather than 408. Given a value like that, the
   * outliner emits "NaN" for some coordinates, which silently drops whole
   * words from the artwork: the word "while" simply vanished off the banner.
   * Two decimal places is far finer than any printer can resolve.
   */
  const round = (value: number) => Math.round(value * 100) / 100;
  const x = round(options.x);
  const y = round(options.y);
  const size = round(options.size);

  // Measure the whole line first so it can be centred or right-aligned.
  const widths = runs.map((run) => font.getAdvanceWidth(run.text, size));
  const total = widths.reduce((sum, width) => sum + width, 0);

  let cursor = x;
  if (anchor === 'middle') cursor -= total / 2;
  else if (anchor === 'end') cursor -= total;

  const paths: string[] = [];
  runs.forEach((run, i) => {
    // Skip whitespace-only runs: they move the cursor but draw nothing.
    if (run.text.trim()) {
      // The cursor is rounded too, for the same reason as x and y above — it
      // has accumulated the widths of earlier runs and is rarely a whole
      // number by the time a later run uses it.
      const outline = font.getPath(run.text, round(cursor), y, size).toPathData(2);

      // Stop the build rather than ship artwork with words missing from it.
      // A NaN in path data makes that whole shape disappear, and the file
      // still opens and still looks plausible — which is exactly how this got
      // as far as a printed-banner preview before anybody noticed.
      if (outline.includes('NaN')) {
        throw new Error(
          `Outlining "${run.text}" produced invalid path data. This is usually a ` +
            `fractional coordinate (x=${cursor}, y=${y}, size=${size}); round it.`,
        );
      }

      paths.push(`<path d="${outline}" fill="${run.fill}"/>`);
    }
    cursor += widths[i];
  });

  return paths.join('');
}

/** Shorthand for a single-colour line. */
export async function outline(
  text: string,
  fill: string,
  options: TextOptions,
): Promise<string> {
  return outlineText([{ text, fill }], options);
}

/** How wide a line will be, for laying things out beside it. */
export async function textWidth(
  text: string,
  size: number,
  family: 'display' | 'mono',
  weight: 400 | 700 = 400,
): Promise<number> {
  const font = await face(`${family}-${weight}` as FaceName);
  return font.getAdvanceWidth(text, size);
}
