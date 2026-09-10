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
  }),
});

/**
 * SPEAKERS - guest speakers and career paths. Shown on the Connect page.
 *
 * Note this collection is for ADULT professionals visiting the club, which is
 * why it has a name field. Do not use it for students.
 */
const speakers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/speakers' }),
  schema: z.object({
    // The guest's name, used with their permission.
    name: z.string(),
    // Their job title and employer, e.g. "Software Engineer, Autodesk".
    role: z.string(),
    // What they came to talk about.
    topic: z.string(),
    // Date of the visit, written as YYYY-MM-DD.
    date: z.coerce.date(),
    // Optional public professional link, such as a company bio page.
    link: z.url().optional(),
  }),
});

/**
 * UPDATES - announcements and meeting recaps. The newest one with
 * kind: 'meeting' becomes the "next meeting" box on the home page.
 */
const updates = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/updates' }),
  schema: z.object({
    // Headline for the update.
    title: z.string(),
    // Date it happens or happened, written as YYYY-MM-DD.
    date: z.coerce.date(),
    // 'meeting' for an upcoming meeting, 'recap' for what happened at one,
    // 'news' for anything else worth announcing.
    kind: z.enum(['meeting', 'recap', 'news']),
    // Optional room number or place, only useful for meetings.
    where: z.string().optional(),
  }),
});

// Hand all four collections to Astro. Every collection must be listed here or
// Astro will not know it exists.
export const collections = { projects, tracks, speakers, updates };
