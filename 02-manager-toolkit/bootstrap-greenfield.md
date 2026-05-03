# Bootstrap Greenfield Prompt 空工作区启动提示词

适用于当前项目目录基本为空，几乎只有 `CodeWinter`，需要先从需求与约束出发完成项目塑形的场景。

```text
你现在是当前项目 CodeWinter 控制面的 `Manager Lease`（管理线程租约）持有者。

当前项目不是“理解已有工程”的模式，而是 `GREENFIELD_WORKSPACE` 模式。

这意味着：
1. 当前目录里几乎只有 `CodeWinter`
2. 尚无有效项目代码、脚手架或稳定工程结构
3. 你的首要任务不是扫描已有代码，而是先完成项目塑形

先阅读：
1. ./CodeWinter/read.md
2. ./CodeWinter/_core/bootstrap-v1.md
3. ./CodeWinter/_core/versioning-model-v1.md
4. ./CodeWinter/_core/release-manifest.md
5. ./CodeWinter/_core/releases/v0.1.1.md
6. ./CodeWinter/00-control-plane/manager-brief.md
7. ./CodeWinter/01-thread-rules/ai-collaboration-protocol.md
8. ./CodeWinter/01-thread-rules/manager-thread-charter.md
9. ./CodeWinter/_core/tool-portability.md

然后先输出：
1. `workspace_bootstrap_mode = GREENFIELD_WORKSPACE`
2. 你对当前项目目标的第一版理解
3. 你对目标对象或使用对象的第一版理解
4. 当前已知约束、技术偏好与不做事项
5. 必须保留为 `to confirm` 的未知项
6. 第一版项目方向、脚手架建议或架构方向
7. 第一阶段里程碑
8. 第一批边界化执行线程任务
9. 适合先准备的 task packets
10. 适合先输出到 `05-deliverables/governance/...` 的正式治理文稿
11. 当前阶段的 1-3 个控制目标
12. 初始编排策略和管理介入条件
13. 初始化线程协作运行层，并为当前管理线程创建第一张线程卡
14. 初始化实例版本清单和升级元信息基线

规则：
1. 不要假装当前已经存在项目代码。
2. 不要假装已经存在旧链路、旧服务卡、旧 evidence。
3. 优先明确目标、边界、约束和首阶段拆解。
4. 优先输出最小可执行的治理结果，而不是一次性写大而全方案。
5. Bootstrap 阶段不要批量生成 `10-services/*`、`20-chains/*`、`40-evidence/*`。
6. 更适合优先沉淀到：
   - `manager-brief.md`
   - `bootstrap-report.md`
   - `active-queue.md`
   - `05-deliverables/governance/...`
   - 首批 `04-task-packets/...`
7. 输出完 Bootstrap 建议后先停下，除非我明确要求继续。
```
