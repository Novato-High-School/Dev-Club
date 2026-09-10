# while { Dev Club }

The website for Dev Club at Novato High School — built by the club, hosted free
on GitHub Pages, and rebuilt automatically whenever a change is merged.

**Live site:** https://novato-high-school.github.io/Dev-Club/

## Want to add a project, recap, or track?

Read **[CONTRIBUTING.md](CONTRIBUTING.md)**. It is one Markdown file and you can
do it from a Chromebook without installing anything.

**Before you add anything:** this is a public website. Never put student names,
emails, phone numbers, or photos on it. Credit people by GitHub username.

## Running it locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # http://localhost:4321/Dev-Club/
```

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Live preview while you edit                      |
| `npm run build`   | Build the site the same way GitHub does          |
| `npm run preview` | Look at the finished build                       |
| `npm run check`   | Check for type errors                            |

## How it is built

| Tool                | Why                                                       |
| ------------------- | --------------------------------------------------------- |
| **Astro**           | Turns the files in `src/` into plain, fast HTML            |
| **Tailwind CSS 4**  | Styling, with our colours defined in `src/styles/global.css` |
| **Content collections** | Markdown files become pages, checked for mistakes at build time |
| **Shiki**           | Real syntax highlighting, done at build time               |
| **Lucide**          | Icons                                                      |
| **GitHub Actions**  | Rebuilds and publishes on every push to `main`             |

There is no server and no database. The whole site is static files, which is
why it costs nothing to run and why it collects no visitor data.

## The boot terminal

First-time visitors get a fake command line that asks them to complete
`while (curious) { ______(); }` before entering. Its behaviour is a single
setting in [`src/config/site.ts`](src/config/site.ts):

```ts
export const BOOT_MODE: 'skippable' | 'hard' | 'hero' | 'off' = 'skippable';
```

| Value         | What visitors get                                                      |
| ------------- | ---------------------------------------------------------------------- |
| `'skippable'` | Full-screen intro with a Skip button, remembered after the first visit. **Default.** |
| `'hard'`      | No Skip button — they have to answer the challenge. Fun for a launch day. |
| `'hero'`      | The terminal sits inside the home page and never blocks anyone.         |
| `'off'`       | No terminal at all.                                                     |

Change the line, save, done. The real page is always written into the HTML
underneath, so search engines and anyone without JavaScript get the full site in
every mode — the terminal is a layer on top, never a wall in front.

## Moving to a custom domain

Two steps:

1. In `src/config/site.ts`, set `BASE = '/'` and `SITE_URL` to the new address.
2. Add a `public/CNAME` file containing just the domain name, and point the DNS
   at GitHub Pages.

Every link on the site goes through the `href()` helper, so nothing else needs
editing.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the site and publishes it. Takes about a minute.

**One-time setup by a repo admin:** Settings → Pages → Source → **GitHub Actions**.

## Still to fill in

- [ ] Meeting room and time (`CLUB` in `src/config/site.ts`)
- [ ] Advisor's **school** email address — not a personal one
- [ ] The interest form link (`CLUB.interestFormUrl`)
- [ ] Replace `src/content/speakers/example-guest.md` with a real visit
