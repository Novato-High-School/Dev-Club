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

import { TOPICS, CLUB, SITE_NAME, SITE_URL_DISPLAY } from '../config/site';
import { outline, outlineText, textWidth, fitSize } from './fonts';

/**
 * THE PALETTES
 * ============
 * `dark` matches src/styles/global.css exactly — it is the website's palette.
 *
 * `light` is the same identity inverted for paper. Two things change beyond
 * the obvious swap:
 *
 *  - `gold` stays bright, because as a rule or a block of colour it still
 *    reads as ours on white.
 *  - `goldInk` is a much darker gold, used wherever gold would be TEXT.
 *    #ffc400 on white is about 1.7:1 contrast — legible on a screen for a
 *    heading, illegible photocopied. The dark gold clears 5:1 and still looks
 *    like the same brand.
 */
export type Theme = 'dark' | 'light';

const PALETTES = {
  dark: {
    ink: '#0b0c0e',
    surface: '#141619',
    edge: '#24272c',
    bone: '#e8e9ec',
    muted: '#9aa0a8',
    gold: '#ffc400',
    goldInk: '#ffc400',
    cyan: '#22d3ee',
  },
  light: {
    ink: '#ffffff',
    surface: '#f5f4f1',
    edge: '#d9d7d2',
    bone: '#0b0c0e',
    muted: '#565b62',
    gold: '#ffc400',
    goldInk: '#7a5c00',
    cyan: '#0e6d80',
  },
} as const;

/** The website's palette, used by everything that is not print. */
const COLOR = PALETTES.dark;

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
function honeycomb(
  width: number,
  height: number,
  side: number,
  opacity: number,
  stroke: string = COLOR.gold,
): string {
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

  return `<g opacity="${opacity}" fill="none" stroke="${stroke}" stroke-width="${Math.max(1, side / 26)}">
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
    outline('No experience needed. We build real things for real users.', COLOR.muted, {
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
    /** Optional ceiling on how wide the caption may be. */
    captionMaxWidth?: number;
    /** One or two lines. One is plenty when the code sits beside it. */
    lines: string[];
    placement: 'above' | 'left';
    /** Gap between caption and code. */
    gap: number;
    /**
     * Colours, for the light paper versions. The CARD stays pale and the
     * modules stay dark whatever the theme — a QR code inverted does not
     * reliably scan, so this is the one thing that never flips.
     */
    colours?: { caption: string; sub: string; card: string; code: string; cardEdge?: string };
  },
): Promise<string> {
  const { x, y, side, captionSize, captionMaxWidth, lines, placement, gap } = options;
  const colours = options.colours ?? {
    caption: COLOR.bone,
    sub: COLOR.muted,
    card: COLOR.bone,
    code: COLOR.ink,
  };
  const pad = side * 0.08;

  // The second line, when there is one, is usually the longer of the two, so
  // it gets its own fitting.
  const subSize =
    lines[1] && captionMaxWidth
      ? Math.min(captionSize * 0.66, await fitSize(lines[1], captionMaxWidth, 'mono'))
      : captionSize * 0.66;

  // Stack upwards from the top of the white card, not from the code itself —
  // the card's padding is what the second line was landing on top of.
  const cardTop = y - pad;
  const subBaseline = cardTop - gap * 0.5;
  const mainBaseline = subBaseline - subSize * 1.5;

  const hasSub = Boolean(lines[1]);

  const caption =
    placement === 'above'
      ? await Promise.all(
          [
            outline(lines[0], colours.caption, {
              x: x + side / 2,
              // With no second line the heading drops to where it would be.
              y: hasSub ? mainBaseline : subBaseline,
              size: captionSize, family: 'display', weight: 700, anchor: 'middle',
            }),
            hasSub
              ? outline(lines[1], colours.sub, {
                  x: x + side / 2, y: subBaseline,
                  size: subSize, family: 'mono', anchor: 'middle',
                })
              : Promise.resolve(''),
          ],
        )
      : await Promise.all(
          [
            outline(lines[0], colours.caption, {
              x: x - gap,
              // A single line sits centred on the code beside it.
              y: y + side * (hasSub ? 0.45 : 0.58),
              size: captionSize, family: 'display', weight: 700, anchor: 'end',
            }),
            hasSub
              ? outline(lines[1], colours.sub, {
                  x: x - gap, y: y + side * 0.72,
                  size: subSize, family: 'mono', anchor: 'end',
                })
              : Promise.resolve(''),
          ],
        );

  return `${caption.join('')}
  <g transform="translate(${x} ${y})">
    <rect x="${-pad}" y="${-pad}" width="${side + pad * 2}" height="${side + pad * 2}" fill="${colours.card}" rx="${pad * 0.6}"${colours.cardEdge ? ` stroke="${colours.cardEdge}" stroke-width="${pad * 0.2}"` : ''}/>
    <g transform="scale(${side / qr.size})" fill="${colours.code}" shape-rendering="crispEdges">
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
 * The club name runs across the full width on one line, which is the whole
 * point of a wide banner: it is legible from much further away than two
 * stacked lines would be. Everything else defers to it — the topic logos are
 * small along the bottom, and the QR sits low in the corner.
 *
 * Deliberately NO meeting time or room. A printed banner outlives a room
 * assignment, and one advertising the wrong room is worse than one that sends
 * people to the site to find out.
 */
async function landscapeSVG(
  inchesWide: number,
  inchesTall: number,
  qr: { path: string; size: number },
): Promise<string> {
  const UNITS_PER_INCH = 50;
  const W = inchesWide * UNITS_PER_INCH;
  const H = inchesTall * UNITS_PER_INCH;

  const margin = W * 0.05;
  const contentWidth = W - margin * 2;

  /**
   * The name fills the width, measured rather than guessed.
   *
   * A size picked as a fraction of the canvas fits one banner shape and
   * overflows the other — 4x2 and 3x1.6 are not the same proportion. Measuring
   * the real font metrics means the line is always as large as it can be and
   * never wider than the banner.
   */
  const titleSize = Math.min(
    await fitSize('while { Dev Club }', contentWidth, 'mono', 700),
    H * 0.3,
  );

  // Bottom band: logos on the left, QR low in the right corner.
  const qrSide = H * 0.22;
  const qrX = W - margin - qrSide;
  const qrY = H * 0.72;

  const logosEnd = W * 0.6;
  const logoSize = H * 0.075;
  const step = (logosEnd - margin) / TOPICS.length;

  /**
   * Size the labels so the longest one fits its slot.
   *
   * "JavaScript" is more than twice the width of "Bots", so a size that suits
   * the short ones runs the long ones into their neighbours. Measuring the
   * widest and working backwards is the only way this stays correct when
   * somebody adds a topic with a long name.
   */
  const widestLabel = Math.max(
    ...(await Promise.all(TOPICS.map((t) => textWidth(t.label, 100, 'mono')))),
  );
  const labelSize = Math.min(logoSize * 0.42, (step * 0.88 * 100) / widestLabel);

  // Whatever room is left between the logos and the code belongs to the
  // caption, so it can never collide with either.
  const captionGap = W * 0.025;
  const captionRoom = qrX - captionGap - (logosEnd + captionGap);
  const captionSize = Math.min(
    H * 0.058,
    await fitSize('Scan to break in', captionRoom, 'display', 700),
  );

  const heading = await Promise.all([
    outline('$ ./join.sh', COLOR.muted, {
      x: margin, y: H * 0.135, size: H * 0.048, family: 'mono',
    }),
    outlineText(
      [
        { text: 'while', fill: COLOR.gold },
        { text: ' { ', fill: COLOR.muted },
        { text: 'Dev Club', fill: COLOR.bone },
        { text: ' }', fill: COLOR.muted },
      ],
      { x: W / 2, y: H * 0.42, size: titleSize, family: 'mono', weight: 700, anchor: 'middle' },
    ),
    outline('Build real things for real users.', COLOR.bone, {
      x: margin, y: H * 0.56, size: H * 0.058, family: 'display', weight: 700,
    }),
    outline('No experience needed.', COLOR.gold, {
      x: margin, y: H * 0.64, size: H * 0.05, family: 'display',
    }),
  ]);

  const topicMarks = await Promise.all(
    TOPICS.map(async (topic, i) => {
      const cx = margin + step * (i + 0.5);
      const cy = H * 0.785;
      const label = await outline(topic.label, COLOR.muted, {
        x: cx, y: cy + logoSize * 1.05, size: labelSize,
        family: 'mono', anchor: 'middle',
      });
      return `${logo(topic.icon, cx, cy, logoSize, COLOR.muted)}${label}`;
    }),
  );

  const qrArt = await qrBlock(qr, {
    x: qrX,
    y: qrY,
    side: qrSide,
    captionSize,
    lines: ['Scan to break in'],
    placement: 'left',
    gap: captionGap,
  });

  /**
   * The address, for anyone who would rather type it than scan — and so a
   * photograph of the banner still says where to go.
   *
   * It runs along the bottom, ending where the code begins, rather than being
   * squeezed underneath it. Under the code there is only about a fifth of the
   * banner's width, which made it too small to read from any useful distance.
   */
  const urlSize = Math.min(
    H * 0.04,
    await fitSize(SITE_URL_DISPLAY, qrX - captionGap - margin, 'mono'),
  );
  const url = await outline(SITE_URL_DISPLAY, COLOR.muted, {
    x: qrX - captionGap,
    y: H * 0.952,
    size: urlSize,
    family: 'mono',
    anchor: 'end',
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

  ${qrArt}
  ${url}
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
    outline('Build real things', COLOR.bone, {
      x: mid, y: H * 0.325, size: W * 0.062, family: 'display', weight: 700, anchor: 'middle',
    }),
    outline('for real users.', COLOR.bone, {
      x: mid, y: H * 0.378, size: W * 0.062, family: 'display', weight: 700, anchor: 'middle',
    }),
    outline('No experience needed.', COLOR.gold, {
      x: mid, y: H * 0.435, size: W * 0.05, family: 'display', anchor: 'middle',
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
    outline(SITE_URL_DISPLAY, COLOR.muted, {
      x: mid, y: H * 0.975, size: W * 0.033, family: 'mono', anchor: 'middle',
    }),
  ]);

  const qrArt = await qrBlock(qr, {
    x: mid - qrSide / 2,
    y: H * 0.845,
    side: qrSide,
    captionSize: W * 0.045,
    lines: ['Scan to break in'],
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

/* ==========================================================================
   BRAND ASSETS
   Everything that is not a printed banner: a form header, letterhead, a
   photocopiable flyer, a square avatar. Each takes a palette, so the same
   code produces the screen version and the paper version.
   ========================================================================== */

type Palette = (typeof PALETTES)['dark'];

function palette(theme: Theme): Palette {
  return PALETTES[theme] as Palette;
}

/**
 * GOOGLE FORM / CLASSROOM HEADER — 1600×400.
 *
 * Wide and short, and cropped hard on narrow screens, so everything that
 * matters stays in the middle band rather than near the edges.
 */
export async function formBannerSVG(width: number, height: number, theme: Theme): Promise<string> {
  const c = palette(theme);
  const left = width * 0.06;

  const titleSize = Math.min(
    await fitSize('while { Dev Club }', width * 0.56, 'mono', 700),
    height * 0.3,
  );

  const parts = await Promise.all([
    outlineText(
      [
        { text: 'while', fill: c.goldInk },
        { text: ' { ', fill: c.muted },
        { text: 'Dev Club', fill: c.bone },
        { text: ' }', fill: c.muted },
      ],
      { x: left, y: height * 0.47, size: titleSize, family: 'mono', weight: 700 },
    ),
    outline('Build real things for real users.', c.bone, {
      x: left, y: height * 0.68, size: height * 0.085, family: 'display', weight: 700,
    }),
    outline('No experience needed.', c.goldInk, {
      x: left, y: height * 0.84, size: height * 0.075, family: 'display',
    }),
  ]);

  // Logos stacked down the right, clear of the text.
  const logoSize = height * 0.13;
  const marks = TOPICS.slice(0, 6).map((topic, i) => {
    const column = i % 2;
    const row = Math.floor(i / 2);
    return logo(
      topic.icon,
      width * 0.76 + column * logoSize * 1.9,
      height * 0.3 + row * logoSize * 1.75,
      logoSize,
      c.muted,
    );
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${c.ink}"/>
  ${honeycomb(width, height, height / 5, theme === 'light' ? 0.25 : 0.12, c.gold)}
  <rect x="0" y="0" width="${width}" height="${height * 0.02}" fill="${c.gold}"/>
  ${parts.join('\n  ')}
  ${marks.join('\n  ')}
</svg>`;
}

/**
 * LETTERHEAD — US Letter, light.
 *
 * Deliberately almost empty. It is a page somebody writes a real letter on, so
 * it gets an identity at the top, a rule, and a quiet footer, and then stays
 * out of the way. No full-bleed colour: this goes through a school printer.
 */
export async function letterheadSVG(
  inchesWide: number,
  inchesTall: number,
  theme: Theme,
): Promise<string> {
  const c = palette(theme);
  const UNITS_PER_INCH = 100;
  const W = inchesWide * UNITS_PER_INCH;
  const H = inchesTall * UNITS_PER_INCH;
  const margin = W * 0.09;

  const parts = await Promise.all([
    outlineText(
      [
        { text: 'while', fill: c.goldInk },
        { text: ' { ', fill: c.muted },
        { text: 'Dev Club', fill: c.bone },
        { text: ' }', fill: c.muted },
      ],
      { x: margin, y: H * 0.072, size: W * 0.042, family: 'mono', weight: 700 },
    ),
    outline('Novato High School', c.muted, {
      x: W - margin, y: H * 0.072, size: W * 0.022, family: 'display', anchor: 'end',
    }),
    outline('Dev Club \u00b7 Novato High School', c.muted, {
      x: margin, y: H * 0.957, size: W * 0.018, family: 'mono',
    }),
    outline(SITE_URL_DISPLAY, c.muted, {
      x: W - margin, y: H * 0.957, size: W * 0.018, family: 'mono', anchor: 'end',
    }),
  ]);

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${inchesWide}in" height="${inchesTall}in"
     viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${c.ink}"/>

  <!-- A single gold rule under the identity. The only colour on the page. -->
  <rect x="${margin}" y="${H * 0.088}" width="${W - margin * 2}" height="${H * 0.004}" fill="${c.gold}"/>

  <!-- And a hairline above the footer. -->
  <rect x="${margin}" y="${H * 0.932}" width="${W - margin * 2}" height="${H * 0.0012}" fill="${c.edge}"/>

  ${parts.join('\n  ')}
</svg>`;
}

/**
 * FLYER — US Letter, light, made to be photocopied.
 *
 * Light on purpose: these get run off fifty at a time on a school copier, and
 * a dark page would be unreadable and ruinous. Unlike the banners it DOES
 * carry the meeting time and room, because a flyer is disposable — reprinting
 * one is a photocopy, not a new banner.
 */
export async function flyerSVG(
  inchesWide: number,
  inchesTall: number,
  theme: Theme,
  qr: { path: string; size: number },
): Promise<string> {
  const c = palette(theme);
  const UNITS_PER_INCH = 100;
  const W = inchesWide * UNITS_PER_INCH;
  const H = inchesTall * UNITS_PER_INCH;
  const mid = W / 2;
  const margin = W * 0.08;

  const titleSize = Math.min(
    await fitSize('{ Dev Club }', W - margin * 2, 'mono', 700),
    H * 0.1,
  );

  const heading = await Promise.all([
    outline('while', c.goldInk, {
      x: mid, y: H * 0.145, size: titleSize * 1.05, family: 'mono', weight: 700, anchor: 'middle',
    }),
    outlineText(
      [
        { text: '{ ', fill: c.muted },
        { text: 'Dev Club', fill: c.bone },
        { text: ' }', fill: c.muted },
      ],
      { x: mid, y: H * 0.225, size: titleSize, family: 'mono', weight: 700, anchor: 'middle' },
    ),
    outline('Build real things for real users.', c.bone, {
      x: mid, y: H * 0.295, size: W * 0.038, family: 'display', weight: 700, anchor: 'middle',
    }),
    outline('No experience needed.', c.goldInk, {
      x: mid, y: H * 0.345, size: W * 0.034, family: 'display', anchor: 'middle',
    }),
  ]);

  // Topics, two columns.
  const logoSize = H * 0.032;
  const rows = Math.ceil(TOPICS.length / 2);
  const topicTop = H * 0.43;
  const rowHeight = H * 0.05;
  const labelSize = logoSize * 0.72;

  const topicMarks = await Promise.all(
    TOPICS.map(async (topic, i) => {
      const column = i % 2;
      const row = Math.floor(i / 2);
      const centre = column === 0 ? W * 0.32 : W * 0.68;
      const cy = topicTop + row * rowHeight;
      const width = await textWidth(topic.label, labelSize, 'mono');
      const block = logoSize + logoSize * 0.5 + width;
      const logoCx = centre - block / 2 + logoSize / 2;
      const label = await outline(topic.label, c.muted, {
        x: logoCx + logoSize / 2 + logoSize * 0.5,
        y: cy + labelSize * 0.35,
        size: labelSize,
        family: 'mono',
      });
      return `${logo(topic.icon, logoCx, cy, logoSize, c.bone)}${label}`;
    }),
  );

  const boxTop = topicTop + rows * rowHeight + H * 0.02;
  const meeting = await Promise.all([
    outline(CLUB.meetingDay, c.goldInk, {
      x: mid, y: boxTop + H * 0.042, size: W * 0.05, family: 'mono', weight: 700, anchor: 'middle',
    }),
    outline(`Lunch \u00b7 Room ${CLUB.meetingRoom}`, c.bone, {
      x: mid, y: boxTop + H * 0.078, size: W * 0.036, family: 'mono', anchor: 'middle',
    }),
  ]);

  // The honeycomb is very faint on paper: a copier turns mid-tone yellow into
  // grey mush, and this has to survive being run off fifty times.
  const qrSide = H * 0.13;
  const qrArt = await qrBlock(qr, {
    x: mid - qrSide / 2,
    y: H * 0.79,
    side: qrSide,
    captionSize: W * 0.032,
    lines: ['Scan to break in'],
    placement: 'above',
    gap: H * 0.012,
    // Pale card, dark modules — always, whatever the page behind it is.
    colours: {
      caption: c.bone,
      sub: c.muted,
      card: '#ffffff',
      code: '#0b0c0e',
      cardEdge: theme === 'light' ? c.edge : undefined,
    },
  });

  const url = await outline(SITE_URL_DISPLAY, c.muted, {
    x: mid, y: H * 0.955, size: W * 0.024, family: 'mono', anchor: 'middle',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${inchesWide}in" height="${inchesTall}in"
     viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${c.ink}"/>
  ${honeycomb(W, H, W / 9, theme === 'light' ? 0.16 : 0.13, c.gold)}

  <rect x="0" y="0" width="${W}" height="${H * 0.012}" fill="${c.gold}"/>
  <rect x="0" y="${H - H * 0.012}" width="${W}" height="${H * 0.012}" fill="${c.gold}"/>

  ${heading.join('\n  ')}
  ${topicMarks.join('\n  ')}

  <rect x="${margin}" y="${boxTop}" width="${W - margin * 2}" height="${H * 0.1}" rx="${W * 0.015}" fill="none" stroke="${c.edge}" stroke-width="${W * 0.003}"/>
  ${meeting.join('\n  ')}

  ${qrArt}
  ${url}
</svg>`;
}

/**
 * SQUARE AVATAR — Discord, Classroom, anywhere that wants a round icon.
 *
 * Everything important sits well inside the circle those platforms crop to.
 */
export async function avatarSVG(size: number, theme: Theme): Promise<string> {
  const c = palette(theme);
  const mid = size / 2;
  const side = size * 0.34;
  const half = (side * Math.sqrt(3)) / 2;

  const hex =
    `M${mid} ${mid - side} L${mid + half} ${mid - side / 2} L${mid + half} ${mid + side / 2} ` +
    `L${mid} ${mid + side} L${mid - half} ${mid + side / 2} L${mid - half} ${mid - side / 2} Z`;

  const braces = await outlineText(
    [
      { text: '{ ', fill: c.gold },
      { text: '}', fill: c.gold },
    ],
    { x: mid, y: mid + size * 0.1, size: size * 0.34, family: 'mono', weight: 700, anchor: 'middle' },
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${c.ink}"/>
  ${honeycomb(size, size, size / 6, 0.12, c.gold)}
  <path d="${hex}" fill="none" stroke="${c.gold}" stroke-width="${size * 0.022}"/>
  ${braces}
</svg>`;
}

/**
 * SLIDE BACKGROUND — TITLE, 1920×1080.
 *
 * For the opening slide of a deck. The presenter puts the talk's title over
 * the middle, so the club identity sits high and the lower half stays clear.
 */
export async function slideTitleSVG(width: number, height: number, theme: Theme): Promise<string> {
  const c = palette(theme);
  const mid = width / 2;

  const titleSize = Math.min(
    await fitSize('while { Dev Club }', width * 0.58, 'mono', 700),
    height * 0.11,
  );

  const parts = await Promise.all([
    outlineText(
      [
        { text: 'while', fill: c.goldInk },
        { text: ' { ', fill: c.muted },
        { text: 'Dev Club', fill: c.bone },
        { text: ' }', fill: c.muted },
      ],
      { x: mid, y: height * 0.27, size: titleSize, family: 'mono', weight: 700, anchor: 'middle' },
    ),
    outline('Build real things for real users.', c.muted, {
      x: mid, y: height * 0.36, size: height * 0.033, family: 'display', anchor: 'middle',
    }),
  ]);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${c.ink}"/>
  ${honeycomb(width, height, height / 7, 0.12, c.gold)}
  <rect x="0" y="0" width="${width}" height="${height * 0.014}" fill="${c.gold}"/>
  ${parts.join('\n  ')}
</svg>`;
}

/**
 * SLIDE BACKGROUND — CONTENT, 1920×1080.
 *
 * Deliberately almost empty. Every slide in the deck sits on this, so anything
 * in the middle would fight the actual content for the whole talk. A small
 * mark bottom-left, a gold rule along the bottom, and a honeycomb faint enough
 * that text stays readable over it.
 */
export async function slideContentSVG(width: number, height: number, theme: Theme): Promise<string> {
  const c = palette(theme);

  const mark = await outlineText(
    [
      { text: 'while', fill: c.goldInk },
      { text: ' { ', fill: c.muted },
      { text: 'Dev Club', fill: c.bone },
      { text: ' }', fill: c.muted },
    ],
    { x: width * 0.035, y: height * 0.955, size: height * 0.028, family: 'mono', weight: 700 },
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${c.ink}"/>

  <!-- Half the usual opacity. Body text has to stay readable on top of this
       for an entire talk, which the title slide does not have to worry about. -->
  ${honeycomb(width, height, height / 7, 0.06, c.gold)}

  <rect x="0" y="${height - height * 0.008}" width="${width}" height="${height * 0.008}" fill="${c.gold}"/>
  ${mark}
</svg>`;
}

/**
 * EMAIL SIGNATURE STRIP — 1200×280, light.
 *
 * Sits under whatever the sender types. It carries NO name and NO email
 * address: club officers are students, and everything generated here is
 * published on a public website. A student's name and address on the open web
 * is precisely what this site does not do. The sender's own name goes in their
 * mail client, above this, where it stays in their mail.
 *
 * Light because email is read on a white background far more often than not,
 * and a dark strip would sit in the message like a hole.
 */
export async function signatureSVG(width: number, height: number, theme: Theme): Promise<string> {
  const c = palette(theme);
  const left = width * 0.03;

  const parts = await Promise.all([
    outlineText(
      [
        { text: 'while', fill: c.goldInk },
        { text: ' { ', fill: c.muted },
        { text: 'Dev Club', fill: c.bone },
        { text: ' }', fill: c.muted },
      ],
      { x: left, y: height * 0.42, size: height * 0.22, family: 'mono', weight: 700 },
    ),
    outline('Novato High School', c.muted, {
      x: left, y: height * 0.63, size: height * 0.115, family: 'display',
    }),
    outline(SITE_URL_DISPLAY, c.muted, {
      x: left, y: height * 0.85, size: height * 0.105, family: 'mono',
    }),
  ]);

  /**
   * Topic logos on the right, small, as a quiet reminder of what we do.
   *
   * Laid out from the RIGHT edge backwards, so the row always ends where it
   * should however many topics there are. Spacing them forwards from a fixed
   * left position pushed the last logo off the strip the moment there were
   * six of them.
   */
  const logoSize = height * 0.17;
  const step = logoSize * 1.55;
  const lastCx = width - width * 0.04 - logoSize / 2;
  const marks = TOPICS.map((topic, i) =>
    logo(
      topic.icon,
      lastCx - step * (TOPICS.length - 1 - i),
      height * 0.5,
      logoSize,
      c.muted,
    ),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${c.ink}"/>
  <rect x="0" y="0" width="${width}" height="${height * 0.035}" fill="${c.gold}"/>
  ${parts.join('\n  ')}
  ${marks.join('\n  ')}
</svg>`;
}
