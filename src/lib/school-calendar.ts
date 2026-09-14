/**
 * READING THE SCHOOL'S CALENDAR
 * =============================
 * Novato High publishes its calendar as an .ics feed — the same format your
 * phone's calendar app uses. We read it while the site is being built and pull
 * out the long breaks, so nobody has to type them in every year.
 *
 * WHAT WE TAKE FROM IT, AND WHAT WE DO NOT
 * ----------------------------------------
 * We only trust events that SAY they are a closure: "Winter Break", "Spring
 * Break - No School", "Staff Development Day - no school".
 *
 * We deliberately ignore the absence of events. The feed is not evenly
 * maintained — May 2027 has two events in the whole month — so plenty of
 * ordinary school weeks look empty. Inferring "no events, so no school" would
 * cancel most of May.
 *
 * One event has to be excluded by name: "Holiday & Stress Less Spirit Week"
 * contains the word Holiday, but school is very much in session.
 *
 * If the feed cannot be reached the site still builds and simply falls back to
 * the computed holidays. The district's web server going down must never take
 * our site with it.
 */

import { SCHOOL_CALENDAR_ICS } from '../config/site';
import { toISODate, type Closure } from './holidays';

/** Names that mean "no school". */
const CLOSURE_PATTERN = /\b(break|no school|holiday)\b/i;

/** Names that look like closures but are not. Checked first. */
const NOT_A_CLOSURE_PATTERN = /spirit week|dance|game|rally|concert|picture/i;

/** Parsed once per build, then reused. */
let cached: Closure[] | null = null;

/** Turns an ICS date, '20261221', into a UTC Date. */
function parseICSDate(value: string): Date | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}

/**
 * Pulls the closure days out of raw .ics text.
 * Exported separately from the fetch so it can be tested without a network.
 */
export function parseClosures(ics: string): Closure[] {
  const out: Closure[] = [];
  // ICS wraps long lines by starting the continuation with a space.
  const unfolded = ics.replace(/\r?\n[ \t]/g, '');

  for (const block of unfolded.split('BEGIN:VEVENT').slice(1)) {
    const summary = block.match(/^SUMMARY[^:]*:(.*)$/m)?.[1]?.trim() ?? '';
    if (!summary) continue;
    if (NOT_A_CLOSURE_PATTERN.test(summary)) continue;
    if (!CLOSURE_PATTERN.test(summary)) continue;

    const start = parseICSDate(block.match(/^DTSTART[^:]*:(.*)$/m)?.[1]?.trim() ?? '');
    if (!start) continue;

    // In .ics an all-day DTEND is exclusive: it is the morning AFTER the last
    // day off. A missing DTEND means a single day.
    const rawEnd = block.match(/^DTEND[^:]*:(.*)$/m)?.[1]?.trim() ?? '';
    const end = parseICSDate(rawEnd);

    const cursor = new Date(start.getTime());
    // The guard stops a malformed feed from generating dates forever.
    for (let i = 0; i < 40; i++) {
      if (end && cursor >= end) break;
      out.push({ date: toISODate(cursor), reason: summary });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      if (!end) break;
    }
  }

  return out;
}

/**
 * Fetches and parses the school calendar. Returns an empty list — never
 * throws — if anything at all goes wrong.
 */
export async function schoolClosures(): Promise<Closure[]> {
  if (cached) return cached;

  try {
    // Give up after 10 seconds rather than hanging the build.
    const response = await fetch(SCHOOL_CALENDAR_ICS, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    cached = parseClosures(await response.text());
    return cached;
  } catch (error) {
    // A warning, not a failure. The computed holidays still apply.
    console.warn(
      `[school-calendar] could not read the school calendar, using computed holidays only: ${error}`,
    );
    cached = [];
    return cached;
  }
}
