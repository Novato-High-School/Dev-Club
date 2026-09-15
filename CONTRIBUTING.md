# Contributing to the Dev Club website

This is the club's real website, and club members are the ones who keep it up
to date. You do **not** need to know Astro, Tailwind, or JavaScript to add
something to it.

Most changes are one Markdown file. You can make them from a Chromebook, in
your browser, without installing anything.

---

## The one rule that matters most

**Never put personal information about a student on this site.** No full names,
no email addresses, no phone numbers, no photos of students, no schedules.

Credit people by their **GitHub username** instead — that is a name they chose
to be public. The site is designed so this is the easy path: none of the
templates below even have a field for a real name.

If you are unsure whether something counts, ask Mr. Knudson before you open the
pull request. That is always the right call.

---

## How changes reach the live site

Every change goes through a pull request. **Nobody pushes straight to `main`,
including the advisor** — GitHub is set up to refuse it. That is on purpose, and
it is how professional teams work.

The path a change takes:

1. **You make a branch.** A separate copy where your work lives. If you edit in
   the GitHub website it offers to make one for you; take the offer.
2. **You open a pull request.** You describing your change and asking for it to
   be included.
3. **A check runs automatically.** It builds the whole site to confirm your
   change did not break it. Roughly a minute. A red X here is information, not
   a telling-off.
4. **Somebody reviews it.** One other person reads it and either approves or
   asks a question. This is the step that catches a phone number nobody meant
   to publish.
5. **It gets merged, and it is live** about a minute later.

Two things worth saying plainly:

- **You cannot break the live site.** If a change does not build, the deploy
  stops and the site keeps serving the last working version.
- **Review is not judgement.** Everybody's work gets reviewed, every time.
  Having a change questioned is the normal state of affairs, not a sign you did
  badly.

---

## Add a project to the Build page

1. Go to the [`src/content/projects/`](src/content/projects/) folder on GitHub.
2. Click **Add file → Create new file**.
3. Name it after your project, all lowercase with dashes and ending in `.md` —
   for example `robot-arm.md`.
4. Paste this in and edit it:

```markdown
---
title: Robot Arm
summary: One or two sentences on what it is, in plain language.
status: building
tech: ['Python', 'Arduino']
repo: https://github.com/Novato-High-School/robot-arm
contributors: ['your-github-username']
started: 2026-09-15
featured: false
---

A few paragraphs about the project. What does it do? What is working so far?
What is the next thing you want to get running?

**Good first task:** name something specific a new member could pick up.
```

5. Scroll down, click **Commit changes**, and choose **Create a new branch and
   start a pull request**.

### What each field means

| Field          | What to put                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `title`        | The project's name.                                                           |
| `summary`      | One or two sentences. This is the text on the card.                           |
| `status`       | Exactly one of `idea`, `building`, `shipped`, `archived`.                     |
| `tech`         | List of technologies, in square brackets and quotes.                          |
| `repo`         | Link to the code. Leave the whole line out if there is not one yet.           |
| `demo`         | Link to a working version. Leave the line out if there is not one.            |
| `contributors` | GitHub usernames only. **Never real names.**                                  |
| `started`      | The date you started, written `YYYY-MM-DD`.                                   |
| `featured`     | `true` puts it on the home page. Keep this to two or three projects.          |

---

## Meetings

**You do not need a file for an ordinary meeting.** The site works out the
schedule by itself: Mondays at lunch in 3202, skipping holidays and school
breaks. A normal week appears on the site with nobody touching anything.

Add a file when there is something to say. Files live in
[`src/content/meetings/`](src/content/meetings/) and **are named by date** —
`2026-09-14.md`. There is no `date:` field; the filename is the date, so the
two can never disagree.

### Before a meeting — the plan

```markdown
---
title: Bot commands and first pull requests
agenda:
  - Set up GitHub accounts
  - Open your first pull request
links:
  - label: Start here
    url: /start
  - label: GitHub track
    url: /learn/github
---
```

`links` are the pages you will actually open during the meeting, so people can
follow along from the meeting page.

### After a meeting — what happened

**You do not have to remember to do this.** On the morning of every meeting a
GitHub issue appears saying "Take notes", with that meeting's plan already in
it. Comment on it to claim it, then write the notes and it closes itself once
they are merged.

If the issue is still open the next day, that is the reminder. Nothing else is
chasing you.

Open the meeting's file and write underneath the `---`. Three sentences is
plenty.

```markdown
---
title: Bot commands and first pull requests
---

Eight people came. Six got GitHub accounts set up and four opened their first
pull request, which is a record. Next week we are finishing the `!idea` command.
```

Nothing moves when you do this. The meeting became an archive entry the moment
its date passed; adding a body just fills in the write-up.

### A guest speaker

A visit **is** a meeting, so it goes on the meeting file. It appears on the
Connect page automatically.

```markdown
---
title: Guest — what a security job actually looks like
speaker:
  name: Full Name
  role: Security Engineer, Company
  topic: How attackers actually get in, and how you stop them
  link: https://company.com/team/their-bio
---
```

Only add a guest **after they have agreed to be listed on a public website**,
and link to a public professional page — never a personal email or phone number.

### A different time or place

```markdown
---
title: Evening demo night
starts: '18:00'
ends: '19:30'
where: Library
---
```

The site then flags it loudly as "not the usual time", so nobody turns up at
lunch to an empty room. Meetings on other days work too — just name the file
after that date.

### Cancelling one

```markdown
---
canceled: true
canceledReason: Rally schedule, no lunch clubs
---
```

Holidays and school breaks are already handled, so this is only for surprises.

---

## Add an announcement

For news that is not about a meeting, in
[`src/content/updates/`](src/content/updates/):

```markdown
---
title: We won the county hackathon
date: 2026-11-02
kind: news
---

A few sentences about what happened.
```

---

## Add a learning track

Each file in [`src/content/tracks/`](src/content/tracks/) becomes its own page
at `/learn/<filename>`. Write the steps in the body — headings and numbered
lists work and come out styled.

```markdown
---
title: Game Development
summary: One sentence on what you will be able to do afterwards.
icon: gamepad-2
level: start here
time: a few meetings
needs:
  - Nothing, or whatever somebody genuinely has to know first
outcomes:
  - Something the reader will be able to DO when they finish
  - Three or four of these is plenty
snippetLang: python
snippet: |
  import pygame
  pygame.init()
resources:
  - label: Name of a free tutorial
    url: https://example.com
    note: One line on who it suits
order: 50
---

## What you will actually do

1. **First step.** What they do and why it matters.
2. **Second step.**

## When you are done

Point them at something real on this site to go and do.
```

- `icon` is any name from [lucide.dev/icons](https://lucide.dev/icons).
- `level` is exactly one of `start here`, `intermediate`, `advanced`.
- `order` decides position on the Learn page — lower numbers come first.
- `snippet` needs the `|` after it, and every line of code indented two spaces.
- `outcomes` should be things a person *does*, not things they "understand".
- `resources` must be free. We do not send members to paywalls.

---

## Add to the boss fight

The front door is a break-in. Type `boss-fight` at the terminal and a
FIREWALL KNIGHT blocks the way.

**The joke, so nobody "fixes" it:** every real attack fails. Fire, ice,
lightning, psychic damage, SQL injection — the knight has armour proofed
against all of it, and typing a longer attack actively helps it, because it
takes a rest while you finish. You get through by not fighting: hornets, a
squirrel, an unattended refrigerator.

Everything lives in [`src/scripts/boss-fight.ts`](src/scripts/boss-fight.ts)
and each addition is one entry.

### A new damage type

```ts
{ match: ['gravity', 'blackhole'], name: 'gravity', armour: 'weighted boots' },
```

`match` is every word that should land on this joke — synonyms and weapons, so
`sword`, `axe` and `slash` all give the same answer. Make the armour specific:
"flame-retardant tabard" is funnier than "fire-proof armour".

### Changing the knight

The knight is ASCII art by **Joan G. Stark**, and it has two states in
`boss-fight.ts`. You meet `KNIGHT_ART`, whose sword is not lit. Your first
failed attack swaps it for `KNIGHT_ABLAZE`, and the knight spends the rest of
the fight holding a burning sword it did not need to light. That timing is the
joke — arriving on fire is a threat, catching fire after you have already
missed is showing off — so if you change one state, change the other to match.

Three rules if you touch it, or add art of your own anywhere on the site:

- **Credit the artist, and leave their signature in the drawing.** The `jgs` in
  the bottom-left corner is her mark and it stays there. Name whoever drew it
  in a comment above the art.
- **Mind the row budget.** The terminal shows seventeen lines. The unlit knight
  is 15, leaving two for the greeting; the burning one is 16, leaving one for
  the echoed attack that lit it. Anything taller scrolls its own head off
  before it is seen, and anything wider than about forty columns wraps on a
  phone.
- **Count your columns before and after any edit.** The flames are ours, added
  to Stark's original. They only work because the fire went into blank space
  and every other column stayed exactly where it was — which is also why the
  knight does not jump sideways when the sword lights.

### A new taunt

One line in `GENERIC_MISSES`, used when the knight cannot even classify what
you tried.

### A new way to win

```ts
{
  match: ['squirrel'],
  tells: [
    ['The knight\'s head snaps to the left at nothing at all.'],
    ['"Nothing distracts me. Not wildlife. Not the small fast ones."'],
    ['"If anyone shouts a certain woodland animal at me I WILL look."'],
  ],
  lines: [['You point past the knight and shout "SQUIRREL!"', 'normal']],
}
```

`tells` are three escalating giveaways. The knight leaks one every third failed
attack, and they get less subtle each time — the first is a tic it tries to
cover, the last all but tells you. So an attentive player catches it early and
nobody is ever permanently stuck.

Ways through work the first time somebody tries them; they never need to fail
first.

Anyone properly stuck can type `cat .secrets` — even mid-fight — and read the
notes left by the last person who tried.

Keep them silly and keep them kind. The knight is pompous, not mean, and the
joke is never at a visitor's expense.

---

## Club artwork

**Do not make a new logo in Canva.** Everything is generated from the site's
own palette and fonts, so it cannot drift: banners in four sizes, a link
preview, a Google Form header, letterhead, a photocopiable flyer, slide
backgrounds, an email signature strip and a square avatar.

They live at `/brand/...` and `/banner/...` on the live site — the table in
[README.md](README.md) lists every one with what it is for.

Two things worth knowing before you add to it:

- **Adding a topic logo** — the row of GitHub, Python, Azure and so on — is one
  line in `TOPICS` in [`src/config/site.ts`](src/config/site.ts). Every asset
  picks it up. `icon` is a name from [simpleicons.org](https://simpleicons.org).
- **Anything for a printer is light.** A near-black page costs a fortune in
  toner and looks terrible photocopied, so the flyer, letterhead and signature
  use a light palette. Gold text goes darker on white, because `#ffc400` on
  white is unreadable on paper.

Adding a whole new asset is one entry in `BRAND_ASSETS` plus a layout function
in [`src/lib/banner.ts`](src/lib/banner.ts).

---

## Add an easter egg to the terminal

There are hidden commands too, outside the fight — `ls -a`, `matrix`, `fortune`
and others. They are not catalogued anywhere on purpose; they are texture, not
a checklist. Adding one is three lines in
[`src/scripts/boot-terminal.ts`](src/scripts/boot-terminal.ts), in the
`EASTER_EGGS` block:

```ts
yourcommand: {
  hint: 'A clue, shown in .secrets before somebody finds it.',
  lines: [
    ['What gets printed.', 'normal'],
    ['', 'normal'],
    ['A quieter second line.', 'dim'],
  ],
},
```

The styles are `normal`, `dim`, `gold`, `cyan`, `success`, and `error`.

Two rules: keep it kind, and make the `hint` solvable. An egg nobody can find
is just dead code.

---

## Linking to other pages

Write links the simple way. The site adds the `/Dev-Club` part for you:

```markdown
See the [Build](/build) page.
```

Do **not** write `/Dev-Club/build` — it works, but it will have to be changed
if the club ever gets its own domain name.

---

## If the build fails

When you open a pull request, GitHub checks that the site still builds. If it
goes red, click **Details** and read the message. It is usually one of these:

- **"data does not match collection schema"** — a field is missing or misspelled
  in your Markdown file. The message names the file and the field.
- **"Invalid option: expected one of ..."** — you used a value that is not
  allowed, like `status: in-progress` instead of `status: building`. The message
  lists the values that _are_ allowed.
- **Date problems** — dates must be written `YYYY-MM-DD`, e.g. `2026-09-18`.

None of these break the live site. The published site only changes once your
pull request is merged, so a failing build is safe — it is the system catching
a typo for you.

---

## Working in a browser

You do not need to install anything. Two options, both fine on a school
Chromebook:

**github.dev — for words.** Open the repository on GitHub and press the `.`
key. GitHub becomes a code editor in the same tab. Instant, free, no setup.
Perfect for adding a project or a recap. It cannot run the site.

**Codespaces — for code.** From the repository, click **Code → Codespaces →
Create codespace**. You get a real computer in the cloud with the site running
live beside your editor. It sets itself up from
[`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json), which
installs everything and starts the preview for you.

Codespaces uses part of your account's monthly free allowance, so **stop it
when you are done** — the button is in the Codespaces list on GitHub.

The [Start here](https://novato-high-school.github.io/Dev-Club/start) page walks
through both with pictures.

## Running the site on your own computer

Only if you would rather work locally. You need
[Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/Novato-High-School/Dev-Club.git
cd Dev-Club
npm install
npm run dev
```

Then open the address it prints — it will look like
`http://localhost:4321/Dev-Club/`. Edits show up as soon as you save.

Two more commands worth knowing:

```bash
npm run build     # build the site exactly the way GitHub does
npm run preview   # look at that finished build
```

`npm run build` is the one to run before pushing a change to the code. If it
passes for you, it will pass on GitHub.

---

## Where things live

| Path                     | What it is                                             |
| ------------------------ | ------------------------------------------------------ |
| `src/config/site.ts`     | Site-wide settings. **Start here.**                    |
| `src/content/`           | The Markdown files above. Most changes happen here.    |
| `src/pages/`             | One file per page of the site.                         |
| `src/components/`        | Reusable pieces: nav, footer, cards, the terminal.     |
| `src/layouts/`           | The frame every page sits inside.                      |
| `src/styles/global.css`  | Colours and fonts.                                     |
| `src/scripts/`           | Code that runs in the visitor's browser.               |
| `src/scripts/boss-fight.ts` | The firewall knight: attacks, taunts, ways through. |
| `src/lib/banner.ts`      | Every piece of club artwork, drawn as SVG.             |
| `src/pages/brand/`       | Where the artwork is published from.                   |
| `scripts/`               | Jobs that run on GitHub, not in a browser.             |
| `.devcontainer/`         | The recipe for a Codespace.                            |
| `.github/workflows/`     | The automatic deployment.                              |

---

## A note on the code

Every file is commented for somebody reading it for the first time. If you
change something and the comment above it is now wrong, please fix the comment
in the same pull request. Out-of-date comments are worse than none.

If you read a file and cannot follow what it does, that is a bug in our
comments, not in you. Say so — that is a genuinely useful contribution.
