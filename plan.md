# Dev Club site — what's next

The site is built and deployed. This file tracks what is left to do.

For how to add content, see [CONTRIBUTING.md](CONTRIBUTING.md).
For how the site is put together, see [README.md](README.md).

---

## Decided and done

Recorded here so nobody re-litigates it:

| Decision | Where it lives |
| --- | --- |
| Astro 7 + Tailwind 4, static, no server | `astro.config.mjs` |
| Deployed to GitHub Pages on merge to `main` | `.github/workflows/deploy.yml` |
| Content in Markdown, schema-checked at build | `src/content.config.ts` |
| Near-black + hornet gold, Space Grotesk + JetBrains Mono | `src/styles/global.css` |
| Boot terminal, switchable in one line | `src/config/site.ts` |
| Site collects no visitor data, credits people by GitHub username | by design |

Two corrections to the original brief, worth not repeating: `@astrojs/tailwind`
is legacy (Tailwind 4 uses `@tailwindcss/vite`), and Astro 7 replaced
remark/rehype with its own Markdown processor, Sätteri.

---

## 1. Launch checklist

### Resolved: the site is reachable at school

`novato-high-school.github.io` has been allowlisted by the district, so the
site works on school devices. Contributing, github.dev and Codespaces already
worked, so the whole workflow is now usable in a meeting.

The custom domain is no longer a blocker — still worth having for a name people
can say out loud and for looking official to parents, but it can happen
whenever. When DNS is ready it is two lines: `BASE = '/'` and `SITE_URL` in
`src/config/site.ts`, plus a `public/CNAME` file. Every link already goes
through the `href()` helper.

### Still to fill in

- [ ] Advisor's **school** email (`@nusd.org`, never a personal address) — `CLUB.advisorEmail`
- [ ] Interest form URL — `CLUB.interestFormUrl`. Keep the form in the school's Google Workspace so submissions land somewhere already approved for student data.
- [ ] Delete `src/content/speakers/example-guest.md` once a real guest has visited

---

## 2. Lock down the workflow

Decided: every change goes through a pull request with one approval. Students
get real branch-and-review practice, and nothing reaches a public school site
without a second person reading it.

**Built already:** `.github/CODEOWNERS` auto-requests the advisor on every PR,
`.github/pull_request_template.md` puts the privacy rule in front of the person
opening it, and `.github/workflows/check.yml` builds the site on every PR.

**Left to do in GitHub's settings** — these cannot be done from the codebase:

- [ ] **Make the repo public.** Push restrictions on a Free organization only
      work on public repos. Public also makes Actions minutes free and lets
      students fork. There are no secrets in the repo and the site content is
      already public.
      **Before flipping it:** see the commit-email note below.
- [ ] **Add a ruleset on `main`** (Settings → Rules → Rulesets → New branch
      ruleset, target `main`):
  - Require a pull request before merging, **1 approval**
  - Require status checks to pass → **Check the site builds**
  - Block force pushes
  - Restrict deletions
  - Dismiss stale approvals when new commits are pushed
- [ ] **Decide what "1 approval" means in practice.** If the advisor is the only
      reviewer it becomes a bottleneck at lunchtime. Promoting two senior
      members to reviewers fixes it and is a genuine responsibility to hand
      somebody.

### Commit emails become public

Every commit so far records `bjknudson@gmail.com` as the author, and making the
repo public makes that permanently visible and harvestable by bots. Options:

- **Going forward:** set the GitHub noreply address
  (`git config user.email "63278475+bjknudson@users.noreply.github.com"`) and
  turn on *Settings → Emails → Block command line pushes that expose my email*.
- **For the existing commits:** they keep the real address unless the history is
  rewritten. Doable while the repo is small and barely cloned, but it changes
  every commit ID.

Worth settling before the repo goes public, not after.

---

## 3. Loose ends in the code

Small, known gaps left from the first build. Each is a good first task for a
member who wants to touch real code rather than Markdown.

**Link preview image.** `BaseLayout.astro` declares
`twitter:card: summary_large_image` but there is no `og:image`, so pasting a
link into Discord or a text message shows nothing. Needs a 1200×630 image in
`public/` and two `<meta>` tags. Could be generated at build time from the page
title so every page gets its own.

**Decide about `motion`.** The `motion` package is in `package.json` but is not
imported anywhere — the animation in the site is all CSS. Either use it for the
entrance and scroll effects in the original brief, or remove the dependency.
Leaving an unused package installed is the worst of the three options.

**Sitemap and robots.txt.** Neither exists. `@astrojs/sitemap` is one line of
config and helps the site actually turn up when somebody searches for the club.

**Real Lighthouse run.** The site was checked for keyboard access, reduced
motion, no-JS, and 375px width, but never scored. Run it on Home and Build and
fix what it finds.

---

## 4. Meetings — built

The next meeting is now worked out rather than typed in. What exists:

- **A schedule, not a file.** Mondays at lunch in 3202, from `MEETING_DAYS` and
  `PERIODS` in `src/config/site.ts`. An ordinary week needs no file at all.
- **Real bell times.** 12:25–12:55 normally, 11:40–12:10 on block days
  (Tuesday/Wednesday), picked from the date of the meeting itself.
- **Closures from three sources**, combined, positive signals only: computed
  federal holidays plus Thanksgiving week (`src/lib/holidays.ts`), the school's
  own ICS feed for the long breaks (`src/lib/school-calendar.ts`), and
  `SKIP_DATES` for surprises. Never inferred from an empty calendar — the feed
  has ordinary school weeks with nothing in them.
- **Meeting files named by date**, holding an agenda beforehand and notes
  afterwards. No `date:` field, so the filename cannot contradict itself.
- **Speakers live on meetings.** A visit is a meeting; `/connect` is a view of
  the meetings that had one. The separate `speakers` collection is gone.
- **`/meetings` archive** listing everything, with un-written-up meetings shown
  quietly and an "add notes" link into GitHub's editor.
- **A published calendar feed** at `/meetings.ics` — a plain file, so no account
  and no app permission, and it handles daylight saving correctly.
- **A daily rebuild** at 07:17 UTC, which is what makes any of this automatic on
  a static site.

Still to do here:

- [ ] **Watch the first few weeks.** The holiday rules are only as good as the
      assumptions behind them. Thanksgiving-week-off is district policy, not
      law, and worth re-checking each August.
- [x] **A write-up nudge.** `.github/workflows/meeting-notes.yml` opens an
      issue on the afternoon of a meeting that has no notes, linking straight
      to the editor. Same day rather than the morning after: the people who
      were in the room are still in the building.
- [ ] **`npm run plan-term`** to generate stub files for a term's Mondays.

### On Remind

Decided against integrating. Remind's developer webhook is a *composer*
integration — it needs a server we do not have, still requires a person to write
the message, and needs partner approval. The site instead gives every meeting a
permanent URL and a copy-ready announcement, so posting to Remind is one paste.

---

## 5. Now that tracks lead somewhere

Built: every track has its own page at `/learn/<name>` with prerequisites,
outcomes, real steps and curated free resources; a `/start` page covers the
account → GitHub Education → join the org → first contribution path; and a
devcontainer means Codespaces sets itself up. The intro terminal has 14 hidden
commands with a `.secrets` map that tracks what you have found.

What that opens up:

- [ ] **Watch where people actually get stuck.** The steps are a guess until a
      real new member walks through them at a meeting. Fix what trips them.
- [ ] **Add tracks as workshops actually run.** Web basics, game development,
      and hardware have all come up. One Markdown file each.
- [ ] **Let members add their own easter eggs.** It is three lines and a genuine
      first code contribution — see CONTRIBUTING.md. Good task for somebody who
      has done a Markdown PR and wants to touch real code next.

---

## 6. Fill it with real content

The site is a shell until this happens, and this is the part members can do
without any code.

- [ ] Replace the three seeded projects with what the club is actually building
- [ ] Write a recap after each meeting (`src/content/updates/`, `kind: recap`)
- [ ] Add tracks beyond the four seeded ones as workshops actually run
- [ ] Add guest speakers once visits happen — with their permission, linking to
      a public professional page, never a personal contact detail

---

## 7. Ideas from the original brief, not yet built

Kept because they are still good, ordered roughly by value per effort.

**Live GitHub repo feed.** Pull the org's public repositories at build time and
show real commit activity on the Build page. Runs in GitHub Actions, so it needs
no secrets in the browser. This is the highest-value item on the list — it makes
the site feel alive without anybody writing a post.

**Motion polish.** Entrance, hover, and scroll animation. Must respect
`prefers-reduced-motion`, which the CSS already honours — keep it that way.

**Glitch, grain, and glow.** SVG filters and CSS gradients for texture, no image
files. Cheap to try, easy to overdo; keep text readable.

**An interactive centrepiece.** Rive for an animated hornet or logo, or Spline
for a rotating wireframe `{ }`. Genuinely fun, and genuinely the most work here —
watch the page weight, and give it a static fallback.

**Custom domain.** Now tracked as the blocker in section 1 — the request is in.

---

## 8. Ongoing

- Keep `CONTRIBUTING.md` true. If a step changes, fix it the same day —
  instructions that lie are worse than none.
- When code changes, fix the comment above it in the same pull request.
- **The privacy rule does not relax.** No student names, emails, phone numbers,
  photos, or schedules on this site, ever. The content schemas have no field for
  them on purpose. If something feels borderline, ask before merging.
