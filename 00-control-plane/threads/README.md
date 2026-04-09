# Threads 线程状态卡目录

本目录用于存放线程状态卡。

规则：
1. 一条线程一个文件
2. 线程优先只写自己的状态卡
3. 管理线程通过这些状态卡汇总到 `thread-board.md`

推荐命名：
1. `threads/<thread-id>.md`

推荐 `thread_id` 格式：
1. `<tool>-<role>-<topic>-<seq>`
2. 例如：
   - `codewinter-manager-root-001`
   - `codex-worker-fable-report-002`
   - `claude-reviewer-web-review-003`

补充说明：
1. `tool` 用来标识该线程当前所处的客户端或运行环境。
2. `role` 建议与线程状态卡中的 `role` 字段保持一致。
3. `topic` 应尽量简短、稳定、可复用，不要写成整句需求。
