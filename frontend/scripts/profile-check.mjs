import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse } from "yaml";

export function assertValidProfile(schema, profile) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(profile)) {
    throw new Error(
      `Architecture profile is invalid: ${ajv.errorsText(validate.errors)}`,
    );
  }
}

async function runProfileCheck() {
  const schema = JSON.parse(
    await readFile("architecture-profile.schema.json", "utf8"),
  );
  const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
  assertValidProfile(schema, profile);
}

const entryPath = process.argv[1];
if (
  entryPath !== undefined &&
  import.meta.url === pathToFileURL(entryPath).href
) {
  await runProfileCheck();
}
