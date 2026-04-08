# CodeWinter Bootstrap v1 初始化协议

`Bootstrap` 是一种接近“安装”的初始化过程，用来把一个全新的 `CodeWinter` 文件夹变成当前项目可用的协作控制面。

## 1. 目标
Bootstrap 的目标不是假装已经理解业务，而是在尽量少猜测的前提下，为新项目建立一个可运行的管理控制面。

## 2. 管理角色模型
Bootstrap 由当前 `Manager Lease`（管理线程租约）持有者执行。

该角色负责：
1. 治理当前项目上下文。
2. 初始化控制面。
3. 不要求永远由同一个线程持有。

## 3. 输入
最小输入：
1. 含有 `./CodeWinter` 的项目根目录
2. 当前源码仓库或工作区
3. 人工提供的项目目标（如果有）
4. 已知业务或架构约束

可选输入：
1. 现有文档
2. PRD
3. 截图
4. API 文档
5. 架构图

## 4. Bootstrap 步骤
### 第一步
先阅读：
1. `./CodeWinter/read.md`
2. `./CodeWinter/00-control-plane/manager-brief.md`
3. `./CodeWinter/01-thread-rules/ai-collaboration-protocol.md`
4. `./CodeWinter/01-thread-rules/manager-thread-charter.md`
5. `./CodeWinter/01-thread-rules/thread-coordination-layer.md`
6. `./CodeWinter/_core/tool-portability.md`

### 第二步
识别工作区形态：
1. 单仓
2. monorepo
3. 多仓工作区
4. 后端项目
5. 前端项目
6. 全栈项目

### 第三步
识别技术形态：
1. 语言
2. 框架
3. 包管理器
4. 构建命令
5. 测试命令
6. 已确认的主要服务、应用或 packages

### 第四步
只把已确认事实写入控制面。

所有未知项必须显式保留为 `to confirm`。

### 第五步
写入第一批控制面产物：
1. `./CodeWinter/00-control-plane/bootstrap-report.md`
2. `./CodeWinter/00-control-plane/manager-brief.md`
3. `./CodeWinter/00-control-plane/active-queue.md`
4. `./CodeWinter/00-control-plane/thread-board.md`
5. 当前管理线程的第一张线程状态卡
6. `./CodeWinter/00-control-plane/instance-manifest.md`
7. `./CodeWinter/00-control-plane/upgrade-plan.md`
8. `./CodeWinter/00-control-plane/upgrade-log.md`

### 第六步
仅在有明确依据时，才创建第一批项目知识：
1. 已确认服务或应用的初始 manifest
2. 如果首个执行任务已明确，则创建首个 task packet

Bootstrap 阶段不要大批量生成 chain cards 或 evidence。

### 第七步
在大规模派发执行线程或扩写长期知识层之前，先停下并等待人工确认。

## 5. 预期输出
Bootstrap 应产出：
1. 项目分类结论
2. 第一版工作区地图
3. 已验证或候选命令
4. 当前风险
5. 显式未知项
6. 当前阶段的控制目标与初始编排策略
7. 推荐的第一批边界化执行线程任务
8. 初始化后的线程协作运行层
9. 实例级版本与升级元信息基线

## 6. 完成标准
满足以下条件即可视为 Bootstrap v1 完成：
1. 新线程无需依赖历史聊天，就能通过 `CodeWinter` 理解当前工作区。
2. `manager-brief.md` 能正确反映当前项目阶段。
3. `active-queue.md` 中列出了仍需跟进的未知项和后续动作。
4. `bootstrap-report.md` 说明了什么已确认、什么仍待确认。
5. `thread-board.md` 和当前管理线程状态卡已初始化。
6. `instance-manifest.md` 已记录当前实例基线版本与状态。
7. `upgrade-plan.md` 与 `upgrade-log.md` 已具备后续升级可用的最小结构。
8. `manager-brief.md` 已能表达当前控制目标、编排策略和管理介入条件。
9. 项目已具备开始派发边界清晰执行线程任务的条件。

## 7. 非目标
Bootstrap v1 不应该：
1. 假装已经完全理解业务
2. 依据弱信号批量生成知识库
3. 在没看清项目前就重构架构
4. 在控制面尚未稳定前就大量派发线程

## 8. 什么时候开始派发执行线程
至少满足以下任一条件时，才建议开始：
1. 已有清晰边界的任务
2. 已知明确的模块或服务边界
3. 已知需要交付的正式输出
4. 已定义清晰的探索或验证任务

## 9. 恢复方式
如果 Bootstrap 被中断：
1. 新起一个管理线程
2. 重新阅读控制面文件
3. 从最新 `bootstrap-report.md` 继续恢复

这也是为什么管理者应是一个可交接租约，而不是永久聊天身份。
