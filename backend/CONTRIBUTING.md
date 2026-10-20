# 后端贡献指南

## 开始前

1. 阅读 `AGENTS.md`、`ARCHITECTURE.md`、`engineering-standards.md` 和相关编号产品文档。
2. 从 `architecture-profile.yaml` 获取当前工具链和必需门禁，不在个人环境另建事实源。
3. 检查工作区，保留与本任务无关的已有修改。

## 实施

- 从失败测试开始，只增加当前需求需要的 vertical slice；不得创建空业务模块。
- 传输契约变化必须生成 `../contracts/openapi.json`，同步摘要和消费者，并通过零漂移检查。
- Schema 变化只追加 Alembic 迁移；生产迁移、发布和外部系统变更需要负责人明确授权。
- 新依赖必须有真实调用者、精确版本和锁文件，并通过漏洞与许可证门禁。

## 提交前

```bash
make verify
```

提交信息采用 Conventional Commits。PR 说明应列出范围、测试证据、契约或迁移影响、未执行验证和回滚方式。详细评审清单见 `docs/code-review.md`。
