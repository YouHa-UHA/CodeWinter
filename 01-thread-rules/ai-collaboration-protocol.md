# AI Collaboration Protocol 协作协议

本文定义使用 `CodeWinter` 的长期协作规则。
它不仅约束线程，还通过默认执行回路、控制门和反馈信号，引导线程稳定推进。

## 1. 线程启动路径
### 新线程
1. 先读 `./CodeWinter/read.md`
2. 再读 `./CodeWinter/00-control-plane/manager-brief.md`
3. 再读 `./CodeWinter/00-control-plane/instance-manifest.md`
4. 再读本文
5. 如果当前任务涉及运行态协作、阻塞、接力或协作请求，再读：
   - `./CodeWinter/01-thread-rules/thread-coordination-layer.md`
   - `./CodeWinter/00-control-plane/thread-board.md`
6. 如果有任务包，再读任务包和必读附件
7. 如果已知目标服务、应用或链路，再读对应资料

### 恢复线程
1. 重新读 `./CodeWinter/read.md`
2. 重新读 `./CodeWinter/00-control-plane/manager-brief.md`
3. 重新读 `./CodeWinter/00-control-plane/instance-manifest.md`
4. 回看自己的线程卡、相关协作请求和 `thread-board.md`
5. 如果本次任务有任务包，再重新读任务包

## 2. 默认执行回路
执行线程默认按以下顺序推进：
1. 理解任务目标
2. 明确边界，不擅自扩张
3. 找最可能的入口和旧链路
4. 收集约束、状态口径、幂等、日志、回写和副作用
5. 评估当前 `risk_gate`
6. 选择下一步：
   - 直接实现
   - 先分析
   - 请求协作
   - 停下确认
7. 完成后验证
8. 最后输出 handoff、正式输出草稿、归档包或完成状态

## 3. 风险控制门
### GREEN
适用：
1. 单模块、小范围、边界清晰的任务
2. 已能看到稳定入口和旧链路

默认动作：
1. 先做短分析
2. 再进入实现
3. 完成后验证并更新线程卡

### YELLOW
适用：
1. 跨模块、跨层或联动调整
2. 当前仍存在明显未知项

默认动作：
1. 先分析并写清约束
2. 优先补协作或补确认
3. 再决定是否进入实现

### RED
适用：
1. 表结构、外部契约、权限模型、安全口径等高风险变化
2. 可能改变关键行为边界的任务

默认动作：
1. 暂停大规模实现
2. 先输出分析、风险与建议动作
3. 请求管理线程或人工明确确认

### 运行态落盘要求
1. 每个活跃线程应把当前 `risk_gate` 写入线程卡。
2. 管理线程在查看运行态时，应把 `risk_gate` 作为优先判断信号，而不是只看 `status`。

## 4. 线程卡要求
线程卡不只是身份记录，也用于表达当前判断质量和编排优先级。

每张线程卡至少应让管理线程看见：
1. 当前在做什么：`current_task`
2. 当前边界是什么：`scope_claims`
3. 当前风险门是什么：`risk_gate`
4. 当前是否真的在推进：`last_meaningful_progress_at`
5. 当前管理优先级是什么：`manager_priority`
6. 当前判断是否可靠：`confidence`
7. 当前是否可能偏航：`deviation_flag`
8. 当前是否需要决策：`decision_needed`
9. 当前建议下一步：`recommended_next_step`

说明：
1. `last_updated` 不等于“最近有实质推进”。
2. `last_meaningful_progress_at` 用来帮助判断空转、老化和偏航风险。
3. `manager_priority` 是运行态编排字段，不是长期知识。

## 5. 协作请求要求
协作请求不是聊天消息，也不是普通提醒。
它本质上是线程之间的结构化协作委托单。

每张协作请求卡至少应让管理线程和目标线程看见：
1. 谁发起：`from_thread_id`
2. 想要什么协作：`type`
3. 为什么现在需要：`why_now`
4. 为什么当前线程不能独立完成：`why_current_thread_cannot_finish_alone`
5. 完成标准是什么：`done_when`
6. 当前紧急程度：`urgency`
7. 当前阻塞严重度：`blocking_severity`

说明：
1. `urgency` 表达“有多急”。
2. `blocking_severity` 表达“它对当前主链路阻塞得有多重”。
3. 如果请求已经卡住主推进，应优先把 `blocking_severity` 写实，而不是只把 `urgency` 写高。

## 6. Manager Signal Panel
管理线程应在 `thread-board.md` 中维护结构化的 Manager Signal Panel。

固定 5 个维度：
1. `system_health`
2. `drift_risk`
3. `decision_pressure`
4. `collab_pressure`
5. `closure_pressure`

每个维度都应写：
1. `level`
2. `summary`
3. `top_reason`

说明：
1. 这里是管理线程视角下的系统判断，不是伪精度监控面板。
2. Runtime 页应优先展示这些判断，而不是先展示漂亮但失真的计数。

## 7. 反馈信号
线程在运行态工件中应尽量显式表达：
1. `phase`
2. `confidence`
3. `deviation_flag`
4. `decision_needed`
5. `recommended_next_step`

这样做的目的不是增加流水账，而是让管理线程看见：
1. 当前线程在哪个阶段
2. 当前判断是否可靠
3. 当前是否可能偏航
4. 是否需要管理介入或人工确认

## 8. 任务包规则
1. `03-inbox` 是管理者给管理线程的原始输入层
2. `04-task-packets` 是给执行线程的任务输入层
3. `packet.md` 是任务包入口
4. 原始附件只有在提炼和验证后，才可以成为长期 evidence
5. 任务包不仅给背景，还应尽量引导线程第一步先做什么

## 9. 正式输出规则
1. `05-deliverables` 用于存放面向人的正式输出
2. 它不是执行线程默认知识层
3. 同一主题或任务应尽量只有一个稳定主目录
4. `thread-outputs/` 用于线程草稿
5. `final/` 用于当前有效正式版本

## 10. 运行态协作层
1. 线程运行态信息放在 `00-control-plane`
2. 线程状态卡放在 `threads/`
3. 协作请求卡放在 `collab-requests/`
4. 全局总览由管理线程维护在 `thread-board.md`
5. 运行态协作信息不等于长期知识层

## 11. 归档标准
只有同时满足以下条件的信息，才进入长期层：
1. 已采纳
2. 已证实
3. 对后续线程仍有复用价值
