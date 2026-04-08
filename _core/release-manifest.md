# CodeWinter Release Manifest 发布清单

本文记录当前这份 `CodeWinter` 本体的发布基线。

它是本体级单一事实源，不是项目实例状态，也不是升级计划。

## Current Release 当前发布
1. `release_version`: `v0.1.1`
2. `release_channel`: `draft`
3. `release_theme`: `CodeWinter v0.1.x Harness Upgrade`
4. `release_codename`: `Carrot on a Stick 胡萝卜钓竿`
5. `release_notes_path`: `./CodeWinter/_core/releases/v0.1.1.md`
6. `project_introduction_archive_path`: `./CodeWinter/_core/releases/v0.1.1.project-introduction.md`
7. `usage_guide_archive_path`: `./CodeWinter/_core/releases/v0.1.1.usage-guide.md`
8. `instance_schema_target`: `schema-v1`
9. `instance_schema_min_supported`: `schema-v1`
10. `runtime_coordination_target`: `runtime-v1`
11. `runtime_coordination_min_supported`: `runtime-v1`
12. `bootstrap_contract_version`: `bootstrap-v1`
13. `migration_contract_version`: `upgrade-migration-v1`
14. `release_governance_version`: `release-governance-v1`
15. `release_notes_model_version`: `release-notes-model-v1`
16. `notes`: `harness upgrade: convert CodeWinter from a rules-first system into a guidance-first system, add release history directory, keep schema-v1 and runtime-v1 unchanged`

## Use Rules 使用规则
1. 每个本体版本只保留一份当前发布清单。
2. `release_version` 按 `Versioning Model` 提升。
3. `instance_schema_*` 只在结构兼容边界变化时提升。
4. `runtime_coordination_*` 只在运行协议兼容边界变化时提升。
5. 项目实例在规划升级时，应将自己的 `instance-manifest.md` 与本文件比较。
6. `candidate` 和 `stable` release 应发布符合 `release-notes-model-v1` 的 release notes。
7. `release_theme` 与 `release_codename` 用于辅助识别发布，不参与兼容判断。
8. 发布目录下的项目介绍与使用说明留档可以在不变更发布版本号的前提下原地更新，但应始终代表当前发布版本的最新口径。
