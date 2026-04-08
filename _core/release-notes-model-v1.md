# CodeWinter Release Notes Model v1 发布说明模型

本文定义 `CodeWinter` 的 release notes 应该怎么写。

它不是传统 changelog，也不是开发流水账。

它的目标是让管理线程、实例维护者和项目管理者快速判断：
1. 这次发布改了什么。
2. 哪些项目会受影响。
3. 是否需要迁移。
4. 是否需要兼容期或冻结新任务派发。

## 1. 不是什么
release notes 不应该是：
1. 按文件逐条罗列改动。
2. 记录所有试错过程。
3. 代替长期知识归档。
4. 代替发布治理规则。

## 2. 是什么
release notes 应该是：
1. 面向一次发布的迁移说明。
2. 面向实例维护者的决策摘要。
3. 面向管理线程的升级行动指引。

## 3. 何时必须发布
1. `candidate` release：必须发布。
2. `stable` release：必须发布。
3. `draft` release：如果涉及结构变化、兼容边界变化或迁移影响，建议发布。

## 4. 一份 release notes 必须回答的 5 个问题
1. 这次发布改了什么。
2. 受影响的是哪些实例。
3. 需不需要迁移。
4. 需不需要兼容期或冻结新任务派发。
5. 有哪些废弃项、风险项和回滚提醒。

## 5. 推荐影响标签
为了让说明更可执行，建议每份 release notes 至少使用一个主影响标签：
1. `NO_ACTION`
   - 当前支持范围内无需动作
2. `OPTIONAL_ADOPTION`
   - 可选跟进，无强制迁移
3. `MIGRATION_RECOMMENDED`
   - 建议迁移，但允许短期兼容运行
4. `MIGRATION_REQUIRED`
   - 不迁移将无法安全跟进
5. `FREEZE_RECOMMENDED`
   - 建议短暂冻结新任务派发后再升级

## 6. 推荐结构
每份 release notes 建议至少包含以下部分：

### 6.1 发布摘要
至少写清：
1. `release_version`
2. `release_channel`
3. `release_theme`
4. `release_codename`
5. 主影响标签
6. 一句话摘要

### 6.2 为什么发布
说明：
1. 本次发布主要解决什么问题
2. 为什么现在要发布

### 6.3 变更摘要
建议按层说明：
1. `_core`
2. 控制面
3. 线程协作运行层
4. 输入输出边界
5. 迁移协议

### 6.4 兼容性影响
必须写清：
1. 当前目标结构轴
2. 最小支持结构轴
3. 当前目标运行轴
4. 最小支持运行轴
5. 哪些实例会受到影响

### 6.5 管理动作
建议按对象给出动作：
1. 新接入项目应该怎么做
2. 正在运行的实例应该怎么做
3. 活跃线程应该怎么做

### 6.6 迁移要求
如果有迁移影响，必须写清：
1. 是否需要实例迁移
2. 是否需要兼容期
3. 是否建议冻结新任务派发
4. 关键迁移动作

### 6.7 废弃项与风险
写清：
1. 哪些旧口径开始废弃
2. 哪些行为不再推荐
3. 当前已知风险

### 6.8 回滚提醒
至少说明：
1. 出现什么问题时应停止升级
2. 回滚应优先保护什么

## 7. 书写规则
1. 优先写迁移判断，不写低价值流水账。
2. 如果无需迁移，要显式写明“无需迁移”。
3. 如果需要兼容期，要显式写明兼容期对象和结束条件。
4. 如果有 breaking change，不能藏在细节段落里，必须写进摘要。
5. 不要把 release notes 写成长篇 changelog。

## 8. 推荐落盘位置
建议每次本体发布的 release notes 落在：
1. `./CodeWinter/_core/releases/<release_version>.md`

同一发布目录下，建议同时维护两份面向人的留档：
1. `./CodeWinter/_core/releases/<release_version>.project-introduction.md`
2. `./CodeWinter/_core/releases/<release_version>.usage-guide.md`

说明：
1. 从 `CodeWinter v0.1.1` 开始，正式启用 `_core/releases/` 作为发布说明目录。
2. 每个发布版本建议一份同名 release notes 文件。
3. 项目介绍与使用说明留档默认代表该发布版本下的“当前最新口径”，如果只是说明优化、措辞修正或非协议级补充，可以原地更新，不必强制提升 `release_version`。

## 9. 与 release manifest 的关系
`release-manifest.md` 负责回答：
1. 当前发布基线是什么
2. 当前兼容边界是什么

release notes 负责回答：
1. 本次变化意味着什么
2. 对实例维护者应采取什么动作

二者必须相互引用，但不能互相替代。

## 10. 一句话原则
release notes 不是“改了什么的流水账”，而是“运行中的项目该怎么跟进这次发布”的行动说明。  
