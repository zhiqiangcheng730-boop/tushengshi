# 数据库迁移

业务表随对应业务任务以只追加迁移引入。本底座不创建占位表，也不在应用启动时自动升级数据库。

设置 `SHUDEKUAI_DATABASE_URL` 后执行：

```bash
uv run alembic upgrade head
```
