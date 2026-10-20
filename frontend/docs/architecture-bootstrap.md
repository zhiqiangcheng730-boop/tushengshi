# 前端架构启动指南

## 1. 环境

需要 Node.js `24.18.0`、Corepack 和仓库锁定的 pnpm `11.17.0`：

```bash
cd frontend
corepack enable
pnpm install --frozen-lockfile
```

直接依赖使用精确版本，`pnpm-lock.yaml` 必须提交。不得使用 npm、Yarn 或手工修改锁文件生成第二套依赖状态。

## 2. 开发与构建

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm build` 只清理并重建 `apps/miniapp/dist/`。在微信开发者工具中导入 `frontend/apps/miniapp/`；共享的 `project.config.json` 已将 `miniprogramRoot` 指向 `dist/`。开发者自己的 AppID 与工具偏好写入被 Git 忽略的 `project.private.config.json`，不得提交 AppSecret。

当前首页仅证明工程、页面注册和构建链路可运行，不代表拍摄、识别、微信登录或服务端 API 已实现。

## 3. 目录扩展

只有出现真实业务行为时才新增页面或 `modules/<module>/`。新页面必须同时完成：

1. 在 `app.json` 注册安全相对路径；
2. 添加页面 TypeScript、JSON、WXML、WXSS 四件套；
3. 将业务状态转换放入可测试的 Application 或展示状态函数；
4. 更新清单/构建测试和对应产品验收映射；
5. 运行 `pnpm verify`。

API 契约冻结后再按 `ARCHITECTURE.md` 增加 `generated/` 与漂移检查，不先创建占位 DTO。

## 4. 权威验证

```bash
pnpm verify
```

该命令验证规范、Profile、锁文件、格式、类型、Lint、架构边界、依赖环、测试覆盖率、构建、包体、漏洞、许可证和 Secret。自动化通过不代替微信开发者工具与 `docs/06-测试与验收计划.md` 中的真机、相机、授权、弱网和性能验收。
