# CodeWinter Operator Console

`Operator Console` 是 `CodeWinter` 的下游操作台，用来优化人与系统的交互体验，而不是替代 `CodeWinter` 本体。

它的边界非常明确：

1. `CodeWinter` 本体仍然是唯一真相源。
2. `_console` 只消费、投影和安全操作这些信息。
3. `_console` 不反向塑造 `CodeWinter` 的协议、规则和长期知识层。
4. 即使 `_console` 不存在，`CodeWinter` 本体也必须能独立运行。

## 当前能力

1. `Workbench`
   - 复制高频提示词
   - 安全上传文件到 `03-inbox`
   - 浏览和预览 `05-deliverables`
2. `Runtime`
   - 查看已注册线程
   - 查看协作请求
   - 查看阻塞、偏航、待决策等运行信号
3. `Explorer`
   - 只读浏览控制面、实例版本信息和发布入口

## 技术实现

1. 宿主层：`Tauri 2`
2. 宿主语言：`Rust`
3. 前端：`React + TypeScript + Vite`
4. 设计方向：`Warm Precision`
5. 组件基础：`Ant Design + 自定义 tokens`

## 安全边界

v1 默认只开放极窄写入面：

1. 允许写：`03-inbox`
2. 默认只读：`_core`、`00-control-plane`、`01-thread-rules`、`02-manager-toolkit`、`04-task-packets`、`05-deliverables`、`10+`

## 发布目录

用户使用的 Windows 发布物不再直接从 `target/` 读取，而是统一放在：

1. `./releases/windows/current/`
2. `./releases/windows/v0.1.1/`

其中包含：

1. `CodeWinter-operator-console.exe`
2. `CodeWinter-operator-console-setup.exe`
3. `RELEASE.md`
