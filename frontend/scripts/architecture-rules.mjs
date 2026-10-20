import { posix } from "node:path";

const importPattern = /(?:from\s+|import\s*\(|import\s+)["']([^"']+)["']/gu;

function collectResolvedImports(sourceFile) {
  const imports = [];
  for (const match of sourceFile.source.matchAll(importPattern)) {
    const importSpecifier = match[1];
    if (importSpecifier?.startsWith(".")) {
      imports.push(
        posix.normalize(
          posix.join(posix.dirname(sourceFile.path), importSpecifier),
        ),
      );
    }
  }
  return imports;
}

function isWithin(path, directory) {
  return path === directory || path.startsWith(`${directory}/`);
}

export function findArchitectureViolations(sourceFiles, profile) {
  const violations = [];
  const sourceRoot = profile.paths.source;
  const remoteIoOwner = profile.architecture.remoteIoOwner;

  for (const sourceFile of sourceFiles) {
    if (/\bwx\.request\s*\(/u.test(sourceFile.source)) {
      if (!isWithin(sourceFile.path, remoteIoOwner)) {
        violations.push(
          `Remote I/O must use ${remoteIoOwner}: ${sourceFile.path}`,
        );
      }
    }

    const resolvedImports = collectResolvedImports(sourceFile);
    if (isWithin(sourceFile.path, `${sourceRoot}/shared`)) {
      for (const importedPath of resolvedImports) {
        if (
          isWithin(importedPath, `${sourceRoot}/pages`) ||
          isWithin(importedPath, `${sourceRoot}/modules`) ||
          importedPath === `${sourceRoot}/app`
        ) {
          violations.push(
            `Shared code must not depend on app, pages, or modules: ${sourceFile.path} -> ${importedPath}`,
          );
        }
      }
    }

    if (sourceFile.path.includes("/presentation/")) {
      for (const importedPath of resolvedImports) {
        if (importedPath.includes("/infrastructure/")) {
          violations.push(
            `Presentation must not depend on infrastructure: ${sourceFile.path} -> ${importedPath}`,
          );
        }
      }
    }

    if (sourceFile.path.includes("/application/")) {
      for (const importedPath of resolvedImports) {
        if (
          importedPath.includes("/infrastructure/") ||
          importedPath.includes("/presentation/") ||
          isWithin(importedPath, `${sourceRoot}/pages`) ||
          isWithin(importedPath, `${sourceRoot}/generated`)
        ) {
          violations.push(
            `Application must remain platform independent: ${sourceFile.path} -> ${importedPath}`,
          );
        }
      }
    }
  }

  return violations;
}

export function findNestedAgentFiles(filePaths) {
  return filePaths.filter((filePath) => filePath.endsWith("/AGENTS.md")).sort();
}
