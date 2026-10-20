# AGENTS.md

## 1. 适用范围与事实源

本文件适用于 `backend/` 全部内容。事实源按以下顺序唯一归属：

- 项目实例事实：`architecture-profile.yaml` 及其 Schema；
- 架构边界：`ARCHITECTURE.md`；
- Python、测试与工具规则：`engineering-standards.md` 和 `pyproject.toml`；
- 产品、业务状态和验收：`../frontend/docs/00`～`11`；
- HTTP 传输契约：`../contracts/openapi.json`。

冲突时不得选择较宽松规则继续；应在同一变更中修正规范和实现。

## 2. 实施原则

- 先读相关产品需求、架构和测试映射，再建立可验证的完成条件。
- 模块采用 `transport → application → domain` 的向内依赖；`infrastructure` 实现 application port。
- 不预建空业务模块、Repository、Entity、Service、Domain、全局工具箱或第二套 DTO。
- HTTP、环境变量、数据库、微信回调、图片和模型输出均为不可信边界，进入系统时严格校验。
- 金额使用整数分；门店、角色、订单版本、完成状态和用量权限由服务端校验。
- 外部 I/O 必须有超时、取消、幂等、资源释放和安全错误映射。
- 不记录 Secret、完整凭据、私有图片地址、SQL 参数、原始模型输出或真实个人数据。
- 不降低类型、Lint、覆盖率、架构、漏洞、许可证或 Secret 门禁来绕过失败。

## 3. 开发流程

生产行为先写能够在旧实现失败的测试，再写最小实现。完成前运行受影响测试和 `make verify`；涉及共享 OpenAPI 时必须重新生成后执行零漂移检查，并回归前端 `pnpm verify`。

不得执行破坏性 Git 操作，不得擅自提交、推送、发布、运行生产迁移或修改外部系统。

最终报告必须以以下两行结束：

`风险: <残余风险、未完成验证或已知限制；无则写无>`

`后续: <待办、下一步和 owner；无则写无>`
