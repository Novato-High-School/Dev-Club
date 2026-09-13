/**
 * BELL SCHEDULE HELPERS
 * =====================
 * Works out what time a meeting starts, given the day it falls on.
 *
 * Novato High runs block days on Tuesday and Wednesday, and lunch is earlier
 * and shorter on those days. The club meets on Mondays at the moment, but a
 * meeting can be moved, so the time has to follow the date rather than being
 * typed in somewhere and left to rot.
 *
 * The rule throughout: work it out from the date. Never store the same fact
 * twice, because the two copies will disagree eventually.
 */

import { BLOCK_DAYS, PERIODS, type Period } from '../config/site';

/**
 * Dates from Markdown files are read as midnight UTC, so we always ask for the
 * UTC day. Using the local day would give the wrong answer for anybody west of
 * Greenwich — which is all of us.
 */
function dayOfWeek(date: Date): number {
  return date.getUTCDay();
}

/** Is this date a block day (Tuesday or Wednesday)? */
export function isBlockDay(date: Date): boolean {
  return (BLOCK_DAYS as readonly number[]).includes(dayOfWeek(date));
}

/** The lunch period that applies on this date. */
export function periodFor(date: Date): Period {
  return isBlockDay(date) ? PERIODS.block : PERIODS.regular;
}

/** 'Monday', 'Tuesday', ... worked out from the date itself. */
export function weekdayName(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/** Turns '11:40' into '11:40 am'. Returns '' if the time is not filled in. */
function to12Hour(time: string): string {
  if (!time) return '';
  const [rawHour, minute] = time.split(':');
  const hour = Number(rawHour);
  const suffix = hour < 12 ? 'am' : 'pm';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}

/**
 * How the time should read on the page.
 *
 *   filled in  -> 'Lunch · 11:40 am – 12:10 pm'
 *   not yet    -> 'Lunch'
 *
 * Showing the label alone is vague, but it is better than inventing a time and
 * sending somebody to an empty room.
 */
export function formatPeriod(period: Period): string {
  if (!period.start || !period.end) return period.label;

  const start = to12Hour(period.start);
  const end = to12Hour(period.end);

  // If both times share am/pm, only say it once: '11:40 – 12:10 pm'.
  const startSuffix = start.slice(-2);
  const endSuffix = end.slice(-2);
  const startText = startSuffix === endSuffix ? start.slice(0, -3) : start;

  return `${period.label} · ${startText} – ${end}`;
}

/**
 * The time to show for one meeting. A meeting file can override it — an
 * evening demo night, say — and anything it does not say falls back to the
 * bell schedule for that day.
 */
export function meetingTime(date: Date, override?: string): string {
  return override?.trim() ? override : formatPeriod(periodFor(date));
}
