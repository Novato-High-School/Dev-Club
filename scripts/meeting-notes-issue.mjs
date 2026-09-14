/**
 * THE NOTES TASK
 * ==============
 * On the morning of a meeting, opens a GitHub issue asking somebody to take
 * notes. When the notes land, the same job closes it.
 *
 * WHY THE MORNING, NOT THE DAY AFTER
 * Note-taking works when it is a job somebody accepts at the start of a
 * meeting, not a request to reconstruct one from memory afterwards. At a lunch
 * meeting the five minutes after the bell are exactly when people leave. If
 * the task already exists, it can be claimed while everyone is in the room.
 *
 * It also means one issue does two jobs. It starts as a task; if it is still
 * open tomorrow, it has become the reminder, without anything else running.
 *
 * HOW IT KNOWS THERE IS A MEETING
 * It reads the site's own calendar feed, dist/meetings.ics, which the build
 * produces with the schedule, the school holidays and any cancellations
 * already applied. This script repeats none of that logic and so cannot
 * disagree with the website about when the club meets.
 */

import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const REPO = process.env.GITHUB_REPOSITORY ?? 'Novato-High-School/Dev-Club';
const TOKEN = process.env.GITHUB_TOKEN;
const API = `https://api.github.com/repos/${REPO}`;

/** Marks an issue as ours, so we never open two for one meeting. */
const marker = (date) => `<!-- meeting-notes:${date} -->`;

/** Today's date where the school is, not where the server is. */
function todayAtSchool() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function readable(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Meeting dates in the published feed. Cancelled ones are simply not in it. */
async function meetingDates() {
  const ics = await readFile(path.join('dist', 'meetings.ics'), 'utf8');
  return new Set([...ics.matchAll(/^UID:(\d{4}-\d{2}-\d{2})@/gm)].map((m) => m[1]));
}

function meetingFile(date) {
  return path.join('src', 'content', 'meetings', `${date}.md`);
}

/** The frontmatter and body of a meeting file, if there is one. */
async function readMeeting(date) {
  try {
    await access(meetingFile(date));
  } catch {
    return null;
  }
  const text = await readFile(meetingFile(date), 'utf8');
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const body = text.replace(/^---[\s\S]*?\n---\n?/, '').trim();
  return { frontmatter, body };
}

/** Has somebody written this meeting up? A file with a body counts. */
async function hasNotes(date) {
  const meeting = await readMeeting(date);
  return Boolean(meeting && meeting.body.length > 0);
}

/**
 * The agenda from the meeting file, so the note-taker starts from a skeleton
 * rather than a blank page.
 */
function agendaFrom(frontmatter) {
  const block = frontmatter.match(/^agenda:\n((?:\s*-\s.*\n?)+)/m)?.[1];
  if (!block) return [];
  return [...block.matchAll(/^\s*-\s+(.*)$/gm)].map((m) => m[1].trim());
}

async function api(route, options = {}) {
  const response = await fetch(`${API}${route}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${route} -> HTTP ${response.status} ${await response.text()}`);
  }
  return response.json();
}

/** Every issue we have ever opened, newest first. */
async function ourIssues() {
  const issues = await api('/issues?state=all&per_page=100');
  return issues
    .map((issue) => ({
      issue,
      date: (issue.body ?? '').match(/<!-- meeting-notes:(\d{4}-\d{2}-\d{2}) -->/)?.[1],
    }))
    .filter((entry) => entry.date);
}

/** Opens today's task. */
async function openTask(date) {
  const meeting = await readMeeting(date);
  const agenda = agendaFrom(meeting?.frontmatter ?? '');

  const file = `src/content/meetings/${date}.md`;
  const editUrl = `https://github.com/${REPO}/edit/main/${file}`;
  const createUrl = `https://github.com/${REPO}/new/main/src/content/meetings?filename=${date}.md`;

  const body = [
    `**Somebody take notes today.** Claim this issue by commenting on it.`,
    ``,
    `Three sentences is plenty: what did people work on, did anything get`,
    `finished, and what is next.`,
    ``,
    ...(agenda.length
      ? [`Today's plan, to save you starting from a blank page:`, ``, ...agenda.map((item) => `- ${item}`), ``]
      : []),
    meeting
      ? `- [Write the notes](${editUrl}) — the file already exists, write under the \`---\``
      : `- [Create the file](${createUrl}) — name it \`${date}.md\`, write under the \`---\``,
    ``,
    `This closes itself once the notes are merged. It is a genuinely good first`,
    `contribution: one file, doable from a Chromebook, live a minute after it`,
    `is merged.`,
    ``,
    marker(date),
  ].join('\n');

  const issue = await api('/issues', {
    method: 'POST',
    body: JSON.stringify({ title: `Take notes — ${readable(date)}`, body }),
  });
  console.log(`Opened #${issue.number} for ${date}.`);
}

/** Closes tasks whose notes have landed, or whose meeting was called off. */
async function closeFinished(meetings, entries) {
  for (const { issue, date } of entries) {
    if (issue.state !== 'open') continue;

    const written = await hasNotes(date);
    const cancelled = !meetings.has(date);
    if (!written && !cancelled) continue;

    await api(`/issues/${issue.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed' }),
    });
    await api(`/issues/${issue.number}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        body: written
          ? 'Notes are in. Thank you — closing this.'
          : 'This meeting is no longer on the calendar, so closing this.',
      }),
    });
    console.log(`Closed #${issue.number} (${written ? 'written up' : 'meeting cancelled'}).`);
  }
}

async function main() {
  const today = todayAtSchool();
  const meetings = await meetingDates();

  if (!TOKEN) {
    const need = meetings.has(today) && !(await hasNotes(today));
    console.log(
      need
        ? `Would open a notes task for ${today}, but there is no token.`
        : `Nothing to do for ${today}.`,
    );
    return;
  }

  const entries = await ourIssues();

  // Tidy up first, so a meeting written up during the meeting itself does not
  // leave its task sitting open.
  await closeFinished(meetings, entries);

  if (!meetings.has(today)) {
    console.log(`No meeting on ${today}.`);
    return;
  }
  if (entries.some((entry) => entry.date === today)) {
    console.log(`${today} already has an issue.`);
    return;
  }
  if (await hasNotes(today)) {
    console.log(`${today} is already written up.`);
    return;
  }

  await openTask(today);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
