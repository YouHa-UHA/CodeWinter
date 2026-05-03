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
      return language === 'zh' ? '同步中' : 'Syncing'
    case 'degraded':
      return language === 'zh' ? '需关注' : 'Needs Attention'
    case 'idle':
    default:
      return language === 'zh' ? '正常' : 'Healthy'
  }
}

export function explainRefreshStatus(status: string, language: Language) {
  switch (status) {
    case 'refreshing':
      return language === 'zh'
        ? 'Console 正在重建最新快照，会在下一份稳定投影视图准备好之后自动更新。'
        : 'The console is rebuilding the latest snapshot and will update after the next stable projection is ready.'
    case 'degraded':
      return language === 'zh'
        ? '最近一次刷新虽然成功，但当前快照里仍包含基线告警、模板态信号，或运行态数据还不完整。'
        : 'The latest refresh succeeded, but the current snapshot still contains baseline warnings, template-state signals, or incomplete runtime data.'
    case 'idle':
    default:
      return language === 'zh'
        ? '当前快照状态健康，没有额外的刷新级问题。'
        : 'The current snapshot is healthy and no refresh-level issues are active.'
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
        ? '这是当前默认推荐采用的稳定发布线，兼容承诺和迁移边界都更强。'
        : 'This is the default stable release line with stronger compatibility and migration guarantees.'
    case 'candidate':
      return language === 'zh'
        ? '这是候选发布线，主结构已经基本收敛，适合进入真实项目试点。'
        : 'This is a candidate release line: the main structure has largely settled and is suitable for real-project pilots.'
    case 'draft':
    default:
      return language === 'zh'
        ? '这是仍在演进中的草案发布线，结构、协议和默认工作方式仍可能继续收敛。'
        : 'This is still a draft release line. Structure, protocol, and default operating flows may continue to evolve.'
  }
}

export function formatSnapshotVersion(version: number, language: Language) {
  return language === 'zh' ? `投影视图 v${version}` : `Projection v${version}`
}

export function explainSnapshotVersion(version: number, language: Language) {
  return language === 'zh'
    ? `这是 Operator Console 自己的投影视图版本（当前为 v${version}），说明客户端如何组织和展示快照数据；它不是 CodeWinter 本体版本。`
    : `This is the Operator Console projection schema version (currently v${version}). It describes how the client organizes snapshot data and is not the CodeWinter core release version.`
}

export function localizeHealthWarning(warning: string, language: Language) {
  const exactMap: Record<string, { en: string; zh: string }> = {
    'Current instance-manifest still looks like a template baseline.': {
      en: 'Current instance-manifest still looks like a template baseline.',
      zh: '当前 instance-manifest 仍像模板基线，说明这个实例还没有完全进入真实运行态。',
    },
    'No real thread cards were detected yet; Runtime may still be showing an empty baseline.': {
      en: 'No real thread cards were detected yet; Runtime may still be showing an empty baseline.',
      zh: '当前还没有检测到真实线程卡，说明 Runtime 看到的很可能仍是空基线。',
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
    return '当前实例仍停留在 BOOTSTRAPPING 基线，说明初始化或实例接管尚未完全完成。'
  }

  const deviationMatch = message.match(/^Thread (.+) explicitly reported deviation\.$/)
  if (deviationMatch) {
    return `线程 ${deviationMatch[1]} 主动上报了偏航信号，说明它判断自己可能偏离了预期执行路径。`
  }

  const decisionMatch = message.match(/^Thread (.+) still has a pending decision\.$/)
  if (decisionMatch) {
    return `线程 ${decisionMatch[1]} 当前仍有待决策事项，需要管理线程或人工进一步确认。`
  }

  const blockingRequestMatch = message.match(
    /^Collaboration request (.+) is marked as fully blocking the current path\.$/,
  )
  if (blockingRequestMatch) {
    return `协作请求 ${blockingRequestMatch[1]} 被标记为完整阻塞当前主链路，需要优先处理。`
  }

  const statusMatch = message.match(/^Thread (.+) is currently in status (.+)\.$/)
  if (statusMatch) {
    return `线程 ${statusMatch[1]} 当前处于 ${statusMatch[2]} 状态，说明它仍处在需要关注的运行阶段。`
  }

  const requestMatch = message.match(/^Collaboration request (.+) is still pending at HIGH urgency\.$/)
  if (requestMatch) {
    return `协作请求 ${requestMatch[1]} 仍处于 HIGH 优先级待处理状态，说明当前可能存在阻塞或紧急接力需求。`
  }

  return message
}

export function localizeRuntimeSignalText(text: string, language: Language) {
  if (language === 'en') {
    return text
  }

  const exactMap: Record<string, string> = {
    'System Health': '系统健康度',
    'Drift Risk': '偏航风险',
    'Decision Pressure': '决策压力',
    'Collaboration Pressure': '协作压力',
    'Closure Pressure': '收口压力',
    'The current instance still looks like a template baseline rather than a fully claimed runtime.':
      '当前实例仍像模板基线，而不是已经被真实项目接管的运行实例。',
    'No real runtime thread cards were detected yet.': '当前还没有检测到真实线程卡。',
    'The workspace baseline has not been fully claimed by a real manager thread yet.':
      '当前工作区还没有被真实管理线程完全接管。',
    'The runtime is active, but at least one high-risk or fully blocking condition needs attention.':
      '系统已经进入运行态，但至少存在一项高风险或完整阻塞条件需要优先处理。',
    'A collaboration request is marked as fully blocking the current execution path.':
      '存在被标记为完整阻塞主链路的协作请求。',
    'At least one active thread is currently running under a RED risk gate.':
      '至少有一个活跃线程当前处于 RED 风险门。',
    'The runtime is moving, but some threads are waiting on collaboration or are currently blocked.':
      '系统仍在推进，但已有部分线程进入阻塞或等待协作状态。',
    'One or more registered threads are currently marked as blocked or collaboration-dependent.':
      '已有一个或多个注册线程被标记为阻塞或协作依赖。',
    'The runtime currently looks structurally stable and able to continue forward.':
      '当前系统整体结构稳定，可以继续向前推进。',
    'No blocking signals, red risk gates, or unresolved baseline issues are dominant right now.':
      '当前没有明显的阻塞信号、红色风险门或未解决的基线问题占据主导。',
    'The runtime shows threads that may be drifting away from their intended execution path.':
      '当前运行态显示存在可能偏离预期执行路径的线程。',
    'At least one thread explicitly reported a deviation flag.':
      '至少有一个线程主动上报了偏航信号。',
    'One or more active threads have not recorded meaningful progress for too long.':
      '至少有一个活跃线程已经过久没有记录实质推进。',
    'The runtime is not visibly drifting, but some active threads are operating with low confidence.':
      '当前没有明显偏航，但已有线程在低信心下推进。',
    'One or more active threads currently report LOW confidence.':
      '至少有一个活跃线程当前报告为 LOW confidence。',
    'No strong deviation or staleness signals are visible right now.':
      '当前没有明显的偏航或陈旧执行信号。',
    'No registered thread has reported a deviation flag or stale active state.':
      '当前没有线程上报偏航，也没有明显的活跃空转状态。',
    'Several decisions are currently waiting on the manager thread or an explicit human call.':
      '当前已有多项事项在等待管理线程或人工明确决策。',
    'At least one thread is marked as P0 while still carrying a pending decision.':
      '至少有一个线程在带有待决策事项的同时被标记为 P0。',
    'There are multiple unresolved decision-needed threads in the runtime.':
      '当前运行态里存在多条尚未解决的待决策线程。',
    'There are decision points in flight, but they have not yet become a dominant bottleneck.':
      '当前存在待决策事项，但尚未形成明显的系统性决策瓶颈。',
    'At least one thread still carries a non-empty decision-needed field.':
      '至少有一个线程仍然保留了非空的 decision_needed 字段。',
    'A high-urgency collaboration request suggests pending routing or approval work.':
      '高优先级协作请求意味着当前仍有待路由或待确认的管理动作。',
    'No visible decision backlog is active in the current runtime snapshot.':
      '当前运行态快照中没有明显的决策积压。',
    'The runtime does not show unresolved decision-needed threads or urgent routing requests.':
      '当前没有未解决的待决策线程，也没有明显的高优先级路由请求。',
    'The collaboration queue is actively pressuring system throughput.':
      '当前协作队列已经对系统推进效率形成明显压力。',
    'At least one open collaboration request is marked as fully blocking the main path.':
      '至少有一条打开中的协作请求被标记为完整阻塞主链路。',
    'There are too many simultaneously open collaboration asks for the current runtime shape.':
      '当前同时打开的协作请求数量已经偏多。',
    'Collaboration is active, but the queue still looks manageable.':
      '当前协作正在发生，但队列看起来仍可控。',
    'Some threads already need collaboration, even if the request queue is still light.':
      '有线程已经进入 NEEDS_COLLAB，即使请求队列本身还不重。',
    'The request queue is active and should be kept moving to avoid future bottlenecks.':
      '当前请求队列已处于活跃状态，应尽快流转以避免后续阻塞。',
    'No active collaboration bottleneck is visible in the current request queue.':
      '当前协作请求队列里没有明显的协作瓶颈。',
    'No open or manager-blocking collaboration requests were detected.':
      '当前没有检测到打开中的或明显阻塞管理线程的协作请求。',
    'Multiple threads are ready to be handed off, integrated, or closed out.':
      '当前有多条线程已经进入可交接、可集成或可收口状态。',
    'Several outputs are already closure-ready and should not remain in active flow for too long.':
      '已有多项产出具备收口条件，不应长期停留在活跃流中。',
    'There are closure-ready items waiting for the manager thread to collect them.':
      '当前已有可收口事项，等待管理线程统一收集。',
    'At least one thread is ready for handoff, completion, or archive review.':
      '至少有一个线程已经准备好交接、完成或归档复核。',
    'Threads are still mostly in active delivery rather than closure preparation.':
      '当前线程仍主要处于推进阶段，而不是收口准备阶段。',
    'No runtime thread has yet reached a clear handoff or archive-ready state.':
      '当前还没有线程进入明确的交接或归档准备状态。',
  }

  return exactMap[text] ?? text
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
      project_introduction_archive_path: 'Project Introduction Archive Path',
      usage_guide_archive_path: 'Usage Guide Archive Path',
      instance_name: 'Instance Name',
      workspace_root: 'Workspace Root',
      status: 'Instance Status',
      compatibility_window: 'Compatibility Window',
      instance_schema_version: 'Instance Schema Version',
      runtime_coordination_version: 'Runtime Coordination Version',
      manager_lease_holder: 'Current Manager Thread',
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
    project_introduction_archive_path: '项目介绍留档路径',
    usage_guide_archive_path: '使用说明留档路径',
    instance_name: '实例名称',
    workspace_root: '工作区根目录',
    status: '实例状态',
    compatibility_window: '兼容窗口',
    instance_schema_version: '实例结构版本',
    runtime_coordination_version: '运行协作版本',
    manager_lease_holder: '当前管理线程',
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
    STABLE: '稳定',
    WATCH: '观察中',
    PRESSURED: '有压力',
    CRITICAL: '关键',
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
    FULL: '完整阻塞',
    PARTIAL: '部分阻塞',
    NONE: '不阻塞',
    GREEN: '绿色',
    YELLOW: '黄色',
    RED: '红色',
    TRUE: '是',
    FALSE: '否',
    INACTIVE: '未启用',
    OPEN: '打开',
    ROUTED: '已路由',
    IN_PROGRESS: '进行中',
    CONSULT: '咨询',
    REVIEW: '评审',
    IMPLEMENT: '实现',
    INTEGRATE: '整合',
    VERIFY: '验证',
    UNBLOCK: '解堵',
    P0: 'P0',
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
  }

  return map[value] ?? value
}
