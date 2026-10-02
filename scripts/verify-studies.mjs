#!/usr/bin/env node
/**
 * Verify published study pages are byte-identical to generator output.
 * Any difference means artifacts have drifted from the generator.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readerScript = join(repoRoot, ".skills/bilingual-reader/scripts/static_reader.py");
const resourcesRoot = join(repoRoot, "resources");
const outRoot = join(repoRoot, "dist/.study-verify");

function findDataFile(resourceId, slug) {
  const artifacts = join(resourcesRoot, resourceId, "artifacts");
  const scoped = join(artifacts, `${slug}.data.json`);
  return existsSync(scoped) ? scoped : join(artifacts, "data.json");
}

let drifted = 0;
let checked = 0;

for (const resourceId of readdirSync(resourcesRoot).sort()) {
  const studiesDir = join(resourcesRoot, resourceId, "studies");
  if (!existsSync(studiesDir)) continue;

  for (const file of readdirSync(studiesDir).sort()) {
    if (!file.endsWith(".html")) continue;

    const slug = file.replace(/\.html$/, "");
    const dataFile = findDataFile(resourceId, slug);
    const generated = execFileSync(
      "python3",
      [
        readerScript,
        "--data-file",
        dataFile,
        "--output-dir",
        outRoot,
        "--template",
        "compact-study",
        "--stdout-html",
      ],
      { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    const committed = readFileSync(join(studiesDir, file), "utf8");
    checked += 1;

    if (committed === generated) {
      console.log(`ok    ${resourceId}/${file}`);
      continue;
    }

    drifted += 1;
    const limit = Math.min(committed.length, generated.length);
    let i = 0;
    while (i < limit && committed[i] === generated[i]) i += 1;
    console.log(
      `DRIFT ${resourceId}/${file}  committed=${committed.length} generated=${generated.length} first_diff@${i}`,
    );
    console.log(`      committed: ${JSON.stringify(committed.slice(i - 60, i + 60))}`);
    console.log(`      generated: ${JSON.stringify(generated.slice(i - 60, i + 60))}`);
  }
}

console.log(
  drifted === 0
    ? `\nAll ${checked} study pages are byte-identical to generator output.`
    : `\n${drifted}/${checked} study pages drifted from the generator.`,
);
process.exit(drifted === 0 ? 0 : 1);
