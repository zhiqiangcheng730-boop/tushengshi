import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "apps/miniapp/dist/**",
        "**/*.test.{ts,mts}",
        "vitest.config.ts",
      ],
      include: [
        "apps/miniapp/src/pages/**/home-page-state.ts",
        "scripts/architecture-rules.mjs",
        "scripts/build-miniapp-rules.mjs",
        "scripts/license-rules.mjs",
        "scripts/miniapp-manifest.mjs",
        "scripts/repository-paths.mjs",
        "scripts/secret-candidate.mjs",
        "scripts/toolchain-rules.mjs",
      ],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "node",
    exclude: [...configDefaults.exclude, "apps/miniapp/dist/**"],
    globals: true,
  },
});
