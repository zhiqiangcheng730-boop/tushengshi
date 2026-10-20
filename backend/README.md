# 数得快后端服务

本目录承载 FastAPI 模块化业务单体、PostgreSQL 迁移、共享识别契约以及未来独立推理 worker 的工程治理。当前仅为可运行底座，不表示身份、订单、图片、识别或收费功能已经实现。

## 环境与安装

需要 `uv 0.11.32`。仓库通过 `.python-version` 固定当前可复现的 Python `3.13.14`：

```bash
cd backend
uv sync --frozen --all-groups
```

## 本地运行

设置 `SHUDEKUAI_DATABASE_URL` 后启动：

```bash
uv run uvicorn shudekuai_api.app:create_app --factory --host 127.0.0.1 --port 8000
```

本地 PostgreSQL 可使用 `docker compose up -d postgres`，密码通过未提交的环境变量注入。

## 验证

```bash
make verify
```

共享 OpenAPI 生成到 `../contracts/openapi.json`。业务端点出现后，契约、服务端实现、前端生成客户端和漂移检查必须在同一变更中更新。

Python 发布工件由 Hatchling 构建，`make package-check` 会生成并校验可构建的 wheel；`dist/` 仅为本地产物，不提交仓库。

架构边界见 `ARCHITECTURE.md`，代码规范见 `engineering-standards.md`，协作和评审入口见 `CONTRIBUTING.md` 与 `docs/code-review.md`。
