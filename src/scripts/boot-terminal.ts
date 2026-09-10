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

/** The settings BootTerminal.astro hands over when it starts this up. */
export interface BootOptions {
  mode: 'skippable' | 'hard' | 'hero';
  storageKey: string;
}

/** One line of text printed into the terminal, and how it should look. */
type LineStyle = 'normal' | 'dim' | 'gold' | 'cyan' | 'success' | 'error';

/**
 * THE COMMANDS
 * Each entry is what gets printed when somebody types that word. Keep the
 * wording short and friendly — a lot of readers here have never used a
 * terminal before, and the first impression matters more than the joke.
 */
const COMMANDS: Record<string, { blurb: string; lines: [string, LineStyle][] }> = {
  about: {
    blurb: 'What is Dev Club?',
    lines: [
      ['Dev Club is the student developer club at Novato High School.', 'normal'],
      ['We build real projects, learn real tools, and publish our work.', 'normal'],
      ['', 'normal'],
      ['No experience required. Genuinely. Most of us started at zero.', 'gold'],
    ],
  },
  projects: {
    blurb: "See what we're building",
    lines: [
      ['Currently in progress:', 'dim'],
      ['  hornet-bot     a Discord bot for the club server', 'normal'],
      ['  this-website   the site you are looking at', 'normal'],
      ['  campus-map     unclaimed, wants a builder', 'normal'],
      ['', 'normal'],
      ['Full details on the Build page.', 'dim'],
    ],
  },
  learn: {
    blurb: 'Explore tools and workshops',
    lines: [
      ['Tracks you can start:', 'dim'],
      ['  github   how teams share code          [start here]', 'normal'],
      ['  python   your first working program    [start here]', 'normal'],
      ['  azure    put it on the internet        [intermediate]', 'normal'],
      ['  apple    build an app with Swift       [intermediate]', 'normal'],
    ],
  },
  join: {
    blurb: 'Request access',
    lines: [],
  },
  clear: {
    blurb: 'Clear the screen',
    lines: [],
  },
};

/** Extra commands that work but are left out of `help`, as a small reward. */
const EASTER_EGGS: Record<string, [string, LineStyle][]> = {
  ls: [
    ['about  projects  learn  join  README.md', 'normal'],
    ['', 'normal'],
    ['(nice, you have used a terminal before)', 'dim'],
  ],
  whoami: [['guest — but not for long', 'cyan']],
  sudo: [['Nice try.', 'gold']],
  exit: [['You can just click Skip, you know.', 'dim']],
};

/** Answers accepted for the `while (curious) { ______(); }` challenge. */
const ACCEPTED_ANSWERS = ['learn', 'build', 'create', 'experiment', 'code', 'explore'];

/** Does this visitor prefer less animation? If so we print instantly. */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Starts the terminal. Called once by BootTerminal.astro.
 */
export function startBootTerminal(options: BootOptions): void {
  const { mode, storageKey } = options;
  const isOverlay = mode !== 'hero';

  // Someone who has already been through the intro should not have to do it
  // again. The inline script in the page head made the same check to decide
  // whether to hide the page, so the two must agree.
  if (isOverlay && hasSeenBoot(storageKey)) {
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

  /** Are we waiting for a normal command, or for the challenge answer? */
  let awaitingChallenge = false;
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
      print(`  ${name.padEnd(10)}${command.blurb}`);
    }
    print('');
  }

  /** Sets up the fill-in-the-blank challenge. */
  function startChallenge(): void {
    awaitingChallenge = true;
    print('Complete the program:', 'dim');
    print('');
    print('  while (curious) {', 'cyan');
    print('      ______();', 'gold');
    print('  }', 'cyan');
    print('');
    input.setAttribute('aria-label', 'Fill in the blank in the program above');
    input.placeholder = 'your answer';
  }

  /** Checks a challenge answer and either lets them in or nudges them. */
  async function checkAnswer(raw: string): Promise<void> {
    // Be generous: ignore capitals, spaces, brackets and semicolons, so that
    // "Build();" and "build" both count. Nobody should fail on punctuation.
    const cleaned = raw.toLowerCase().replace(/[^a-z]/g, '');

    if (!ACCEPTED_ANSWERS.includes(cleaned)) {
      print('');
      print(`"${raw}" is not it — but there is no wrong answer to feel bad about.`, 'error');
      print('Try one of: learn, build, create, experiment', 'dim');
      print('');
      return;
    }

    awaitingChallenge = false;
    granted = true;
    input.disabled = true;

    await printSequence(
      [
        ['', 'normal'],
        ['  checking...', 'dim'],
        ['', 'normal'],
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
    enter.focus();
  }

  /** Runs one typed command. */
  async function run(raw: string): Promise<void> {
    const text = raw.trim();
    if (text === '') return;

    echo(text);

    // While the challenge is on screen, anything typed is treated as an answer
    // rather than as a command.
    if (awaitingChallenge) {
      await checkAnswer(text);
      return;
    }

    const name = text.toLowerCase();

    if (name === 'help') return printHelp();

    if (name === 'clear') {
      screen.replaceChildren();
      return;
    }

    if (name === 'join') {
      print('');
      return startChallenge();
    }

    if (COMMANDS[name]) {
      print('');
      await printSequence(COMMANDS[name].lines, reducedMotion ? 0 : 60);
      print('');
      return;
    }

    if (EASTER_EGGS[name]) {
      print('');
      await printSequence(EASTER_EGGS[name], reducedMotion ? 0 : 60);
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
      // Put keyboard focus somewhere sensible in the real page.
      (previouslyFocused ?? document.querySelector<HTMLElement>('a[href]'))?.focus();
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
        ['Status: waiting for input', 'dim'],
        ['', 'normal'],
        ['Type help to begin.', 'normal'],
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
