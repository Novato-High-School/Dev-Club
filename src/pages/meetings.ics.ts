/**
 * THE CALENDAR FEED
 * =================
 * Publishes every upcoming meeting as an .ics file — the format every calendar
 * app understands. Subscribe once and future meetings, room changes and
 * cancellations arrive on their own.
 *
 * This is deliberately the opposite of plugging the site into somebody's
 * calendar account. It is a plain static file, so there is no login, no app
 * permission, no account to tie it to, and nothing to break when a password
 * changes. Anyone can subscribe, including parents.
 *
 * Lives at /Dev-Club/meetings.ics
 */

import type { APIRoute } from 'astro';

import { getMeetings } from '../lib/meetings';
import { SITE_URL, CLUB } from '../config/site';
import { href } from '../lib/href';

/** The school's timezone. Meeting times are written in local school time. */
const TIME_ZONE = 'America/Los_Angeles';

/**
 * How many hours ahead of UTC the school is on a given date.
 * California is -7 in summer and -8 in winter, and asking the runtime rather
 * than hardcoding it means daylight saving is handled for us.
 */
function offsetMinutes(date: Date): number {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    timeZoneName: 'longOffset',
  }).format(date);

  // Produces something like "9/14/2026, GMT-07:00".
  const match = formatted.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/**
 * Turns a local school date and time into an ICS timestamp in UTC,
 * e.g. ('2026-09-14', '12:25') -> '20260914T192500Z'
 */
function toICSTimestamp(isoDate: string, time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  // Start by pretending the local time is UTC, then correct by the offset.
  const asIfUTC = new Date(`${isoDate}T${time}:00Z`);
  const corrected = new Date(asIfUTC.getTime() - offsetMinutes(asIfUTC) * 60_000);

  void hour;
  void minute;
  return corrected.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Commas, semicolons and newlines have to be escaped in ICS text fields. */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * ICS lines must be 75 bytes or shorter; longer ones are wrapped by starting
 * the continuation with a space.
 */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(' ' + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest) parts.push(' ' + rest);
  return parts.join('\r\n');
}

export const GET: APIRoute = async () => {
  const { upcoming, past } = await getMeetings();

  // Cancelled meetings are simply left out. Calendar apps replace the whole
  // feed each time they sync, so dropping one removes it from the subscriber's
  // calendar, which is exactly what should happen.
  const events = [...past, ...upcoming].filter(
    (meeting) => !meeting.canceled && meeting.starts && meeting.ends,
  );

  // A fixed timestamp per build; calendars use it to spot newer versions.
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Novato High School//Dev Club//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${escapeText('Dev Club meetings')}`),
    `X-WR-TIMEZONE:${TIME_ZONE}`,
  ];

  for (const meeting of events) {
    const url = `${SITE_URL}${href(`/meetings/${meeting.id}`)}`;
    const description = [
      meeting.agenda.length ? meeting.agenda.join('. ') + '.' : '',
      url,
    ]
      .filter(Boolean)
      .join('\n\n');

    lines.push(
      'BEGIN:VEVENT',
      // Stable per meeting, so re-syncing updates rather than duplicates.
      `UID:${meeting.id}@dev-club.novato-high-school`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toICSTimestamp(meeting.id, meeting.starts)}`,
      `DTEND:${toICSTimestamp(meeting.id, meeting.ends)}`,
      fold(`SUMMARY:${escapeText(`Dev Club — ${meeting.title}`)}`),
      fold(`LOCATION:${escapeText(meeting.where)}`),
      fold(`DESCRIPTION:${escapeText(description)}`),
      fold(`URL:${url}`),
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="dev-club.ics"`,
    },
  });
};

// Not used, but keeps the club room handy if the feed ever needs a fallback.
void CLUB;
