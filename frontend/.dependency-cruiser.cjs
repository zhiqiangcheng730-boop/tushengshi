module.exports = {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "presentation-must-not-depend-on-infrastructure",
      severity: "error",
      from: { path: "^apps/miniapp/src/modules/.+/presentation/" },
      to: { path: "^apps/miniapp/src/modules/.+/infrastructure/" },
    },
    {
      name: "application-must-remain-platform-independent",
      severity: "error",
      from: { path: "^apps/miniapp/src/modules/.+/application/" },
      to: {
        path: [
          "^apps/miniapp/src/(?:app|pages)/",
          "^apps/miniapp/src/generated/",
          "^apps/miniapp/src/modules/.+/(?:infrastructure|presentation)/",
        ],
      },
    },
    {
      name: "shared-must-not-depend-on-app-pages-or-modules",
      severity: "error",
      from: { path: "^apps/miniapp/src/shared/" },
      to: { path: "^apps/miniapp/src/(?:app|pages|modules)/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.app.json" },
  },
};
