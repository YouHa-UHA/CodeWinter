# Collaboration Request 模板

适用于线程需要其他线程协作时，主动创建协作请求卡。

```text
请在 `./CodeWinter/00-control-plane/collab-requests/` 下创建或更新一个协作请求卡。

目标：
1. 说明你需要什么类型的协作
2. 说明为什么当前线程此时需要协作
3. 说明为什么当前线程不能或不应独自完成
4. 说明你希望对方输出什么
5. 给出推荐阅读路径、任务包、handoff 或相关文件

至少写清：
1. `request_id`
2. `from_thread_id`
3. `status`
4. `type`
5. `urgency`
6. `target_thread_id` 或 `target_capability`
7. `background`
8. `current_confirmed_state`
9. `why_now`
10. `why_not_self`
11. `requested_outcome`
12. `recommended_receiver_profile`
13. `acceptance_signal`
14. `constraints`
15. `to_confirm`

如果你已经准备好了对方接力所需上下文，请同步产出 handoff。
```
