/**
 * THE BOOT TERMINAL
 * =================
 * The fake command line that greets visitors. Type `help`, look around, then
 * `join` to answer a small challenge and enter the site.
 *
 * How it is put together:
 *
 *   - The HTML for the terminal lives in BootTerminal.astro, inside a
 *     <template> tag. A template is markup the browser holds but does not
 *     display, so the terminal only exists once this file copies it out.
 *   - That is deliberate. The real website is fully written into the page
 *     before we do anything, which means search engines, screen readers, and
 *     anybody whose JavaScript did not load get the whole site, never a wall.
 *   - Which mode we are in ('skippable', 'hard' or 'hero') only changes two
 *     things: whether there is a Skip button, and whether the Escape key
 *     works. That is why switching modes is a one-line change in
 *     src/config/site.ts.
 *
 * To add a command, add one entry to the COMMANDS object below. Nothing else
 * needs to change — the help text builds itself from that object.
 */

import {
  attack,
  newFight,
  KNIGHT_ART,
  type FightState,
} from './boss-fight';

/** The settings BootTerminal.astro hands over when it starts this up. */
export interface BootOptions {
  mode: 'skippable' | 'hard' | 'hero';
  storageKey: string;
}

/** One line of text printed into the terminal, and how it should look. */
export type LineStyle = 'normal' | 'dim' | 'gold' | 'cyan' | 'success' | 'error';

/**
 * THE COMMANDS `help` ADMITS TO
 * =============================
 * These are the ones a visitor is shown, and all but one of them are dead
 * ends. That is deliberate. The terminal is a locked door, not a menu: the
 * point is to poke at it until something gives.
 *
 * The dead ends are written to sound like a real server that is not going to
 * co-operate, and one of them — `run` — is a nudge.
 */
const COMMANDS: Record<string, { blurb: string; lines: [string, LineStyle][] }> = {
  list: {
    blurb: 'List files on the server',
    lines: [
      ['Reading /srv/dev-club ...', 'dim'],
      ['', 'normal'],
      ['You do not have permission to view these files.', 'error'],
    ],
  },
  ssh: {
    blurb: 'Connect to another machine',
    lines: [
      ['Scanning for open connections ...', 'dim'],
      ['', 'normal'],
      ['No connections visible from here.', 'error'],
    ],
  },
  run: {
    blurb: 'Run away',
    lines: [
      ["There's nothing to run from.", 'normal'],
      ['', 'normal'],
      ['Yet.', 'dim'],
    ],
  },
  'boss-fight': {
    blurb: 'Not sure why this is here',
    lines: [],
  },
  exit: {
    blurb: 'Return to the prompt',
    lines: [['Returning to the prompt.', 'dim']],
  },
  clear: {
    blurb: 'Clear the screen',
    lines: [],
  },
};

/**
 * THE HIDDEN COMMANDS
 * ===================
 * None of these appear in `help`. They are here to be found.
 *
 * Each one has a `hint`, which is what `cat .secrets` shows for the ones you
 * have not discovered yet — so there is a trail to follow rather than a list of
 * things you would have to guess blindly.
 *
 * Adding one is three lines: a name, some output, and a hint. Please do add
 * your own; that is rather the point.
 */
interface Egg {
  /** What gets printed. */
  lines: [string, LineStyle][];
  /** Cryptic clue shown in `.secrets` before it has been found. */
  hint: string;
  /** Set for eggs that run an effect instead of just printing. */
  effect?: 'matrix' | 'theme' | 'hornet';
}

const EASTER_EGGS: Record<string, Egg> = {
  ls: {
    hint: 'What would you type to see what is here?',
    lines: [
      ['about  projects  learn  join  README.md', 'normal'],
      ['', 'normal'],
      ['(some files are shy. -a is the flag that coaxes them out.)', 'dim'],
    ],
  },

  'ls -a': {
    hint: 'Files whose names start with a dot like to hide.',
    lines: [
      ['.  ..  .secrets  .config  README.md', 'normal'],
      ['about  projects  learn  join', 'normal'],
      ['', 'normal'],
      ['Try: cat .secrets', 'gold'],
    ],
  },

  '.config': {
    hint: 'There is more than one dotfile.',
    lines: [
      ['# dev-club/.config', 'dim'],
      ['curiosity   = maximum', 'normal'],
      ['gatekeeping = false', 'normal'],
      ['snacks      = occasionally', 'normal'],
      ['hornets     = stylised only', 'normal'],
    ],
  },

  whoami: {
    hint: 'Who are you, anyway?',
    lines: [['guest — but not for long', 'cyan']],
  },

  sudo: {
    hint: 'Try demanding something.',
    lines: [
      ['Nice try.', 'gold'],
      ['', 'normal'],
      ['You already have all the permissions you need here.', 'dim'],
    ],
  },

  hornet: {
    hint: 'We are the Hornets. Say so.',
    effect: 'hornet',
    lines: [],
  },

  matrix: {
    hint: 'A film about a green rain of characters.',
    effect: 'matrix',
    lines: [],
  },

  theme: {
    hint: 'Not a fan of gold?',
    effect: 'theme',
    lines: [],
  },

  coffee: {
    hint: 'What does every programmer allegedly run on?',
    lines: [
      ['418 I\'M A TEAPOT', 'gold'],
      ['', 'normal'],
      ['This is a real HTTP status code. Somebody put it in the actual', 'dim'],
      ['specification as a joke in 1998 and it never left.', 'dim'],
    ],
  },

  sl: {
    hint: 'What happens when you type ls too fast?',
    lines: [
      ['      ====        ________                ___________', 'gold'],
      ['  _D _|  |_______/        \\__I_I_____===__|_________|', 'gold'],
      ['   |(_)---  |   H\\________/ |   |        =|___ ___|', 'gold'],
      ['   /     |  |   H  |  |     |   |         ||_| |_||', 'gold'],
      ['  |      |  |   H  |__--------------------| [___] |', 'gold'],
      ['', 'normal'],
      ['(a real command that exists purely to punish typos)', 'dim'],
    ],
  },

  vim: {
    hint: 'Open an editor people joke about escaping.',
    lines: [
      ['You are now trapped in vim.', 'gold'],
      ['', 'normal'],
      ['Press Escape, then type  :q!  and hit Enter.', 'normal'],
      ['', 'normal'],
      ['(you are not actually trapped. but one day you will be.)', 'dim'],
    ],
  },

  '42': {
    hint: 'The answer to life, the universe, and everything.',
    lines: [
      ['Correct.', 'success'],
      ['', 'normal'],
      ['Now what was the question?', 'dim'],
    ],
  },

  fortune: {
    hint: 'Ask for your fortune.',
    lines: [],
  },

  credits: {
    hint: 'Who made this?',
    lines: [
      ['This site was built by Dev Club members.', 'normal'],
      ['', 'normal'],
      ['Every project, recap and track on it was written by a student', 'dim'],
      ['and merged through a pull request, the same as real software.', 'dim'],
      ['', 'normal'],
      ['Your name could be in the commit log by Thursday.', 'gold'],
    ],
  },

  konami: {
    hint: 'A very old cheat code. Arrow keys, then two letters.',
    lines: [
      ['↑ ↑ ↓ ↓ ← → ← → B A', 'gold'],
      ['', 'normal'],
      ['30 LIVES GRANTED', 'success'],
      ['', 'normal'],
      ['You will need roughly four of them to learn Git.', 'dim'],
    ],
  },

  exit: {
    hint: 'Try to leave.',
    lines: [['You can just click Skip, you know.', 'dim']],
  },
};

/** Rotating fortunes, for the `fortune` command. */
const FORTUNES: string[] = [
  'It works on my machine.',
  'There are two hard problems in computer science: naming things, cache invalidation, and off-by-one errors.',
  'The code you write at 2am will be read by someone at 9am. Often you.',
  'Weeks of coding can save you hours of planning.',
  'Deleted code has no bugs.',
  'Every program has at least one more bug. This is known as the law.',
  'Asking for help early is a senior developer skill.',
  'The best time to write a comment was when you wrote the line. The second best time is now.',
];

/** The club mascot, as close as we get to one. Hexagons, not clip art. */
const HORNET_ART: [string, LineStyle][] = [
  ['        __     __        ', 'gold'],
  ['       /  \\   /  \\       ', 'gold'],
  ['      |    |_|    |      ', 'gold'],
  ['       \\__/   \\__/       ', 'gold'],
  ['        __     __        ', 'gold'],
  ['       /  \\   /  \\       ', 'gold'],
  ['      |    |_|    |      ', 'gold'],
  ['       \\__/   \\__/       ', 'gold'],
  ['', 'normal'],
  ['        NOVATO HORNETS', 'normal'],
  ['   stylised, never clip art', 'dim'],
];

/** Accent colours the `theme` command cycles through. */
const THEMES: { name: string; value: string }[] = [
  { name: 'hornet gold', value: '#ffc400' },
  { name: 'acid green', value: '#a3e635' },
  { name: 'cyan', value: '#22d3ee' },
  { name: 'magenta', value: '#f472b6' },
];

/** Does this visitor prefer less animation? If so we print instantly. */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Starts the terminal. Called once by BootTerminal.astro.
 */
export function startBootTerminal(options: BootOptions): void {
  const { mode, storageKey } = options;
  const isOverlay = mode !== 'hero';

  // Someone who has already been through the intro should not have to do it
  // again — unless they asked for it. The QR code on the club banner points at
  // "?boot", so scanning it always drops you into the terminal, whether or not
  // you have been to the site before.
  //
  // The inline script in the page head makes the same check to decide whether
  // to hide the page behind the overlay, so the two must agree.
  if (isOverlay && !wantsBoot() && hasSeenBoot(storageKey)) {
    revealSite();
    return;
  }

  const template = document.getElementById('boot-template') as HTMLTemplateElement | null;
  if (!template) {
    // Something is wrong with the page, but the website itself is fine.
    // Show it rather than leaving anyone staring at a blank screen.
    revealSite();
    return;
  }

  const root = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  root.id = 'boot-root';

  // In 'hard' mode there is no way out but through, so the Skip button goes.
  // In 'hero' mode there is nothing to skip, so it goes there too.
  if (mode === 'hard' || mode === 'hero') {
    root.querySelector('[data-boot-skip]')?.remove();
  }

  // The inline hero version sits in the page instead of covering it.
  if (isOverlay) {
    root.classList.add('fixed', 'inset-0', 'z-50');
    document.body.appendChild(root);
  } else {
    document.getElementById('boot-inline-mount')?.appendChild(root);
    revealSite();
  }

  const screen = root.querySelector<HTMLElement>('[data-boot-output]')!;
  const input = root.querySelector<HTMLInputElement>('[data-boot-input]')!;
  const form = root.querySelector<HTMLFormElement>('[data-boot-form]')!;
  const skipButton = root.querySelector<HTMLButtonElement>('[data-boot-skip]');

  // Remember who was focused before we took over, so we can hand focus back
  // politely when the terminal closes.
  const previouslyFocused = document.activeElement as HTMLElement | null;

  /** Null when at the prompt; a fight in progress otherwise. */
  let fight: FightState | null = null;
  /** Once someone is through, typing is finished. */
  let granted = false;

  // ---------------------------------------------------------------------
  // Printing to the screen
  // ---------------------------------------------------------------------

  const STYLE_CLASSES: Record<LineStyle, string> = {
    normal: 'text-bone',
    dim: 'text-muted',
    gold: 'text-gold',
    cyan: 'text-cyan',
    success: 'text-acid font-bold',
    error: 'text-gold',
  };

  /** Adds one line of text to the terminal and scrolls down to it. */
  function print(text: string, style: LineStyle = 'normal'): void {
    const line = document.createElement('div');
    line.className = `${STYLE_CLASSES[style]} whitespace-pre-wrap break-words`;
    // A blank line still needs height, or the spacing collapses.
    line.textContent = text === '' ? ' ' : text;
    screen.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
  }

  /** Prints several lines, with a small pause between them for atmosphere. */
  async function printSequence(lines: [string, LineStyle][], delay = 90): Promise<void> {
    for (const [text, style] of lines) {
      print(text, style);
      // Anyone who asked for reduced motion gets the whole thing at once.
      if (!reducedMotion && delay > 0) await wait(delay);
    }
  }

  /** Echoes what the visitor typed, the way a real terminal does. */
  function echo(text: string): void {
    const line = document.createElement('div');
    line.className = 'text-bone';
    line.textContent = `> ${text}`;
    screen.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
  }

  // ---------------------------------------------------------------------
  // Handling what the visitor types
  // ---------------------------------------------------------------------

  /** Prints the list of commands, built from the COMMANDS object above. */
  function printHelp(): void {
    print('Available commands:', 'dim');
    print('');
    for (const [name, command] of Object.entries(COMMANDS)) {
      print(`  ${name.padEnd(13)}${command.blurb}`);
    }
    print('');
    // Said plainly, because it is true, and because it is the nudge.
    print('Most of these will not get you anywhere.', 'dim');
    print('');
  }

  /** Opens the boss fight. */
  async function startFight(): Promise<void> {
    fight = newFight();

    // Wipe the screen first. The terminal shows about eighteen lines, and the
    // knight plus its introduction is most of that — without clearing, the
    // art scrolls off the top before anybody has seen it.
    screen.replaceChildren();

    await printSequence(KNIGHT_ART, reducedMotion ? 0 : 55);
    await printSequence(
      [
        ['', 'normal'],
        ['A FIREWALL KNIGHT blocks the way.', 'gold'],
        ['', 'normal'],
        ['Type an attack. Or type run.', 'dim'],
      ],
      reducedMotion ? 0 : 120,
    );

    // printSequence keeps the view pinned to the newest line; put it back to
    // the top so the whole knight is on screen when the fight begins.
    screen.scrollTop = 0;

    input.placeholder = 'your attack';
  }

  /** One exchange with the knight. */
  async function fightTurn(raw: string): Promise<void> {
    const state = fight!;

    // Leaving is always allowed. The knight does not chase.
    if (/^(run|exit|flee|quit|back)$/i.test(raw.trim())) {
      fight = null;
      input.placeholder = 'type help';
      print('');
      print('You back away. The knight lets you go.', 'normal');
      print('It has seen people come back.', 'dim');
      print('');
      return;
    }

    // Reading the notes mid-standoff is allowed, and does not count as a
    // failed attack. This is the safety net, and being stuck in the fight is
    // exactly when somebody needs it.
    if (/^(cat +)?\.?secrets$/i.test(raw.trim())) {
      print('');
      print('You check the notes. The knight waits, politely.', 'dim');
      await printSecrets();
      return;
    }

    // Asking for help mid-fight gets fight help, not the server's menu.
    if (/^help$/i.test(raw.trim())) {
      print('');
      print('Type an attack. Anything you like.', 'normal');
      print('Type run to back out.', 'dim');
      print('');
      print('The knight waits. It is in no hurry at all.', 'dim');
      print('');
      return;
    }

    const { lines, art, won } = attack(raw, state);

    // An attack that comes with art gets a beat of its own. The terminal shows
    // about eighteen lines, so a drawing and the knight's answer cannot both
    // be on screen at once — printing them together would scroll the top of
    // the picture away before anyone saw it. So: clear the screen, draw, hold
    // it there, and only then let the answer scroll it off. Ordinary attacks
    // skip all of this and the fight still reads as a conversation.
    if (art) {
      screen.replaceChildren();
      echo(raw);
      // No blank line before the drawing: the screen fits the echoed command
      // and sixteen rows exactly, and a spacer costs us the boots.
      await printSequence(art, reducedMotion ? 0 : 55);
      // printSequence follows the newest line; put the view back to the top so
      // the whole drawing is on screen for the pause.
      screen.scrollTop = 0;
      await wait(reducedMotion ? 700 : 1600);
    }

    print('');
    await printSequence(lines, reducedMotion ? 0 : 70);

    if (!won) {
      print('');
      return;
    }

    fight = null;
    granted = true;
    input.disabled = true;

    await printSequence(
      [
        ['', 'normal'],
        ['  ✓ FIREWALL DOWN', 'success'],
        ['  ✓ ACCESS GRANTED', 'success'],
        ['', 'normal'],
        ['  Welcome to Dev Club.', 'normal'],
        ['', 'normal'],
      ],
      reducedMotion ? 0 : 260,
    );

    // Swap the input line for a button that takes them into the site.
    form.hidden = true;
    const enter = document.createElement('button');
    enter.type = 'button';
    enter.className =
      'mt-2 rounded border border-gold px-5 py-2.5 font-mono text-sm text-gold ' +
      'transition-colors hover:bg-gold hover:text-ink';
    enter.textContent = '[ Enter the site ]';
    enter.addEventListener('click', () => finish());
    form.parentElement!.appendChild(enter);
    enter.focus({ preventScroll: true });
  }

  /** Runs one typed command. */
  async function run(raw: string): Promise<void> {
    const text = raw.trim();
    if (text === '') return;

    echo(text);

    // Mid-fight, anything typed is an attack rather than a command.
    if (fight) {
      await fightTurn(text);
      return;
    }

    // Lower-case it and squeeze runs of spaces, so "ls   -A" still matches
    // "ls -a". Small thing; saves a lot of "why didn't that work".
    const name = text.toLowerCase().replace(/\s+/g, ' ');

    if (name === 'help') return printHelp();

    if (name === 'clear') {
      screen.replaceChildren();
      return;
    }

    if (name === 'boss-fight' || name === 'bossfight' || name === 'boss') {
      return startFight();
    }

    // `exit` at the prompt just clears the line and says so.
    if (name === 'exit') {
      print('');
      print('Returning to the prompt.', 'dim');
      print('');
      return;
    }

    if (COMMANDS[name]) {
      print('');
      await printSequence(COMMANDS[name].lines, reducedMotion ? 0 : 60);
      print('');
      return;
    }

    // `cat .secrets` is the map: it shows what has been found and leaves a
    // clue for everything that has not.
    if (name === 'cat .secrets' || name === '.secrets' || name === 'secrets') {
      await printSecrets();
      return;
    }

    // `cat something` falls through to an egg of that name, so `cat .config`
    // works the way somebody used to a terminal would expect.
    const catTarget = name.startsWith('cat ') ? name.slice(4).trim() : null;
    const eggName = catTarget && EASTER_EGGS[catTarget] ? catTarget : name;

    if (EASTER_EGGS[eggName]) {
      print('');
      const egg = EASTER_EGGS[eggName];

      // Some eggs do something rather than say something.
      if (egg.effect === 'matrix') await runMatrix();
      else if (egg.effect === 'theme') nextTheme();
      else if (egg.effect === 'hornet') await printSequence(HORNET_ART, reducedMotion ? 0 : 45);
      else if (eggName === 'fortune') {
        print(FORTUNES[Math.floor(Math.random() * FORTUNES.length)], 'cyan');
      } else {
        await printSequence(egg.lines, reducedMotion ? 0 : 60);
      }

      print('');
      return;
    }

    // A couple of small commands that behave like the real thing.
    if (name === 'pwd') {
      print('');
      print('/var/www/dev-club', 'normal');
      print('');
      return;
    }
    if (name.startsWith('echo ')) {
      print('');
      print(text.slice(5));
      print('');
      return;
    }

    // Unknown input gets a nudge, never a scolding.
    print('');
    print(`I don't know "${text}" yet.`, 'error');
    print('Type help to see what does work.', 'dim');
    print('');
  }

  // ---------------------------------------------------------------------
  // Easter eggs
  // ---------------------------------------------------------------------

  /**
   * `.secrets` — notes left behind by whoever tried this before you.
   *
   * This used to be a checklist of hidden commands with a "found 3 of 14"
   * counter, which was a second game sitting beside the first one and broke
   * the fiction every time you opened it. It is now part of the story: an
   * abandoned scratchpad that points at the fight and says, without saying,
   * that the way through is not a weapon.
   *
   * It is also the safety net. Anyone who cannot work out what to do can read
   * this and get a push in the right direction.
   */
  async function printSecrets(): Promise<void> {
    await printSequence(
      [
        ['', 'normal'],
        ['# .secrets', 'dim'],
        ['# left by whoever was here before you', 'dim'],
        ['', 'normal'],
        ['Tried everything sharp. Everything on fire.', 'normal'],
        ['Everything that counts as a damage type.', 'normal'],
        ['None of it works. Do not waste your afternoon on it', 'normal'],
        ['like I did.', 'normal'],
        ['', 'normal'],
        ['But it flinches.', 'gold'],
        ['', 'normal'],
        ['I have watched it flinch four separate times and I still', 'normal'],
        ['do not know at what. Whatever gets through that armour', 'normal'],
        ['is not a weapon.', 'normal'],
        ['', 'normal'],
        ['Keep it talking. It cannot help itself.', 'cyan'],
        ['', 'normal'],
        ['I ran out of lunch break. You might not.', 'dim'],
        ['', 'normal'],
      ],
      reducedMotion ? 0 : 60,
    );
  }

  /** A short burst of falling characters, because of course. */
  async function runMatrix(): Promise<void> {
    const CHARS = 'アイウエオカキクケコ01{}[]<>/\\|=+*';
    const rows = reducedMotion ? 3 : 12;

    for (let i = 0; i < rows; i++) {
      let line = '';
      for (let j = 0; j < 46; j++) {
        // Leave gaps so it reads as rain rather than a solid block.
        line += Math.random() > 0.35 ? CHARS[Math.floor(Math.random() * CHARS.length)] : ' ';
      }
      print(line, 'success');
      if (!reducedMotion) await wait(70);
    }
    print('');
    print('Wake up, Hornet.', 'gold');
  }

  /** Cycles the site accent colour. Lives until the page is reloaded. */
  let themeIndex = 0;
  function nextTheme(): void {
    themeIndex = (themeIndex + 1) % THEMES.length;
    const theme = THEMES[themeIndex];
    // Every gold thing on the site reads this one variable, so setting it here
    // re-skins the whole page at once.
    document.documentElement.style.setProperty('--color-gold', theme.value);
    print(`accent colour → ${theme.name}`, 'gold');
    print('');
    print('(reload the page to put it back)', 'dim');
  }

  // ---------------------------------------------------------------------
  // Leaving the terminal
  // ---------------------------------------------------------------------

  /** Closes the terminal for good and shows the site. */
  function finish(): void {
    rememberBoot(storageKey);

    if (!isOverlay) return; // The hero version stays where it is.

    root.classList.add('opacity-0');
    const removeIt = () => {
      root.remove();
      revealSite();
      document.removeEventListener('keydown', onKeydown, true);

      /**
       * Start at the top of the page.
       *
       * The overlay hides the site rather than replacing it, so the page
       * underneath can already be scrolled — most often because the browser
       * restored the position from a previous visit when this one loaded, which
       * you cannot see while the terminal is covering it. Entering the site
       * then dropped you into the middle of the page instead of at the title.
       */
      window.scrollTo(0, 0);

      // preventScroll matters: focusing an element scrolls it into view, which
      // would undo the line above.
      (previouslyFocused ?? document.querySelector<HTMLElement>('a[href]'))?.focus({
        preventScroll: true,
      });
    };
    // Let the fade finish first, unless the visitor asked for less motion.
    if (reducedMotion) removeIt();
    else setTimeout(removeIt, 320);
  }

  /**
   * Keeps keyboard focus inside the terminal while it is covering the page,
   * and handles the Escape key. Without the focus trap, pressing Tab would
   * walk invisibly into the hidden page behind, which is disorienting for
   * anyone using a keyboard or a screen reader.
   */
  function onKeydown(event: KeyboardEvent): void {
    if (!isOverlay || granted) return;

    // Escape skips — but only in the mode that allows skipping.
    if (event.key === 'Escape' && mode === 'skippable') {
      event.preventDefault();
      finish();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href]',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Wrap around at both ends so focus can never leave the terminal.
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // ---------------------------------------------------------------------
  // Wiring it all up
  // ---------------------------------------------------------------------

  /**
   * The Konami code: up up down down left right left right B A.
   * We watch the last ten keys pressed and compare. Typing `konami` works too,
   * for anyone who reads the hint rather than remembering 1986.
   */
  const KONAMI = [
    'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
    'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
  ];
  let konamiProgress: string[] = [];

  root.addEventListener('keydown', (event) => {
    konamiProgress.push(event.key.toLowerCase());
    if (konamiProgress.length > KONAMI.length) konamiProgress.shift();

    if (konamiProgress.join(',') === KONAMI.join(',')) {
      konamiProgress = [];
      input.value = '';
      void (async () => {
        print('');
        await printSequence(EASTER_EGGS.konami.lines, reducedMotion ? 0 : 90);
        print('');
      })();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    void run(value);
  });

  skipButton?.addEventListener('click', () => finish());

  if (isOverlay) {
    document.addEventListener('keydown', onKeydown, true);
    // The page behind is hidden, so hide it from screen readers too. Otherwise
    // they would read out a page the visitor cannot see or reach.
    for (const child of Array.from(document.body.children)) {
      if (child !== root) child.setAttribute('aria-hidden', 'true');
    }
  }

  // Clicking anywhere on the terminal should put the cursor back in the input,
  // the way clicking a real terminal window does.
  root.addEventListener('mousedown', (event) => {
    if (granted) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a')) return;
    event.preventDefault();
    input.focus();
  });

  // Finally: print the opening screen.
  void (async () => {
    await printSequence(
      [
        ['DEV CLUB SYSTEM', 'gold'],
        ['Status: locked', 'dim'],
        ['', 'normal'],
        ['You are not supposed to be here.', 'normal'],
        ['', 'normal'],
        ['Type help.', 'normal'],
        ['', 'normal'],
      ],
      reducedMotion ? 0 : 220,
    );
    input.focus();
  })();

  // The terminal is built, so the page-head safety timer has nothing to fix.
  // For the overlay we keep the site hidden behind it until finish() runs.
}

// -------------------------------------------------------------------------
// Small helpers
// -------------------------------------------------------------------------

/** Uncovers the real website. Safe to call more than once. */
function revealSite(): void {
  document.documentElement.removeAttribute('data-booting');
  for (const child of Array.from(document.body.children)) {
    if (child.id !== 'boot-root') child.removeAttribute('aria-hidden');
  }
}

/**
 * Did the visitor explicitly ask for the intro? The banner's QR code adds
 * "?boot" to the address so a scan always starts the break-in, whether or not
 * they have been to the site before.
 */
export function wantsBoot(): boolean {
  try {
    return new URLSearchParams(location.search).has('boot');
  } catch {
    return false;
  }
}

/** Has this browser been through the intro before? */
function hasSeenBoot(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    // Private browsing can block storage entirely. Showing the intro again is
    // a much better failure than showing a blank page.
    return false;
  }
}

/** Notes that this browser has been through the intro. */
function rememberBoot(key: string): void {
  try {
    localStorage.setItem(key, new Date().toISOString());
  } catch {
    // Nothing to do — they will simply see the intro again next time.
  }
}

/** Pauses for a moment, used to pace the typing effect. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
