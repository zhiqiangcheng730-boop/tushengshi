import { describe, expect, it } from "vitest";

import { assertAllowedLicenses } from "./license-check.mjs";

describe("assertAllowedLicenses", () => {
  it("should accept pnpm's empty production dependency report", () => {
    expect(() =>
      assertAllowedLicenses("No licenses in packages found\n"),
    ).not.toThrow();
  });

  it("should accept an allowlisted license report", () => {
    expect(() =>
      assertAllowedLicenses(JSON.stringify({ MIT: ["example@1.0.0"] })),
    ).not.toThrow();
  });

  it("should reject a production dependency with an unapproved license", () => {
    expect(() =>
      assertAllowedLicenses(JSON.stringify({ GPL: ["example@1.0.0"] })),
    ).toThrow("Production dependencies use unapproved licenses: GPL");
  });
});
