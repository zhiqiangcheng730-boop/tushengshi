import { execFileSync } from "node:child_process";

execFileSync("pnpm", ["typecheck"], {
  cwd: process.cwd(),
  stdio: "inherit",
});
