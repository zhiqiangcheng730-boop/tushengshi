import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { parse } from "yaml";

import { assertToolchain } from "./toolchain-rules.mjs";

export { assertToolchain };

async function runToolchainCheck() {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
  assertToolchain(packageJson, profile);
}

const entryPath = process.argv[1];
if (
  entryPath !== undefined &&
  import.meta.url === pathToFileURL(entryPath).href
) {
  await runToolchainCheck();
}
