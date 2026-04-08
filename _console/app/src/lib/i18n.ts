import type { LocalizedText } from '../types/snapshot'

export type Language = 'en' | 'zh'

const LANGUAGE_STORAGE_KEY = 'CodeWinter-console-language'

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === 'zh' || stored === 'en' ? stored : 'en'
}

export function persistLanguage(language: Language) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export function pickLocalizedText(text: LocalizedText, language: Language) {
  return language === 'zh' ? text.zh : text.en
}

export function formatRefreshStatus(status: string, language: Language) {
  switch (status) {
    case 'refreshing':
      return language === 'zh' ? '刷新中' : 'Refreshing'
    case 'degraded':
      return language === 'zh' ? '需关注' : 'Degraded'
    case 'idle':
    default:
      return language === 'zh' ? '正常' : 'Healthy'
  }
}

export function explainRefreshStatus(status: string, language: Language) {
  switch (status) {
    case 'refreshing':
      return language === 'zh'
        ? 'Console 正在重新构建最新快照。'
        : 'The console is rebuilding the latest snapshot.'
    case 'degraded':
      return language === 'zh'
        ? '最近一次刷新虽然成功，但当前快照里仍包含基线告警、模板态信号或不完整的运行态数据。'
        : 'The last refresh succeeded, but the current snapshot still contains baseline warnings, template-state signals, or incomplete runtime data.'
    case 'idle':
    default:
      return language === 'zh'
        ? '当前快照状态正常，没有发现需要额外提示的刷新问题。'
        : 'The current snapshot is healthy and no refresh warnings are active.'
  }
}

export function formatReleaseChannel(channel: string, language: Language) {
  switch (channel.toLowerCase()) {
    case 'stable':
      return language === 'zh' ? '稳定版' : 'Stable'
    case 'candidate':
      return language === 'zh' ? '候选版' : 'Candidate'
    case 'draft':
    default:
      return language === 'zh' ? '草案版' : 'Draft'
  }
}

export function explainReleaseChannel(channel: string, language: Language) {
  switch (channel.toLowerCase()) {
    case 'stable':
      return language === 'zh'
        ? '这是一版可默认采用的稳定发布，兼容承诺更强。'
        : 'This release is stable and is the default adoption target with stronger compatibility guarantees.'
    case 'candidate':
      return language === 'zh'
        ? '这是一版候选发布，主结构已经基本收敛，适合在真实项目中试点验证。'
        : 'This release is a candidate build: the main structure has mostly settled and is suitable for real-project pilots.'
    case 'draft':
    default:
      return language === 'zh'
        ? '这是一版仍在持续演进的草案发布，结构、协议或默认工作流仍可能继续调整。'
        : 'This release is still a fast-moving draft. Structure, protocol, and default flows may continue to change.'
  }
}

export function formatSnapshotVersion(version: number, language: Language) {
  return language === 'zh' ? `投影视图 ${version}` : `Snapshot ${version}`
}

export function explainSnapshotVersion(version: number, language: Language) {
  return language === 'zh'
    ? `这是 Operator Console 自己的投影视图版本（当前为 ${version}），表示客户端如何组织快照数据，不等于 CodeWinter 本体的发布版本。`
    : `This is the Operator Console's own projection schema version (${version}). It describes how the client organizes snapshot data, not the CodeWinter core release version.`
}

export function localizeHealthWarning(warning: string, language: Language) {
  const exactMap: Record<string, { en: string; zh: string }> = {
    'Current instance-manifest still looks like a template baseline.': {
      en: 'Current instance-manifest still looks like a template baseline.',
      zh: '当前 instance-manifest 仍像模板基线，说明这个实例还没有完全进入真实运行态。',
    },
    'No real thread cards were detected yet; Runtime may still be showing an empty baseline.': {
      en: 'No real thread cards were detected yet; Runtime may still be showing an empty baseline.',
      zh: '当前还没有检测到真实线程卡，说明 Runtime 视图现在看到的可能仍是空基线。',
    },
  }

  const localized = exactMap[warning]
  return localized ? localized[language] : warning
}

export function localizeRuntimeAlert(message: string, language: Language) {
  if (language === 'en') {
    return message
  }

  if (message === 'Current instance is still at the BOOTSTRAPPING baseline.') {
    return '当前实例仍处于 BOOTSTRAPPING 基线，说明初始化或实例接管还没有完全完成。'
  }

  const deviationMatch = message.match(/^Thread (.+) explicitly reported deviation\.$/)
  if (deviationMatch) {
    return `线程 ${deviationMatch[1]} 主动上报了偏航信号，说明它认为自己可能正在偏离预期执行路径。`
  }

  const decisionMatch = message.match(/^Thread (.+) still has a pending decision\.$/)
  if (decisionMatch) {
    return `线程 ${decisionMatch[1]} 当前仍有待决策事项，需要管理线程或人工进一步确认。`
  }

  const statusMatch = message.match(/^Thread (.+) is currently in status (.+)\.$/)
  if (statusMatch) {
    return `线程 ${statusMatch[1]} 当前状态为 ${statusMatch[2]}，表示它仍处于需要关注的运行阶段。`
  }

  const requestMatch = message.match(
    /^Collaboration request (.+) is still pending at HIGH urgency\.$/,
  )
  if (requestMatch) {
    return `协作请求 ${requestMatch[1]} 仍处于 HIGH 优先级待处理状态，说明当前可能存在阻塞或紧急接力需求。`
  }

  return message
}

export function localizeExplorerArea(area: string, language: Language) {
  const normalized = area.toLowerCase()

  switch (normalized) {
    case 'control-plane':
      return language === 'zh' ? '控制面' : 'Control Plane'
    case 'runtime':
      return language === 'zh' ? '运行态' : 'Runtime'
    case 'release':
    case 'releases':
      return language === 'zh' ? '发布' : 'Release'
    case 'deliverables':
      return language === 'zh' ? '正式输出' : 'Deliverables'
    case 'knowledge':
      return language === 'zh' ? '知识层' : 'Knowledge'
    default:
      return area
  }
}

export function localizeInstanceFieldLabel(key: string, language: Language) {
  if (language === 'en') {
    const labelMap: Record<string, string> = {
      release_version: 'Release Version',
      release_channel: 'Release Channel',
      release_theme: 'Release Theme',
      release_codename: 'Release Codename',
      release_notes_path: 'Release Notes Path',
      instance_name: 'Instance Name',
      workspace_root: 'Workspace Root',
      status: 'Instance Status',
      compatibility_window: 'Compatibility Window',
      instance_schema_version: 'Instance Schema Version',
      runtime_coordination_version: 'Runtime Coordination Version',
      manager_lease_holder: 'Manager Lease Holder',
      last_bootstrap_at: 'Last Bootstrap At',
      last_upgrade_at: 'Last Upgrade At',
      bootstrap_contract_version: 'Bootstrap Contract Version',
      migration_contract_version: 'Migration Contract Version',
      release_governance_version: 'Release Governance Version',
      release_notes_model_version: 'Release Notes Model Version',
      manager_brief: 'Manager Brief',
      active_queue: 'Active Queue',
      thread_board: 'Thread Board',
      upgrade_plan: 'Upgrade Plan',
      upgrade_log: 'Upgrade Log',
    }

    return labelMap[key] ?? prettifyKey(key)
  }

  const labelMap: Record<string, string> = {
    release_version: '发布版本',
    release_channel: '发布通道',
    release_theme: '发布主题',
    release_codename: '发布代号',
    release_notes_path: '发布说明路径',
    instance_name: '实例名称',
    workspace_root: '工作区根目录',
    status: '实例状态',
    compatibility_window: '兼容窗口',
    instance_schema_version: '实例结构版本',
    runtime_coordination_version: '运行协作版本',
    manager_lease_holder: '管理租约持有者',
    last_bootstrap_at: '最近 Bootstrap 时间',
    last_upgrade_at: '最近升级时间',
    bootstrap_contract_version: 'Bootstrap 协议版本',
    migration_contract_version: '迁移协议版本',
    release_governance_version: '发布治理版本',
    release_notes_model_version: '发布说明模型版本',
    manager_brief: 'Manager Brief',
    active_queue: 'Active Queue',
    thread_board: 'Thread Board',
    upgrade_plan: 'Upgrade Plan',
    upgrade_log: 'Upgrade Log',
  }

  return labelMap[key] ?? prettifyKey(key)
}

export function localizeInstanceFieldValue(key: string, value: string, language: Language) {
  const normalizedValue = value.trim()

  if (normalizedValue === 'to confirm') {
    return language === 'zh' ? '待确认' : 'To confirm'
  }

  if (normalizedValue === 'not yet') {
    return language === 'zh' ? '尚未发生' : 'Not yet'
  }

  if (key === 'release_channel') {
    return formatReleaseChannel(normalizedValue, language)
  }

  return localizeProtocolValue(normalizedValue, language)
}

function prettifyKey(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function localizeProtocolValue(value: string, language: Language) {
  if (language === 'en') {
    return value
  }

  const map: Record<string, string> = {
    BOOTSTRAPPING: '初始化中',
    ACTIVE: '活跃',
    BLOCKED: '阻塞',
    NEEDS_COLLAB: '需要协作',
    HANDOFF_READY: '准备交接',
    DONE: '已完成',
    WAITING: '等待中',
    DORMANT: '待命',
    DISCOVERING: '探索中',
    BOUNDING: '边界确认中',
    IMPLEMENTING: '实现中',
    VERIFYING: '验证中',
    HANDING_OFF: '交接中',
    CLOSING: '收口中',
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
    TRUE: '是',
    FALSE: '否',
    INACTIVE: '未启用',
  }

  return map[value] ?? value
}
