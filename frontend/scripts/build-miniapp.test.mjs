import { describe, expect, it } from "vitest";

import {
  assertExpectedBuildFiles,
  assertSafeOutputDirectory,
  collectRuntimeAssets,
} from "./build-miniapp.mjs";

describe("assertSafeOutputDirectory", () => {
  it("should resolve the configured Mini Program output inside the workspace", () => {
    expect(
      assertSafeOutputDirectory("/workspace/frontend", "apps/miniapp/dist"),
    ).toBe("/workspace/frontend/apps/miniapp/dist");
  });

  it.each(["../dist", "apps/miniapp/../outside", "/tmp/miniapp-dist"])(
    "should reject unsafe output path %s",
    (outputPath) => {
      expect(() =>
        assertSafeOutputDirectory("/workspace/frontend", outputPath),
      ).toThrow(`Unsafe Mini Program output directory: ${outputPath}`);
    },
  );
});

describe("collectRuntimeAssets", () => {
  it("should preserve nested relative paths for supported runtime assets", () => {
    const sourcePaths = [
      "app.json",
      "app.ts",
      "pages/home/index.wxml",
      "pages/home/icons/ready.png",
      "pages/home/notes.txt",
      "styles/theme.wxss",
    ];

    expect(
      collectRuntimeAssets(sourcePaths, [".json", ".wxml", ".wxss", ".png"]),
    ).toEqual([
      "app.json",
      "pages/home/icons/ready.png",
      "pages/home/index.wxml",
      "styles/theme.wxss",
    ]);
  });
});

describe("assertExpectedBuildFiles", () => {
  const validOutputPaths = [
    "app.js",
    "app.json",
    "app.wxss",
    "sitemap.json",
    "styles/theme.wxss",
    "styles/tokens.wxss",
    "pages/home/home-page-state.js",
    "pages/home/index.js",
    "pages/home/index.json",
    "pages/home/index.wxml",
    "pages/home/index.wxss",
  ];

  it("should accept a complete build for every registered page", () => {
    expect(() =>
      assertExpectedBuildFiles(validOutputPaths, ["pages/home/index"]),
    ).not.toThrow();
  });

  it("should reject a build with a missing page resource", () => {
    const outputPaths = validOutputPaths.filter(
      (outputPath) => outputPath !== "pages/home/index.wxml",
    );

    expect(() =>
      assertExpectedBuildFiles(outputPaths, ["pages/home/index"]),
    ).toThrow("Missing Mini Program build file: pages/home/index.wxml");
  });

  it.each(["app.ts", "app.js.map", "types/app.d.ts"])(
    "should reject prohibited output %s",
    (prohibitedPath) => {
      expect(() =>
        assertExpectedBuildFiles(
          [...validOutputPaths, prohibitedPath],
          ["pages/home/index"],
        ),
      ).toThrow(`Prohibited Mini Program build file: ${prohibitedPath}`);
    },
  );
});
