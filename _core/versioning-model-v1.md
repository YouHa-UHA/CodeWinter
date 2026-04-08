# CodeWinter Versioning Model v1 版本模型

本文定义 `CodeWinter` 本体的版本策略。

它关注的是平台本体如何发布、如何声明兼容边界、以及实例升级时该如何判断迁移要求。

## 1. 设计目标
`CodeWinter` 的版本系统应同时满足四件事：
1. 让本体发布有清晰编号。
2. 让实例迁移有明确兼容边界。
3. 让版本轴保持最少，不把系统做成复杂矩阵。
4. 让线程和管理者都能快速判断“能不能直接升级，还是必须迁移”。

## 2. 核心原则
1. 发布版本与兼容边界分开。
2. 只有真正的兼容边界变化，才提升协议轴版本。
3. 迁移判断不能只看 `release_version`，必须同时比较结构轴和运行轴。
4. 一个 `CodeWinter release` 可以连续多版共享同一条结构轴和运行轴。
5. `release_theme`、`release_codename` 和 `release_notes_path` 属于辅助发布元数据，不参与兼容判断。
6. 如果只是面向人的说明优化、措辞修正或非协议级补充，可以在当前发布目录下原地更新项目介绍与使用说明留档，不必强制提升 `release_version`。

## 3. 三条主版本轴
`CodeWinter` 当前固定三条主版本轴。

### 3.1 `release_version`
用于标识 `CodeWinter` 本体发布版本。

格式建议：
1. `vMAJOR.MINOR.PATCH`

用途：
1. 表示本体当前是哪一版发布。
2. 用于发布记录、升级计划、变更说明和回滚判断。
3. 通常配合 `release_channel` 一起表达当前发布成熟度。

### 3.2 `instance_schema_version`
用于标识项目实例的结构兼容线。

格式建议：
1. `schema-vN`

用途：
1. 表示当前实例目录结构、必需文件、核心字段和治理边界属于哪一条结构线。

说明：
1. 这不是每次发布都要提升的版本。
2. 只有当旧实例不迁移就无法安全运行新控制面时，才提升这条版本。

### 3.3 `runtime_coordination_version`
用于标识线程协作运行层的协议兼容线。

格式建议：
1. `runtime-vN`

用途：
1. 表示线程状态机、协作请求语义、运行态更新规则属于哪一条运行协议线。

说明：
1. 这不是每次发布都要提升的版本。
2. 只有当旧线程协议语义已不能安全兼容新运行层时，才提升这条版本。

## 4. `release_channel`
用于标识当前本体发布所处的成熟阶段。

当前建议值：
1. `draft`
   - 仍在快速演进，适合本体设计与内部验证阶段
2. `candidate`
   - 主要结构已收敛，适合试点项目接入
3. `stable`
   - 可作为默认推荐基线，兼容承诺应严格执行

说明：
1. `release_channel` 不是兼容轴。
2. 它用于帮助判断“这版能不能大规模推广”，而不是替代版本比较。

## 5. 辅助合同版本
除了三条主版本轴，`CodeWinter` 还可以记录若干辅助合同版本，但它们不是实例迁移判断的主轴。

当前建议保留：
1. `bootstrap_contract_version`
   - 例如 `bootstrap-v1`
   - 对应 `_core/bootstrap-v1.md`
2. `migration_contract_version`
   - 例如 `upgrade-migration-v1`
   - 当前由 `_core/upgrade-migration-v1.md` 承载
3. `release_governance_version`
   - 例如 `release-governance-v1`
   - 对应 `_core/release-governance-v1.md`
4. `release_notes_model_version`
   - 例如 `release-notes-model-v1`
   - 对应 `_core/release-notes-model-v1.md`

说明：
1. 辅助合同版本用于说明“当前本体采用哪版启动协议、迁移协议、发布治理和发布说明模型”。
2. 它们帮助理解本体行为，但不应替代结构轴和运行轴。

## 6. `release_version` 的提升规则
### 6.1 Patch
适用于：
1. 文案修正。
2. 模板措辞优化。
3. 示例补充。
4. 不改变实例结构和运行协议的细节修复。

特点：
1. 不要求结构迁移。
2. 不要求运行协议迁移。
3. 多数情况下不需要兼容期。

### 6.2 Minor
适用于：
1. 新增非破坏性能力。
2. 新增可选模板或可选目录。
3. 新增可兼容字段。
4. 新增推荐流程，但旧流程仍可继续收尾。

特点：
1. `release_version` 提升。
2. `instance_schema_version` 和 `runtime_coordination_version` 可以保持不变。
3. 如果新增内容涉及滚动启用，可配合兼容期。

### 6.3 Major
适用于：
1. 核心术语变化。
2. 目录边界变化。
3. 强制必需文件变化。
4. 运行协议语义变化。
5. 管理与执行角色边界变化。

特点：
1. `release_version` 提升主版本。
2. 通常伴随 `instance_schema_version` 或 `runtime_coordination_version` 的升级。
3. 通常需要正式迁移方案和兼容期。

## 7. 兼容轴的提升规则
### 7.1 什么时候提升 `instance_schema_version`
仅在以下情况提升：
1. 新控制面要求新增必需文件，而旧实例默认没有。
2. 旧目录边界已无法安全映射到新结构。
3. 旧实例缺少新版本必需字段。
4. 旧治理边界会导致新控制面误判或失真。

不应提升的情况：
1. 文案变化。
2. 示例变化。
3. 新增可选字段。
4. 新增可选文档。

### 7.2 什么时候提升 `runtime_coordination_version`
仅在以下情况提升：
1. 线程状态机发生不兼容变化。
2. 协作请求卡字段含义发生不兼容变化。
3. 运行态更新规则发生破坏性变化。
4. 新旧线程已无法基于同一语义协作。

不应提升的情况：
1. 新增可选状态说明。
2. 补充协作建议。
3. 非必需字段扩展。
4. 兼容性保留的模板细化。

## 8. 版本判断原则
判断实例是否能升级，不能只看 `release_version`。

必须至少比较：
1. 当前实例 `release_version`
2. 目标发布 `release_version`
3. 当前实例 `instance_schema_version`
4. 目标发布的 `instance_schema_target`
5. 目标发布的 `instance_schema_min_supported`
6. 当前实例 `runtime_coordination_version`
7. 目标发布的 `runtime_coordination_target`
8. 目标发布的 `runtime_coordination_min_supported`

## 9. 推荐判断矩阵
### 9.1 可直接热升级
满足以下条件时，一般可直接升级：
1. 当前实例结构轴等于目标结构轴。
2. 当前实例运行轴等于目标运行轴。
3. 本次仅是 Patch，或低风险 Minor。

### 9.2 可滚动升级
满足以下条件时，一般建议滚动升级：
1. 当前实例版本低于目标发布版本。
2. 当前结构轴和运行轴仍在目标发布支持范围内。
3. 新能力需要逐步启用，或旧线程需要兼容收尾。

### 9.3 必须迁移后再升级
满足以下任一条件时，必须先做实例迁移：
1. 当前 `instance_schema_version` 低于目标发布的最小支持结构轴。
2. 当前 `runtime_coordination_version` 低于目标发布的最小支持运行轴。
3. 新版本要求的必需文件或必需字段当前实例不存在。

## 10. 发布清单要求
每个 `CodeWinter` 本体发布都应提供一份当前发布清单：
1. `./CodeWinter/_core/release-manifest.md`

它至少应声明：
1. `release_version`
2. `release_channel`
3. `instance_schema_target`
4. `instance_schema_min_supported`
5. `runtime_coordination_target`
6. `runtime_coordination_min_supported`
7. `bootstrap_contract_version`
8. `migration_contract_version`
9. `release_governance_version`
10. `release_notes_model_version`

建议同时声明：
1. `release_theme`
2. `release_codename`
3. `release_notes_path`
4. `project_introduction_archive_path`
5. `usage_guide_archive_path`

## 11. 当前推荐基线
当前这份 `CodeWinter` 本体建议采用以下基线：
1. `release_version`: `v0.1.1`
2. `release_channel`: `draft`
3. `release_theme`: `CodeWinter v0.1.x Harness Upgrade`
4. `release_codename`: `Carrot on a Stick 胡萝卜钓竿`
5. `release_notes_path`: `./CodeWinter/_core/releases/v0.1.1.md`
6. `instance_schema_target`: `schema-v1`
7. `instance_schema_min_supported`: `schema-v1`
8. `runtime_coordination_target`: `runtime-v1`
9. `runtime_coordination_min_supported`: `runtime-v1`
10. `bootstrap_contract_version`: `bootstrap-v1`
11. `migration_contract_version`: `upgrade-migration-v1`
12. `release_governance_version`: `release-governance-v1`
13. `release_notes_model_version`: `release-notes-model-v1`

## 12. 一句话原则
`CodeWinter` 的发布版本用于标识“本体发到了哪一版”，结构轴和运行轴用于判断“实例还能不能安全协作”。  
