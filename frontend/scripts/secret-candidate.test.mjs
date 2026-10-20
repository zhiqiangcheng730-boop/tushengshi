import { describe, expect, it } from "vitest";

import { readCandidateText } from "./secret-candidate.mjs";

describe("readCandidateText", () => {
  it("should return text for an existing candidate", async () => {
    const readText = async () => "safe contents";

    await expect(readCandidateText("existing.txt", readText)).resolves.toBe(
      "safe contents",
    );
  });

  it("should skip a tracked candidate deleted from the working tree", async () => {
    const missingFileError = Object.assign(new Error("missing"), {
      code: "ENOENT",
    });
    const readText = async () => Promise.reject(missingFileError);

    await expect(
      readCandidateText("deleted.txt", readText),
    ).resolves.toBeNull();
  });

  it("should preserve non-missing filesystem failures", async () => {
    const permissionError = Object.assign(new Error("denied"), {
      code: "EACCES",
    });
    const readText = async () => Promise.reject(permissionError);

    await expect(readCandidateText("protected.txt", readText)).rejects.toThrow(
      "denied",
    );
  });
});
