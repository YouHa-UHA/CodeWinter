# CodeWinter Starter 统一启动入口

本文是当前项目所有线程的统一启动入口。

## 1. 默认阅读顺序
### 新线程
1. 先读本文。
2. 再读 `./CodeWinter/00-control-plane/manager-brief.md`。
3. 再读 `./CodeWinter/00-control-plane/instance-manifest.md`。
4. 再读 `./CodeWinter/01-thread-rules/ai-collaboration-protocol.md`。
5. 如果 `instance-manifest.md` 显示当前实例处于 `UPGRADING` 或 `COMPATIBILITY_WINDOW`，再读升级相关文件。
6. 如果任务与跨线程协作有关，再读 `./CodeWinter/01-thread-rules/thread-coordination-layer.md` 和 `./CodeWinter/00-control-plane/thread-board.md`。
7. 如果有任务包，再读 `./CodeWinter/04-task-packets/.../packet.md` 及其必读附件。
8. 如果已知目标服务或应用，再读对应 `service-manifest.md`。
9. 如果已知目标链路，再读对应 chain card。
10. 需要时再读 evidence、decisions 和近期 service log。

升级相关文件包括：
1. `./CodeWinter/_core/upgrade-migration-v1.md`
2. `./CodeWinter/_core/versioning-model-v1.md`
3. `./CodeWinter/_core/release-manifest.md`
4. `./CodeWinter/_core/release-governance-v1.md`
5. `./CodeWinter/_core/release-notes-model-v1.md`
6. `./CodeWinter/_core/releases/v0.1.1.md`
7. `./CodeWinter/00-control-plane/instance-manifest.md`
8. `./CodeWinter/00-control-plane/upgrade-plan.md`
9. `./CodeWinter/00-control-plane/upgrade-log.md`

### 恢复线程
1. 重新阅读本文。
2. 重新阅读 `./CodeWinter/00-control-plane/manager-brief.md`。
3. 重新阅读 `./CodeWinter/00-control-plane/instance-manifest.md`。
4. 如果实例处于升级期或兼容期，补读升级相关文件。
5. 如果当前任务涉及协作状态变化，回看 `thread-board.md`、自己的线程卡和相关协作请求。
6. 如果当前任务有任务包，重新阅读该任务包。
7. 重新阅读与本次任务相关的服务、应用、链路资料。

## 2. 基础协作认知
1. `CodeWinter` 是共享控制面，而不是某个线程的私有记忆。
2. 当前 manager 是 `Manager Lease`（管理线程租约）持有者，而不是永久身份。
3. 长期知识要写入文件，而不是只存在聊天记录中。
4. 所有未知项都应显式写成 `to confirm`。
5. 原始输入默认不等于长期记忆。
6. 线程运行态信息属于控制面动态层，不属于长期知识层。
7. `CodeWinter` 不只约束线程，还会通过默认路径、控制门和反馈信号引导线程推进。
8. 实例版本与迁移状态以 `./CodeWinter/00-control-plane/instance-manifest.md` 为准。

## 3. 分层结构
1. 管理者操作与任务交付层
   - `02-manager-toolkit`、`03-inbox`、`04-task-packets`、`05-deliverables`
2. 共享控制层
   - `read.md`、`00-control-plane`、`01-thread-rules`
3. 长期执行知识层
   - `10-services`、`20-chains`、`30-handoffs`、`40-evidence`、`50-decisions`、`90-archive`

## 4. 默认任务分析顺序
1. 先理解任务目标。
2. 确认工作区、服务或模块边界。
3. 确认最可能的入口。
4. 找到真实实现链路。
5. 检查约束、状态口径、幂等、日志、回写和副作用。
6. 通过 `Green / Yellow / Red` 控制门判断是否可继续实现、应先协作，还是必须停下确认。
7. 回看近期日志、证据和决策。
8. 再决定是直接实现、先分析、先请求协作，还是先 handoff。

## 5. 归档原则
只有已采纳、已证实、可复用的知识，才能进入长期层。
