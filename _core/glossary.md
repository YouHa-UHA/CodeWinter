# CodeWinter 术语表

本文用于统一 `CodeWinter` 内部术语，避免同一概念在不同阶段出现多种中文说法。

## 核心术语
1. `Bootstrap`
   - 中文建议：初始化安装
   - 含义：把新项目接入 `CodeWinter` 控制面的启动过程
2. `Manager Lease`
   - 中文建议：管理线程租约
   - 含义：当前持有控制面治理职责的线程角色
3. `Worker Thread`
   - 中文建议：执行线程
   - 含义：负责具体模块、链路、实现或验证任务的线程
   - 说明：`子线程` 可视为历史别名，正式正文优先使用“执行线程”
4. `Control Plane`
   - 中文建议：控制面
   - 含义：共享导航、规则、动态状态和管理协议层
5. `Task Packet`
   - 中文建议：任务包
   - 含义：发给执行线程的入口文件和任务附件集合
6. `Handoff`
   - 中文建议：交接包 / 交接材料
   - 含义：线程之间用于稳定接力的结构化上下文
7. `Deliverable`
   - 中文建议：正式输出 / 正式交付物
   - 含义：面向管理者或人的可读输出
8. `Evidence`
   - 中文建议：证据层
   - 含义：可复用的结构化事实、样例、契约、字段说明
9. `Decision`
   - 中文建议：决策层
   - 含义：已采纳的关键取舍、约束和禁改提醒
10. `Archive`
   - 中文建议：归档
   - 含义：将已采纳、已证实、可复用信息写入长期层
11. `Thread Board`
   - 中文建议：线程总览
   - 含义：由管理线程维护的全局线程运行态摘要页
12. `Thread Card`
   - 中文建议：线程状态卡
   - 含义：每个线程记录自己当前状态、边界、产出和下一步的文件
13. `Collaboration Request`
   - 中文建议：协作请求卡
   - 含义：线程主动发起协作需求时使用的请求文件
14. `Scope Claim`
   - 中文建议：边界声明
   - 含义：线程当前明确宣告自己主要负责的任务边界
15. `Harness Engineering`
   - 中文建议：支架工程 / 驾驭式工程
   - 含义：通过默认路径、控制门、状态机、反馈回路和模板结构来引导线程行为的方法
16. `Manager Harness`
   - 中文建议：管理驾控支架
   - 含义：管理线程用于维持控制目标、编排策略、介入条件和收口节奏的默认回路
17. `Worker Harness`
   - 中文建议：执行驾控支架
   - 含义：执行线程按默认执行回路推进任务的引导结构
18. `Feedback Harness`
   - 中文建议：反馈支架
   - 含义：通过信心、偏航、决策需求和推荐下一步等信号帮助系统纠偏的机制
19. `Control Gate`
   - 中文建议：控制门
   - 含义：让 `Green / Yellow / Red` 直接决定默认动作的行为门
20. `Release Codename`
   - 中文建议：发布代号
   - 含义：用于标识某次 `CodeWinter` 本体发布主题或代号的辅助元数据
21. `CodeWinter Release`
   - 中文建议：`CodeWinter` 发布版本
   - 含义：上游平台发布的一版 `CodeWinter` 规范
22. `Release Version`
   - 中文建议：发布版本号
   - 含义：用于标识 `CodeWinter` 本体当前发布版本的版本号
23. `Versioning Model`
   - 中文建议：版本模型
   - 含义：定义 `CodeWinter` 本体发布线、兼容边界和迁移判断规则的模型
24. `Release Manifest`
   - 中文建议：发布清单
   - 含义：记录当前 `CodeWinter` 本体发布基线与兼容边界的清单文件
25. `Release Channel`
   - 中文建议：发布通道
   - 含义：标识当前本体版本处于 `draft`、`candidate`、`stable` 等哪个阶段
26. `Release Governance`
   - 中文建议：发布治理
   - 含义：定义发布成熟度、晋级规则、兼容承诺和采用建议的治理规则
27. `Release Notes`
   - 中文建议：发布说明
   - 含义：面向一次发布的迁移说明与行动指引，不是传统 changelog
28. `Impact Label`
   - 中文建议：影响标签
   - 含义：用于快速标记一次发布对实例的动作要求，例如 `NO_ACTION` 或 `MIGRATION_REQUIRED`
29. `Instance Schema Version`
   - 中文建议：实例结构版本
   - 含义：标识项目实例目录结构、必需文件和核心字段属于哪一条兼容线
30. `Runtime Coordination Version`
   - 中文建议：运行协作版本
   - 含义：标识线程协作运行层协议属于哪一条兼容线
31. `CodeWinter Instance`
   - 中文建议：`CodeWinter` 项目实例
   - 含义：某个具体项目中正在运行的一份 `CodeWinter`
32. `Instance Migration`
   - 中文建议：实例迁移
   - 含义：将某个项目实例从旧版 `CodeWinter` 升级到新版的过程
33. `Compatibility Window`
   - 中文建议：兼容期
   - 含义：实例升级后，新旧协议短期并存的过渡阶段
34. `Core-Owned`
   - 中文建议：平台所有内容
   - 含义：可由上游版本安全替换或升级的内容
35. `Instance-Owned`
   - 中文建议：实例所有内容
   - 含义：属于具体项目实例、不应被升级流程直接覆盖的内容
36. `Managed-with-Migration`
   - 中文建议：需迁移管理内容
   - 含义：可以升级，但必须通过迁移处理的内容
37. `Instance Manifest`
   - 中文建议：实例清单
   - 含义：记录当前实例版本、状态与兼容期信息的最小元数据文件
38. `Upgrade Plan`
   - 中文建议：升级计划
   - 含义：记录当前实例升级前计划、影响范围与回滚思路的文件
39. `Upgrade Log`
   - 中文建议：升级记录
   - 含义：记录已执行升级结果、兼容期状态与遗留事项的文件

## 设计原则术语
1. `Progressive Disclosure`
   - 中文建议：渐进式披露
2. `Externalized State`
   - 中文建议：状态外部化
3. `Artifact-First Coordination`
   - 中文建议：以工件为先的协作
4. `Harness Engineering`
   - 中文建议：支架工程 / 驾驭式工程
5. `Evidence Before Memory`
   - 中文建议：先证据，后记忆
6. `Structured Uncertainty`
   - 中文建议：结构化不确定性
7. `Human Approval Gates`
   - 中文建议：人工确认闸口
8. `Event-Driven Updates`
   - 中文建议：事件驱动更新
9. `Runtime Coordination Layer`
   - 中文建议：线程协作运行层
10. `Rolling Upgrade`
   - 中文建议：滚动升级
11. `Backward Compatibility`
   - 中文建议：向后兼容

## 书写建议
1. 第一次出现时，建议使用“中文 + 英文术语”并列写法。
2. 目录名、分类名、枚举值优先保留英文。
3. 控制面正文、说明文稿、管理指令优先使用中文。
4. 同类概念尽量固定一种中文说法，例如优先使用“正式输出”而不是来回切换“正式文稿”。
