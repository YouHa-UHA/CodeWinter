# Thread Resume 模板

适用于旧执行线程在新阶段或新任务中被重新唤起。

```text
这是当前线程的新任务阶段，请先清空局部假设，不要直接沿用上一个任务的隐含判断。

先阅读：
1. ./CodeWinter/read.md
2. ./CodeWinter/00-control-plane/manager-brief.md
3. ./CodeWinter/01-thread-rules/ai-collaboration-protocol.md

然后再读当前任务包，以及本次命中的服务、应用、链路资料。

如果当前任务状态发生了明显切换，请先更新你的线程状态卡。

在编码前，先按默认执行回路输出：
1. 当前任务边界
2. 与你旧上下文相比发生了什么变化
3. 当前所处阶段：`DISCOVERING / BOUNDING / IMPLEMENTING / VERIFYING / HANDING_OFF / CLOSING`
4. 最可能的入口
5. 可复用的事实和约束
6. 风险控制门：Green / Yellow / Red
7. 推荐下一步：直接实现 / 先分析 / 请求协作 / 停下确认

如果当前任务属于 `Yellow` 或 `Red`，不要直接进入大规模实现。
```
