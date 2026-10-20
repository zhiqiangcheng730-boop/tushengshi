import { describe, expect, it } from "vitest";

import { validateMiniappManifest } from "./miniapp-manifest.mjs";

describe("validateMiniappManifest", () => {
  it("should return the registered page routes for a valid manifest", () => {
    const manifestSource = JSON.stringify({
      pages: ["pages/home/index"],
      window: { navigationBarTitleText: "数得快" },
    });

    expect(validateMiniappManifest(manifestSource)).toEqual([
      "pages/home/index",
    ]);
  });

  it.each([JSON.stringify({}), JSON.stringify({ pages: [] })])(
    "should reject a manifest without a registered page",
    (manifestSource) => {
      expect(() => validateMiniappManifest(manifestSource)).toThrow(
        "Mini Program manifest must register at least one page.",
      );
    },
  );

  it("should reject a page route that escapes the source root", () => {
    const manifestSource = JSON.stringify({ pages: ["../private/index"] });

    expect(() => validateMiniappManifest(manifestSource)).toThrow(
      "Unsafe Mini Program page route: ../private/index",
    );
  });

  it("should reject malformed JSON with an actionable error", () => {
    expect(() => validateMiniappManifest('{"pages":[')).toThrow(
      "Invalid Mini Program app manifest JSON.",
    );
  });
});
