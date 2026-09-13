/**
 * THE PRINTED BANNER — vector
 * ===========================
 * One file per size listed in BANNER_SIZES, e.g. /Dev-Club/banner/2x4.svg
 *
 * SVG is what you want to send a print shop: it is vector, so it stays razor
 * sharp at four feet tall, and the file is a few kilobytes. Most shops accept
 * SVG or PDF directly; if yours insists on a raster file, there is a .png at
 * the same address.
 */

import type { APIRoute } from 'astro';
import QRCode from 'qrcode';

import { posterSVG } from '../../lib/banner';
import { BANNER_SIZES, SITE_URL } from '../../config/site';
import { href } from '../../lib/href';

export function getStaticPaths() {
  return BANNER_SIZES.map((size) => ({ params: { id: size.id }, props: { size } }));
}

/**
 * Builds the QR code as one SVG path, drawn on a grid of 1×1 squares.
 *
 * We read the raw module matrix rather than asking the library for SVG,
 * because that gives us a known grid size to scale against. Getting this wrong
 * produces a QR code that looks almost right and does not scan, which is worse
 * than no QR code at all.
 */
export async function qrCode(): Promise<{ path: string; size: number }> {
  const qr = QRCode.create(`${SITE_URL}${href('/')}`, {
    // 'M' survives roughly 15% of the code being damaged or obscured, which is
    // about right for something printed and stood outdoors.
    errorCorrectionLevel: 'M',
  });

  const size = qr.modules.size;
  const squares: string[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr.modules.get(x, y)) squares.push(`M${x} ${y}h1v1h-1z`);
    }
  }

  return { path: squares.join(''), size };
}

export const GET: APIRoute = async ({ props }) => {
  const { size } = props as { size: (typeof BANNER_SIZES)[number] };

  const svg = posterSVG(size.inchesWide, size.inchesTall, await qrCode());

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
