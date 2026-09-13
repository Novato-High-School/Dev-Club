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
export const BOOT_MODE: 'skippable' | 'hard' | 'hero' | 'off' = 'skippable';

/**
 * The name of the browser's memory slot that remembers a visitor already saw
 * the boot terminal. If you ever redesign the intro and want everyone to see
 * it again, bump the number at the end (v1 -> v2).
 */
export const BOOT_STORAGE_KEY = 'devclub.boot.v1';

/**
 * Text used in the browser tab, search results, and link previews.
 */
export const SITE_NAME = 'Dev Club';
export const SITE_LOGO = 'while { Dev Club }';
export const SITE_DESCRIPTION =
  'The student developer club at Novato High School. We build real projects, ' +
  'learn real tools, and welcome people who have never written a line of code.';

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
   * Link to the interest form students fill out to join.
   *
   * TODO: replace this with the real school-managed form link. We deliberately
   * do NOT collect sign ups on this website: it is a static site, and student
   * submissions belong in a system the school already approved.
   */
  interestFormUrl: '',
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
