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

## Add a meeting recap or announcement

Same steps, but in [`src/content/updates/`](src/content/updates/):

```markdown
---
title: Recap — the week we finally fixed the bot
date: 2026-09-18
kind: recap
---

What happened at the meeting, in a few sentences. What did people work on?
Did anything get finished? What is next?
```

`kind` is one of:

- `meeting` — an upcoming meeting. The soonest one becomes the "next meeting"
  box on the home page.
- `recap` — what happened at a meeting that already occurred.
- `news` — anything else worth announcing.

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

## Add an easter egg to the terminal

The intro terminal has hidden commands. Adding one is three lines in
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

The styles are `normal`, `dim`, `gold`, `cyan`, `success`, and `error`. The
count in `.secrets` and the nudge in `help` both update themselves — you do not
have to change a number anywhere.

Two rules: keep it kind (no joke that lands on a person), and make the `hint`
solvable. An egg nobody can find is just dead code.

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
| `.devcontainer/`         | The recipe for a Codespace.                            |
| `.github/workflows/`     | The automatic deployment.                              |

---

## A note on the code

Every file is commented for somebody reading it for the first time. If you
change something and the comment above it is now wrong, please fix the comment
in the same pull request. Out-of-date comments are worse than none.

If you read a file and cannot follow what it does, that is a bug in our
comments, not in you. Say so — that is a genuinely useful contribution.
