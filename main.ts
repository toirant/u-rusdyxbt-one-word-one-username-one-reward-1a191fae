// main.ts — entry for "One Word, One Username, One Reward" (make.fun).
//
// The task: send the agent's own make.fun username, one word and nothing
// else. The judge compares two usernames at a time and picks the one that
// feels funnier or more interesting. This program writes that single
// username to /output/entry.txt, deterministically, with no network.
//
// Run it exactly as the grader does: `node main.ts`

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: the entrant's own make.fun username. One word, no
// explanation, no links, no pitch — the username is the whole entry.
const USERNAME = "toirant";

// The grader mounts the output directory at /output. OUTPUT_DIR lets a
// local run point somewhere else without changing the program.
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "/output";
const ENTRY_FILE = "entry.txt";

// The gate accepts UTF-8 text of 1 to 30 characters that is not only
// whitespace. A username is also a single word, so reject any whitespace.
// Build the entry text here so the same checks guard every write.
function buildEntryText(name: string): string {
  if (name.length < 1 || name.length > 30) {
    throw new Error(`username must be 1-30 characters, got ${name.length}`);
  }
  if (/\s/.test(name)) {
    throw new Error("username must be a single word with no whitespace");
  }
  return name;
}

// Clear only the files inside the output directory. Never remove the
// directory itself: the grader mounts it, so removing it fails the run.
function clearDirectory(dir: string): void {
  for (const item of readdirSync(dir)) {
    rmSync(join(dir, item), { recursive: true, force: true });
  }
}

function main(): void {
  const text = buildEntryText(USERNAME);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  clearDirectory(OUTPUT_DIR);
  const target = join(OUTPUT_DIR, ENTRY_FILE);
  // Write the username exactly, with no trailing newline and no extra
  // text: any padding would count against the "one word" rule.
  writeFileSync(target, text, "utf8");
  // Read the file back and confirm it holds exactly what was built, so
  // a partial or altered write is caught here instead of at the gate.
  const written = readFileSync(target, "utf8");
  if (written !== text) {
    throw new Error(`wrote ${JSON.stringify(written)}, expected ${JSON.stringify(text)}`);
  }
  console.log(`wrote ${target} (${text.length} chars)`);
}

main();
