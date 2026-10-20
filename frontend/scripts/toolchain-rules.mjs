const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;

export function assertToolchain(packageJson, profile) {
  for (const scriptName of profile.checks.required) {
    if (typeof packageJson.scripts?.[scriptName] !== "string") {
      throw new Error(`Missing required script: ${scriptName}`);
    }
  }

  for (const [packageName, version] of Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    if (typeof version !== "string" || !exactVersionPattern.test(version)) {
      throw new Error(
        `Dependency must use an exact version: ${packageName}@${String(version)}`,
      );
    }
  }

  if (packageJson.engines?.node !== profile.toolchain.node) {
    throw new Error(
      `Node engine must match architecture profile: ${profile.toolchain.node}`,
    );
  }

  if (packageJson.engines?.pnpm !== profile.toolchain.pnpm) {
    throw new Error(
      `pnpm engine must match architecture profile: ${profile.toolchain.pnpm}`,
    );
  }

  const nodeTypesVersion = packageJson.devDependencies?.["@types/node"];
  const nodeMajor = profile.toolchain.node.split(".")[0];
  if (
    typeof nodeTypesVersion === "string" &&
    nodeTypesVersion.split(".")[0] !== nodeMajor
  ) {
    throw new Error(
      `@types/node major must match Node engine major: ${nodeMajor}`,
    );
  }

  const expectedPackageManager = `pnpm@${profile.toolchain.pnpm}`;
  if (packageJson.packageManager !== expectedPackageManager) {
    throw new Error(
      `packageManager must match architecture profile: ${expectedPackageManager}`,
    );
  }
}
