import { extname, isAbsolute, resolve } from "node:path";

const requiredApplicationFiles = [
  "app.js",
  "app.json",
  "app.wxss",
  "sitemap.json",
  "styles/theme.wxss",
  "styles/tokens.wxss",
];
const pageResourceExtensions = [".js", ".json", ".wxml", ".wxss"];
const prohibitedOutputPatterns = [/\.ts$/u, /\.d\.ts$/u, /\.map$/u];
const supportedOutputExtensions = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".png",
  ".webp",
  ".wxml",
  ".wxss",
]);

export function assertSafeOutputDirectory(workspaceRoot, outputPath) {
  const expectedOutputDirectory = resolve(workspaceRoot, "apps/miniapp/dist");
  const configuredOutputDirectory = resolve(workspaceRoot, outputPath);
  if (
    isAbsolute(outputPath) ||
    configuredOutputDirectory !== expectedOutputDirectory
  ) {
    throw new Error(`Unsafe Mini Program output directory: ${outputPath}`);
  }
  return configuredOutputDirectory;
}

export function collectRuntimeAssets(sourcePaths, allowedExtensions) {
  const allowedExtensionSet = new Set(allowedExtensions);
  return sourcePaths
    .filter((sourcePath) => allowedExtensionSet.has(extname(sourcePath)))
    .sort();
}

export function assertExpectedBuildFiles(outputPaths, pageRoutes) {
  const outputPathSet = new Set(outputPaths);
  const requiredPaths = [
    ...requiredApplicationFiles,
    ...pageRoutes.flatMap((pageRoute) =>
      pageResourceExtensions.map((extension) => `${pageRoute}${extension}`),
    ),
  ];

  for (const requiredPath of requiredPaths) {
    if (!outputPathSet.has(requiredPath)) {
      throw new Error(`Missing Mini Program build file: ${requiredPath}`);
    }
  }

  for (const outputPath of outputPaths) {
    if (prohibitedOutputPatterns.some((pattern) => pattern.test(outputPath))) {
      throw new Error(`Prohibited Mini Program build file: ${outputPath}`);
    }
    if (!supportedOutputExtensions.has(extname(outputPath))) {
      throw new Error(`Unsupported Mini Program build file: ${outputPath}`);
    }
  }
}
