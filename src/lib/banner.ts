/**
 * THE CLUB BANNER
 * ===============
 * Draws the club's artwork as SVG, from the same colours and fonts the website
 * uses. One function produces every size we need:
 *
 *   - the link-preview image, so pasting the site into Remind or Discord shows
 *     a proper card instead of nothing
 *   - the tall printed banners for the club fair
 *
 * Because it is SVG it is vector art: the same file prints crisply at four feet
 * tall and shrinks to a thumbnail without going fuzzy.
 *
 * TO ADD A TOPIC LOGO, edit TOPICS in src/config/site.ts. Nothing here needs
 * changing — the layout spaces itself out for however many there are.
 */

import iconData from '@iconify-json/simple-icons/icons.json';

import { TOPICS, CLUB, SITE_URL, SITE_NAME, BASE } from '../config/site';
import { outline, outlineText, textWidth } from './fonts';

/** The folder the site lives in, shown on the printed URL. */
const BASE_PATH = (BASE as string) === '/' ? '' : BASE;

/** The palette, matching src/styles/global.css exactly. */
const COLOR = {
  ink: '#0b0c0e',
  surface: '#141619',
  edge: '#24272c',
  bone: '#e8e9ec',
  muted: '#9aa0a8',
  gold: '#ffc400',
  cyan: '#22d3ee',
} as const;

/**
 * Every word in this artwork is drawn as outlines rather than as text with a
 * font name attached — see src/lib/fonts.ts for why. It means these files can
 * be handed to a print shop, or opened anywhere, and still look right.
 */

/**
 * Looks up one brand logo and returns its path data.
 * Simple Icons draws everything on a 24×24 grid, single path, no colour.
 */
function logoPath(name: string): string {
  const icons = (iconData as { icons: Record<string, { body: string }> }).icons;
  const icon = icons[name];
  if (!icon) {
    throw new Error(
      `No Simple Icons logo called "${name}". Check the spelling at simpleicons.org — ` +
        `they are lowercase with no dots, so Node.js is "nodedotjs".`,
    );
  }
  // The body is markup like <path d="..."/>; we want just the d attribute.
  return icon.body.match(/ d="([^"]+)"/)?.[1] ?? '';
}

/** One logo, scaled from its 24×24 grid and centred on (cx, cy). */
function logo(name: string, cx: number, cy: number, size: number, fill: string): string {
  const scale = size / 24;
  const x = cx - size / 2;
  const y = cy - size / 2;
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="${logoPath(name)}" fill="${fill}"/></g>`;
}

/**
 * The honeycomb background, same geometry as the website's HexGrid: rows sit
 * 1.5 × the side length apart and every other row shifts half a hexagon
 * sideways. Stack them any other way and they stop interlocking.
 */
function honeycomb(width: number, height: number, side: number, opacity: number): string {
  const hexWidth = side * Math.sqrt(3);
  const rowPitch = side * 1.5;
  const half = hexWidth / 2;

  const hex = (cx: number, cy: number) =>
    `M${cx} ${cy - side} L${cx + half} ${cy - side / 2} L${cx + half} ${cy + side / 2} ` +
    `L${cx} ${cy + side} L${cx - half} ${cy + side / 2} L${cx - half} ${cy - side / 2} Z`;

  const cells: string[] = [];
  for (let row = -1; cy(row) < height + side; row++) {
    const offset = row % 2 === 0 ? 0 : half;
    for (let x = -hexWidth; x < width + hexWidth; x += hexWidth) {
      cells.push(hex(x + offset, cy(row)));
    }
  }
  function cy(row: number) {
    return row * rowPitch;
  }

  return `<g opacity="${opacity}" fill="none" stroke="${COLOR.gold}" stroke-width="${Math.max(1, side / 26)}">
    <path d="${cells.join(' ')}"/>
  </g>`;
}

/** The `while { Dev Club }` wordmark, drawn as outlines. */
async function wordmark(
  x: number,
  y: number,
  size: number,
  anchor: 'start' | 'middle' = 'start',
): Promise<string> {
  return outlineText(
    [
      { text: 'while', fill: COLOR.gold },
      { text: ' { ', fill: COLOR.muted },
      { text: 'Dev Club', fill: COLOR.bone },
      { text: ' }', fill: COLOR.muted },
    ],
    { x, y, size, family: 'mono', weight: 700, anchor },
  );
}

/**
 * THE LINK PREVIEW IMAGE — 1200×630, the size every chat app expects.
 */
export async function ogImageSVG(): Promise<string> {
  const W = 1200;
  const H = 630;
  const topics = TOPICS.slice(0, 6);
  const gap = W / (topics.length + 1);

  const parts = await Promise.all([
    outline('$ whoami', COLOR.muted, { x: 80, y: 150, size: 26, family: 'mono' }),
    wordmark(80, 250, 68),
    outline('The student developer club at Novato High School', COLOR.bone, {
      x: 80,
      y: 320,
      size: 30,
      family: 'display',
    }),
    outline('No experience needed. We build real things, in the open.', COLOR.muted, {
      x: 80,
      y: 368,
      size: 26,
      family: 'display',
    }),
  ]);

  const topicMarks = await Promise.all(
    topics.map(async (topic, i) => {
      const cx = gap * (i + 1);
      const label = await outline(topic.label, COLOR.muted, {
        x: cx,
        y: 552,
        size: 18,
        family: 'mono',
        anchor: 'middle',
      });
      return `${logo(topic.icon, cx, 490, 52, COLOR.muted)}${label}`;
    }),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLOR.ink}"/>
  ${honeycomb(W, H, 46, 0.1)}
  <rect x="0" y="0" width="${W}" height="8" fill="${COLOR.gold}"/>
  ${parts.join('\n  ')}
  ${topicMarks.join('\n  ')}
  <rect x="0" y="${H - 4}" width="${W}" height="4" fill="${COLOR.edge}"/>
</svg>`;
}

/**
 * THE PRINTED BANNER — tall and narrow, for the club fair.
 *
 * Laid out at 50 units per inch, so a font size of 100 really is two inches
 * tall on the finished print. Sized for reading from across a quad.
 */
export async function posterSVG(
  inchesWide: number,
  inchesTall: number,
  qr: { path: string; size: number },
): Promise<string> {
  const UNITS_PER_INCH = 50;
  const W = inchesWide * UNITS_PER_INCH;
  const H = inchesTall * UNITS_PER_INCH;
  const mid = W / 2;

  const topics = TOPICS;
  const columns = 2;
  const rows = Math.ceil(topics.length / columns);
  const topicTop = H * 0.47;
  const rowHeight = H * 0.062;
  const logoSize = rowHeight * 0.68;
  const columnCentres = [W * 0.29, W * 0.71];

  const infoTop = topicTop + rows * rowHeight + H * 0.02;
  const qrSide = H * 0.105;
  const qrScale = qrSide / qr.size;

  const heading = await Promise.all([
    outline('$ ./join.sh', COLOR.muted, {
      x: mid, y: H * 0.095, size: W * 0.042, family: 'mono', anchor: 'middle',
    }),
    outline('while', COLOR.gold, {
      x: mid, y: H * 0.17, size: W * 0.135, family: 'mono', weight: 700, anchor: 'middle',
    }),
    outlineText(
      [
        { text: '{ ', fill: COLOR.muted },
        { text: 'Dev Club', fill: COLOR.bone },
        { text: ' }', fill: COLOR.muted },
      ],
      { x: mid, y: H * 0.247, size: W * 0.115, family: 'mono', weight: 700, anchor: 'middle' },
    ),
    outline('Build real things.', COLOR.bone, {
      x: mid, y: H * 0.32, size: W * 0.058, family: 'display', weight: 700, anchor: 'middle',
    }),
    outline('Publish them in the open.', COLOR.bone, {
      x: mid, y: H * 0.368, size: W * 0.058, family: 'display', weight: 700, anchor: 'middle',
    }),
    outline('No experience needed.', COLOR.gold, {
      x: mid, y: H * 0.425, size: W * 0.05, family: 'display', anchor: 'middle',
    }),
  ]);

  // Each topic is a logo and a label, measured together so the pair sits
  // centred in its column rather than the logo hanging off to one side.
  const topicMarks = await Promise.all(
    topics.map(async (topic, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const centre = columnCentres[col];
      const cy = topicTop + row * rowHeight;
      const labelSize = logoSize * 0.64;
      const gap = logoSize * 0.45;

      const width = await textWidth(topic.label, labelSize, 'mono');
      const blockWidth = logoSize + gap + width;
      const logoCx = centre - blockWidth / 2 + logoSize / 2;
      const textX = logoCx + logoSize / 2 + gap;

      const label = await outline(topic.label, COLOR.muted, {
        x: textX, y: cy + labelSize * 0.35, size: labelSize, family: 'mono',
      });
      return `${logo(topic.icon, logoCx, cy, logoSize, COLOR.bone)}${label}`;
    }),
  );

  const footer = await Promise.all([
    outline(CLUB.meetingDay, COLOR.gold, {
      x: mid, y: infoTop + H * 0.048, size: W * 0.065, family: 'mono', weight: 700, anchor: 'middle',
    }),
    outline(`Lunch \u00b7 Room ${CLUB.meetingRoom}`, COLOR.bone, {
      x: mid, y: infoTop + H * 0.09, size: W * 0.048, family: 'mono', anchor: 'middle',
    }),
    outline('Scan to see what we build', COLOR.muted, {
      x: mid, y: H * 0.815, size: W * 0.042, family: 'display', anchor: 'middle',
    }),
    outline(`${SITE_URL.replace('https://', '')}${BASE_PATH}`, COLOR.muted, {
      x: mid, y: H * 0.975, size: W * 0.033, family: 'mono', anchor: 'middle',
    }),
  ]);

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${inchesWide}in" height="${inchesTall}in"
     viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLOR.ink}"/>
  ${honeycomb(W, H, W / 10, 0.13)}

  <rect x="0" y="0" width="${W}" height="${H * 0.014}" fill="${COLOR.gold}"/>
  <rect x="0" y="${H - H * 0.014}" width="${W}" height="${H * 0.014}" fill="${COLOR.gold}"/>

  ${heading.join('\n  ')}
  ${topicMarks.join('\n  ')}

  <rect x="${W * 0.08}" y="${infoTop}" width="${W * 0.84}" height="${H * 0.115}" rx="${W * 0.02}" fill="${COLOR.surface}" stroke="${COLOR.edge}" stroke-width="${W * 0.004}"/>

  <g transform="translate(${mid - qrSide / 2} ${H * 0.835})">
    <rect x="${-H * 0.008}" y="${-H * 0.008}" width="${qrSide + H * 0.016}" height="${qrSide + H * 0.016}" fill="${COLOR.bone}" rx="${H * 0.004}"/>
    <g transform="scale(${qrScale})" fill="${COLOR.ink}" shape-rendering="crispEdges">
      <path d="${qr.path}"/>
    </g>
  </g>

  ${footer.join('\n  ')}
</svg>`;
}

// Kept for the page titles that use it.
export { SITE_NAME };
