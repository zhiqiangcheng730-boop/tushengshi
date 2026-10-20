import { execFileSync } from "node:child_process";

const pullRequestTitle = process.env.PR_TITLE;
if (pullRequestTitle === undefined || pullRequestTitle.trim() === "") {
  throw new Error(
    "PR_TITLE is required for the pull-request commit policy check.",
  );
}

execFileSync("pnpm", ["exec", "commitlint"], {
  input: `${pullRequestTitle}\n`,
  stdio: ["pipe", "inherit", "inherit"],
});
