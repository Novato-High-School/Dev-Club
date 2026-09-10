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
  meetingTime: 'Lunch',
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
