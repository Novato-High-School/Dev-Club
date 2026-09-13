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
 * The family names as they are recorded INSIDE the font files, which is what a
 * renderer matches on — not the friendlier names the CSS uses. Space Grotesk
 * genuinely calls itself "Space Grotesk Light" in its name table, odd as that
 * looks. Get these wrong and the text silently renders in a fallback face.
 */
const FONT_DISPLAY = 'Space Grotesk Light';
const FONT_MONO = 'JetBrains Mono';

/** Escapes text so a stray & or < cannot break the SVG. */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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

/** The `while { Dev Club }` wordmark, drawn as text at a given size. */
function wordmark(x: number, y: number, size: number, anchor = 'start'): string {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT_MONO}" font-size="${size}" font-weight="700">
    <tspan fill="${COLOR.gold}">while</tspan><tspan fill="${COLOR.muted}"> { </tspan><tspan fill="${COLOR.bone}">Dev Club</tspan><tspan fill="${COLOR.muted}"> }</tspan>
  </text>`;
}

/**
 * THE LINK PREVIEW IMAGE — 1200×630, the size every chat app expects.
 */
export function ogImageSVG(): string {
  const W = 1200;
  const H = 630;
  const topics = TOPICS.slice(0, 6);
  const gap = W / (topics.length + 1);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLOR.ink}"/>
  ${honeycomb(W, H, 46, 0.1)}

  <!-- A gold rule along the top, echoing the site's accent. -->
  <rect x="0" y="0" width="${W}" height="8" fill="${COLOR.gold}"/>

  <text x="80" y="150" font-family="${FONT_MONO}" font-size="26" fill="${COLOR.muted}">$ whoami</text>
  ${wordmark(80, 250, 68)}

  <text x="80" y="320" font-family="${FONT_DISPLAY}" font-size="30" fill="${COLOR.bone}">
    The student developer club at Novato High School
  </text>
  <text x="80" y="368" font-family="${FONT_DISPLAY}" font-size="26" fill="${COLOR.muted}">
    No experience needed. We build real things, in the open.
  </text>

  <!-- What we cover. -->
  <g>
    ${topics
      .map((topic, i) => {
        const cx = gap * (i + 1);
        return `${logo(topic.icon, cx, 490, 52, COLOR.muted)}
        <text x="${cx}" y="552" text-anchor="middle" font-family="${FONT_MONO}" font-size="18" fill="${COLOR.muted}">${esc(topic.label)}</text>`;
      })
      .join('\n    ')}
  </g>

  <rect x="0" y="${H - 4}" width="${W}" height="4" fill="${COLOR.edge}"/>
</svg>`;
}

/**
 * THE PRINTED BANNER — tall and narrow, for the club fair.
 *
 * Laid out at 50 units per inch, so a font-size of 100 really is two inches
 * tall on the finished print. Everything is sized for reading from across a
 * quad, not from a desk.
 */
export function posterSVG(
  inchesWide: number,
  inchesTall: number,
  qr: { path: string; size: number },
): string {
  const UNITS_PER_INCH = 50;
  const W = inchesWide * UNITS_PER_INCH;
  const H = inchesTall * UNITS_PER_INCH;
  const mid = W / 2;

  const topics = TOPICS;
  // Two columns, so the labels stay large enough to read from a distance.
  const columns = 2;
  const rows = Math.ceil(topics.length / columns);
  const topicTop = H * 0.47;
  const rowHeight = H * 0.062;
  const logoSize = rowHeight * 0.68;

  // Each column is a logo and its label, treated as one block and centred.
  const columnCentres = [W * 0.29, W * 0.71];

  const infoTop = topicTop + rows * rowHeight + H * 0.02;
  const qrScale = (H * 0.105) / qr.size;

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${inchesWide}in" height="${inchesTall}in"
     viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLOR.ink}"/>
  ${honeycomb(W, H, W / 10, 0.13)}

  <!-- Gold bands top and bottom, so it reads as ours from across a quad. -->
  <rect x="0" y="0" width="${W}" height="${H * 0.014}" fill="${COLOR.gold}"/>
  <rect x="0" y="${H - H * 0.014}" width="${W}" height="${H * 0.014}" fill="${COLOR.gold}"/>

  <!-- IDENTITY -->
  <text x="${mid}" y="${H * 0.095}" text-anchor="middle" font-family="${FONT_MONO}" font-size="${W * 0.042}" fill="${COLOR.muted}">$ ./join.sh</text>

  <text x="${mid}" y="${H * 0.17}" text-anchor="middle" font-family="${FONT_MONO}" font-size="${W * 0.135}" font-weight="700" fill="${COLOR.gold}">while</text>
  <text x="${mid}" y="${H * 0.247}" text-anchor="middle" font-family="${FONT_MONO}" font-size="${W * 0.115}" font-weight="700">
    <tspan fill="${COLOR.muted}">{ </tspan><tspan fill="${COLOR.bone}">Dev Club</tspan><tspan fill="${COLOR.muted}"> }</tspan>
  </text>

  <!-- THE PITCH -->
  <text x="${mid}" y="${H * 0.32}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="${W * 0.058}" font-weight="700" fill="${COLOR.bone}">Build real things.</text>
  <text x="${mid}" y="${H * 0.368}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="${W * 0.058}" font-weight="700" fill="${COLOR.bone}">Publish them in the open.</text>
  <text x="${mid}" y="${H * 0.425}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="${W * 0.05}" fill="${COLOR.gold}">No experience needed.</text>

  <!-- WHAT WE COVER -->
  <g>
    ${topics
      .map((topic, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const centre = columnCentres[col];
        const cy = topicTop + row * rowHeight;
        const labelSize = logoSize * 0.64;
        // Rough width of the label, so logo + text sit centred together.
        const labelWidth = topic.label.length * labelSize * 0.6;
        const blockWidth = logoSize + logoSize * 0.45 + labelWidth;
        const logoCx = centre - blockWidth / 2 + logoSize / 2;
        const textX = logoCx + logoSize / 2 + logoSize * 0.45;
        return `${logo(topic.icon, logoCx, cy, logoSize, COLOR.bone)}
    <text x="${textX}" y="${cy + labelSize * 0.35}" font-family="${FONT_MONO}" font-size="${labelSize}" fill="${COLOR.muted}">${esc(topic.label)}</text>`;
      })
      .join('\n    ')}
  </g>

  <!-- WHEN AND WHERE -->
  <rect x="${W * 0.08}" y="${infoTop}" width="${W * 0.84}" height="${H * 0.115}" rx="${W * 0.02}" fill="${COLOR.surface}" stroke="${COLOR.edge}" stroke-width="${W * 0.004}"/>
  <text x="${mid}" y="${infoTop + H * 0.048}" text-anchor="middle" font-family="${FONT_MONO}" font-size="${W * 0.065}" font-weight="700" fill="${COLOR.gold}">${esc(CLUB.meetingDay)}</text>
  <text x="${mid}" y="${infoTop + H * 0.09}" text-anchor="middle" font-family="${FONT_MONO}" font-size="${W * 0.048}" fill="${COLOR.bone}">Lunch &#183; Room ${esc(CLUB.meetingRoom)}</text>

  <!-- QR CODE, because nobody types a URL off a banner -->
  <text x="${mid}" y="${H * 0.815}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="${W * 0.042}" fill="${COLOR.muted}">Scan to see what we build</text>
  <g transform="translate(${mid - (H * 0.105) / 2} ${H * 0.835})">
    <rect x="${-H * 0.008}" y="${-H * 0.008}" width="${H * 0.105 + H * 0.016}" height="${H * 0.105 + H * 0.016}" fill="${COLOR.bone}" rx="${H * 0.004}"/>
    <g transform="scale(${qrScale})" fill="${COLOR.ink}" shape-rendering="crispEdges">
      <path d="${qr.path}"/>
    </g>
  </g>
  <text x="${mid}" y="${H * 0.975}" text-anchor="middle" font-family="${FONT_MONO}" font-size="${W * 0.033}" fill="${COLOR.muted}">${esc(SITE_URL.replace('https://', ''))}${esc(BASE_PATH)}</text>
</svg>`;
}

// Kept for the page titles that use it.
export { SITE_NAME };
