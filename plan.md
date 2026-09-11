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

### Blocker: github.io is filtered on school devices

The site is live and correct, but school devices cannot reach it — the district
web filter intercepts `novato-high-school.github.io` and serves a block page.
This is not a fault in the site; the same build loads fine off the school
network. It does mean students cannot see the club website at school, which is
most of the point of having one.

**In progress:** a school domain has been requested. Once DNS points at GitHub
Pages, the switch on our side is two lines — `BASE = '/'` and `SITE_URL` in
`src/config/site.ts` — plus a `public/CNAME` file. Every link already goes
through the `href()` helper, so nothing else changes.

- [ ] Point DNS at GitHub Pages, then make the two-line switch
- [ ] Worth doing while waiting: ask IT to allowlist the single hostname
      `novato-high-school.github.io`. Filters usually block all of `*.github.io`
      at once, so asking for one hostname is a much smaller request.

Good news: `github.com` itself is **not** blocked, so contributing, github.dev
and Codespaces all work on school devices today.

### Still to fill in

- [ ] Advisor's **school** email (`@nusd.org`, never a personal address) — `CLUB.advisorEmail`
- [ ] Interest form URL — `CLUB.interestFormUrl`. Keep the form in the school's Google Workspace so submissions land somewhere already approved for student data.
- [ ] Delete `src/content/speakers/example-guest.md` once a real guest has visited

---

## 2. Loose ends in the code

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

## 3. Now that tracks lead somewhere

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

## 4. Fill it with real content

The site is a shell until this happens, and this is the part members can do
without any code.

- [ ] Replace the three seeded projects with what the club is actually building
- [ ] Write a recap after each meeting (`src/content/updates/`, `kind: recap`)
- [ ] Add tracks beyond the four seeded ones as workshops actually run
- [ ] Add guest speakers once visits happen — with their permission, linking to
      a public professional page, never a personal contact detail

---

## 5. Ideas from the original brief, not yet built

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

## 6. Ongoing

- Keep `CONTRIBUTING.md` true. If a step changes, fix it the same day —
  instructions that lie are worse than none.
- When code changes, fix the comment above it in the same pull request.
- **The privacy rule does not relax.** No student names, emails, phone numbers,
  photos, or schedules on this site, ever. The content schemas have no field for
  them on purpose. If something feels borderline, ask before merging.
