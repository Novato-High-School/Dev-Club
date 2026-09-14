/**
 * CONTENT COLLECTIONS
 * ===================
 * This is how club members add things to the website without touching any
 * layout or design code. Each "collection" below is a folder of Markdown
 * files, and each Markdown file becomes a card or an entry on a page.
 *
 * To add a project, you write a new file in src/content/projects/.
 * To add a meeting recap, you write a new file in src/content/updates/.
 * See CONTRIBUTING.md for step by step instructions.
 *
 * The `schema` for each collection is a checklist of what a file must contain.
 * If you forget a required field or make a typo, the site will refuse to build
 * and print a message telling you exactly which file and field is wrong. That
 * is on purpose: a clear error now beats a broken page later.
 *
 * PRIVACY RULE, enforced by design: none of these schemas has a field for a
 * student's full name, email address, or photo. Credit people by their GitHub
 * username instead. This is a public website that anyone can read.
 */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// `z` is Zod, the library that checks each Markdown file has what it needs.
// Astro re-exports it from 'astro/zod' so the versions always match.
import { z } from 'astro/zod';

/**
 * PROJECTS - what the club is building. Shown on the Build page.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    // Short name of the project, e.g. "Hornet Bot".
    title: z.string(),
    // One or two sentences explaining what it is, in plain language.
    summary: z.string(),
    // Where the project is at. Controls the coloured label on the card.
    status: z.enum(['idea', 'building', 'shipped', 'archived']),
    // Technologies used, e.g. ['Python', 'Discord API']. Shows as small tags.
    tech: z.array(z.string()).default([]),
    // Optional link to the code on GitHub.
    repo: z.url().optional(),
    // Optional link to a live, working version.
    demo: z.url().optional(),
    // GitHub usernames of the people who worked on it, e.g. ['octocat'].
    // Usernames only, never real names.
    contributors: z.array(z.string()).default([]),
    // Date the project started, written as YYYY-MM-DD.
    started: z.coerce.date(),
    // Set to true to pin this project to the top of the Build page.
    featured: z.boolean().default(false),
  }),
});

/**
 * TRACKS - the things you can learn at Dev Club. Shown on the Learn page.
 */
const tracks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tracks' }),
  schema: z.object({
    // Name of the track, e.g. "Python".
    title: z.string(),
    // One sentence on what you will be able to do after this track.
    summary: z.string(),
    // A Lucide icon name from https://lucide.dev/icons, e.g. 'terminal'.
    icon: z.string().default('code'),
    // How much experience you need before starting.
    level: z.enum(['start here', 'intermediate', 'advanced']),
    // Small code sample shown on the card, and which language it is written in
    // so the syntax colours come out right.
    snippet: z.string().optional(),
    snippetLang: z.string().default('python'),
    // Controls the order tracks appear in. Lower numbers come first.
    order: z.number().default(100),

    // Roughly how long the track takes, in plain words rather than hours.
    // For example "one meeting" or "a few weeks of lunches".
    time: z.string().default("a few meetings"),

    // What you need before starting. Written as full sentences, because they
    // are shown to somebody deciding whether they are ready.
    needs: z.array(z.string()).default([]),

    // What you will be able to do when you are done. These become the
    // checklist on the track page, so write them as things a person DOES.
    outcomes: z.array(z.string()).default([]),

    // Links out to the genuinely good free tutorials, so a track keeps going
    // after the meeting ends. Keep this short and curated, not a link dump.
    resources: z
      .array(z.object({ label: z.string(), url: z.url(), note: z.string().optional() }))
      .default([]),
  }),
});

/**
 * MEETINGS - one file per meeting, named by date: 2026-09-14.md
 *
 * You do NOT need a file for an ordinary meeting. The site works out the
 * schedule on its own, so a normal Monday appears with no file at all.
 *
 * Add a file when there is something to say: an agenda beforehand, notes
 * afterwards, a guest speaker, a different time or room, or a cancellation.
 *
 * The DATE COMES FROM THE FILENAME. There is no date field, on purpose - a
 * file called 2026-09-14.md containing "date: 2026-09-17" is a contradiction
 * waiting to happen, and we have been bitten by exactly that already.
 */
const meetings = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/meetings' }),
  schema: z.object({
    // What this meeting is about. Optional - without it the site just says
    // "Weekly meeting".
    title: z.string().optional(),

    // Set true when a meeting is called off. Say why: the site shows the
    // reason rather than silently dropping the meeting.
    canceled: z.boolean().default(false),
    canceledReason: z.string().optional(),

    // Override the usual time and place for this one meeting. `starts` and
    // `ends` are 24-hour "HH:MM" and feed the calendar; `time` is only for
    // when you want different wording on the page.
    starts: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    ends: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    time: z.string().optional(),
    where: z.string().optional(),

    // What you plan to do, shown before the meeting happens.
    agenda: z.array(z.string()).default([]),

    // Pages we will actually use in the meeting. Internal links can be
    // written the short way, e.g. /learn/github.
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),

    // A visiting guest. This is for ADULT professionals who have agreed to be
    // listed on a public website - never for students. Link to a public
    // professional page, never a personal email or phone number.
    speaker: z
      .object({
        name: z.string(),
        role: z.string(),
        topic: z.string().optional(),
        link: z.url().optional(),
      })
      .optional(),
  }),
});

/**
 * UPDATES - announcements that are not tied to a meeting.
 */
const updates = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/updates' }),
  schema: z.object({
    // Headline for the update.
    title: z.string(),
    // Date it happens or happened, written as YYYY-MM-DD.
    date: z.coerce.date(),
    // Only 'news' now - meeting agendas and recaps live in src/content/meetings/.
    kind: z.enum(['news']).default('news'),
  }),
});

// Hand all four collections to Astro. Every collection must be listed here or
// Astro will not know it exists.
export const collections = { projects, tracks, meetings, updates };
