import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { toFrontendRelativePath } from "./repository-paths.mjs";

export { toFrontendRelativePath };

const entryPath = process.argv[1];
if (
  entryPath !== undefined &&
  fileURLToPath(import.meta.url) === resolve(entryPath)
) {
  const frontendRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
  execFileSync("pnpm", process.argv.slice(2), {
    cwd: frontendRoot,
    stdio: "inherit",
  });
}
