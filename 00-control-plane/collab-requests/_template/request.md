# Collaboration Request 协作请求卡: <request-id>

## 1. 请求身份
- `request_id`:
- `from_thread_id`:
- `status`:
- `type`:
- `urgency`:
- `opened_at`:
- `updated_at`:

推荐 `status`：
1. `OPEN`
2. `ROUTED`
3. `IN_PROGRESS`
4. `FULFILLED`
5. `CANCELLED`
6. `STALE`

推荐 `type`：
1. `CONSULT`
2. `IMPLEMENT`
3. `VERIFY`
4. `REVIEW`
5. `INTEGRATE`
6. `UNBLOCK`

推荐 `urgency`：
1. `LOW`
2. `MEDIUM`
3. `HIGH`

## 2. 目标协作对象
- `target_thread_id`:
- `target_capability`:
- `reason_for_targeting`:
- `recommended_receiver_profile`:

说明：
1. 如果没有明确目标线程，也至少写清希望命中的能力

## 3. 背景与当前状态
- `background`:
- `current_confirmed_state`:
- `why_now`:
- `why_current_thread_cannot_finish_alone`:
- `decision_context`:

## 4. 希望对方产出什么
- `requested_outcome`:
- `expected_output_type`:
- `done_when`:
- `acceptance_signal`:

可选 `expected_output_type`：
1. `analysis`
2. `implementation`
3. `verification`
4. `review-note`
5. `handoff`
6. `deliverable-draft`

## 5. 推荐输入材料
- `related_task_packets`:
- `related_handoffs`:
- `related_paths`:
- `related_deliverables`:

## 6. 约束与风险
- `constraints`:
- `known_risks`:
- `to_confirm`:

## 7. 收尾状态
- `resolution_note`:
- `follow_up_actions`:
