/**
 * THE LINK PREVIEW IMAGE
 * ======================
 * Lives at /Dev-Club/og.png and is what appears when somebody pastes a link to
 * the site into Remind, Discord, Slack or a text message.
 *
 * Built from the same SVG as everything else, so it cannot drift away from the
 * rest of the club's artwork.
 */

import type { APIRoute } from 'astro';

import { ogImageSVG } from '../lib/banner';
import { svgToPng } from '../lib/render-png';

export const GET: APIRoute = async () => {
  // 1200x630 is the size every chat app and social network expects.
  const png = await svgToPng(await ogImageSVG(), 1200);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
