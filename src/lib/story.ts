/**
 * THE STORY GRAPH
 * ===============
 * Loads the scenes in src/content/story/ and checks that they join up into
 * storylines that actually work, before the site is built.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The schema in src/content.config.ts checks one scene file at a time: has it
 * got a `from`, is its `choice` a word we are allowed to use. But most of the
 * ways a story can be broken are about how scenes RELATE to each other:
 *
 *   - a `from` pointing at a scene nobody ever wrote
 *   - two scenes offering the same choice in the same place
 *   - a storyline you can walk into but never finish
 *
 * None of those are visible from inside a single file, so they are checked
 * here instead, over the whole collection at once.
 *
 * A note on how strict this is. The terminal itself guarantees a reader can
 * always type `back` or `exit`, whatever the scenes say, so a broken story
 * cannot actually trap anybody. That makes everything below a QUALITY check:
 * it is here so a contributor hears about a mistake from a build error with
 * their filename on it, rather than from a visitor saying the game went
 * nowhere.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

/** One scene, with its id, ready for the terminal to use. */
export interface Scene {
  /** The filename without .md, e.g. 'server-room'. */
  id: string;
  /** The scene this one follows, or null for an entrance. */
  from: string | null;
  /** What the reader types to get here. Null for an entrance. */
  choice: string | null;
  /** The secret word that starts this storyline. Null for a normal scene. */
  command: string | null;
  /** True if reaching this scene offers the way into the site. */
  ending: boolean;
  /** Cryptic clue for `cat .secrets`, when an advisor has promoted one. */
  hint: string | null;
  /** GitHub username of whoever wrote it. */
  author: string | null;
  /** The scene text itself: the body of the Markdown file. */
  body: string;
}

/** A scene plus the scenes a reader can reach from it. */
export interface StoryNode extends Scene {
  /** Scenes whose `from` points at this one, in alphabetical order. */
  choices: Scene[];
}

/** Separator for map keys built from two values. Never appears in real text. */
const KEY_SEPARATOR = '\u0000';

/**
 * Turns one Markdown entry into a Scene.
 *
 * Zod has already guaranteed the shape by this point, so this only has to
 * settle the optional fields into plain nulls, which are easier to check
 * against than `undefined` scattered through the terminal code.
 */
function toScene(entry: CollectionEntry<'story'>): Scene {
  return {
    id: entry.id,
    from: entry.data.from ?? null,
    choice: entry.data.choice ?? null,
    command: entry.data.command ?? null,
    ending: entry.data.ending,
    hint: entry.data.hint ?? null,
    author: entry.data.author ?? null,
    body: entry.body ?? '',
  };
}

/**
 * Every problem found, as a list of sentences aimed at whoever wrote the
 * scene. An empty list means the story is sound.
 *
 * Each message names the file, because the person reading it is usually a
 * beginner looking at a red X on their first pull request, and "which file"
 * is the only question that matters at that moment.
 */
export function findStoryProblems(scenes: Scene[]): string[] {
  const problems: string[] = [];
  const byId = new Map(scenes.map((scene) => [scene.id, scene]));

  // Two entrances answering to the same secret word: whichever loaded first
  // would win, and the other would look broken for no visible reason.
  const seenCommands = new Map<string, string>();
  for (const scene of scenes) {
    if (!scene.command) continue;
    const word = scene.command.trim().toLowerCase();
    const alreadyUsed = seenCommands.get(word);
    if (alreadyUsed) {
      problems.push(
        `${scene.id}.md and ${alreadyUsed}.md both start with the secret word ` +
          `"${word}". Only one storyline can answer to a word — pick another.`,
      );
    } else {
      seenCommands.set(word, scene.id);
    }
  }

  // A `from` that names a scene nobody wrote. Nearly always a typo, and the
  // scene it means is usually sitting right there spelled differently.
  for (const scene of scenes) {
    if (scene.from && !byId.has(scene.from)) {
      problems.push(
        `${scene.id}.md says it follows "${scene.from}", but there is no ` +
          `${scene.from}.md in src/content/story/. Check the spelling — it has ` +
          `to match the other file's name exactly, without the .md.`,
      );
    }
  }

  // Two scenes offering the same choice from the same place. The reader types
  // the word and only ever gets one of them.
  const seenChoices = new Map<string, string>();
  for (const scene of scenes) {
    if (!scene.from || !scene.choice) continue;
    const key = `${scene.from}${KEY_SEPARATOR}${scene.choice.trim().toLowerCase()}`;
    const alreadyUsed = seenChoices.get(key);
    if (alreadyUsed) {
      problems.push(
        `${scene.id}.md and ${alreadyUsed}.md both offer the choice ` +
          `"${scene.choice}" from ${scene.from}.md. Two scenes cannot share a ` +
          `choice in the same place — reword one of them.`,
      );
    } else {
      seenChoices.set(key, scene.id);
    }
  }

  // Index of which scenes hang off which, used by both walks below.
  const childrenOf = new Map<string, string[]>();
  for (const scene of scenes) {
    if (!scene.from) continue;
    childrenOf.set(scene.from, [...(childrenOf.get(scene.from) ?? []), scene.id]);
  }

  // Which scenes a reader can actually walk to, starting from the entrances.
  const reachable = new Set<string>();
  const queue = scenes.filter((scene) => scene.command).map((scene) => scene.id);
  while (queue.length) {
    const id = queue.shift()!;
    // A scene names exactly one parent, so a story a reader can actually walk
    // is always a tree and never loops. Two scenes CAN still point at each
    // other in a file nobody can reach, though, and that would spin forever
    // without this guard — the unreachable check below is what reports it.
    if (reachable.has(id)) continue;
    reachable.add(id);
    queue.push(...(childrenOf.get(id) ?? []));
  }

  // A scene nothing leads to. Its `from` exists, but that parent's own chain
  // never reaches an entrance, so no reader can arrive.
  for (const scene of scenes) {
    if (!reachable.has(scene.id) && byId.has(scene.from ?? '')) {
      problems.push(
        `Nothing leads to ${scene.id}.md. It follows ${scene.from}.md, but no ` +
          `chain of choices reaches ${scene.from}.md from a storyline entrance, ` +
          `so a reader could never get there.`,
      );
    }
  }

  // A scene that neither continues nor ends: the reader arrives, and the
  // story simply stops with nothing to type. They can always get out with
  // `back`, so it is not a trap, but it reads as though the game gave up.
  // Almost always someone wrote a scene and forgot to say what happens next.
  for (const scene of scenes) {
    if (scene.ending) continue;
    if ((childrenOf.get(scene.id) ?? []).length > 0) continue;
    problems.push(
      `${scene.id}.md is a dead end: nothing follows it and it is not marked ` +
        `as an ending, so the story stops there with nothing for the reader to ` +
        `do. Either add "ending: true" to finish the storyline here, or add ` +
        `another scene with "from: ${scene.id}".`,
    );
  }

  // A storyline you can start but never finish. The terminal is a way into
  // the site, so a storyline that reaches no ending is a corridor with no
  // door at the end of it.
  for (const entrance of scenes.filter((scene) => scene.command)) {
    const seen = new Set<string>();
    const walk = [entrance.id];
    let foundEnding = false;
    while (walk.length) {
      const id = walk.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      if (byId.get(id)?.ending) {
        foundEnding = true;
        break;
      }
      walk.push(...(childrenOf.get(id) ?? []));
    }
    if (!foundEnding) {
      problems.push(
        `The storyline starting at ${entrance.id}.md never reaches an ending, ` +
          `so a reader who finds it cannot finish it. Mark its last scene with ` +
          `"ending: true", or add a scene that is.`,
      );
    }
  }

  return problems;
}

/**
 * Loads every scene, checks the story holds together, and hands back the
 * scenes with their choices already attached.
 *
 * Throws if anything is wrong, which stops the build. That is deliberate: the
 * check that runs on every pull request builds the site, so a broken story is
 * caught there — on the contributor's own branch, with their filename in the
 * error — instead of reaching the live site.
 */
export async function loadStory(): Promise<StoryNode[]> {
  const scenes = (await getCollection('story')).map(toScene);

  const problems = findStoryProblems(scenes);
  if (problems.length) {
    throw new Error(
      `The story in src/content/story/ does not hold together:\n\n` +
        problems.map((problem) => `  - ${problem}`).join('\n') +
        `\n\nNothing else is wrong with the site — fix the scenes above and it ` +
        `will build.\n`,
    );
  }

  // Alphabetical, so the order a reader sees choices in does not depend on
  // which order the files happened to load.
  return scenes.map((scene) => ({
    ...scene,
    choices: scenes
      .filter((other) => other.from === scene.id)
      .sort((a, b) => a.id.localeCompare(b.id)),
  }));
}
