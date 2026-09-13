/**
 * THE PRINTED BANNER — raster
 * ===========================
 * The same artwork as the .svg, flattened to a PNG for print shops that will
 * not take vector files.
 *
 * Rendered at 150 dots per inch, which is the usual standard for something
 * this size: a 4ft banner is read from several feet away, so pushing to 300dpi
 * would quadruple the file for detail nobody can see.
 */

import type { APIRoute } from 'astro';

import { posterSVG } from '../../lib/banner';
import { svgToPng } from '../../lib/render-png';
import { BANNER_SIZES } from '../../config/site';
import { qrCode } from './[id].svg';

const DOTS_PER_INCH = 150;

export function getStaticPaths() {
  return BANNER_SIZES.map((size) => ({ params: { id: size.id }, props: { size } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { size } = props as { size: (typeof BANNER_SIZES)[number] };

  const svg = posterSVG(size.inchesWide, size.inchesTall, await qrCode());
  const png = await svgToPng(svg, size.inchesWide * DOTS_PER_INCH);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
