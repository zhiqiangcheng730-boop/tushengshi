import { readFile, readdir } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { parse } from "yaml";

import { findArchitectureViolations } from "./architecture-rules.mjs";

async function collectTypeScriptSources(sourceRoot, currentPath = sourceRoot) {
  const entries = await readdir(currentPath, { withFileTypes: true });
  const sourceGroups = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(currentPath, entry.name);
      if (entry.isDirectory()) {
        return collectTypeScriptSources(sourceRoot, entryPath);
      }
      if (!entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
        return [];
      }
      return [
        {
          path: entryPath
            .slice(process.cwd().length + 1)
            .split(sep)
            .join("/"),
          source: await readFile(entryPath, "utf8"),
        },
      ];
    }),
  );
  return sourceGroups.flat();
}

const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
const sourceFiles = await collectTypeScriptSources(
  resolve(process.cwd(), profile.paths.source),
);
const violations = findArchitectureViolations(sourceFiles, profile);

if (violations.length > 0) {
  throw new Error(`Architecture violations:\n${violations.join("\n")}`);
}
