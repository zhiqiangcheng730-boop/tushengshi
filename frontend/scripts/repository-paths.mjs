import { relative, resolve, sep } from "node:path";

export function toFrontendRelativePath(
  gitRoot,
  frontendRoot,
  repositoryRelativePath,
) {
  if (
    repositoryRelativePath === ".." ||
    repositoryRelativePath.startsWith(`..${sep}`) ||
    repositoryRelativePath.startsWith("../")
  ) {
    throw new Error(
      `Unsafe repository-relative path: ${repositoryRelativePath}`,
    );
  }
  const absolutePath = resolve(gitRoot, repositoryRelativePath);
  const frontendRelativePath = relative(frontendRoot, absolutePath);
  if (
    frontendRelativePath === ".." ||
    frontendRelativePath.startsWith(`..${sep}`)
  ) {
    return null;
  }
  return frontendRelativePath.split(sep).join("/");
}
