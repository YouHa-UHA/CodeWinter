# 快捷提示词入口

本文是管理者常用线程动作的快捷入口。

## Bootstrap
适用场景：新项目第一次接入 `CodeWinter`
1. `./CodeWinter/02-manager-toolkit/bootstrap-manager.md`

## Bootstrap Greenfield
适用场景：当前项目目录基本为空，只有 `CodeWinter`，需要从需求与约束出发先完成项目塑形
1. `./CodeWinter/02-manager-toolkit/bootstrap-greenfield.md`

## Start
适用场景：执行线程第一次接手某个边界清晰的任务
1. `./CodeWinter/02-manager-toolkit/thread-start.md`

## Resume
适用场景：旧线程重新被唤起，进入新阶段或新任务
1. `./CodeWinter/02-manager-toolkit/thread-resume.md`

## Collaborate
适用场景：当前线程需要其他线程继续接力，或需要把动作清晰交给下个线程
1. `./CodeWinter/02-manager-toolkit/thread-handoff.md`

## Runtime Update
适用场景：线程需要登记、更新状态、上报阻塞、偏航、决策需求或报告完成
1. `./CodeWinter/02-manager-toolkit/thread-runtime-update.md`

## Collaboration Request
适用场景：线程需要主动发起协作请求，并把“为什么现在需要协作”说清楚
1. `./CodeWinter/02-manager-toolkit/collab-request.md`

## Archive Direct
适用场景：小任务已完全确认，可直接归档
1. `./CodeWinter/02-manager-toolkit/archive-direct.md`

## Archive Bundle
适用场景：跨线程、高价值或高风险任务，需先出归档包再确认
1. `./CodeWinter/02-manager-toolkit/archive-bundle.md`

## 可复制模板契约
为保证 Console 与后续自动化消费者稳定识别，`02-manager-toolkit` 下被定义为“可复制模板”的文件应遵守以下约定：
1. 文件可以保留标题、适用说明、补充解释和注意事项。
2. 真正发给线程的可复制正文，应放在且只放在一个 canonical fenced `text` block 中。
3. UI 与其他消费者默认优先提取这个 canonical `text` block，而不是复制整篇 Markdown。
4. 这是一条面向可复制模板的消费契约，不是整个 `CodeWinter` 文档系统的通用格式约束。
