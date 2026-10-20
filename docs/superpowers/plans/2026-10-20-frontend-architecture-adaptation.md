# 前端架构适配实施计划

> **供智能体执行者使用：** 必须使用子技能 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，逐项实施本计划。各步骤使用复选框（`- [ ]`）语法跟踪。

**目标：** 在 `frontend/` 下增加经过验证的原生微信小程序工程底座，同时保留所有现有前端文档和原型资源。

**架构：** `frontend/` 作为 pnpm 治理根目录，`frontend/apps/miniapp/` 包含唯一运行目标。脚手架采用严格 TypeScript、原生小程序文件、可执行架构规则、确定性构建输出，以及在仓库根目录中明确委派给 `frontend/` 的 CI 和钩子。

**技术栈：** Node.js 24.18.0、pnpm 11.17.0、TypeScript 5.9.3、原生微信小程序 API、ESLint 10 Flat Config、Prettier 3.9.10、Vitest 5.0.5、dependency-cruiser 18.7.0、Husky 9.1.7、Commitlint 21.2.4。

**设计说明：** `docs/superpowers/specs/2026-10-20-frontend-architecture-adaptation-design.md`

## 全局约束

- 保留 `frontend/docs/`、`frontend/prototype/`、`frontend/README.md` 和 v0.1 讨论纪要中的所有既有文件及内容。
- 保持 `frontend/apps/miniapp/` 下的运行目标为原生微信小程序和 TypeScript；不引入 React、Rspack、HeroUI、TanStack Query、Playwright 单页应用配置或跨端框架。
- 只创建应用壳和最小首页；不预先创建规划中的业务页面，也不创建空的 `modules/` 和 `generated/` 目录树。
- 不伪造 OpenAPI Schema 或后端行为。
- 精确锁定所有直接依赖，并提交 `frontend/pnpm-lock.yaml`。
- 生成输出只能位于已忽略的 `frontend/apps/miniapp/dist/`。
- 根目录级 CI 和钩子必须明确指向 `frontend/`，不得将前端配置强加给 `backend/`。
- 除非项目负责人明确要求，否则不得提交、推送、发布或修改外部系统。

## 评审重点

- 格式错误或不完整的小程序清单必须在构建前校验失败；任务 3 增加清单测试，任务 4 针对构建输出再次检查。
- 构建清理绝不能越出 `apps/miniapp/dist/`；任务 4 在删除前测试解析后的输出边界。
- 静态资源和嵌套页面文件必须保留相对路径；任务 4 对比预期输出文件集合。
- 允许的共享 HTTP 边界之外直接调用 `wx.request`，以及反向分层导入，都必须失败；任务 5 增加反向测试夹具。
- 当 Git 根目录是 `frontend/` 的父目录时，从 `frontend/` 运行脚本仍必须扫描正确文件并调用正确钩子；任务 5 和任务 6 验证仓库相对路径处理。

---

### 任务 1：建立前端治理与架构事实

**文件：**

- 新建：`frontend/AGENTS.md`
- 新建：`frontend/ARCHITECTURE.md`
- 新建：`frontend/CONTRIBUTING.md`
- 新建：`frontend/engineering-standards.md`
- 新建：`frontend/architecture-profile.yaml`
- 新建：`frontend/architecture-profile.schema.json`
- 新建：`frontend/docs/case-based-naming-conventions.md`
- 新建：`frontend/docs/code-review.md`

**接口：**

- 输入：已批准的设计说明和现有编号产品/设计文档。
- 输出：供配置、脚本、CI 和后续应用开发使用的权威事实与规则。

- [ ] **步骤 1：根据已批准的事实源映射编写治理文档**

  适配参考仓库的关注点分离方式。将产品和界面事实指向现有编号文档，并用原生小程序的生命周期、WXML/WXSS、`setData`、请求、存储和页面注册规则替换单页应用专属规则。

- [ ] **步骤 2：定义并校验架构 Profile 契约**

  记录 `wechat-mini-program`、源码/输出路径、Node.js `24.18.0`、pnpm `11.17.0`、初始 2 MiB 主包预算、必需检查名称，以及尚无冻结 API 契约这一事实。JSON Schema 必须拒绝未知键、非法路径或非法预算。

- [ ] **步骤 3：检查交叉引用和格式**

  运行：`rg -n "DESING|DESIGN|React|Rspack|HeroUI|TanStack|browser-spa" frontend/{AGENTS.md,ARCHITECTURE.md,CONTRIBUTING.md,engineering-standards.md,architecture-profile.yaml,docs/case-based-naming-conventions.md,docs/code-review.md}`

  预期：只有有意保留的对比或非目标引用；不存在重复的 `DESIGN.md` 要求，也没有误带入单页应用规则。

- [ ] **步骤 4：评审任务差异检查点**

  运行：`git diff --check && git status --short`

  预期：只新增治理文件；所有原始前端文件仍然保留。

### 任务 2：增加版本锁定的 TypeScript 与质量工具链

**文件：**

- 新建：`frontend/package.json`
- 新建：`frontend/pnpm-workspace.yaml`
- 新建：`frontend/pnpm-lock.yaml`
- 新建：`frontend/.npmrc`
- 新建：`frontend/.editorconfig`
- 新建：`frontend/.gitattributes`
- 新建：`frontend/.gitignore`
- 新建：`frontend/.prettierignore`
- 新建：`frontend/eslint.config.mjs`
- 新建：`frontend/commitlint.config.mjs`
- 新建：`frontend/tsconfig.json`
- 新建：`frontend/tsconfig.app.json`
- 新建：`frontend/tsconfig.build.json`
- 新建：`frontend/tsconfig.test.json`
- 新建：`frontend/vitest.config.ts`
- 新建：`frontend/.dependency-cruiser.cjs`
- 新建：`frontend/scripts/toolchain-check.mjs`
- 新建：`frontend/scripts/toolchain-check.test.mjs`

**接口：**

- 输入：`architecture-profile.yaml` 中的版本和必需命令。
- 输出：精确的依赖解析，以及 `format`、`lint`、`typecheck`、`test`、`build`、安全和聚合 `verify` 命令界面。

- [ ] **步骤 1：初始化版本锁定的包与 TypeScript/测试配置**

  添加包清单和共享配置，安装精确版本的依赖并生成 `pnpm-lock.yaml`。此时不要实现 `assertToolchain`。

- [ ] **步骤 2：编写失败的工具链契约测试**

  测试 `assertToolchain(packageJson, profile)` 对脚本缺失、依赖版本带范围前缀、Node/pnpm 版本不匹配以及完整有效清单的处理。

- [ ] **步骤 3：运行专项测试并确认因实现缺失而失败**

  运行：`pnpm exec vitest run scripts/toolchain-check.test.mjs`

  预期：失败，因为尚未实现 `assertToolchain`。

- [ ] **步骤 4：实现工具链检查**

  使用计划标题中经注册表验证的直接依赖版本，并加入 `miniprogram-api-typings@5.2.3`、`@commitlint/cli@21.2.4`、`@commitlint/config-conventional@21.2.4`、`@eslint/js@10.0.1`、`@types/node@26.6.5`、`@vitest/coverage-v8@5.0.5`、`ajv@8.20.0`、`ajv-formats@3.0.1`、`eslint-plugin-import-x@4.17.1`、`eslint-plugin-promise@7.3.0`、`globals@17.13.0`、`lint-staged@17.6.0`、`typescript-eslint@8.72.0` 和 `yaml@2.9.1`。断言完整的必需命令集合存在，且依赖版本均为精确版本。

- [ ] **步骤 5：运行工具链测试和静态配置检查**

  运行：`pnpm test -- scripts/toolchain-check.test.mjs && pnpm toolchain:check && pnpm typecheck`

  预期：通过，且没有 warning 或生成的 TypeScript 产物。

- [ ] **步骤 6：评审任务差异检查点**

  运行：`git diff --check && git status --short`

  预期：已增加版本锁定的工具链/配置文件和锁文件；现有内容保持不变。

### 任务 3：构建最小原生小程序应用壳

**文件：**

- 新建：`frontend/apps/miniapp/project.config.json`
- 新建：`frontend/apps/miniapp/src/app.ts`
- 新建：`frontend/apps/miniapp/src/app.json`
- 新建：`frontend/apps/miniapp/src/app.wxss`
- 新建：`frontend/apps/miniapp/src/sitemap.json`
- 新建：`frontend/apps/miniapp/src/pages/home/index.ts`
- 新建：`frontend/apps/miniapp/src/pages/home/index.json`
- 新建：`frontend/apps/miniapp/src/pages/home/index.wxml`
- 新建：`frontend/apps/miniapp/src/pages/home/index.wxss`
- 新建：`frontend/apps/miniapp/src/pages/home/home-page-state.ts`
- 新建：`frontend/apps/miniapp/src/pages/home/home-page-state.test.ts`
- 新建：`frontend/apps/miniapp/src/styles/tokens.wxss`
- 新建：`frontend/apps/miniapp/src/styles/theme.wxss`
- 新建：`frontend/scripts/miniapp-manifest.mjs`
- 新建：`frontend/scripts/miniapp-manifest.test.mjs`

**接口：**

- 输入：原生小程序全局 API 和 `docs/02-UI规范与原型说明.md` 中的界面词汇。
- 输出：一个已注册首页、确定性的初始展示状态、有效的应用/页面清单和语义化 WXSS Token。

- [ ] **步骤 1：编写失败的展示状态与清单测试**

  断言 `createHomePageState()` 返回不可变的初始标题/状态模型；断言 `validateMiniappManifest()` 只接受已声明的首页，并拒绝页面缺失、路径穿越和格式错误的 JSON。

- [ ] **步骤 2：运行测试并确认因实现缺失而失败**

  运行：`pnpm test -- apps/miniapp/src/pages/home/home-page-state.test.ts scripts/miniapp-manifest.test.mjs`

  预期：失败，因为状态工厂和清单校验器尚不存在。

- [ ] **步骤 3：实现原生应用壳和最小首页**

  注册 `pages/home/index`，由页面状态所有者维护用户可见文案，使用语义化 Token，不实现 API、存储或相机行为，并且只使用原生 WXML、WXSS、Page 和 App 构造。

- [ ] **步骤 4：运行专项测试和应用类型检查**

  运行：`pnpm test -- apps/miniapp/src/pages/home/home-page-state.test.ts scripts/miniapp-manifest.test.mjs && pnpm typecheck`

  预期：通过，小程序类型已生效，且不存在隐式全局变量或 `any`。

- [ ] **步骤 5：评审任务差异检查点**

  运行：`git diff --check && git status --short`

  预期：只新增最小原生应用壳、对应测试和清单校验器。

### 任务 4：实现确定性构建与包校验

**文件：**

- 新建：`frontend/scripts/build-miniapp.mjs`
- 新建：`frontend/scripts/build-miniapp.test.mjs`
- 新建：`frontend/scripts/bundle-budget.mjs`
- 修改：`frontend/package.json`
- 修改：`frontend/tsconfig.build.json`

**接口：**

- 输入：`apps/miniapp/src/`、`architecture-profile.yaml` 以及任务 3 中的 `validateMiniappManifest()`。
- 输出：完整且被忽略的 `apps/miniapp/dist/` 目录树；遇到不安全路径、资源缺失、不支持的输出、source map/声明文件或预算超限时返回失败退出码。

- [ ] **步骤 1：编写失败的构建规划测试**

  使用有效的嵌套目录树、越界输出路径、缺失的页面资源以及必须保留相对路径的资源，测试 `assertSafeOutputDirectory()`、`collectRuntimeAssets()` 和 `assertExpectedBuildFiles()`。

- [ ] **步骤 2：运行专项构建测试并确认因实现缺失而失败**

  运行：`pnpm test -- scripts/build-miniapp.test.mjs`

  预期：失败，因为构建辅助函数尚不存在。

- [ ] **步骤 3：实现编译、复制、输出校验和包体预算**

  只删除解析后的配置输出目录，运行构建用 TypeScript 配置，按原路径复制明确允许的运行时资源扩展名，校验输出清单和资源，并强制执行 Profile 中的字节预算。

- [ ] **步骤 4：验证构建行为和输出内容**

  运行：`pnpm test -- scripts/build-miniapp.test.mjs && pnpm build && find apps/miniapp/dist -type f | sort`

  预期：通过；输出包含 `app.js`、`app.json`、`app.wxss`、`sitemap.json`、两个样式文件以及四个 `pages/home/index.*` 运行时文件，不包含 `.ts`、`.map` 或 `.d.ts` 文件。

- [ ] **步骤 5：评审任务差异检查点**

  运行：`git diff --check && git status --short --ignored`

  预期：构建实现已纳入跟踪，`apps/miniapp/dist/` 只作为忽略的输出出现。

### 任务 5：强制执行架构、Profile、指令与安全约束

**文件：**

- 新建：`frontend/scripts/architecture-rules.mjs`
- 新建：`frontend/scripts/architecture-check.mjs`
- 新建：`frontend/scripts/architecture-check.test.mjs`
- 新建：`frontend/scripts/profile-check.mjs`
- 新建：`frontend/scripts/instructions-check.mjs`
- 新建：`frontend/scripts/diagram-check.mjs`
- 新建：`frontend/scripts/secret-patterns.mjs`
- 新建：`frontend/scripts/secret-check.mjs`
- 新建：`frontend/scripts/staged-secret-check.mjs`
- 新建：`frontend/scripts/staged-typecheck.mjs`
- 新建：`frontend/scripts/license-check.mjs`
- 新建：`frontend/scripts/run-frontend-command.mjs`
- 修改：`frontend/.dependency-cruiser.cjs`
- 修改：`frontend/package.json`

**接口：**

- 输入：治理文件、架构 Profile/Schema、源码路径、Git 根目录/前缀以及暂存文件参数。
- 输出：可从仓库根目录或 `frontend/` 运行，并供本地、钩子和 CI 使用的确定性零 warning 门禁。

- [ ] **步骤 1：编写失败的架构与仓库路径测试**

  增加基于测试夹具的测试，证明允许的导入能够通过；证明 `shared/http` 之外直接调用 `wx.request`、从 shared 导入页面、从 presentation 导入 infrastructure、嵌套 `AGENTS.md`、无效 Profile 以及父级 Git 根目录路径错误都会失败，并给出可操作的路径信息。

- [ ] **步骤 2：运行专项测试并确认因实现缺失而失败**

  运行：`pnpm test -- scripts/architecture-check.test.mjs`

  预期：失败，因为规则函数尚未实现。

- [ ] **步骤 3：实现适配后的治理与安全检查**

  在可行范围内由 Profile 数据驱动规则，避免大范围删除文件系统内容，安全解析 Git 路径，扫描已跟踪和未跟踪且未被忽略的文本文件，并让完整扫描和暂存扫描复用同一套 Secret 模式定义。

- [ ] **步骤 4：运行全部专项治理门禁**

  运行：`pnpm profile:check && pnpm instructions:check && pnpm architecture:check && pnpm cycle:check && pnpm diagram:check && pnpm security:check`

  预期：通过；不存在被忽略的架构违规、高危生产依赖问题、被拒绝的生产许可证或潜在密钥。

- [ ] **步骤 5：评审任务差异检查点**

  运行：`git diff --check && git status --short`

  预期：只新增或修改前端范围内的检查实现和配置。

### 任务 6：集成仓库钩子、CI、文档入口与最终验证

**文件：**

- 新建：`.github/actions/frontend-pnpm-check/action.yml`
- 新建：`.github/workflows/frontend-verify.yml`
- 新建：`.husky/pre-commit`
- 新建：`.husky/commit-msg`
- 修改：`frontend/package.json`
- 修改：`frontend/README.md`
- 新建：`frontend/docs/architecture-bootstrap.md`
- 修改：`frontend/docs/07-交付校验记录.md`

**接口：**

- 输入：任务 1 至任务 5 创建的所有命令和文档。
- 输出：可被仓库根目录识别的 CI/钩子、容易发现的本地设置说明，以及不重写既有产品历史的验证记录。

- [ ] **步骤 1：使用前端范围命令增加根目录可识别的集成文件**

  CI 必须以 `frontend/` 为工作目录，并为指令/Profile/工具链、格式、类型、Lint、架构/循环依赖、测试、构建和安全检查提供稳定作业。钩子必须调用 `pnpm --dir frontend`，且不得针对 `backend/` 运行。

- [ ] **步骤 2：以增量方式更新前端入口文档**

  在 `frontend/README.md` 末尾追加工程设置、构建和验证链接；记录微信开发者工具导入步骤，并说明自动化构建证据与真机证据的区别。在 `docs/07-交付校验记录.md` 中增加带日期的新章节，不修改之前的结论。

- [ ] **步骤 3：依据锁文件安装并运行专项门禁**

  运行：`pnpm install --frozen-lockfile && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build`

  预期：所有命令均通过，且没有 warning、跳过或未解释的失败。

- [ ] **步骤 4：运行权威聚合验证**

  运行：`pnpm verify`

  预期：治理、Profile、工具链、冻结安装、格式、类型、Lint、架构、循环依赖、测试/覆盖率、构建/预算、依赖审计、许可证和 Secret 检查全部通过。

- [ ] **步骤 5：证明兼容性并检查最终差异**

  从仓库根目录运行：

  ```bash
  git diff --check
  git status --short
  git diff --stat
  git diff -- frontend/docs frontend/prototype frontend/README.md
  pnpm --dir frontend verify
  ```

  预期：原始文档和原型仍然保留；`README.md` 和 `docs/07-交付校验记录.md` 只包含增量工程/验证章节；从父级 Git 仓库上下文运行完整前端验证能够通过。

- [ ] **步骤 6：在不提交的前提下准备负责人交接**

  报告结果、变更文件、命令及输出、未运行的真机检查、残余风险和建议提交范围。除非负责人要求，否则不要创建提交。
