import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import {
  findArchitectureViolations,
  findNestedAgentFiles,
} from "./architecture-rules.mjs";
import { assertValidProfile } from "./profile-check.mjs";
import { toFrontendRelativePath } from "./run-frontend-command.mjs";

const architectureProfile = {
  architecture: {
    remoteIoOwner: "apps/miniapp/src/shared/http",
  },
  paths: {
    source: "apps/miniapp/src",
  },
};

describe("findArchitectureViolations", () => {
  it("should allow remote I/O in the configured shared HTTP boundary", () => {
    const sourceFiles = [
      {
        path: "apps/miniapp/src/shared/http/http-client.ts",
        source:
          "export const request = () => wx.request({ url: 'https://example.test' });",
      },
      {
        path: "apps/miniapp/src/modules/counting/application/count.ts",
        source:
          "export const count = (points: readonly unknown[]) => points.length;",
      },
    ];

    expect(
      findArchitectureViolations(sourceFiles, architectureProfile),
    ).toEqual([]);
  });

  it("should reject direct remote I/O from a page", () => {
    const sourceFiles = [
      {
        path: "apps/miniapp/src/pages/home/index.ts",
        source: "wx.request({ url: 'https://example.test' });",
      },
    ];

    expect(
      findArchitectureViolations(sourceFiles, architectureProfile),
    ).toEqual([
      "Remote I/O must use apps/miniapp/src/shared/http: apps/miniapp/src/pages/home/index.ts",
    ]);
  });

  it("should reject shared code importing a page", () => {
    const sourceFiles = [
      {
        path: "apps/miniapp/src/shared/lifecycle/page-scope.ts",
        source: 'import "../../pages/home/index";',
      },
    ];

    expect(
      findArchitectureViolations(sourceFiles, architectureProfile),
    ).toEqual([
      "Shared code must not depend on app, pages, or modules: apps/miniapp/src/shared/lifecycle/page-scope.ts -> apps/miniapp/src/pages/home/index",
    ]);
  });

  it("should reject presentation code importing infrastructure", () => {
    const sourceFiles = [
      {
        path: "apps/miniapp/src/modules/counting/presentation/count-state.ts",
        source: 'import "../infrastructure/http-counting-gateway";',
      },
    ];

    expect(
      findArchitectureViolations(sourceFiles, architectureProfile),
    ).toEqual([
      "Presentation must not depend on infrastructure: apps/miniapp/src/modules/counting/presentation/count-state.ts -> apps/miniapp/src/modules/counting/infrastructure/http-counting-gateway",
    ]);
  });
});

describe("findNestedAgentFiles", () => {
  it("should report every instruction file below the frontend root", () => {
    expect(
      findNestedAgentFiles([
        "AGENTS.md",
        "apps/miniapp/AGENTS.md",
        "docs/notes.md",
      ]),
    ).toEqual(["apps/miniapp/AGENTS.md"]);
  });
});

describe("assertValidProfile", () => {
  it("should reject an output path that escapes the frontend root", async () => {
    const schema = JSON.parse(
      await readFile("architecture-profile.schema.json", "utf8"),
    );
    const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
    profile.paths.output = "../dist";

    expect(() => assertValidProfile(schema, profile)).toThrow(
      "Architecture profile is invalid",
    );
  });
});

describe("toFrontendRelativePath", () => {
  it("should translate a repository path when the Git root is the parent", () => {
    expect(
      toFrontendRelativePath(
        "/repo",
        "/repo/frontend",
        "frontend/apps/miniapp/src/app.ts",
      ),
    ).toBe("apps/miniapp/src/app.ts");
  });

  it("should ignore a repository path outside the frontend subtree", () => {
    expect(
      toFrontendRelativePath("/repo", "/repo/frontend", "backend/main.py"),
    ).toBeNull();
  });

  it("should reject a repository path that escapes the Git root", () => {
    expect(() =>
      toFrontendRelativePath("/repo", "/repo/frontend", "../secret.txt"),
    ).toThrow("Unsafe repository-relative path: ../secret.txt");
  });
});
