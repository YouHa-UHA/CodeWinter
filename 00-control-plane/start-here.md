# CodeWinter Start Here 管理入口

本文只做一件事：给管理者提供 `CodeWinter` 的导航入口。

说明：
1. 当前 `CodeWinter` 本体仓中的控制面文件默认是模板基线。
2. 真正接入某个项目后，应由管理线程将这些文件改写为该实例的真实状态。

## 最常用入口
1. 当前动态状态
   - `./CodeWinter/00-control-plane/manager-brief.md`
2. 跨话题待办队列
   - `./CodeWinter/00-control-plane/active-queue.md`
3. Bootstrap 状态
   - `./CodeWinter/00-control-plane/bootstrap-report.md`
4. 实例版本与状态
   - `./CodeWinter/00-control-plane/instance-manifest.md`
5. 线程协作总览
   - `./CodeWinter/00-control-plane/thread-board.md`
6. 协作规则
   - `./CodeWinter/01-thread-rules/ai-collaboration-protocol.md`
7. 线程协作运行层规则
   - `./CodeWinter/01-thread-rules/thread-coordination-layer.md`
8. 升级与迁移协议
   - `./CodeWinter/_core/upgrade-migration-v1.md`
9. 版本模型
   - `./CodeWinter/_core/versioning-model-v1.md`
10. 当前发布清单
   - `./CodeWinter/_core/release-manifest.md`
11. 发布治理
   - `./CodeWinter/_core/release-governance-v1.md`
12. 发布说明模型
   - `./CodeWinter/_core/release-notes-model-v1.md`
13. 当前发布说明
   - `./CodeWinter/_core/releases/v0.1.1.md`
14. 升级计划
   - `./CodeWinter/00-control-plane/upgrade-plan.md`
15. 升级日志
   - `./CodeWinter/00-control-plane/upgrade-log.md`
16. 管理线程章程
   - `./CodeWinter/01-thread-rules/manager-thread-charter.md`
17. 管理工具箱
   - `./CodeWinter/02-manager-toolkit/quick-prompts.md`

## 使用规则
1. 本页只做导航，不堆细节规则。
2. 稳定 Starter 信息写入 `./CodeWinter/read.md`。
3. 当前项目动态写入 `manager-brief.md`。
4. 当前实例版本、升级状态与兼容期状态写入 `instance-manifest.md`。
5. 如果当前只是 `CodeWinter` 本体仓，不要把这些占位内容误判为真实实例运行态。
