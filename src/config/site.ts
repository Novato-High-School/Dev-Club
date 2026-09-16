/**
 * SITE CONFIGURATION
 * ==================
 * This is the one file to edit when you want to change how the whole site
 * behaves. Everything else in the project reads its settings from here, so you
 * should never have to hunt through a dozen files to change one thing.
 *
 * If you are new here, read the comments above each setting before changing it.
 */

/**
 * Where the site lives on the internet, WITHOUT any folder path on the end.
 * GitHub Pages gives every organization a free address that looks like this.
 */
export const SITE_URL = 'https://novato-high-school.github.io';

/**
 * The folder the site sits in, called the "base path".
 *
 * Our repository is named "Dev-Club", so GitHub publishes the site to
 * https://novato-high-school.github.io/Dev-Club/ and every link on the site
 * needs to start with "/Dev-Club".
 *
 * If we ever buy a real domain name (like devclub.example.org), change this
 * single line to '/' and everything keeps working.
 */
export const BASE = '/Dev-Club';

/**
 * The address as it should be PRINTED — capitalised so it can be read across a
 * room, with the trailing slash. Domain names ignore capitals, so this is only
 * about legibility; it goes on banners, never in a link.
 */
export const SITE_URL_DISPLAY = 'Novato-High-School.github.io/Dev-Club/';

/**
 * How the "boot the club" terminal intro behaves.
 *
 *   'skippable' - Full screen terminal on a visitor's first arrival, with a
 *                 visible Skip button. Once they finish it (or skip it) we
 *                 remember and never show it again. This is the default.
 *   'hard'      - Same terminal, but there is no Skip button. Visitors have to
 *                 answer the challenge to get in. Fun for a launch day; not
 *                 something to leave switched on for months.
 *   'hero'      - The terminal becomes a panel inside the home page instead of
 *                 covering the screen. It never blocks anyone.
 *   'off'       - No terminal at all.
 *
 * Change the value below and save. That is the entire switch.
 */
export const BOOT_MODE: 'skippable' | 'hard' | 'hero' | 'off' = 'hard';

/**
 * The name of the browser's memory slot that remembers a visitor already saw
 * the boot terminal. If you ever redesign the intro and want everyone to see
 * it again, bump the number at the end (v1 -> v2).
 */
export const BOOT_STORAGE_KEY = 'devclub.boot.v1';

/**
 * THE RECRUITING WINDOW
 * =====================
 * During recruiting, anyone who WINS the boss fight (not someone who skips
 * it) sees a one-time offer on the same win screen: a rescue code plus a
 * "sign up" link, so they can claim a rubber ducky. Outside this date range,
 * winning just shows the normal "Enter the site" screen — nothing else
 * changes, and no code is generated anywhere.
 *
 * There is no server, so nobody here is really "verifying" a secret — the
 * code is a scrambled timestamp (see generateRescueCode below), and it is
 * only as good as the honor system plus a spreadsheet formula that unscrambles
 * it to see how old it was when someone typed it into the sign-up form. Full
 * recipe for that formula is in CONTRIBUTING.md under "Recruiting: the
 * rescue-code offer".
 */
export const RECRUITING = {
  /** Both dates are 'YYYY-MM-DD', inclusive, read in the visitor's local time. */
  startsOn: '2026-09-15',
  endsOn: '2026-09-29',
} as const;

/** Has this browser already seen the rescue-code offer? Bump the version to reset everyone. */
export const RESCUE_STORAGE_KEY = 'devclub.rescueOffer.v1';

/** True when `now` falls inside the recruiting window above (inclusive, local time). */
export function isRecruitingActive(now: Date = new Date()): boolean {
  const start = new Date(`${RECRUITING.startsOn}T00:00:00`);
  const end = new Date(`${RECRUITING.endsOn}T23:59:59`);
  return now >= start && now <= end;
}

/**
 * THE RESCUE CODE CIPHER
 * =======================
 * The code shown on a win is not a fixed word — it is the current minute,
 * XOR-scrambled with RESCUE_SECRET_KEY and written out in hex. XOR is its own
 * inverse, so the exact same operation that makes the code also unmakes it:
 * feed a code back through BITXOR with this same key (that is what the
 * response-sheet formula in CONTRIBUTING.md does) and you get the minute it
 * was generated back out, which tells you how old it was at sign-up time.
 *
 * RESCUE_EPOCH and RESCUE_SECRET_KEY MUST match the constants used in the
 * spreadsheet formula, or every code will look "wrong" there. Change either
 * one to invalidate every code generated so far (handy at the end of a
 * recruiting push); when you do, update the spreadsheet formula to match.
 */
export const RESCUE_EPOCH = new Date('2026-09-01T00:00:00Z').getTime();
export const RESCUE_SECRET_KEY = 47291;
export const RESCUE_CODE_PREFIX = 'QUACK-';

/** The rescue code for right now: a scrambled, hex-encoded minute-count since RESCUE_EPOCH. */
export function generateRescueCode(now: Date = new Date()): string {
  const minutesSinceEpoch = Math.floor((now.getTime() - RESCUE_EPOCH) / 60_000);
  const scrambled = minutesSinceEpoch ^ RESCUE_SECRET_KEY;
  return RESCUE_CODE_PREFIX + scrambled.toString(16).toUpperCase();
}

/**
 * Text used in the browser tab, search results, and link previews.
 */
export const SITE_NAME = 'Dev Club';
export const SITE_LOGO = 'while { Dev Club }';
export const SITE_DESCRIPTION =
  'The student developer club at Novato High School. We build real things for ' +
  'real users, learn real tools, and welcome people who have never written a ' +
  'line of code.';

/**
 * Club details shown on the Home and Join pages.
 *
 * PRIVACY RULE: do not put student names, student emails, phone numbers, or
 * photos of students in this file. It is a public website. Staff contact
 * information is fine because it is already published by the school.
 */
export const CLUB = {
  meetingDay: 'Mondays',
  meetingRoom: '3202',
  advisorName: 'Mr. Knudson',

  /**
   * TODO: fill in the advisor's SCHOOL email address (the @nusd.org one), not
   * a personal address. This goes on a public web page that anyone, including
   * bots that harvest addresses for spam, can read.
   */
  advisorEmail: '',
  githubOrg: 'https://github.com/Novato-High-School',

  /**
   * Link to the interest form students fill out to join. Used as the
   * "open in a new tab" fallback next to the embedded form on /join.
   *
   * TODO: replace this with the real school-managed form link. This site
   * still does NOT store sign-ups itself: submissions go straight to
   * Google, in a form the school already approved.
   */
  interestFormUrl: 'https://forms.gle/nLZ7bLXcHMQm3AT16',

  /**
   * Google's embeddable version of the same form (Send > Embed <> in
   * Google Forms gives you this URL; it always ends in ?embedded=true).
   * Leave empty to fall back to a plain link instead of an iframe.
   */
  interestFormEmbedUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSe-SojqxoOL2CZAu5Ul21bPxZoPIPk9feFxJTJoBj1aaecNmA/viewform?embedded=true',
} as const;

/**
 * THE BELL SCHEDULE
 * =================
 * Lunch is not at the same time every day. Novato High runs block days on
 * Tuesday and Wednesday, and lunch on those days is earlier and shorter.
 *
 * We keep real clock times rather than just the word "Lunch" for two reasons:
 * a calendar feed needs actual times to be useful, and "Lunch" means nothing
 * to a parent reading the site.
 *
 * Times are 24-hour, as "HH:MM", in local school time.
 */

/** Days of the week that run the block schedule. 0 = Sunday, 1 = Monday, ... */
export const BLOCK_DAYS = [2, 3] as const; // Tuesday, Wednesday

export interface Period {
  /** What to call it on the page. */
  label: string;
  /** 24-hour start time, e.g. '11:40'. Empty means "we have not filled it in". */
  start: string;
  /** 24-hour end time, e.g. '12:10'. */
  end: string;
}

/**
 * Which day(s) the club meets. 0 = Sunday, 1 = Monday, ...
 * Change this and every upcoming meeting date follows automatically.
 */
export const MEETING_DAYS = [1] as const; // Mondays

/**
 * The school's published calendar feed. We read it at build time to find the
 * long breaks — winter, mid-winter, spring — which move around year to year.
 *
 * If this is unreachable the site still builds: it falls back to the computed
 * holidays below. A district web outage must never break our site.
 */
export const SCHOOL_CALENDAR_ICS =
  'https://novatohigh.nusd.org/sndreq/generateCalendarICS.php?calendar_id=138811';

/**
 * Days with no meeting that nothing else catches.
 *
 * Most closures are worked out automatically — see src/lib/holidays.ts — so
 * this is only for surprises. Put the reason in the comment.
 */
export const SKIP_DATES: { date: string; reason: string }[] = [
  // { date: '2026-10-30', reason: 'Rally schedule, no lunch clubs' },
];

export const PERIODS: { regular: Period; block: Period } = {
  /** Lunch on a normal day — Monday, Thursday and Friday. */
  regular: { label: 'Lunch', start: '12:25', end: '12:55' },

  /** Lunch on a block day — Tuesday and Wednesday. Earlier and shorter. */
  block: { label: 'Lunch', start: '11:40', end: '12:10' },
};

/**
 * TOPICS ON THE BANNER
 * ====================
 * What we cover, shown as logos on the club banner and the link-preview image.
 *
 * ADDING ONE IS A SINGLE LINE. `icon` is a name from Simple Icons —
 * https://simpleicons.org — lowercase with no spaces or dots, so "Node.js" is
 * `nodedotjs` and "Azure" is `microsoftazure`. If a logo is missing the banner
 * build will tell you the name it could not find.
 *
 * A note on the logos: these are other people's trademarks. Using them to say
 * "we teach this" is normal and fine, but do not restyle them, recolour them,
 * or imply the company sponsors the club.
 */
export const TOPICS: { icon: string; label: string }[] = [
  { icon: 'github', label: 'GitHub' },
  { icon: 'python', label: 'Python' },
  { icon: 'microsoftazure', label: 'Azure' },
  { icon: 'swift', label: 'Swift' },
  { icon: 'javascript', label: 'JavaScript' },
  { icon: 'discord', label: 'Bots' },
];

/**
 * Sizes the printed banner is generated at. The club fair banners are tall and
 * narrow, and meant to be read from several feet away.
 *
 * Everything is laid out at 50 units per inch, so a font-size of 100 is two
 * inches tall on the finished print no matter which size you pick.
 */
export const BANNER_SIZES: { id: string; inchesWide: number; inchesTall: number }[] = [
  // Portrait — the tall club-fair banners.
  { id: '2x4', inchesWide: 24, inchesTall: 48 },
  { id: '1.6x3', inchesWide: 19.2, inchesTall: 36 },

  // Landscape — the same two sizes turned on their side, for a table front,
  // a wall, or hanging above a booth. The layout is redrawn rather than
  // stretched: a wide banner wants its content in a row, not a column.
  { id: '4x2', inchesWide: 48, inchesTall: 24 },
  { id: '3x1.6', inchesWide: 36, inchesTall: 19.2 },
];

/**
 * Where the banner's QR code sends people.
 *
 * Not the plain home page: "?boot" always opens the terminal challenge, even
 * for somebody who has been to the site before. Scanning a banner should drop
 * you straight into the interesting bit — and the terminal has a Skip button,
 * so nobody is trapped by it.
 */
export const QR_TARGET_QUERY = '?boot';

/**
 * BRAND ASSETS
 * ============
 * Everything the club needs besides the printed banners: a header for a Google
 * Form, letterhead for real letters, a photocopiable flyer, a square avatar.
 *
 * ADDING ONE IS A SINGLE ENTRY. `kind` picks the layout, `theme` picks the
 * palette, and `unit` says whether the numbers are pixels (for screens) or
 * inches (for paper).
 *
 * A note on `theme: 'light'`: anything going near a printer is light. A
 * full-bleed near-black page costs a fortune in toner, jams school copiers,
 * and looks awful photocopied. Screens get the dark version; paper does not.
 */
export const BRAND_ASSETS: {
  id: string;
  label: string;
  kind:
    | 'form-banner'
    | 'letterhead'
    | 'flyer'
    | 'avatar'
    | 'slide-title'
    | 'slide-content'
    | 'signature';
  theme: 'dark' | 'light';
  width: number;
  height: number;
  unit: 'px' | 'in';
}[] = [
  {
    id: 'form-banner',
    label: 'Google Form / Classroom header',
    kind: 'form-banner',
    theme: 'dark',
    width: 1600,
    height: 400,
    unit: 'px',
  },
  {
    id: 'letterhead',
    label: 'Letterhead, US Letter',
    kind: 'letterhead',
    theme: 'light',
    width: 8.5,
    height: 11,
    unit: 'in',
  },
  {
    id: 'flyer',
    label: 'Photocopiable flyer, US Letter',
    kind: 'flyer',
    theme: 'light',
    width: 8.5,
    height: 11,
    unit: 'in',
  },
  {
    id: 'slide-title',
    label: 'Slide background — title slide',
    kind: 'slide-title',
    theme: 'dark',
    width: 1920,
    height: 1080,
    unit: 'px',
  },
  {
    id: 'slide-content',
    label: 'Slide background — content slides, deliberately empty',
    kind: 'slide-content',
    theme: 'dark',
    width: 1920,
    height: 1080,
    unit: 'px',
  },
  {
    /**
     * A branding strip for an email signature.
     *
     * It carries NO name and NO email address, on purpose. Club officers are
     * students, and anything generated here is published on a public website —
     * a minor's name and address on the open web is exactly what this site
     * does not do. Whoever is president types their own name in their mail
     * client above this strip, where it stays private to their mail.
     */
    id: 'signature',
    label: 'Email signature strip — no names, see README',
    kind: 'signature',
    theme: 'light',
    width: 1200,
    height: 280,
    unit: 'px',
  },
  {
    id: 'avatar',
    label: 'Square avatar — Discord, Classroom, anywhere round',
    kind: 'avatar',
    theme: 'dark',
    width: 512,
    height: 512,
    unit: 'px',
  },
];