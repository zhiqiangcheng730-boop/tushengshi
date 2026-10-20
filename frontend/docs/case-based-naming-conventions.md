# 基于代码场景的命名规范

## 1. 通用规则

- 文件和目录：kebab-case；微信固定入口 `app.*`、`sitemap.json` 与页面 `index.*` 例外。
- 类型、类、枚举：PascalCase。
- 变量、函数、属性：camelCase；布尔值使用 `is/has/can/should`。
- 常量：默认 camelCase；跨协议稳定错误码使用 UPPER_SNAKE_CASE。
- 集合使用复数，金额使用 `Fen`，时间使用 `Ms/At`，尺寸使用 `Px/Bytes` 标明单位。

## 2. 小程序场景

| 场景             | 格式                          | 示例                     |
| ---------------- | ----------------------------- | ------------------------ |
| 页面事件方法     | `handle<Event>`               | `handleCaptureTap`       |
| 传入回调         | `on<Event>`                   | `onPointChanged`         |
| 页面状态工厂     | `create<Page>State`           | `createHomePageState`    |
| Application 用例 | 动词 + 名词                   | `ConfirmBatch`           |
| Port             | 能力名                        | `RecognitionGateway`     |
| Adapter          | 机制 + 能力                   | `HttpRecognitionGateway` |
| Transport DTO    | 方向 + 边界                   | `ConfirmBatchRequestDto` |
| 稳定错误         | 原因 + `Error`                | `VersionConflictError`   |
| 存储键           | owner + 版本                  | `countingDraftV1`        |
| 语义样式 Token   | `--<category>-<role>-<state>` | `--color-action-primary` |

## 3. 禁止命名

禁止没有上下文就无法判断职责的 `data`、`info`、`item`、`obj`、`temp`、`utils`、`common`、`manager`、`handler`。确需表示协议字段时保留外部名称，并在边界立即映射为业务名称。

测试文件与被测单元同名并使用 `.test.ts`；`describe` 指向单元，`it` 使用 `should <预期行为> when <条件>`。Fixture 名称表达授权、版本、失败类型等场景，不使用 `mockData`。
