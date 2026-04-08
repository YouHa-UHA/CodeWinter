# Thread Runtime Update 运行态更新模板

适用于线程登记、状态切换、阻塞上报、完成上报等运行态更新。

```text
请根据当前任务进展，更新你的线程状态卡，而不是写流水账。

目标：
1. 如果这是你第一次接手当前任务，请在 `./CodeWinter/00-control-plane/threads/` 下创建或初始化你的线程卡
2. 如果你已有线程卡，请只在状态切换事件发生时更新

至少更新以下字段：
1. `thread_id`
2. `tool`
3. `role`
4. `status`
5. `phase`
6. `current_task`
7. `scope_claims`
8. `needs_collab`
9. `blocked_by` 或 `waiting_for`
10. `confidence`
11. `deviation_flag`
12. `decision_needed`
13. `current_outputs`
14. `recommended_next_step`
15. `next_expected_action`
16. `last_updated`

推荐 `phase`：
1. `DISCOVERING`
2. `BOUNDING`
3. `IMPLEMENTING`
4. `VERIFYING`
5. `HANDING_OFF`
6. `CLOSING`

只在以下事件发生时更新：
1. 第一次接手任务
2. 正式进入执行
3. 发现阻塞
4. 需要协作
5. handoff 准备完成
6. 当前任务完成
7. 进入待命

如果你怀疑自己偏航，请显式写出 `deviation_flag`，不要藏在描述里。
```
