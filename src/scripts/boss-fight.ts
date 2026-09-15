/**
 * THE FIREWALL KNIGHT
 * ===================
 * The boss fight behind the club's front door.
 *
 * THE JOKE, so nobody "fixes" it: every real attack fails. The knight is
 * immune to fire, ice, lightning, psychic damage, and every other thing a
 * player might reasonably try — it is wearing armour proofed against all of
 * them. You cannot win by hitting it harder. Typing a longer, more elaborate
 * attack is actively counterproductive, because it gives the knight time to
 * sit down and recover.
 *
 * You win by not fighting fairly. The ways through are silly: hornets, a
 * squirrel, an unattended kitchen appliance. If a visitor never guesses, the
 * knight heckles them and gives one away — so nobody gets stuck.
 *
 * ADDING TO IT is meant to be easy, and is a good first code contribution:
 *   - a new damage type      -> one line in DAMAGE_TYPES
 *   - a new taunt            -> one line in GENERIC_MISSES
 *   - a new way to win       -> one entry in VULNERABILITIES
 * Nothing else needs touching; the fight reads all three at runtime.
 */

import type { LineStyle } from './boot-terminal';

/** A line of output and how it should look. */
export type FightLine = [string, LineStyle];

/** What the caller needs to remember between turns. */
export interface FightState {
  /** Failed attacks so far. Drives when the knight starts heckling. */
  misses: number;
  /** Only ever goes up. That is the point. */
  hp: number;
  /** Which heckle comes next, so they do not repeat. */
  heckle: number;
}

export function newFight(): FightState {
  return { misses: 0, hp: 100, heckle: 0 };
}

/**
 * The knight itself. Kept narrow enough to fit the terminal on a phone.
 */
export const KNIGHT_ART: FightLine[] = [
  ['                        (  )              ', 'gold'],
  ['                       )    (             ', 'gold'],
  ['           .-"""""-.    )  (              ', 'normal'],
  ['          /  _   _  \\    ||               ', 'normal'],
  ['         |  (o) (o)  |   ||               ', 'normal'],
  ['         |    ___    | --++--             ', 'normal'],
  ['          \\  \\___/  /    ||               ', 'normal'],
  ['         /|_________|\\   ()               ', 'normal'],
  ['        / | FIREWALL | \\                  ', 'gold'],
  ['       |  |  KNIGHT  |  |                 ', 'gold'],
  ['        \\_|__|___|__|_/                   ', 'normal'],
];

/**
 * THE FLAMING SWORD
 * =================
 * ASCII art by Joan G. Stark, whose signature ("jgs") is part of the drawing
 * and stays in it. Her work is all over the early web; if you reuse ASCII art
 * from anywhere, leave the artist's mark alone and name them in a comment,
 * exactly like this.
 *
 * The only change we made to the original is the fire: the `|`, `(` and `)`
 * strokes hugging the blade. Every other column is untouched, which is why the
 * little tower on the right still lines up.
 *
 * It prints when somebody swings a blade at the knight, which is what almost
 * everybody tries first. The sword looks magnificent. It does nothing. That is
 * the joke, so please do not "fix" it by letting this win the fight.
 *
 * Sixteen rows, and no caption: the terminal shows about eighteen lines, and
 * the echoed command and a blank take the other two. Anything longer scrolls
 * its own top off. Keep new art inside that budget.
 */
export const FLAMING_SWORD_ART: FightLine[] = [
  ['  \\|/', 'gold'],
  ['|\\)|(          //', 'gold'],
  [' \\\\(|||)      _!_', 'gold'],
  ['  \\\\)|||(    /___\\', 'gold'],
  ['   \\\\(|||)   [+++]', 'gold'],
  ['    \\\\)|  _ _\\^^^/_ _', 'normal'],
  ['     \\\\/ (    \'-\'  ( )', 'normal'],
  ['     /( \\/ | {&}   /\\ \\', 'normal'],
  ['       \\  / \\     / _> )', 'normal'],
  ['        "`   >:::;-\'`""\'-.', 'normal'],
  ['            /:::/         \\', 'normal'],
  ['           /  /||   {&}   |', 'normal'],
  ['          (  / (\\         /', 'normal'],
  ['          / /   \\\'-.___.-\'', 'normal'],
  ['    jgs _/ /     \\ \\', 'normal'],
  ['       /___|    /___|', 'normal'],
];

/**
 * DAMAGE TYPES
 * Every one of these fails. The armour named beside each is the punchline, so
 * make new ones specific — "fire-proof gauntlets" is funnier than
 * "fire-proof armour".
 *
 * The key is what gets matched; list synonyms and weapons that deal that kind
 * of damage, so "sword", "axe" and "slash" all land on the same joke.
 */
export const DAMAGE_TYPES: {
  match: string[];
  name: string;
  armour: string;
  /** Optional art printed before the knight shrugs the attack off. */
  art?: FightLine[];
}[] = [
  { match: ['fire', 'flame', 'burn', 'fireball', 'torch', 'lava', 'magma'], name: 'fire', armour: 'a flame-retardant tabard' },
  { match: ['ice', 'cold', 'frost', 'freeze', 'blizzard', 'snow'], name: 'ice', armour: 'a thermal underlayer' },
  { match: ['lightning', 'shock', 'electric', 'thunderbolt', 'taser', 'volt'], name: 'lightning', armour: 'rubber-soled sabatons' },
  { match: ['thunder', 'sonic', 'sound', 'scream', 'shout', 'noise'], name: 'thunder', armour: 'a noise-cancelling helm' },
  { match: ['acid', 'corrosive', 'dissolve'], name: 'acid', armour: 'a lab-grade apron' },
  { match: ['poison', 'toxic', 'venomous', 'gas'], name: 'poison', armour: 'a sealed respirator' },
  { match: ['psychic', 'mind', 'telepath', 'mental', 'confuse'], name: 'psychic', armour: 'a tinfoil coif' },
  { match: ['necrotic', 'death', 'decay', 'rot', 'undead'], name: 'necrotic', armour: 'a suspiciously fresh surcoat' },
  { match: ['radiant', 'holy', 'divine', 'smite', 'bless'], name: 'radiant', armour: 'a polarised visor' },
  { match: ['force', 'kinetic', 'telekinesis', 'push'], name: 'force', armour: 'reinforced bracing' },
  { match: ['slash', 'sword', 'blade', 'axe', 'katana', 'machete', 'cut', 'sabre', 'saber'], name: 'slashing', armour: 'overlapping plate', art: FLAMING_SWORD_ART },
  { match: ['pierce', 'arrow', 'spear', 'bow', 'lance', 'dagger', 'stab', 'javelin', 'dart'], name: 'piercing', armour: 'chainmail, obviously' },
  { match: ['bludgeon', 'hammer', 'mace', 'club', 'bat', 'punch', 'kick', 'fist', 'smash'], name: 'bludgeoning', armour: 'a very good gambeson' },
  { match: ['water', 'flood', 'tide', 'wave', 'hydro'], name: 'water', armour: 'a waterproof cloak' },
  { match: ['wind', 'air', 'gust', 'tornado', 'cyclone'], name: 'wind', armour: 'an aerodynamic crest' },
  { match: ['earth', 'rock', 'stone', 'boulder', 'quake'], name: 'earth', armour: 'a hard hat' },
  { match: ['shadow', 'dark', 'void', 'umbral'], name: 'shadow', armour: 'a night-vision visor' },
  { match: ['light', 'laser', 'beam', 'photon'], name: 'light', armour: 'mirrored pauldrons' },
  { match: ['arcane', 'magic', 'spell', 'wizard', 'wand', 'hex', 'curse'], name: 'arcane', armour: 'an anti-magic gorget' },
  { match: ['nature', 'vine', 'thorn', 'root', 'druid'], name: 'nature', armour: 'gardening gloves' },
  { match: ['explosive', 'bomb', 'grenade', 'tnt', 'dynamite', 'blast', 'rocket'], name: 'explosive', armour: 'bomb-disposal padding' },
  { match: ['radiation', 'nuclear', 'nuke', 'atomic', 'gamma'], name: 'radiation', armour: 'a lead-lined cuirass' },
  { match: ['gravity', 'blackhole', 'black hole', 'singularity'], name: 'gravity', armour: 'weighted boots' },
  { match: ['time', 'chrono', 'rewind', 'stasis'], name: 'temporal', armour: 'a wristwatch it refuses to explain' },
  { match: ['plasma', 'ion'], name: 'plasma', armour: 'a ceramic heat shield' },
  { match: ['steel', 'metal', 'iron'], name: 'metal', armour: 'more metal' },
  { match: ['ghost', 'spectral', 'phase', 'spirit'], name: 'spectral', armour: 'consecrated chainmail' },
  { match: ['dragon', 'draconic', 'wyrm'], name: 'draconic', armour: 'dragonhide, second-hand' },
  { match: ['fairy', 'pixie', 'charm'], name: 'fairy', armour: 'cold iron trim' },
  { match: ['virus', 'malware', 'trojan', 'worm', 'ransomware'], name: 'malware', armour: 'up-to-date definitions' },
  { match: ['ddos', 'flood attack', 'packet', 'botnet'], name: 'volumetric', armour: 'generous bandwidth' },
  { match: ['sql', 'injection', 'inject', 'drop table'], name: 'injection', armour: 'parameterised queries' },
  { match: ['brute', 'bruteforce', 'brute force', 'password', 'crack'], name: 'brute force', armour: 'a rate limiter' },
  { match: ['phish', 'phishing', 'scam', 'email'], name: 'phishing', armour: 'mandatory annual training' },
  { match: ['xss', 'script', 'javascript'], name: 'script injection', armour: 'a strict content policy' },
];

/** The knight's stock response to anything that counts as damage. */
export function missLine(type: { name: string; armour: string }): FightLine[] {
  return [
    [`The knight is impervious to your ${type.name}.`, 'error'],
    [`It is wearing ${type.armour}.`, 'dim'],
  ];
}

/** For attacks the knight cannot even classify. Rotates so it never repeats. */
export const GENERIC_MISSES: string[] = [
  'The knight parries without looking up.',
  'Nothing happens. The knight seems disappointed on your behalf.',
  'The firewall logs your attempt and rates it 2 out of 10.',
  'That bounces off. The knight does not acknowledge it.',
  'The knight blocks it one-handed and yawns.',
  'Access denied. Also, that was not really an attack.',
  'The knight steps aside. You hit a wall. The wall is fine.',
  'Your attack is added to a list of things that did not work.',
];

/**
 * WAYS THROUGH
 * None of them are violence. That is the whole gag: the firewall is hardened
 * against every attack in the book and completely open to being distracted.
 *
 * These work the first time you try them — nobody has to fail first.
 */
export const VULNERABILITIES: {
  match: string[];
  /** Three escalating giveaways: barely there, then unmistakable. */
  tells: string[][];
  lines: FightLine[];
}[] = [
  {
    match: ['hornet', 'hornets', 'wasp', 'bee', 'bees', 'venom', 'sting', 'swarm'],
    tells: [
      ['... wait.', 'Was that a hornet?', '... No. Nothing. ON GUARD.'],
      ['The knight swats at the air, then pretends it was a stretch.', '"I am not AFRAID of insects, if that is what you are implying."'],
      ['"Look — the helmet does not seal at the neck. It is a known issue.', 'Do not get any ideas. Especially not stinging ones."'],
    ],
    lines: [
      ['You release a hornet.', 'normal'],
      ['', 'normal'],
      ['The visor slams shut. Too late. The hornet is already inside.', 'normal'],
      ['', 'normal'],
      ['"NOT THE — AGH — WHY IS IT ALWAYS HORNETS—"', 'gold'],
      ['', 'normal'],
      ['The firewall knight clatters to the floor in several pieces.', 'normal'],
    ],
  },
  {
    match: ['squirrel', 'squirrels'],
    tells: [
      ['The knight\'s head snaps to the left at nothing at all.', '"... I thought I saw something move."'],
      ['"Nine years I have guarded this port. Nothing distracts me.', 'Not wildlife. Not rodents. Not the small fast ones."'],
      ['"If anyone shouts a certain woodland animal at me I WILL look.', 'I know I will. I have made peace with it."'],
    ],
    lines: [
      ['You point past the knight and shout "SQUIRREL!"', 'normal'],
      ['', 'normal'],
      ['"WHERE?"', 'gold'],
      ['', 'normal'],
      ['The knight turns around so fast its helmet stays facing you', 'normal'],
      ['for a moment. You walk straight past.', 'normal'],
    ],
  },
  {
    match: ['refrigerator', 'fridge', 'freezer', 'appliance'],
    tells: [
      ['The knight pauses mid-swing, staring into the middle distance.', '"... did I leave something on?"'],
      ['"It is fine. It is FINE. The kitchen is fine." It is not convinced.'],
      ['"My one weakness is unfinished business. Appliances. At home.', 'Forget I said that. Forget I said appliances."'],
    ],
    lines: [
      ['You ask: "Is your refrigerator running?"', 'normal'],
      ['', 'normal'],
      ['The knight goes very still.', 'normal'],
      ['', 'normal'],
      ['"...yes?"', 'gold'],
      ['', 'normal'],
      ['"Then you had better go and catch it."', 'normal'],
      ['', 'normal'],
      ['It sprints off down the corridor, armour clanging.', 'normal'],
    ],
  },
  {
    match: ['compliment', 'nice armour', 'nice armor', 'flatter', 'praise', 'thank'],
    tells: [
      ['The knight adjusts its pauldrons, slightly, as if you might notice.'],
      ['"Nobody ever says anything about the armour. Nine years.', 'Not that I keep count."'],
      ['"You could just SAY something nice. About the polish, say.', 'Hypothetically. Then I would have to let you past, obviously."'],
    ],
    lines: [
      ['You tell the knight its armour looks genuinely well maintained.', 'normal'],
      ['', 'normal'],
      ['A long pause.', 'normal'],
      ['', 'normal'],
      ['"...really? I do polish it."', 'gold'],
      ['', 'normal'],
      ['The knight steps aside to show you the pauldrons, and keeps', 'normal'],
      ['talking about them. You are already through the door.', 'normal'],
    ],
  },
];

/**
 * THE LEAK
 * The knight gives itself away, and immediately covers for it.
 *
 * Three tiers, getting less subtle each time, so an attentive player catches
 * the first one and nobody is ever permanently stuck. It is appended to a
 * failed attack rather than delivered as a speech: a tic the knight cannot
 * suppress reads far better than it announcing its own weakness.
 */
export function leak(state: FightState): FightLine[] {
  const vulnerability = VULNERABILITIES[state.heckle % VULNERABILITIES.length];
  // Tier rises with every leak, so help arrives quickly if it is needed.
  const tier = Math.min(state.heckle, vulnerability.tells.length - 1);
  state.heckle += 1;

  return [
    ['', 'normal'],
    ...vulnerability.tells[tier].map((line: string): FightLine => [line, 'cyan']),
  ];
}

/** Normalises what somebody typed so matching is forgiving. */
function normalise(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** One exchange. Returns what to print and whether the knight has fallen. */
export function attack(
  input: string,
  state: FightState,
): { lines: FightLine[]; art?: FightLine[]; won: boolean } {
  const text = normalise(input);

  // A way through always works, first try or fiftieth.
  for (const vulnerability of VULNERABILITIES) {
    if (vulnerability.match.some((word) => text.includes(word))) {
      return { lines: vulnerability.lines, won: true };
    }
  }

  state.misses += 1;

  // Typing an essay gives the knight time to sit down.
  if (input.length > 60) {
    state.hp += 10;
    const lines: FightLine[] = [
      ['You type a long, detailed and frankly beautiful attack.', 'normal'],
      ['', 'normal'],
      ['The knight takes a short rest while you finish it.', 'dim'],
      ['', 'normal'],
      [`The firewall knight recovers 10 HP. (${state.hp} HP)`, 'error'],
    ];
    if (state.misses % 3 === 0) lines.push(...leak(state));
    return { lines, won: false };
  }

  const damage = DAMAGE_TYPES.find((type) =>
    type.match.some((word) => text.includes(word)),
  );

  // A damage type may bring art with it. The picture is the reward for a good
  // guess, never a shortcut past the fight: the knight still shrugs the attack
  // off exactly like any other. The extra beat below is the knight standing
  // there, unimpressed, while you finish your big entrance.
  const lines: FightLine[] = damage
    ? [
        ...(damage.art
          ? ([['The knight waits for you to finish.', 'dim'], ['', 'normal']] as FightLine[])
          : []),
        ...missLine(damage),
      ]
    : [[GENERIC_MISSES[state.misses % GENERIC_MISSES.length], 'error']];

  lines.push(['', 'normal'], [`Firewall knight: ${state.hp} HP`, 'dim']);

  // Every third failure, it gets bored and says too much.
  if (state.misses % 3 === 0) lines.push(...leak(state));

  return { lines, art: damage?.art, won: false };
}
