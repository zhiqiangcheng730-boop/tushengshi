# 后端工程代码与质量规范

## 1. Python 与类型

- 使用 Python `3.13.14`，直接依赖精确锁定并提交 `uv.lock`。
- `mypy --strict`；公共函数必须标注参数和返回类型，禁止无理由 `Any`、裸 `type: ignore` 和未经校验的字典传递。
- Pydantic 只用于不可信边界和稳定契约；Domain 使用标准 Python 类型，不依赖 Transport DTO。

## 2. 命名与结构

- 模块、函数和变量使用 `snake_case`，类和协议使用 `PascalCase`，常量使用 `UPPER_SNAKE_CASE`。
- 文件、函数和类只承担一个可描述职责；禁止 `utils.py`、`helpers.py`、`common.py` 式无 owner 容器。
- 业务模块只公开明确的 application contract，不从其他模块深层导入实现。

## 3. HTTP、数据库与异步

- Handler 只做解析、身份上下文、调用用例和错误映射。
- SQLAlchemy 查询必须参数化；写操作显式声明事务边界；数据库调用传播取消和超时。
- 不在事务中执行远程 I/O 或模型推理；不使用无限重试或静默捕获。
- 日志为结构化安全字段，不记录 Secret、Authorization、数据库 URL、原图或原始模型输出。

## 4. 测试

- 测试公开行为和契约，先 RED 再 GREEN；禁止 `skip`、`only`、空断言、真实网络和不受控时间。
- 契约测试覆盖合法、非法、边界和互斥输入；HTTP 测试覆盖 request id、稳定错误和就绪失败。
- 数据库 Repository 与迁移出现后必须使用真实 PostgreSQL 集成测试，不以 SQLite 或 mock 替代。
- 覆盖率是最低信号：Statements/Lines 90%、Branches 85%、Functions 100%。

## 5. 生成物与零债务

- OpenAPI 和 JSON Schema 声明唯一生成源，生成物禁止手改并执行零漂移检查。
- 禁止 warning、TODO/FIXME、长期兼容分支、未使用依赖、注释掉的旧实现或扩大排除范围。
