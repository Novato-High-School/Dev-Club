/**
 * BRAND ASSETS — vector
 * =====================
 * One file per entry in BRAND_ASSETS, e.g. /Dev-Club/brand/letterhead.svg
 *
 * All of them come from the same palette and fonts as the website, and all
 * their lettering is converted to outlines, so a file can be handed to a print
 * shop or opened on a school computer and still look right.
 */

import type { APIRoute } from 'astro';

import {
  formBannerSVG,
  letterheadSVG,
  flyerSVG,
  avatarSVG,
  slideTitleSVG,
  slideContentSVG,
  signatureSVG,
} from '../../lib/banner';
import { BRAND_ASSETS } from '../../config/site';
import { qrCode } from '../banner/[id].svg';

export function getStaticPaths() {
  return BRAND_ASSETS.map((asset) => ({ params: { id: asset.id }, props: { asset } }));
}

/** Builds whichever asset this is. */
export async function renderBrandAsset(
  asset: (typeof BRAND_ASSETS)[number],
): Promise<string> {
  switch (asset.kind) {
    case 'form-banner':
      return formBannerSVG(asset.width, asset.height, asset.theme);
    case 'letterhead':
      return letterheadSVG(asset.width, asset.height, asset.theme);
    case 'flyer':
      return flyerSVG(asset.width, asset.height, asset.theme, await qrCode());
    case 'avatar':
      return avatarSVG(asset.width, asset.theme);
    case 'slide-title':
      return slideTitleSVG(asset.width, asset.height, asset.theme);
    case 'slide-content':
      return slideContentSVG(asset.width, asset.height, asset.theme);
    case 'signature':
      return signatureSVG(asset.width, asset.height, asset.theme);
  }
}

export const GET: APIRoute = async ({ props }) => {
  const { asset } = props as { asset: (typeof BRAND_ASSETS)[number] };

  return new Response(await renderBrandAsset(asset), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
