/**
 * THE WRITE-UP NUDGE
 * ==================
 * On the afternoon of a meeting, if nobody has written it up yet, this opens a
 * GitHub issue asking somebody to. The issue links straight to the editor, so
 * claiming it is one click and writing it is three sentences.
 *
 * WHY THE SAME DAY rather than the morning after: the people who were in the
 * room are still in the building, and it is still fresh. By tomorrow the
 * meeting is a blur and the issue is a chore.
 *
 * HOW IT KNOWS THERE WAS A MEETING
 * It reads the site's own calendar feed, dist/meetings.ics, which the build
 * produces. That feed already has the schedule, the school holidays and the
 * cancellations applied to it — so this script does not repeat any of that
 * logic and cannot disagree with the website about when the club meets.
 */

import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const REPO = process.env.GITHUB_REPOSITORY ?? 'Novato-High-School/Dev-Club';
const TOKEN = process.env.GITHUB_TOKEN;
const API = `https://api.github.com/repos/${REPO}`;

/** Today's date where the school is, not where the server is. */
function todayAtSchool() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * The meeting dates in the published feed. Each event's UID starts with the
 * date, and cancelled meetings are never in the feed at all.
 */
async function meetingDatesFromFeed(feedPath) {
  const ics = await readFile(feedPath, 'utf8');
  return new Set([...ics.matchAll(/^UID:(\d{4}-\d{2}-\d{2})@/gm)].map((m) => m[1]));
}

/** Has somebody written this meeting up? A file with a body counts. */
async function hasNotes(date) {
  const file = path.join('src', 'content', 'meetings', `${date}.md`);
  try {
    await access(file);
  } catch {
    return false;
  }

  const text = await readFile(file, 'utf8');
  // Frontmatter sits between the first two --- lines; anything after is notes.
  const body = text.replace(/^---[\s\S]*?\n---\n?/, '').trim();
  return body.length > 0;
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

async function main() {
  const today = todayAtSchool();
  const meetings = await meetingDatesFromFeed(path.join('dist', 'meetings.ics'));

  if (!meetings.has(today)) {
    console.log(`No meeting on ${today}. Nothing to do.`);
    return;
  }

  if (await hasNotes(today)) {
    console.log(`${today} is already written up. Nothing to do.`);
    return;
  }

  // A hidden marker, so re-running cannot open a second issue for one meeting.
  const marker = `<!-- meeting-notes:${today} -->`;
  const existing = await api(`/issues?state=all&per_page=100`);
  if (existing.some((issue) => (issue.body ?? '').includes(marker))) {
    console.log(`An issue for ${today} already exists. Nothing to do.`);
    return;
  }

  if (!TOKEN) {
    console.log(`Would open an issue for ${today}, but there is no token.`);
    return;
  }

  const pretty = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${today}T00:00:00Z`));

  const file = `src/content/meetings/${today}.md`;
  const editUrl = `https://github.com/${REPO}/edit/main/${file}`;
  const createUrl = `https://github.com/${REPO}/new/main/src/content/meetings?filename=${today}.md`;

  const issue = await api('/issues', {
    method: 'POST',
    body: JSON.stringify({
      title: `Write up ${pretty}'s meeting`,
      body: [
        `We met today and nobody has written it up yet.`,
        ``,
        `**Three sentences is plenty.** What did people work on? Did anything`,
        `get finished? What is next?`,
        ``,
        `- [Add the notes](${editUrl}) — if the file already exists`,
        `- [Create the file](${createUrl}) — if it does not`,
        ``,
        `Write underneath the \`---\`. Everything above it is settings.`,
        ``,
        `This is a genuinely good first contribution: it is one file, you can do`,
        `it from a Chromebook, and it goes live about a minute after it is`,
        `merged.`,
        ``,
        marker,
      ].join('\n'),
    }),
  });

  console.log(`Opened #${issue.number} for ${today}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
