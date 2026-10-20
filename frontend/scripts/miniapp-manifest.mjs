const safePageRoutePattern = /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/u;

function parseManifest(manifestSource) {
  try {
    return JSON.parse(manifestSource);
  } catch {
    throw new Error("Invalid Mini Program app manifest JSON.");
  }
}

export function validateMiniappManifest(manifestSource) {
  const manifest = parseManifest(manifestSource);
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    throw new Error("Mini Program manifest must register at least one page.");
  }

  for (const pageRoute of manifest.pages) {
    if (
      typeof pageRoute !== "string" ||
      !safePageRoutePattern.test(pageRoute)
    ) {
      throw new Error(`Unsafe Mini Program page route: ${String(pageRoute)}`);
    }
  }

  return [...manifest.pages];
}
