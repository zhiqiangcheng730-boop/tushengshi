# 前端工程代码与质量规范

## 1. 事实源与可执行规则

架构边界以 `ARCHITECTURE.md` 为准，实例版本与路径以 `architecture-profile.yaml` 为准。TypeScript、ESLint、Prettier、dependency-cruiser、Commitlint 与 `package.json#scripts` 是对应机械规则的唯一可执行来源；本文只解释语义约束。

## 2. TypeScript 规范

- 人工维护源码启用 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noImplicitOverride`、`noImplicitReturns`、`noFallthroughCasesInSwitch`、`useUnknownInCatchVariables`、`isolatedModules`、`forceConsistentCasingInFileNames`，类型检查配置保持 `noEmit` 与 `skipLibCheck: false`。
- 禁止显式/隐式 `any`、`@ts-ignore`、生产代码非空断言和为消错使用双重断言。
- 外部输入先以 `unknown` 接收并在边界校验；Union 必须穷尽处理，互斥状态使用判别联合。
- 类型检查与生产编译分离。生产构建只改变输出和模块格式，不降低源码类型门禁。

## 3. ESLint 与复杂度

- 使用唯一 Flat Config；`pnpm lint` 覆盖源码、测试、脚本和配置，并以 `--max-warnings=0` 运行。
- 人工维护 JavaScript/TypeScript 单文件最多 500 行、单函数最多 80 行、圈复杂度最多 12、嵌套最多 3 层、参数最多 4 个，禁止嵌套三元。
- 启用 type-aware TypeScript、Promise/异步安全、import cycle 和未使用代码检查。
- 禁止项目级/目录级 disable。单行抑制必须说明规则、原因和可验证依据。

## 4. 命名、文件与导出

细则见 `docs/case-based-naming-conventions.md`。源码文件使用 kebab-case；类型使用 PascalCase；函数和变量使用 camelCase；布尔值使用 `is/has/can/should` 前缀。名称必须表达业务角色、单位和生命周期，禁止脱离上下文的 `data`、`info`、`item`、`obj`、`temp`、`utils`、`common`、`manager`、`handler`。

默认 named export；微信平台协议要求的 `App()`、`Page()`、`Component()` 注册除外。禁止全局 barrel；跨模块只允许显式 `public.ts`，模块内部引用具体文件。

## 5. 原生小程序规则

- `app.json` 是页面与全局组件注册唯一来源。路由字符串集中由注册清单拥有，不在业务代码散落复制。
- Page/Component 只承担事件适配和渲染；业务规则、坐标变换、金额、状态机与恢复策略进入可独立测试的纯函数或 Application。
- 事件方法使用 `handle<Event>`，传入回调使用 `on<Event>`；WXML 事件名与 TypeScript 方法保持可搜索的一致命名。
- `setData` 发送最小差量，不传函数、类实例、循环结构、图片内容或不参与渲染的大对象。高频触摸更新必须节流并验证目标设备性能。
- `onLoad/onShow` 获取的请求、监听、订阅和计时器在 `onHide/onUnload` 对称释放；异步回调写状态前验证页面仍活跃且请求版本仍为当前。
- 页面不能直接 `wx.request`。平台存储、相机、文件、位置和授权经有明确 owner 的 Adapter 使用，失败、取消、超时和资源释放必须可观察。
- WXML 保持语义层次和可操作名称；触摸目标、焦点、颜色之外的状态表达、安全区和大字体按 UI 规范与真机矩阵验证。

## 6. 样式

全局样式只有 `app.wxss`、`styles/tokens.wxss` 和 `styles/theme.wxss`。业务样式与页面/组件就近维护。颜色、排版、间距、圆角、阴影和层级使用语义 Token；不得在业务 WXSS 复制原始品牌值或用颜色名称表达业务角色。

## 7. 依赖、常量与配置

- 只增加有真实调用者的依赖并精确锁定；生产依赖必须通过漏洞与许可证检查。
- 路由、状态、错误码、存储键、协议字段、超时、容量与环境差异由唯一 owner 定义。
- Secret、AppSecret、token、私有地址和门店标识不得进入源码、默认值、日志、fixture 或构建参数。
- `project.config.json` 只能包含可共享设置；开发者 appid 和个人偏好进入被忽略的 `project.private.config.json`。

## 8. 测试与生成代码

- 生产行为按 TDD 建立失败证据后实现。纯函数使用 Vitest；页面/组件行为在引入真实交互时增加微信运行时或开发者工具集成测试。
- 测试名称采用 `should <behavior> when <condition>`，fixture 名称表达场景，不使用 `mockData`。
- 测试覆盖正常、边界、非法、重复/迟到和生命周期取消路径；不以覆盖率数字替代关键断言。
- OpenAPI 生成代码必须位于 `generated/`、带禁止手改标识并由漂移检查治理。契约冻结前不创建占位生成文件。

## 9. 构建与零债务

构建只能清理 Profile 指定的 `apps/miniapp/dist/`，保留静态资源相对路径，拒绝 source map、声明文件、密钥和超预算输出。不得提交 warning、skip、flaky、TODO/FIXME、注释掉的旧实现、空模块或未使用依赖；临时兼容必须有 owner、移除条件和自动化测试。
