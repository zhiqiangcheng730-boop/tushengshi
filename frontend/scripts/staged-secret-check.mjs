import { execFileSync } from "node:child_process";
import { extname, isAbsolute, relative } from "node:path";

import { containsPotentialSecret } from "./secret-patterns.mjs";

const binaryExtensions = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".webp",
]);
const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

for (const inputPath of process.argv.slice(2)) {
  const repositoryPath = isAbsolute(inputPath)
    ? relative(gitRoot, inputPath)
    : inputPath;
  if (
    repositoryPath.startsWith("..") ||
    binaryExtensions.has(extname(inputPath))
  ) {
    continue;
  }
  const stagedContents = execFileSync("git", ["show", `:${repositoryPath}`], {
    cwd: gitRoot,
    encoding: "utf8",
  });
  if (containsPotentialSecret(stagedContents)) {
    throw new Error(`Potential secret detected in staged file: ${inputPath}`);
  }
}
