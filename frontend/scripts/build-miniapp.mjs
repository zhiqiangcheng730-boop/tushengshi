import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { parse } from "yaml";

import {
  assertExpectedBuildFiles,
  assertSafeOutputDirectory,
  collectRuntimeAssets,
} from "./build-miniapp-rules.mjs";
import { validateMiniappManifest } from "./miniapp-manifest.mjs";

export {
  assertExpectedBuildFiles,
  assertSafeOutputDirectory,
  collectRuntimeAssets,
};

async function collectFilePaths(
  rootDirectory,
  currentDirectory = rootDirectory,
) {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const nestedPaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        return collectFilePaths(rootDirectory, entryPath);
      }
      return [relative(rootDirectory, entryPath).split(sep).join("/")];
    }),
  );
  return nestedPaths.flat().sort();
}

async function copyRuntimeAssets({
  allowedExtensions,
  outputDirectory,
  sourceDirectory,
}) {
  const sourcePaths = await collectFilePaths(sourceDirectory);
  const runtimeAssetPaths = collectRuntimeAssets(
    sourcePaths,
    allowedExtensions,
  );
  for (const assetPath of runtimeAssetPaths) {
    const targetPath = resolve(outputDirectory, assetPath);
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(resolve(sourceDirectory, assetPath), targetPath);
  }
}

async function buildMiniapp() {
  const workspaceRoot = process.cwd();
  const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
  const sourceDirectory = resolve(workspaceRoot, profile.paths.source);
  const outputDirectory = assertSafeOutputDirectory(
    workspaceRoot,
    profile.paths.output,
  );

  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });
  execFileSync("pnpm", ["exec", "tsc", "-p", "tsconfig.build.json"], {
    stdio: "inherit",
  });
  await copyRuntimeAssets({
    allowedExtensions: profile.package.runtimeAssetExtensions,
    outputDirectory,
    sourceDirectory,
  });

  const appManifestSource = await readFile(
    resolve(outputDirectory, "app.json"),
    "utf8",
  );
  const pageRoutes = validateMiniappManifest(appManifestSource);
  const outputPaths = await collectFilePaths(outputDirectory);
  assertExpectedBuildFiles(outputPaths, pageRoutes);
}

const entryPath = process.argv[1];
if (
  entryPath !== undefined &&
  import.meta.url === pathToFileURL(entryPath).href
) {
  await buildMiniapp();
}
