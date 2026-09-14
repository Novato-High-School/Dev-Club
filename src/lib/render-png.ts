/**
 * TURNING SVG INTO PNG
 * ====================
 * Chat apps will not show an SVG in a link preview, and print shops want a
 * raster fallback, so some of our artwork has to become a PNG.
 *
 * Fonts are the fiddly part, for two reasons:
 *
 *  1. The renderer cannot read .woff2 — the compressed format browsers use,
 *     and the only one our font package ships. So we unpack them to plain
 *     TrueType first.
 *  2. The renderer only accepts font FILE PATHS, not data held in memory. So
 *     the unpacked fonts are written to a cache folder and handed over by path.
 *
 * Both failures are silent and look the same: the image renders perfectly and
 * the words come out in the wrong typeface, or not at all. If the artwork ever
 * looks like Times New Roman, start here.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import { decompress } from 'wawoff2';

/**
 * Regular and bold of each face.
 *
 * These are the fixed-weight versions rather than the variable ones the site
 * loads in the browser: the renderer only uses a variable font's default
 * instance, so headings came out light whatever weight we asked for.
 */
const FONT_SOURCES = [
  '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2',
  '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2',
  '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
  '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2',
];

/** Where the unpacked TrueType copies live. Rebuilt if missing. */
const CACHE_DIR = path.join('node_modules', '.cache', 'dev-club-fonts');

let cachedPaths: string[] | null = null;

/** Unpacks the fonts to disk once per build and returns their paths. */
async function fontFiles(): Promise<string[]> {
  if (cachedPaths) return cachedPaths;

  await mkdir(CACHE_DIR, { recursive: true });

  const resolved = await Promise.all(
    FONT_SOURCES.map(async (source) => {
      const name = path.basename(source).replace(/\.woff2$/, '.ttf');
      const target = path.join(CACHE_DIR, name);

      if (!existsSync(target)) {
        const woff2 = await readFile(path.join('node_modules', source));
        await writeFile(target, Buffer.from(await decompress(woff2)));
      }
      return target;
    }),
  );

  cachedPaths = resolved;
  return resolved;
}

/**
 * Renders SVG markup to a PNG.
 *
 * `width` is the output width in pixels; the height follows the SVG's own
 * proportions, so asking for 3600 on a 2ft × 4ft banner gives 150 dots per inch
 * without any arithmetic.
 */
export async function svgToPng(svg: string, width: number): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFiles: await fontFiles(),
      // Never fall back to whatever is installed on the build machine — that is
      // how a poster ends up set in Times New Roman.
      loadSystemFonts: false,
      defaultFontFamily: 'Space Grotesk',
    },
  });

  return Buffer.from(resvg.render().asPng());
}
