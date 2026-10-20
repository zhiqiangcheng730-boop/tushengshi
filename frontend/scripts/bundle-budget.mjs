import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

import { parse } from "yaml";

async function calculateDirectoryBytes(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const byteCounts = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directoryPath, entry.name);
      return entry.isDirectory()
        ? calculateDirectoryBytes(entryPath)
        : (await stat(entryPath)).size;
    }),
  );
  return byteCounts.reduce(
    (totalBytes, byteCount) => totalBytes + byteCount,
    0,
  );
}

const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
const outputDirectory = resolve(process.cwd(), profile.paths.output);
const outputBytes = await calculateDirectoryBytes(outputDirectory);
const maximumBytes = profile.package.mainPackageMaxBytes;

if (outputBytes > maximumBytes) {
  throw new Error(
    `Mini Program package is ${outputBytes} bytes; the budget is ${maximumBytes} bytes.`,
  );
}

console.log(`Mini Program package: ${outputBytes}/${maximumBytes} bytes.`);
