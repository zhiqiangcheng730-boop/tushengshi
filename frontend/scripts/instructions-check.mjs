import { access, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, sep } from "node:path";

import { findNestedAgentFiles } from "./architecture-rules.mjs";

const requiredFiles = [
  "AGENTS.md",
  "ARCHITECTURE.md",
  "CONTRIBUTING.md",
  "architecture-profile.schema.json",
  "architecture-profile.yaml",
  "docs/case-based-naming-conventions.md",
  "docs/code-review.md",
  "engineering-standards.md",
];

for (const filePath of requiredFiles) {
  await access(filePath);
}

const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
for (const repositoryFile of [
  ".github/actions/frontend-pnpm-check/action.yml",
  ".github/workflows/frontend-verify.yml",
  ".husky/commit-msg",
  ".husky/pre-commit",
]) {
  await access(resolve(repositoryRoot, repositoryFile));
}

async function collectPaths(rootPath, currentPath = rootPath) {
  const entries = await readdir(currentPath, { withFileTypes: true });
  const pathGroups = await Promise.all(
    entries.map(async (entry) => {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "coverage"
      ) {
        return [];
      }
      const entryPath = resolve(currentPath, entry.name);
      if (entry.isDirectory()) return collectPaths(rootPath, entryPath);
      return [
        entryPath
          .slice(rootPath.length + 1)
          .split(sep)
          .join("/"),
      ];
    }),
  );
  return pathGroups.flat();
}

const filePaths = await collectPaths(process.cwd());
const nestedAgentFiles = findNestedAgentFiles(filePaths);
if (nestedAgentFiles.length > 0) {
  throw new Error(
    `Nested AGENTS.md files are forbidden: ${nestedAgentFiles.join(", ")}`,
  );
}
