import { readFile } from "node:fs/promises";

export async function readCandidateText(filePath, readText = readFile) {
  try {
    return await readText(filePath, "utf8");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}
