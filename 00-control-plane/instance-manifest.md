# CodeWinter Instance Manifest 实例清单

本文记录当前项目中这份 `CodeWinter instance` 的最小版本与迁移元信息。

它是实例级单一事实源，不是升级流水日志，也不是长期知识归档。

说明：
1. 当前 `CodeWinter` 本体仓中的这份文件是模板基线，不代表已经存在真实实例。
2. 真正接入项目后，应由管理线程用实际实例信息覆盖这些占位值。

## 当前实例
1. `instance_name`: `to confirm`
2. `workspace_root`: `to confirm`
3. `release_version`: `v0.1.1`
4. `release_channel`: `draft`
5. `release_theme`: `CodeWinter v0.1.x Harness Upgrade`
6. `release_codename`: `Carrot on a Stick 胡萝卜钓竿`
7. `release_notes_path`: `./CodeWinter/_core/releases/v0.1.1.md`
8. `instance_schema_version`: `schema-v1`
9. `runtime_coordination_version`: `runtime-v1`
10. `bootstrap_contract_version`: `bootstrap-v1`
11. `migration_contract_version`: `upgrade-migration-v1`
12. `release_governance_version`: `release-governance-v1`
13. `release_notes_model_version`: `release-notes-model-v1`
14. `status`: `BOOTSTRAPPING`
15. `compatibility_window`: `INACTIVE`
16. `manager_lease_holder`: `to confirm`
17. `last_bootstrap_at`: `to confirm`
18. `last_upgrade_at`: `not yet`

## 当前工件
1. `manager_brief`: `./CodeWinter/00-control-plane/manager-brief.md`
2. `active_queue`: `./CodeWinter/00-control-plane/active-queue.md`
3. `thread_board`: `./CodeWinter/00-control-plane/thread-board.md`
4. `upgrade_plan`: `./CodeWinter/00-control-plane/upgrade-plan.md`
5. `upgrade_log`: `./CodeWinter/00-control-plane/upgrade-log.md`

## 推荐状态值
1. `BOOTSTRAPPING`
2. `RUNNING`
3. `UPGRADING`
4. `COMPATIBILITY_WINDOW`
5. `PAUSED`

## 使用规则
1. 由当前管理线程维护。
2. Bootstrap 完成时初始化，并优先对齐 `./CodeWinter/_core/release-manifest.md`。
3. 每次升级开始、进入兼容期、升级收口时更新。
4. 本文件只记录当前基线，不记录升级过程流水。
5. 实例迁移判断不能只看 `release_version`，还必须比较结构轴和运行轴。
