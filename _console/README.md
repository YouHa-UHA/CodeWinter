# CodeWinter Operator Console

`Operator Console` 是 `CodeWinter` 的下游操作台，用来优化人与系统的交互体验，而不是替代 `CodeWinter` 本体。

它的边界非常明确：

1. `CodeWinter` 本体仍然是唯一真相源。
2. `_console` 只消费、投影和安全操作这些信息。
3. `_console` 不反向塑造 `CodeWinter` 的协议、规则和长期知识层。
4. 即使 `_console` 不存在，`CodeWinter` 本体也必须能独立运行。

## 当前能力

1. `Overview`
   - 查看当前发布版本下的项目介绍与使用说明
   - 把系统介绍、使用入口和当前发布基线放在统一首页
2. `Workbench`
   - 复制高频提示词
   - 安全上传文件到 `03-inbox`
   - 安全上传文件到 `04-task-packets/_incoming`
   - 浏览和预览 `05-deliverables`
3. `Runtime`
   - 查看已注册线程
   - 查看协作请求
   - 查看阻塞、偏航、待决策等运行信号
4. `Library`
   - 只读浏览控制面、实例版本信息和系统资料入口

## 技术实现

1. 宿主层：`Tauri 2`
2. 宿主语言：`Rust`
3. 前端：`React + TypeScript + Vite`
4. 组件基础：`Ant Design + 自定义 tokens`
5. 数据原则：`Projection-First`
6. 当前壳层方向：轻量化桌面操作台 + 响应式材质系统

## 安全边界

v1 默认只开放极窄写入面：

1. 允许写：`03-inbox`
2. 允许写：`04-task-packets/_incoming`
3. 默认只读：`_core`、`00-control-plane`、`01-thread-rules`、`02-manager-toolkit`、`05-deliverables`、`10+`

## 数据边界

1. `CodeWinter` 文件系统仍是唯一真相源。
2. UI 壳层属于 `CodeWinter` 项目，但不定义 `CodeWinter` 协议真相。
3. 提示词条目、上传区、实例字段、运行态解释等 `CodeWinter` 域信息，应由 snapshot adapter 扫描与投影提供，而不是由 React 页面私自写死。
4. Console 的运行缓存、快照和发布物属于派生物，可以删除并重建。

## 发布目录

本地使用的 Windows 发布物不直接从 `target/` 读取，而是统一放在：

1. `./releases/windows/current/`
2. `./releases/windows/v0.1.1/`

其中包含：

1. `CodeWinter-operator-console.exe`
2. `CodeWinter-operator-console-setup.exe`
3. `RELEASE.md`

说明：
1. `releases/` 是本地发布落点，不是源码真相层。
2. 正式对外分发时，更推荐通过 GitHub Releases 提供安装包，而不是把二进制文件提交进源码仓库。
