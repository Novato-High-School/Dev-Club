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
 * The QR block: white card, code, and the line that tells people why to scan.
 *
 * The code points at "?boot", which always opens the terminal challenge. So
 * the invitation is to break into the club, not to read a website — a much
 * better reason to get a phone out while walking past a table. The terminal
 * has a Skip button, which the caption says, so nobody feels trapped.
 *
 * The caption sits above the code on a tall banner and beside it on a wide
 * one, because that is where the room is.
 */
async function qrBlock(
  qr: { path: string; size: number },
  options: {
    /** Left edge of the code itself. */
    x: number;
    /** Top edge of the code itself. */
    y: number;
    /** Width and height of the code. */
    side: number;
    captionSize: number;
    lines: [string, string];
    placement: 'above' | 'left';
    /** Gap between caption and code. */
    gap: number;
  },
): Promise<string> {
  const { x, y, side, captionSize, lines, placement, gap } = options;
  const pad = side * 0.08;

  const caption =
    placement === 'above'
      ? await Promise.all([
          outline(lines[0], COLOR.bone, {
            x: x + side / 2, y: y - gap - captionSize * 0.85,
            size: captionSize, family: 'display', weight: 700, anchor: 'middle',
          }),
          outline(lines[1], COLOR.muted, {
            x: x + side / 2, y: y - gap + captionSize * 0.3,
            size: captionSize * 0.66, family: 'mono', anchor: 'middle',
          }),
        ])
      : await Promise.all([
          outline(lines[0], COLOR.bone, {
            x: x - gap, y: y + side * 0.45,
            size: captionSize, family: 'display', weight: 700, anchor: 'end',
          }),
          outline(lines[1], COLOR.muted, {
            x: x - gap, y: y + side * 0.72,
            size: captionSize * 0.62, family: 'mono', anchor: 'end',
          }),
        ]);

  return `${caption.join('')}
  <g transform="translate(${x} ${y})">
    <rect x="${-pad}" y="${-pad}" width="${side + pad * 2}" height="${side + pad * 2}" fill="${COLOR.bone}" rx="${pad * 0.6}"/>
    <g transform="scale(${side / qr.size})" fill="${COLOR.ink}" shape-rendering="crispEdges">
      <path d="${qr.path}"/>
    </g>
  </g>`;
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
  // A wide banner wants its content in a row, not a tall one squashed. The two
  // shapes get genuinely different layouts rather than one being stretched.
  return inchesWide > inchesTall
    ? landscapeSVG(inchesWide, inchesTall, qr)
    : portraitSVG(inchesWide, inchesTall, qr);
}

/**
 * THE LANDSCAPE BANNER — wide and short. For a table front, a wall, or hanging
 * above a booth.
 *
 * The identity stacks in the middle, the topics run along one row, and the
 * meeting details and the QR code sit side by side underneath.
 */
async function landscapeSVG(
  inchesWide: number,
  inchesTall: number,
  qr: { path: string; size: number },
): Promise<string> {
  const UNITS_PER_INCH = 50;
  const W = inchesWide * UNITS_PER_INCH;
  const H = inchesTall * UNITS_PER_INCH;
  const mid = W / 2;

  const topics = TOPICS;
  const logoSize = H * 0.095;
  // Spread the logos evenly across the middle 88% of the width.
  const first = W * 0.06;
  const span = W * 0.88;
  const step = span / topics.length;
  const topicsCy = H * 0.545;

  // The bottom band: meeting details on the left, QR on the right. Both start
  // below the topic labels, which is what the previous version got wrong.
  const bandTop = H * 0.7;
  const boxLeft = W * 0.06;
  const boxWidth = W * 0.38;
  const boxHeight = H * 0.22;

  const qrSide = H * 0.22;
  const qrX = W * 0.94 - qrSide;

  const heading = await Promise.all([
    outline('$ ./join.sh', COLOR.muted, {
      x: mid, y: H * 0.115, size: H * 0.045, family: 'mono', anchor: 'middle',
    }),
    outlineText(
      [
        { text: 'while', fill: COLOR.gold },
        { text: ' { ', fill: COLOR.muted },
        { text: 'Dev Club', fill: COLOR.bone },
        { text: ' }', fill: COLOR.muted },
      ],
      { x: mid, y: H * 0.28, size: H * 0.14, family: 'mono', weight: 700, anchor: 'middle' },
    ),
    outline('Build real things. Publish them in the open.', COLOR.bone, {
      x: mid, y: H * 0.375, size: H * 0.05, family: 'display', weight: 700, anchor: 'middle',
    }),
    outline('No experience needed.', COLOR.gold, {
      x: mid, y: H * 0.44, size: H * 0.045, family: 'display', anchor: 'middle',
    }),
  ]);

  // Logo above label, centred in each slot — a row is too tight for the
  // side-by-side arrangement the portrait version uses.
  const topicMarks = await Promise.all(
    topics.map(async (topic, i) => {
      const cx = first + step * (i + 0.5);
      const cy = topicsCy;
      const labelSize = logoSize * 0.44;
      const label = await outline(topic.label, COLOR.muted, {
        x: cx, y: cy + logoSize * 0.95, size: labelSize, family: 'mono', anchor: 'middle',
      });
      return `${logo(topic.icon, cx, cy, logoSize, COLOR.bone)}${label}`;
    }),
  );

  const meeting = await Promise.all([
    outline(CLUB.meetingDay, COLOR.gold, {
      x: boxLeft + boxWidth / 2, y: bandTop + boxHeight * 0.45,
      size: H * 0.08, family: 'mono', weight: 700, anchor: 'middle',
    }),
    outline(`Lunch \u00b7 Room ${CLUB.meetingRoom}`, COLOR.bone, {
      x: boxLeft + boxWidth / 2, y: bandTop + boxHeight * 0.8,
      size: H * 0.055, family: 'mono', anchor: 'middle',
    }),
    outline(`${SITE_URL.replace('https://', '')}${BASE_PATH}`, COLOR.muted, {
      x: mid, y: H * 0.965, size: H * 0.035, family: 'mono', anchor: 'middle',
    }),
  ]);

  const qrArt = await qrBlock(qr, {
    x: qrX,
    y: bandTop,
    side: qrSide,
    captionSize: H * 0.055,
    lines: ['Scan to break in', '14 hidden commands'],
    placement: 'left',
    gap: W * 0.015,
  });

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${inchesWide}in" height="${inchesTall}in"
     viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLOR.ink}"/>
  ${honeycomb(W, H, H / 7, 0.13)}

  <rect x="0" y="0" width="${W}" height="${H * 0.022}" fill="${COLOR.gold}"/>
  <rect x="0" y="${H - H * 0.022}" width="${W}" height="${H * 0.022}" fill="${COLOR.gold}"/>

  ${heading.join('\n  ')}
  ${topicMarks.join('\n  ')}

  <rect x="${boxLeft}" y="${bandTop}" width="${boxWidth}" height="${boxHeight}" rx="${H * 0.03}" fill="${COLOR.surface}" stroke="${COLOR.edge}" stroke-width="${H * 0.006}"/>
  ${meeting.join('\n  ')}

  ${qrArt}
</svg>`;
}

/**
 * THE PORTRAIT BANNER — tall and narrow, for the club fair.
 */
async function portraitSVG(
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
  const qrSide = H * 0.1;

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
    outline(`${SITE_URL.replace('https://', '')}${BASE_PATH}`, COLOR.muted, {
      x: mid, y: H * 0.975, size: W * 0.033, family: 'mono', anchor: 'middle',
    }),
  ]);

  const qrArt = await qrBlock(qr, {
    x: mid - qrSide / 2,
    y: H * 0.845,
    side: qrSide,
    captionSize: W * 0.045,
    lines: ['Scan to break in', '14 hidden commands. Skip anytime.'],
    placement: 'above',
    gap: H * 0.015,
  });

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

  ${qrArt}

  ${footer.join('\n  ')}
</svg>`;
}

// Kept for the page titles that use it.
export { SITE_NAME };
