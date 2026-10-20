# 前端架构适配设计

## 1. 目标

在 `frontend/` 下建立面向生产的前端工程底座，同时不删除或移动现有产品文档、讨论纪要、原型或预览资源。

本次实现适配 `/Users/cool/work/self-project/general_architecture_projects` 的治理模型，同时保留本项目已经记录的技术决策：面向用户的客户端采用 TypeScript 编写的原生微信小程序。

## 2. 事实源

以下现有项目决策继续作为权威依据：

- `frontend/docs/03-架构与技术方案.md` 选定原生微信小程序，并规划将其代码放在 `apps/miniapp/` 下。
- `frontend/docs/02-UI规范与原型说明.md` 负责界面和交互规范。
- `frontend/docs/01-产品需求与交互设计.md` 负责面向用户的行为定义。
- `frontend/docs/06-测试与验收计划.md` 负责产品验收场景。
- `frontend/docs/`、`frontend/prototype/` 下的现有文件以及 v0.1 讨论纪要必须原地保留。

参考仓库提供的是工程模式，而不是浏览器专用技术。本项目将适配其中的 `AGENTS.md`、`ARCHITECTURE.md`、`engineering-standards.md`、`CONTRIBUTING.md`、TypeScript 规则、ESLint 规则、构建门禁、依赖检查、CI 结构和安全检查。不会复制 React、Rspack、HeroUI、TanStack Query、Playwright 单页应用配置以及运行时配置逻辑。

参考仓库中不存在 `DESING.md` 或 `DESIGN.md`。本项目不会重复创建设计规范文件：`frontend/docs/02-UI规范与原型说明.md` 继续负责视觉设计，`frontend/engineering-standards.md` 负责代码规范。

## 3. 仓库布局

`frontend/` 作为前端治理和包管理根目录：

```text
frontend/
├── apps/
│   └── miniapp/
│       ├── src/
│       │   ├── app.ts
│       │   ├── app.json
│       │   ├── app.wxss
│       │   ├── sitemap.json
│       │   ├── pages/home/
│       │   ├── shared/
│       │   └── styles/
│       ├── project.config.json
│       └── tsconfig.json
├── scripts/
├── docs/
├── prototype/
├── AGENTS.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── engineering-standards.md
├── architecture-profile.yaml
├── architecture-profile.schema.json
├── eslint.config.mjs
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.build.json
├── tsconfig.test.json
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

当前只创建应用壳和最小首页。拍摄、复核、汇总、历史和门店设置等规划页面，在实现其业务行为前不预先创建，以避免空模块树和推测性抽象。

仅能在仓库根目录被 Git 识别的仓库级集成文件，例如 `.github/workflows/` 和 Husky 钩子，可以添加在根目录。其命令必须明确指向 `frontend/`，不得将前端假设强加给未来的后端工程。

## 4. 运行环境与工具链

前端底座采用：

- 原生微信小程序 API 和文件格式；
- 启用严格编译选项和微信 API 类型的 TypeScript；
- 精确锁定依赖版本并提交锁文件的 pnpm；
- ESLint Flat Config，用于类型感知的 TypeScript、Promise、导入循环、复杂度、文件大小和未使用代码检查；
- Prettier、`.editorconfig` 和 `.gitattributes`，用于保证格式化结果确定；
- Vitest，用于与框架无关的应用逻辑、状态、几何和契约测试；
- dependency-cruiser，用于完整的依赖循环和分层检查；
- Commitlint 和 Husky，用于本地提交门禁；
- GitHub Actions，用于权威 CI 门禁。

在出现真实使用者之前，工程脚手架不引入跨端框架、Web 框架、组件库、全局状态库、请求库或 Schema 库。

## 5. 应用边界

小程序初始采用以下边界：

- `app.*` 是组合根和平台入口。
- `pages/` 包含已注册的小程序页面和交互适配器。
- 引入真实模块后，`modules/<module>/application/` 负责业务命令、状态转换和稳定端口。
- `modules/<module>/infrastructure/` 负责微信、API 和存储适配器。
- `modules/<module>/presentation/` 负责供页面或组件共享的模块专属展示逻辑。
- `shared/` 包含拥有多个真实使用者的能力，例如唯一 HTTP 边界、已校验配置、生命周期辅助能力或共享几何原语。
- `generated/` 专用于 OpenAPI 派生代码，禁止手工编辑。
- `styles/` 负责全局主题入口和语义化设计 Token。

初始脚手架不要求创建空的 `modules/` 或 `generated/` 目录树。模块存在后，依赖方向为：

```text
pages / presentation -> application <- infrastructure
app -> pages 和模块组合
shared -> 仅可依赖平台与第三方依赖
```

展示代码不得直接调用 `wx.request`。远程 I/O 归唯一共享客户端和模块基础设施适配器所有。应用代码不得依赖小程序页面实例、生成的传输 DTO 或基础设施实现。这些规则由可执行检查强制实施，而不只依赖文档约定。

## 6. 构建与打包

源码目录为 `frontend/apps/miniapp/src/`；生成输出位于 `frontend/apps/miniapp/dist/`，并由 Git 忽略。

生产构建执行以下操作：

1. 仅删除已知的 `apps/miniapp/dist/` 输出目录；
2. 使用专用构建配置编译应用 TypeScript；
3. 复制小程序运行时资源（`json`、`wxml`、`wxss`、图片和其他明确支持的资源），且不改变其相对路径；
4. 验证输出中存在必需的应用和页面入口文件；
5. 拒绝 source map、声明文件、密钥、不支持的文件、缺失的引用资源以及超过 Profile 预算的包输出。

`apps/miniapp/project.config.json` 将微信开发者工具指向 `dist/`，并使用非敏感的占位应用标识。开发者专属项目设置保存在已忽略的 `project.private.config.json` 中。

构建过程不伪造 API Schema。现有架构要求使用 OpenAPI 生成客户端类型，但只有在后端契约冻结并提交到约定的仓库路径后，相关门禁才会启用。

## 7. 工程规则与治理

`frontend/AGENTS.md` 是前端子树唯一的智能体指令文件。它引用而不重复以下权威来源：

- 项目事实：`architecture-profile.yaml` 及其 Schema；
- 架构边界：`ARCHITECTURE.md`；
- 代码规则：`engineering-standards.md` 和可执行配置；
- Git 与评审流程：`CONTRIBUTING.md`；
- 产品和界面行为：现有编号文档。

适配后的规范保留参考仓库的重要约束：

- 严格 TypeScript：设置 `skipLibCheck: false`，禁止显式 `any` 和未经检查的非空断言，并在不可信边界执行运行时校验；
- ESLint 零 warning，并限制文件长度、函数长度、嵌套深度、复杂度和参数数量；
- 源文件采用 kebab-case，业务命名精确，默认使用具名导出，不建立全局桶文件；
- 禁止循环依赖和隐藏的反向依赖；
- 精确锁定依赖版本，说明依赖理由，执行 Secret 扫描、生产依赖审计和许可证白名单检查；
- 为生产行为提供自动化测试，并在交付前完整执行 `pnpm verify`。

React、浏览器、CSS Module、Query 和单页应用专属规则，替换为小程序的页面注册、WXML/WXSS 归属、事件命名、`setData` 载荷大小、生命周期清理、请求取消和平台存储边界规则。

## 8. 验证与 CI

根包提供以下专项命令和唯一权威聚合命令：

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm architecture:check`
- `pnpm cycle:check`
- `pnpm profile:check`
- `pnpm instructions:check`
- `pnpm test` 和 `pnpm test:coverage`
- `pnpm build`
- `pnpm security:check`
- `pnpm verify`

初始测试套件至少证明：

- 应用和首页清单结构有效；
- 首页展示状态具有确定性；
- 构建产出全部必需的小程序文件；
- 架构检查会拒绝允许边界之外的直接远程 I/O；
- Profile 与工具链配置保持内部一致。

GitHub Actions 从仓库根目录运行，并以 `frontend/` 为工作目录。格式、类型、Lint、架构、循环依赖、测试、构建和安全检查使用稳定的作业名称。真机和微信开发者工具自动化仍作为独立发布证据，因为 CI 无法替代 `frontend/docs/06-测试与验收计划.md` 中的设备矩阵。

## 9. 兼容性与非目标

本次迁移不得删除、重命名、整体重新格式化或重新解释现有产品文档和原型。本次不实现相机访问、身份认证、API 调用、识别、点位编辑、离线恢复、支付、平台后台或后端服务。

初始脚手架满足以下条件即视为成功：

1. 所有既有前端文件仍然存在并保留原内容；
2. 在 `frontend/` 中执行 `pnpm install --frozen-lockfile` 成功；
3. 专项检查和聚合命令 `pnpm verify` 通过，且没有 warning 或未解释的跳过；
4. 生产构建在 `apps/miniapp/dist/` 下创建完整的原生小程序输出；
5. 架构和工程文档与可执行配置一致；
6. Git 差异中不存在无关清理或生成的本地状态。

## 10. 回滚

本次变更为增量变更。在业务实现开始前，回滚方式是移除新增的治理、工具链、CI 和 `apps/miniapp/` 脚手架文件。现有文档和原型资源没有被删除或重写，因此无需恢复。
