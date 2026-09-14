/**
 * BRAND ASSETS — raster
 * =====================
 * The same artwork flattened to PNG, for anywhere that will not take an SVG —
 * Google Forms and Discord both want a bitmap, and school printers are
 * happier with one.
 *
 * Screen assets render at their exact pixel size. Paper assets render at 200
 * dots per inch, which is plenty for a copier and keeps the file sane.
 */

import type { APIRoute } from 'astro';

import { svgToPng } from '../../lib/render-png';
import { BRAND_ASSETS } from '../../config/site';
import { renderBrandAsset } from './[id].svg';

const PRINT_DPI = 200;

export function getStaticPaths() {
  return BRAND_ASSETS.map((asset) => ({ params: { id: asset.id }, props: { asset } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { asset } = props as { asset: (typeof BRAND_ASSETS)[number] };

  // Pixels are already pixels; inches need scaling up to print resolution.
  const width = asset.unit === 'px' ? asset.width : asset.width * PRINT_DPI;
  const png = await svgToPng(await renderBrandAsset(asset), Math.round(width));

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
