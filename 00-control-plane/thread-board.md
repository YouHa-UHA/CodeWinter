# Thread Board 线程总览

本文是当前项目的线程协作总览页。

说明：
1. 当前 `CodeWinter` 本体仓中的这份文件是模板基线。
2. 真正接入项目后，应由管理线程将其改写为该实例的真实线程总览。

规则：
1. 本页由管理线程维护。
2. 执行线程默认不直接写本页。
3. 执行线程应优先更新自己的线程状态卡与自己发起的协作请求卡。

## 当前状态
1. 线程协作运行层：
   - 已初始化，待真实线程接入

## Manager Signal Panel
### system_health
- `system_health_level`:
- `system_health_summary`:
- `system_health_top_reason`:

### drift_risk
- `drift_risk_level`:
- `drift_risk_summary`:
- `drift_risk_top_reason`:

### decision_pressure
- `decision_pressure_level`:
- `decision_pressure_summary`:
- `decision_pressure_top_reason`:

### collab_pressure
- `collab_pressure_level`:
- `collab_pressure_summary`:
- `collab_pressure_top_reason`:

### closure_pressure
- `closure_pressure_level`:
- `closure_pressure_summary`:
- `closure_pressure_top_reason`:

推荐等级：
1. `system_health_level`：`STABLE / WATCH / PRESSURED / CRITICAL`
2. `drift_risk_level`：`LOW / MEDIUM / HIGH`
3. `decision_pressure_level`：`LOW / MEDIUM / HIGH`
4. `collab_pressure_level`：`LOW / MEDIUM / HIGH`
5. `closure_pressure_level`：`LOW / MEDIUM / HIGH`

说明：
1. 这里不是伪精度监控面板，而是管理线程视角下的结构化系统判断。
2. `summary` 用一句话概括当前维度状态。
3. `top_reason` 用一句话指出最值得先处理的原因。

## 活跃线程摘要
1. 当前无已登记线程

建议摘要字段：
1. `thread_id`
2. `tool`
3. `role`
4. `status`
5. `phase`
6. `manager_priority`
7. `risk_gate`
8. `confidence`
9. `recommended_next_step`
10. `last_updated`

## 待处理协作请求
1. 当前无待处理请求

建议摘要字段：
1. `request_id`
2. `from_thread`
3. `type`
4. `target`
5. `urgency`
6. `blocking_severity`
7. `acceptance_signal`
8. `status`

## 管理关注项
1. 当前无需要管理线程介入的事项

建议关注对象：
1. `deviation_flag = true` 的线程
2. `decision_needed` 非空的线程
3. `risk_gate = RED` 的线程
4. 长时间无 `last_meaningful_progress_at` 但仍标记为活跃的线程
5. `blocking_severity = FULL` 且无人响应的协作请求

## 待收口事项
1. 当前无待收口事项

说明：
1. 已完成但待归档的线程
2. 已交付但待集成的线程
3. 已准备好 handoff 但未继续派发的线程
都应在此记录摘要

## 过期待处理规则
1. 长时间无更新的线程，可由管理线程标记为 `DORMANT`
2. 长时间无响应的协作请求，可由管理线程标记为 `STALE`
3. 这类状态变化应记录在对应线程卡或请求卡中，而不应只停留在本页摘要
