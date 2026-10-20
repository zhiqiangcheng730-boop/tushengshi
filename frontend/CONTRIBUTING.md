# 前端协作与交付规范

## 1. 开始前

使用 `corepack enable` 启用仓库锁定的 pnpm，在 `frontend/` 执行 `pnpm install --frozen-lockfile`。阅读 `AGENTS.md`、`ARCHITECTURE.md`、`engineering-standards.md` 与相关产品文档，并检查 `git status --short`。

## 2. 分支与变更范围

- 使用短生命周期分支；一个变更只解决一个可验证目标。
- 不混入无关格式化、重命名、依赖升级或文档改写。
- 不提交 `dist/`、覆盖率、本机微信配置、密钥、真实业务图片或临时日志。
- 新依赖必须说明调用者、替代方案、许可证、审计和包体影响。

## 3. 提交信息

Commit 遵循 Conventional Commits，并要求非空 scope，例如：

```text
feat(miniapp): add capture page shell
fix(build): preserve nested static assets
docs(architecture): clarify storage boundary
```

允许的常用类型为 `feat`、`fix`、`refactor`、`test`、`docs`、`build`、`ci`、`chore`。主题使用祈使句，描述行为结果；禁止 `update`、`changes`、`fix stuff` 等无信息内容。Agent 未获得 owner 明确授权时不得创建 Commit、推送或发起 PR。

## 4. 本地门禁

- 开发中运行受影响测试和 `pnpm typecheck`、`pnpm lint`。
- 提交前运行 `pnpm commit:ready`。
- 交付前运行权威命令 `pnpm verify`。
- 微信能力、相机、授权、弱网、横竖屏、安全区和真机性能按 `docs/06-测试与验收计划.md` 留存设备与结果，不能用桌面单测代替。

不得通过修改脚本、降低阈值、跳过测试或扩大 ignore 让失败消失。外部服务或真机条件阻塞时，完成其余门禁并在交付报告列出命令、错误和 owner 所需输入。

## 5. 合并请求

PR 必须说明目标、行为变化、架构/契约影响、测试证据、真机证据（适用时）、残余风险和回滚方式。评审按 `docs/code-review.md`；Required Checks 全绿不等于可以忽略产品验收或安全问题。

## 6. 合并与发布

只通过受保护分支流程合并，不改写共享历史。发布制品来自同一已验证提交的 `apps/miniapp/dist/`，不得在上传前手工修改。微信上传、体验版、审核、发布和回滚均属于外部状态变更，需要 owner 明确授权。
