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

/**
 * STORY - the branching adventure hidden in the terminal on the front page.
 * ==========================================================================
 * This is the collection to add to if you want your first change to the site
 * to be something you can actually play. Each file below is ONE SCENE: a bit
 * of text, and the choice that leads to it.
 *
 * HOW THE STORY FITS TOGETHER
 * ---------------------------
 * A scene says which scene it hangs off, using `from`. It is written that way
 * around on purpose. If a scene instead listed its own children, then every
 * person adding a scene would have to edit the SAME file, and at a meeting
 * where ten people add a scene at once, nine of them would get a merge
 * conflict. Because a scene names its parent, adding one means adding one new
 * file and changing nothing else — so ten people can work at once and none of
 * them collide.
 *
 * Your scene is a branch of the story, and the copy of the code you write it
 * in is a branch of the repository. Same word, and very nearly the same idea.
 *
 * TWO KINDS OF SCENE
 * ------------------
 * An ENTRANCE starts a new storyline. It sets `command` — the secret word
 * somebody has to type into the terminal to find it — and has no `from`.
 * Entrances are not listed anywhere; they are meant to be discovered.
 *
 * Every other scene sets `from` and `choice`, and no `command`.
 *
 * An ENDING sets `ending: true`, which offers the reader the way into the
 * site. A storyline needs at least one, or it goes nowhere.
 *
 * See CONTRIBUTING.md for the walkthrough.
 */

/**
 * Words a scene is not allowed to use as its `command` or its `choice`.
 *
 * The terminal checks for these BEFORE it looks at any scene, so that a
 * reader can always get out of the story no matter what anyone writes. That
 * means a scene using one of them would simply never fire — it would look
 * broken with nothing to point at. Rejecting it here turns that silent
 * failure into a build error that says what to do instead.
 */
const RESERVED_STORY_WORDS = [
  'back',
  'exit',
  'quit',
  'run',
  'flee',
  'help',
  'clear',
  'secrets',
  '.secrets',
  'cat .secrets',
];

/**
 * Is this word one the terminal has reserved?
 *
 * The check lives in `superRefine` below rather than on the field itself,
 * because a plain `.refine()` loses the custom message on the way through
 * Astro and the contributor just sees "Invalid input" — which tells a
 * beginner nothing at all.
 */
const isReserved = (value: string): boolean =>
  RESERVED_STORY_WORDS.includes(value.trim().toLowerCase());

const story = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/story' }),
  schema: z
    .object({
      // The scene this one follows on from: the `id` of another scene, which
      // is that scene's filename without the .md. Leave this out only if you
      // are writing an entrance.
      from: z.string().optional(),

      // What the reader types to get here from `from`. Keep it to one or two
      // words - it is being typed, not clicked.
      choice: z.string().optional(),

      // ENTRANCES ONLY. The secret word that starts this storyline from the
      // terminal prompt. Do not tell anyone. That is the point.
      command: z.string().optional(),

      // Set true if this scene ends the story and lets the reader into the
      // site. Every storyline needs at least one of these somewhere.
      ending: z.boolean().default(false),

      // ENTRANCES ONLY, and optional. A cryptic clue for `cat .secrets`, the
      // in-terminal list of things left to find. Leave this out when you add
      // an entrance: an advisor decides which entrances get a public clue, so
      // that the clue list stays short enough to be a trail rather than an
      // index.
      hint: z.string().optional(),

      // GitHub username of whoever wrote the scene, so you get the credit.
      // Username only, never a real name.
      author: z.string().optional(),
    })
    // Checked after the fields above, because it is about how they combine.
    .superRefine((scene, ctx) => {
      const isEntrance = scene.command !== undefined;

      // Reserved words first: if the word is one the terminal keeps for
      // itself, the scene would silently never fire, and nothing else about
      // the file is worth commenting on until that is fixed.
      for (const field of ['choice', 'command'] as const) {
        const value = scene[field];
        if (value !== undefined && isReserved(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message:
              `"${value}" cannot be used as a ${field}, because the terminal ` +
              `keeps that word so a reader can always get out of the story. ` +
              `Reserved: ${RESERVED_STORY_WORDS.join(', ')}. Pick another word.`,
          });
        }
      }

      if (isEntrance && scene.from !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from'],
          message:
            'A scene sets EITHER `command` (it starts a storyline) OR `from` ' +
            '(it continues one), never both. Remove whichever one you did not mean.',
        });
      }

      if (!isEntrance && scene.from === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from'],
          message:
            'This scene has no `from`, so nothing leads to it and no reader ' +
            'could ever see it. Add `from: <the id of the scene before this ' +
            'one>`, or add `command:` to make it the start of a new storyline.',
        });
      }

      if (!isEntrance && scene.from !== undefined && scene.choice === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['choice'],
          message:
            'This scene has a `from` but no `choice`, so there is nothing for ' +
            'the reader to type to reach it. Add `choice: <a word or two>`.',
        });
      }

      if (isEntrance && scene.choice !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['choice'],
          message:
            '`choice` is how a reader gets here from the scene before. An ' +
            'entrance has no scene before it, so remove `choice` and keep ' +
            '`command`.',
        });
      }
    }),
});

// Hand all five collections to Astro. Every collection must be listed here or
// Astro will not know it exists.
export const collections = { projects, tracks, meetings, updates, story };
