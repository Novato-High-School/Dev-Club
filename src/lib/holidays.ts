/**
 * WHEN THERE IS NO SCHOOL
 * =======================
 * Works out the days the club cannot meet. Three sources, and they are
 * combined rather than ranked — if any of them says "no school", there is no
 * meeting.
 *
 *   1. Federal holidays, worked out from rules (this file). Labor Day is
 *      always the first Monday in September, so there is nothing to maintain.
 *   2. The school's own calendar feed, for breaks that move year to year
 *      (see src/lib/school-calendar.ts).
 *   3. SKIP_DATES in the config, for one-off surprises.
 *
 * THE RULE THAT MATTERS: we only cancel on a positive signal. The school
 * calendar has plenty of weeks with no events in them that are ordinary school
 * weeks — May 2027 has two events in the entire month — so "nothing on the
 * calendar" never means "no school".
 */

/** A date with no school, and why, so the site can explain itself. */
export interface Closure {
  /** The date, as YYYY-MM-DD. */
  date: string;
  /** Shown to visitors, e.g. "Memorial Day". */
  reason: string;
}

/** Formats a Date as YYYY-MM-DD, in UTC to avoid off-by-one-day bugs. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The nth given weekday of a month — "the third Monday in January".
 * Pass n = -1 for the last one in the month.
 */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  if (n === -1) {
    // Walk back from the last day of the month to the weekday we want.
    const last = new Date(Date.UTC(year, month, 0));
    while (last.getUTCDay() !== weekday) last.setUTCDate(last.getUTCDate() - 1);
    return last;
  }

  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  first.setUTCDate(1 + offset + 7 * (n - 1));
  return first;
}

/** Adds days to a date without mutating the original. */
function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/**
 * Every closure we can work out from a rule, for one calendar year.
 *
 * These are the ones the school's calendar feed does NOT contain — I checked,
 * and Labor Day, MLK Day, Memorial Day, Veterans Day and Thanksgiving are all
 * missing from it. Most of them fall on a Monday, which is exactly when we
 * meet, so leaving them to the feed would have cancelled nothing.
 */
export function computedClosures(year: number): Closure[] {
  const out: Closure[] = [];
  const add = (date: Date, reason: string) => out.push({ date: toISODate(date), reason });

  add(nthWeekday(year, 9, 1, 1), 'Labor Day'); // first Monday in September
  add(new Date(Date.UTC(year, 10, 11)), 'Veterans Day'); // 11 November
  add(nthWeekday(year, 1, 1, 3), 'Martin Luther King Jr. Day'); // third Monday in January
  add(nthWeekday(year, 2, 1, 3), "Presidents' Day"); // third Monday in February
  add(nthWeekday(year, 5, 1, -1), 'Memorial Day'); // last Monday in May
  add(new Date(Date.UTC(year, 6, 4)), 'Independence Day'); // 4 July

  /**
   * Thanksgiving is the whole week off here, not just the Thursday. The
   * district confirmed it, and it matches the feed, which has no events at all
   * that week. Worth re-checking each year, because it is a local policy
   * rather than a law.
   */
  const thanksgiving = nthWeekday(year, 11, 4, 4); // fourth Thursday in November
  const mondayOfThatWeek = addDays(thanksgiving, -3);
  for (let i = 0; i < 5; i++) {
    add(addDays(mondayOfThatWeek, i), 'Thanksgiving break');
  }

  return out;
}

/**
 * Computed closures across a range of years, so a school year that straddles
 * January is covered in one go.
 */
export function computedClosuresBetween(startYear: number, endYear: number): Closure[] {
  const out: Closure[] = [];
  for (let year = startYear; year <= endYear; year++) out.push(...computedClosures(year));
  return out;
}
