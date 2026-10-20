import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { assertAllowedLicenses } from "./license-rules.mjs";

export { assertAllowedLicenses };

const entryPath = process.argv[1];
if (
  entryPath !== undefined &&
  import.meta.url === pathToFileURL(entryPath).href
) {
  const reportSource = execFileSync(
    "pnpm",
    ["licenses", "list", "--prod", "--json"],
    { encoding: "utf8" },
  );
  assertAllowedLicenses(reportSource);
}
