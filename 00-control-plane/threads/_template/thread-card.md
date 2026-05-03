# Thread Card 线程状态卡: <thread-id>

## 1. 基本身份
- `thread_id`:
- `tool`:
- `role`:
- `status`:
- `phase`:
- `last_updated`:
- `last_meaningful_progress_at`:
- `manager_priority`:
- `risk_gate`:

可选 `role`：
1. `manager`
2. `worker`
3. `reviewer`
4. `integrator`
5. `explorer`

推荐 `status`：
1. `BOOTSTRAPPING`
2. `ACTIVE`
3. `BLOCKED`
4. `NEEDS_COLLAB`
5. `WAITING`
6. `HANDOFF_READY`
7. `DONE`
8. `DORMANT`

推荐 `phase`：
1. `DISCOVERING`
2. `BOUNDING`
3. `IMPLEMENTING`
4. `VERIFYING`
5. `HANDING_OFF`
6. `CLOSING`

推荐 `manager_priority`：
1. `P0`
2. `P1`
3. `P2`
4. `P3`

推荐 `risk_gate`：
1. `GREEN`
2. `YELLOW`
3. `RED`

说明：
1. `last_updated` 表示最近一次状态卡被更新的时间。
2. `last_meaningful_progress_at` 表示最近一次真正产生推进的时间，而不只是改了一次状态描述。
3. `manager_priority` 用于表达当前管理线程对该线程的编排优先级。
4. `risk_gate` 是当前任务在运行态中的风险控制门，应和执行判断保持一致。

## 2. 当前任务与边界
- `current_task`:
- `scope_claims`:
- `candidate_services_or_apps`:
- `related_paths`:

说明：
1. `scope_claims` 用于表达该线程当前主要负责的边界。
2. 如果只是候选归属，也应明确写出，不要隐含。

## 3. 能力与偏好
- `strengths`:
- `preferred_task_types`:
- `not_owner_or_avoid`:

说明：
1. 这里只写当前协作阶段真正有用的能力标签，不写冗长画像。
2. 用于帮助管理线程判断是否值得请求该线程协作。

## 4. 判断质量与反馈信号
- `confidence`:
- `deviation_flag`:
- `decision_needed`:
- `assumptions_to_confirm`:

推荐 `confidence`：
1. `HIGH`
2. `MEDIUM`
3. `LOW`

说明：
1. `deviation_flag` 用于表达“我怀疑自己正在偏航”。
2. `decision_needed` 用于表达“这里需要管理线程或人工明确判断”。

## 5. 协作状态
- `needs_collab`:
- `blocked_by`:
- `waiting_for`:
- `related_request_ids`:
- `related_handoffs`:

## 6. 当前产出与下一步
- `current_outputs`:
- `recommended_next_step`:
- `next_expected_action`:
- `acceptance_signal`:
- `manager_attention`:
- `ready_for_handoff`:
- `ready_for_archive_review`:

## 7. 仅记录状态切换事件
推荐只在以下事件发生时更新本卡：
1. 第一次接手任务
2. 进入执行
3. 发现阻塞
4. 需要协作
5. handoff 准备完成
6. 当前任务完成
7. 进入待命
