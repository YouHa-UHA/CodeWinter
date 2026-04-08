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
   - `cursor-worker-fable-report-002`
   - `claude-worker-web-review-003`
