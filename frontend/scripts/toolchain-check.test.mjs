import { describe, expect, it } from "vitest";

import { assertToolchain } from "./toolchain-check.mjs";

const requiredScripts = [
  "build",
  "format:check",
  "lint",
  "test:coverage",
  "typecheck",
  "verify",
];

const profile = {
  checks: { required: requiredScripts },
  toolchain: { node: "24.18.0", pnpm: "11.17.0" },
};

function createValidPackageJson() {
  return {
    dependencies: { example: "1.2.3" },
    devDependencies: { tooling: "4.5.6" },
    engines: { node: "24.18.0", pnpm: "11.17.0" },
    packageManager: "pnpm@11.17.0",
    scripts: Object.fromEntries(
      requiredScripts.map((scriptName) => [scriptName, `run-${scriptName}`]),
    ),
  };
}

describe("assertToolchain", () => {
  it("should accept exact versions and every required command", () => {
    expect(() =>
      assertToolchain(createValidPackageJson(), profile),
    ).not.toThrow();
  });

  it("should reject a missing required command", () => {
    const packageJson = createValidPackageJson();
    delete packageJson.scripts.build;

    expect(() => assertToolchain(packageJson, profile)).toThrow(
      "Missing required script: build",
    );
  });

  it.each(["^1.2.3", "~1.2.3", "latest", "workspace:*"])(
    "should reject non-exact dependency version %s",
    (version) => {
      const packageJson = createValidPackageJson();
      packageJson.dependencies.example = version;

      expect(() => assertToolchain(packageJson, profile)).toThrow(
        `Dependency must use an exact version: example@${version}`,
      );
    },
  );

  it("should reject Node and pnpm versions that differ from the profile", () => {
    const packageJson = createValidPackageJson();
    packageJson.engines.node = "22.0.0";

    expect(() => assertToolchain(packageJson, profile)).toThrow(
      "Node engine must match architecture profile: 24.18.0",
    );
  });

  it("should reject a packageManager version that differs from the profile", () => {
    const packageJson = createValidPackageJson();
    packageJson.packageManager = "pnpm@10.0.0";

    expect(() => assertToolchain(packageJson, profile)).toThrow(
      "packageManager must match architecture profile: pnpm@11.17.0",
    );
  });

  it("should reject Node type declarations from a different runtime major", () => {
    const packageJson = createValidPackageJson();
    packageJson.devDependencies["@types/node"] = "26.6.5";

    expect(() => assertToolchain(packageJson, profile)).toThrow(
      "@types/node major must match Node engine major: 24",
    );
  });
});
