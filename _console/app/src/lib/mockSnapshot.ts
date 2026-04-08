import type { ConsoleSnapshot } from '../types/snapshot'

export const mockSnapshot: ConsoleSnapshot = {
  snapshotVersion: 1,
  generatedAt: new Date().toISOString(),
  codewinterRoot: 'E:/code/ai_code/CodeWinter',
  release: {
    version: 'v0.1.1',
    channel: 'draft',
    theme: 'CodeWinter v0.1.x Harness Upgrade',
    codename: 'Carrot on a Stick',
  },
  managerBrief: {
    path: './CodeWinter/00-control-plane/manager-brief.md',
    sections: [
      {
        title: 'Current Control Goals',
        lines: [
          '1. Validate the first real project instance.',
          '2. Keep the Operator Console subordinate to the CodeWinter core.',
        ],
      },
      {
        title: 'Current Orchestration Strategy',
        lines: [
          '1. Prioritize safe operator actions before broader write access.',
          '2. Keep runtime visibility high and protocol coupling low.',
        ],
      },
    ],
  },
  instanceManifest: {
    path: './CodeWinter/00-control-plane/instance-manifest.md',
    fields: [
      { key: 'release_version', value: 'v0.1.1' },
      { key: 'release_channel', value: 'draft' },
      { key: 'status', value: 'BOOTSTRAPPING' },
      { key: 'instance_name', value: 'to confirm' },
    ],
    sections: [
      {
        id: 'basics',
        title: { en: 'Instance Basics', zh: '实例基础' },
        description: {
          en: 'Who this instance is and whether it has been claimed by a real project.',
          zh: '说明当前实例是谁，以及它是否已经被真实项目接管。',
        },
        fields: [
          { key: 'instance_name', value: 'to confirm' },
          { key: 'status', value: 'BOOTSTRAPPING' },
        ],
      },
      {
        id: 'release',
        title: { en: 'Release Baseline', zh: '发布基线' },
        description: {
          en: 'Which CodeWinter core release this instance is aligned with.',
          zh: '说明当前实例对齐的是哪一版 CodeWinter 本体发布。',
        },
        fields: [
          { key: 'release_version', value: 'v0.1.1' },
          { key: 'release_channel', value: 'draft' },
        ],
      },
    ],
  },
  workbench: {
    prompts: [
      {
        id: 'bootstrap',
        path: './CodeWinter/02-manager-toolkit/bootstrap-manager.md',
        label: { en: 'Bootstrap', zh: '初始化接管' },
        description: {
          en: 'Set up a new CodeWinter instance and hand the first lease to the manager thread.',
          zh: '用于新项目第一次接入 CodeWinter，由管理线程完成初始化安装。',
        },
      },
    ],
    uploadZones: [
      {
        target: 'inbox',
        path: './CodeWinter/03-inbox',
        kicker: { en: 'Inbox', zh: '收件箱' },
        title: { en: 'Safe write to 03-inbox', zh: '安全写入 03-inbox' },
        headline: { en: 'Raw intake for the manager thread', zh: '管理线程原始收件入口' },
        body: {
          en: 'Use this area to hand raw files to the manager thread.',
          zh: '这里用于向管理线程投递原始材料。',
        },
        buttonLabel: { en: 'Choose a file and write it to Inbox', zh: '选择文件写入 Inbox' },
        emptyState: { en: 'No inbox files have been detected yet.', zh: '当前还没有检测到 Inbox 文件。' },
        items: [],
      },
      {
        target: 'taskPacketDrop',
        path: './CodeWinter/04-task-packets/_incoming',
        kicker: { en: 'Task Packet Drop', zh: '任务投递区' },
        title: {
          en: 'Safe write to 04-task-packets/_incoming',
          zh: '安全写入 04-task-packets/_incoming',
        },
        headline: {
          en: 'Stage raw files for child-thread delivery',
          zh: '为子线程任务先暂存原始附件',
        },
        body: {
          en: 'Use this drop zone to stage files that will later be organized into task packets.',
          zh: '这里用于暂存后续要整理成正式任务包的原始附件。',
        },
        buttonLabel: {
          en: 'Choose a file and send it to Task Packets',
          zh: '选择文件投递到 Task Packets',
        },
        emptyState: {
          en: 'No task packet drop files have been detected yet.',
          zh: '当前还没有检测到任务投递文件。',
        },
        items: [],
      },
    ],
    deliverableGroups: [],
  },
  runtime: {
    managerLeaseHolder: 'to confirm',
    threads: [],
    collabRequests: [],
    alerts: [
      {
        level: 'info',
        message:
          'The console is running in browser fallback mode, so the snapshot shown here is mock data.',
      },
    ],
  },
  explorer: {
    entries: [
      {
        label: 'manager-brief.md',
        path: './CodeWinter/00-control-plane/manager-brief.md',
        area: 'control-plane',
        kind: 'file',
      },
      {
        label: 'release-manifest.md',
        path: './CodeWinter/_core/release-manifest.md',
        area: 'release',
        kind: 'file',
      },
    ],
  },
  health: {
    refreshStatus: 'degraded',
    lastGoodAt: new Date().toISOString(),
    warnings: [
      'Current instance-manifest still looks like a template baseline.',
      'No real thread cards were detected yet; Runtime may still be showing an empty baseline.',
    ],
  },
}
