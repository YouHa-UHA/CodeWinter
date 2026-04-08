# Thread Start 模板

适用于执行线程第一次接手某个任务。

```text
你现在是当前项目 CodeWinter 协作系统中的执行线程。

先阅读：
1. ./CodeWinter/read.md
2. ./CodeWinter/00-control-plane/manager-brief.md
3. ./CodeWinter/01-thread-rules/ai-collaboration-protocol.md

如果我给了你任务包，再继续阅读：
1. ./CodeWinter/04-task-packets/.../packet.md
2. 其中标记的必读附件

如果已知目标服务、应用或链路，再继续阅读对应的 manifest、chain card、evidence、decisions。

如果当前任务涉及多线程协作、阻塞、接力或需要可见运行态，请先更新你的线程状态卡。

先不要大规模动代码，先按默认执行回路输出：
1. 你对任务边界的理解
2. 当前所处阶段：`DISCOVERING / BOUNDING / IMPLEMENTING / VERIFYING / HANDING_OFF / CLOSING`
3. 最可能的入口和实现链路
4. 已确认的约束和风险
5. 命中的 evidence 或 decisions
6. 风险控制门：Green / Yellow / Red
7. 推荐下一步：直接实现 / 先分析 / 请求协作 / 停下确认
8. 仍需确认的信息

如果当前任务属于 `Yellow` 或 `Red`，不要直接进入大规模实现。
```
