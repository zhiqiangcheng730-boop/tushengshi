import { execFileSync } from "node:child_process";
import { extname, resolve } from "node:path";

import { toFrontendRelativePath } from "./run-frontend-command.mjs";
import { readCandidateText } from "./secret-candidate.mjs";
import { containsPotentialSecret } from "./secret-patterns.mjs";

const binaryExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".webp",
  ".woff",
  ".woff2",
]);
const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const frontendRoot = process.cwd();
const repositoryPaths = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: gitRoot, encoding: "utf8" },
)
  .split("\0")
  .filter((filePath) => filePath !== "");
const filesWithPotentialSecrets = [];

for (const repositoryPath of repositoryPaths) {
  const frontendPath = toFrontendRelativePath(
    gitRoot,
    frontendRoot,
    repositoryPath,
  );
  if (frontendPath === null || binaryExtensions.has(extname(frontendPath))) {
    continue;
  }
  const contents = await readCandidateText(resolve(frontendRoot, frontendPath));
  if (contents !== null && containsPotentialSecret(contents)) {
    filesWithPotentialSecrets.push(frontendPath);
  }
}

if (filesWithPotentialSecrets.length > 0) {
  throw new Error(
    `Potential secrets detected: ${filesWithPotentialSecrets.join(", ")}`,
  );
}
