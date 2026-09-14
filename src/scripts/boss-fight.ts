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
  ['                              (  )        ', 'gold'],
  ['                             )    (       ', 'gold'],
  ['                              )  (        ', 'gold'],
  ['                               ||         ', 'dim'],
  ['              .-"""""""-.      ||         ', 'normal'],
  ['             /  _     _  \\     ||         ', 'normal'],
  ['            |  (o)   (o)  |    ||         ', 'normal'],
  ['            |     ___     |  --++--       ', 'normal'],
  ['            |    \\___/    |    ||         ', 'normal'],
  ['             \\___________/     ()         ', 'normal'],
  ['            /|           |\\              ', 'normal'],
  ['           / |  FIREWALL | \\             ', 'gold'],
  ['          |  |  KNIGHT   |  \\            ', 'gold'],
  ['          |  |___________|  |             ', 'normal'],
  ['           \\ /           \\ /             ', 'normal'],
  ['           |_|           |_|              ', 'normal'],
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
}[] = [
  { match: ['fire', 'flame', 'burn', 'fireball', 'torch', 'lava', 'magma'], name: 'fire', armour: 'flame-retardant tabard' },
  { match: ['ice', 'cold', 'frost', 'freeze', 'blizzard', 'snow'], name: 'ice', armour: 'thermal underlayer' },
  { match: ['lightning', 'shock', 'electric', 'thunderbolt', 'taser', 'volt'], name: 'lightning', armour: 'rubber-soled sabatons' },
  { match: ['thunder', 'sonic', 'sound', 'scream', 'shout', 'noise'], name: 'thunder', armour: 'noise-cancelling helm' },
  { match: ['acid', 'corrosive', 'dissolve'], name: 'acid', armour: 'lab-grade apron' },
  { match: ['poison', 'toxic', 'venomous', 'gas'], name: 'poison', armour: 'sealed respirator' },
  { match: ['psychic', 'mind', 'telepath', 'mental', 'confuse'], name: 'psychic', armour: 'tinfoil coif' },
  { match: ['necrotic', 'death', 'decay', 'rot', 'undead'], name: 'necrotic', armour: 'suspiciously fresh surcoat' },
  { match: ['radiant', 'holy', 'divine', 'smite', 'bless'], name: 'radiant', armour: 'polarised visor' },
  { match: ['force', 'kinetic', 'telekinesis', 'push'], name: 'force', armour: 'reinforced bracing' },
  { match: ['slash', 'sword', 'blade', 'axe', 'katana', 'machete', 'cut', 'sabre', 'saber'], name: 'slashing', armour: 'overlapping plate' },
  { match: ['pierce', 'arrow', 'spear', 'bow', 'lance', 'dagger', 'stab', 'javelin', 'dart'], name: 'piercing', armour: 'chainmail, obviously' },
  { match: ['bludgeon', 'hammer', 'mace', 'club', 'bat', 'punch', 'kick', 'fist', 'smash'], name: 'bludgeoning', armour: 'a very good gambeson' },
  { match: ['water', 'flood', 'tide', 'wave', 'hydro'], name: 'water', armour: 'waterproof cloak' },
  { match: ['wind', 'air', 'gust', 'tornado', 'cyclone'], name: 'wind', armour: 'aerodynamic crest' },
  { match: ['earth', 'rock', 'stone', 'boulder', 'quake'], name: 'earth', armour: 'hard hat' },
  { match: ['shadow', 'dark', 'void', 'umbral'], name: 'shadow', armour: 'night-vision visor' },
  { match: ['light', 'laser', 'beam', 'photon'], name: 'light', armour: 'mirrored pauldrons' },
  { match: ['arcane', 'magic', 'spell', 'wizard', 'wand', 'hex', 'curse'], name: 'arcane', armour: 'anti-magic gorget' },
  { match: ['nature', 'vine', 'thorn', 'root', 'druid'], name: 'nature', armour: 'gardening gloves' },
  { match: ['explosive', 'bomb', 'grenade', 'tnt', 'dynamite', 'blast', 'rocket'], name: 'explosive', armour: 'bomb-disposal padding' },
  { match: ['radiation', 'nuclear', 'nuke', 'atomic', 'gamma'], name: 'radiation', armour: 'lead-lined cuirass' },
  { match: ['gravity', 'blackhole', 'black hole', 'singularity'], name: 'gravity', armour: 'weighted boots' },
  { match: ['time', 'chrono', 'rewind', 'stasis'], name: 'temporal', armour: 'wristwatch it refuses to explain' },
  { match: ['plasma', 'ion'], name: 'plasma', armour: 'ceramic heat shield' },
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

/** Armour is singular or plural; this keeps the sentence readable either way. */
export function missLine(type: { name: string; armour: string }): FightLine[] {
  return [
    [`An attack with ${type.name} is ineffective.`, 'error'],
    [`The knight is wearing ${type.name}-proof ${type.armour}.`, 'dim'],
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
  /** The heckle that gives this one away, when the knight gets bored. */
  tell: string;
  lines: FightLine[];
}[] = [
  {
    match: ['hornet', 'hornets', 'wasp', 'bee', 'bees', 'venom', 'sting', 'swarm'],
    tell: "Nothing gets through this armour. Nothing. Well — nothing larger than, say, a stinging insect. Hypothetically.",
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
    tell: 'I have guarded this port for nine years. Nothing distracts me. Not wildlife. Definitely not small rodents.',
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
    tell: 'My only weakness is unfinished business. Appliances left on at home. That kind of thing. Forget I said it.',
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
    tell: 'And do not try being NICE to me. I get quite enough of that. None at all, in fact. Not one compliment in nine years.',
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

/** Escalating heckles. Each one leaks a different way through. */
export function heckle(state: FightState): FightLine[] {
  const vulnerability = VULNERABILITIES[state.heckle % VULNERABILITIES.length];
  state.heckle += 1;

  return [
    ['', 'normal'],
    ['The knight lowers its sword and sighs.', 'dim'],
    ['', 'normal'],
    [`"${vulnerability.tell}"`, 'cyan'],
    ['', 'normal'],
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
): { lines: FightLine[]; won: boolean } {
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
    if (state.misses % 3 === 0) lines.push(...heckle(state));
    return { lines, won: false };
  }

  const damage = DAMAGE_TYPES.find((type) =>
    type.match.some((word) => text.includes(word)),
  );

  const lines: FightLine[] = damage
    ? missLine(damage)
    : [[GENERIC_MISSES[state.misses % GENERIC_MISSES.length], 'error']];

  lines.push(['', 'normal'], [`Firewall knight: ${state.hp} HP`, 'dim']);

  // Every third failure, it gets bored and says too much.
  if (state.misses % 3 === 0) lines.push(...heckle(state));

  return { lines, won: false };
}
