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

## Club artwork

All of it is generated from [`src/lib/banner.ts`](src/lib/banner.ts), using the
same palette and fonts as the website, so nothing can drift out of sync.

| Address | What it is |
| --- | --- |
| `/og.png` | 1200×630 link preview. Shows up automatically when the site is pasted into Remind, Discord or a text |
| `/banner/2x4.svg` · `.png` | 2ft × 4ft, portrait |
| `/banner/1.6x3.svg` · `.png` | 1.6ft × 3ft, portrait |
| `/banner/4x2.svg` · `.png` | 4ft × 2ft, landscape |
| `/banner/3x1.6.svg` · `.png` | 3ft × 1.6ft, landscape |

The landscape versions are laid out separately rather than stretched. They put
the club name first — sized to fill the width, measured rather than guessed, so
it fits whatever proportions the banner has — with the QR in a column down the
right and the topic logos small along the bottom.

**The landscape banners deliberately carry no meeting time or room.** A printed
banner outlives a room assignment, and one advertising the wrong room is worse
than one that sends people to the site to find out. The portrait versions keep
the meeting box, since they are cheaper to reprint.

Sizes live in `BANNER_SIZES` in the config; anything wider than it is tall gets
the landscape treatment automatically.

Send a print shop the **.svg** if they will take it — it is vector, so it stays
sharp at any size. All of the lettering is converted to outlines, which is the
thing print shops mean when they ask you to "convert text to outlines": the file
carries its own letter shapes and does not need our fonts installed anywhere.
The `.png` is there for shops that will not take vector.

### Adding a topic logo

One line in `TOPICS` in [`src/config/site.ts`](src/config/site.ts). The layout
spaces itself out for however many there are.

```ts
{ icon: 'raspberrypi', label: 'Hardware' },
```

`icon` is a name from [simpleicons.org](https://simpleicons.org) — lowercase,
no dots or spaces, so Node.js is `nodedotjs` and Azure is `microsoftazure`. If
the name is wrong the build stops and tells you.

### The QR code

Every banner carries one, and it does **not** point at the plain home page. It
points at `?boot`, which opens the terminal challenge even for somebody who has
been to the site before — so scanning a banner drops you straight into the
interesting part rather than a description of it.

The caption reads **"Scan to break in / find the hidden commands"**. No count,
on purpose: the number would go stale the first time somebody adds an egg, and
not saying is more inviting anyway.

The terminal keeps its Skip button, so it is an invitation, not a toll gate.

**On the logos:** these are other companies' trademarks. Using them to say "we
teach this" is normal, but do not recolour or restyle them, and do not imply
any of them sponsors the club.

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
