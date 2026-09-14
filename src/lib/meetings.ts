/**
 * WORKING OUT THE MEETINGS
 * ========================
 * Everything the site knows about when the club meets comes from here.
 *
 * The idea in one sentence: the SCHEDULE is a rule, and a MEETING FILE is
 * optional detail attached to one date.
 *
 * So an ordinary week needs no file at all — the site already knows the club
 * meets Mondays at lunch in 3202. You add a file when there is something to
 * say: an agenda, notes afterwards, a guest, a different room, a cancellation.
 *
 * Nothing stores whether a meeting is "upcoming" or "past". That is worked out
 * from the date every time the site is built, so a meeting becomes an archive
 * entry on its own, with nobody moving a file.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

import { MEETING_DAYS, SKIP_DATES, CLUB } from '../config/site';
import { computedClosuresBetween, toISODate, type Closure } from './holidays';
import { schoolClosures } from './school-calendar';
import { meetingTime, periodFor, isBlockDay, weekdayName } from './schedule';

/** One meeting, ready for a page to display. */
export interface Meeting {
  /** YYYY-MM-DD. Doubles as the URL: /meetings/2026-09-14 */
  id: string;
  date: Date;
  weekday: string;
  title: string;
  /** How the time should read, e.g. 'Lunch · 12:25 – 12:55 pm'. */
  time: string;
  where: string;
  /** Real clock times, for the calendar feed. */
  starts: string;
  ends: string;
  isBlockDay: boolean;
  canceled: boolean;
  canceledReason?: string;
  /** True when the time or place is not the usual one. */
  unusual: boolean;
  agenda: string[];
  links: { label: string; url: string }[];
  speaker?: { name: string; role: string; topic?: string; link?: string };
  /** The Markdown file, when one exists. Its body is the write-up. */
  entry?: CollectionEntry<'meetings'>;
  /** Has somebody written up what happened? */
  hasNotes: boolean;
}

/** Midnight UTC today, so comparisons ignore the time of day. */
function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/** Every date with no school, from all three sources, keyed by YYYY-MM-DD. */
async function closureMap(from: Date, to: Date): Promise<Map<string, string>> {
  const all: Closure[] = [
    ...computedClosuresBetween(from.getUTCFullYear(), to.getUTCFullYear()),
    ...(await schoolClosures()),
    ...SKIP_DATES,
  ];

  const map = new Map<string, string>();
  // First reason wins, so the computed holiday name beats a vaguer feed entry.
  for (const closure of all) {
    if (!map.has(closure.date)) map.set(closure.date, closure.reason);
  }
  return map;
}

/** The dates the club would meet on between two dates, ignoring closures. */
function scheduledDates(from: Date, to: Date): string[] {
  const days = MEETING_DAYS as readonly number[];
  const out: string[] = [];
  for (let d = new Date(from.getTime()); d <= to; d = addDays(d, 1)) {
    if (days.includes(d.getUTCDay())) out.push(toISODate(d));
  }
  return out;
}

/**
 * Builds one Meeting from a date and, if there is one, its file.
 * Anything the file does not say falls back to the usual schedule.
 */
function build(
  id: string,
  entry: CollectionEntry<'meetings'> | undefined,
  closureReason: string | undefined,
): Meeting {
  const date = new Date(`${id}T00:00:00Z`);
  const data = entry?.data;
  const period = periodFor(date);

  const starts = data?.starts ?? period.start;
  const ends = data?.ends ?? period.end;
  const where = data?.where ?? CLUB.meetingRoom;

  // A meeting is "unusual" when it does not match the normal pattern, so the
  // page can shout about it. Turning up at lunch to an after-school meeting is
  // the failure we are trying to prevent.
  const unusual =
    starts !== period.start || ends !== period.end || where !== CLUB.meetingRoom;

  return {
    id,
    date,
    weekday: weekdayName(date),
    title: data?.title ?? 'Weekly meeting',
    time: data?.time ?? meetingTime(date, data?.starts ? `${starts}–${ends}` : undefined),
    where,
    starts,
    ends,
    isBlockDay: isBlockDay(date),
    canceled: Boolean(data?.canceled) || Boolean(closureReason),
    canceledReason: data?.canceledReason ?? closureReason,
    unusual,
    agenda: data?.agenda ?? [],
    links: data?.links ?? [],
    speaker: data?.speaker,
    entry,
    // A file with a body has been written up; one with only frontmatter has not.
    hasNotes: Boolean(entry?.body && entry.body.trim().length > 0),
  };
}

/**
 * Every meeting the site knows about, split into what is coming and what has
 * already happened.
 */
export async function getMeetings(): Promise<{
  upcoming: Meeting[];
  past: Meeting[];
  next?: Meeting;
}> {
  const files = await getCollection('meetings');

  // The filename IS the date, so an odd name is a mistake worth stopping for.
  for (const file of files) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(file.id)) {
      throw new Error(
        `Meeting file "${file.id}.md" must be named by its date, like 2026-09-14.md`,
      );
    }
  }

  const byId = new Map(files.map((f) => [f.id, f]));
  const today = todayUTC();

  // Look back to the first meeting anyone recorded, and six months forward.
  const earliestFile = files.map((f) => f.id).sort()[0];
  const from = earliestFile ? new Date(`${earliestFile}T00:00:00Z`) : today;
  const to = addDays(today, 183);

  const closures = await closureMap(from, to);

  // Dates the schedule produces, plus any file on a date it did not — which is
  // how a Saturday hackathon or an evening talk gets in.
  const ids = new Set([...scheduledDates(from, to), ...byId.keys()]);

  const all = [...ids]
    .sort()
    .map((id) => build(id, byId.get(id), closures.get(id)));

  const todayId = toISODate(today);
  return {
    upcoming: all.filter((m) => m.id >= todayId),
    past: all.filter((m) => m.id < todayId).reverse(),
    // The next meeting that is actually happening.
    next: all.find((m) => m.id >= todayId && !m.canceled),
  };
}
