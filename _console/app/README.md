# CodeWinter Operator Console App

`app/` 是 `CodeWinter Operator Console` 的前端层。

当前技术栈：
1. `React`
2. `TypeScript`
3. `Vite`

职责边界：
1. 只负责 UI 展示与交互。
2. 不直接解析 `CodeWinter` 本体文件。
3. 通过 `src-tauri` 提供的命令消费 snapshot 和安全动作。

常用命令：
1. `npm run dev`
2. `npm run build`
3. `npm run lint`
4. `npm run tauri:dev`
5. `npm run tauri:build`
