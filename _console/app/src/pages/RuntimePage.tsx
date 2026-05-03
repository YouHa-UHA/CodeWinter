import {
  LinkOutlined,
  NodeIndexOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Button, Empty, Tag, Typography } from 'antd'
import {
  localizeProtocolValue,
  localizeRuntimeAlert,
  localizeRuntimeSignalText,
  pickLocalizedText,
} from '../lib/i18n'
import type { Language } from '../lib/i18n'
import type {
  CollaborationRequestSummary,
  RuntimeAlert,
  RuntimeSignalCard,
  ThreadSummary,
} from '../types/snapshot'

const { Paragraph, Text, Title } = Typography

interface RuntimePageProps {
  language: Language
  query: string
  managerLeaseHolder?: string
  threads: ThreadSummary[]
  collabRequests: CollaborationRequestSummary[]
  signals: RuntimeSignalCard[]
  alerts: RuntimeAlert[]
  onOpenPath: (path: string) => Promise<void>
}

function matchesQuery(values: string[], query: string) {
  if (!query.trim()) {
    return true
  }

  const normalized = query.toLowerCase()
  return values.some((value) => value.toLowerCase().includes(normalized))
}

function isPlaceholderValue(value?: string) {
  if (!value) {
    return true
  }

  const normalized = value.trim().toLowerCase()
  return (
    normalized.length === 0 ||
    normalized === 'to confirm' ||
    normalized === 'not yet' ||
    normalized === 'none' ||
    normalized === '-' ||
    normalized === 'n/a'
  )
}

function valueOrFallback(value: string | undefined, language: Language) {
  if (isPlaceholderValue(value)) {
    return language === 'zh' ? '未设置' : 'Not set'
  }

  return localizeProtocolValue(value!.trim(), language)
}

function formatDate(value: string | undefined, language: Language) {
  if (isPlaceholderValue(value)) {
    return language === 'zh' ? '未记录' : 'Not recorded'
  }

  const date = new Date(value!)
  if (Number.isNaN(date.getTime())) {
    return value!
  }

  return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
    hour12: false,
  })
}

function toneColor(value?: string) {
  if (!value) {
    return 'default'
  }

  switch (value.trim().toUpperCase()) {
    case 'HIGH':
    case 'CRITICAL':
    case 'RED':
    case 'FULL':
    case 'BLOCKED':
      return 'error'
    case 'MEDIUM':
    case 'WATCH':
    case 'PRESSURED':
    case 'YELLOW':
    case 'PARTIAL':
    case 'NEEDS_COLLAB':
    case 'HANDOFF_READY':
      return 'warning'
    case 'LOW':
    case 'STABLE':
    case 'GREEN':
    case 'DONE':
    case 'ACTIVE':
      return 'success'
    default:
      return 'processing'
  }
}

function dotTone(value?: string) {
  if (!value) {
    return 'muted'
  }

  switch (value.trim().toUpperCase()) {
    case 'RED':
    case 'CRITICAL':
    case 'BLOCKED':
      return 'danger'
    case 'YELLOW':
    case 'WATCH':
    case 'PRESSURED':
    case 'NEEDS_COLLAB':
    case 'HANDOFF_READY':
      return 'warning'
    case 'GREEN':
    case 'STABLE':
    case 'ACTIVE':
    case 'DONE':
      return 'success'
    default:
      return 'muted'
  }
}

function requestLaneLabel(type: string | undefined, language: Language) {
  const normalized = (type ?? '').trim().toUpperCase()

  if (normalized === 'CONSULT' || normalized === 'REVIEW') {
    return language === 'zh' ? '分析协作' : 'Analysis'
  }

  if (normalized === 'IMPLEMENT' || normalized === 'INTEGRATE') {
    return language === 'zh' ? '执行协作' : 'Execution'
  }

  if (normalized === 'VERIFY' || normalized === 'UNBLOCK') {
    return language === 'zh' ? '解堵协作' : 'Unblock'
  }

  return language === 'zh' ? '待分类协作' : 'General'
}

function compactTask(thread: ThreadSummary, language: Language) {
  if (!isPlaceholderValue(thread.currentTask)) {
    return thread.currentTask!.trim()
  }

  return language === 'zh'
    ? '当前还没有写入任务摘要。'
    : 'No task summary has been recorded yet.'
}

function compactNextStep(thread: ThreadSummary, language: Language) {
  if (!isPlaceholderValue(thread.recommendedNextStep)) {
    return thread.recommendedNextStep!.trim()
  }

  return language === 'zh'
    ? '等待管理线程或当前线程写入下一步建议。'
    : 'Waiting for the next recommended action.'
}

function confidenceMeterWidth(thread: ThreadSummary) {
  const confidence = (thread.confidence ?? '').trim().toUpperCase()
  const riskGate = (thread.riskGate ?? '').trim().toUpperCase()
  const status = (thread.status ?? '').trim().toUpperCase()

  if (confidence === 'HIGH' || riskGate === 'GREEN' || status === 'DONE') {
    return 84
  }

  if (confidence === 'MEDIUM' || riskGate === 'YELLOW' || status === 'ACTIVE') {
    return 60
  }

  if (confidence === 'LOW' || riskGate === 'RED' || status === 'BLOCKED') {
    return 28
  }

  return 44
}

function levelWeight(value?: string) {
  switch ((value ?? '').trim().toUpperCase()) {
    case 'CRITICAL':
    case 'RED':
    case 'HIGH':
    case 'FULL':
      return 0.96
    case 'PRESSURED':
    case 'WATCH':
    case 'YELLOW':
    case 'MEDIUM':
    case 'PARTIAL':
      return 0.72
    case 'LOW':
    case 'GREEN':
    case 'STABLE':
      return 0.46
    default:
      return 0.34
  }
}

function signalTone(value?: string) {
  switch ((value ?? '').trim().toUpperCase()) {
    case 'CRITICAL':
    case 'RED':
    case 'HIGH':
    case 'FULL':
      return 'danger'
    case 'PRESSURED':
    case 'WATCH':
    case 'YELLOW':
    case 'MEDIUM':
    case 'PARTIAL':
      return 'warning'
    case 'LOW':
    case 'GREEN':
    case 'STABLE':
      return 'success'
    default:
      return 'muted'
  }
}

function buildSignalGraph(signals: RuntimeSignalCard[]) {
  const source = signals.slice(0, 5)
  const values = source.map((signal, index) => {
    const weight = levelWeight(signal.level)
    return {
      key: `node-${signal.id}-${index}`,
      left: source.length === 1 ? 50 : 10 + (index / Math.max(source.length - 1, 1)) * 80,
      bottom: 18 + weight * 56,
      weight,
      tone: signalTone(signal.level),
      delay: `${index * 140}ms`,
      duration: `${4 + index * 0.25}s`,
    }
  })

  const segments = values.slice(0, -1).map((current, index) => {
    const next = values[index + 1]
    const deltaX = next.left - current.left
    const deltaY = next.bottom - current.bottom
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI

    return {
      key: `segment-${current.key}-${next.key}`,
      left: `${current.left}%`,
      bottom: `${current.bottom}px`,
      width: `${length}%`,
      angle: `${angle}deg`,
      tone: current.weight >= next.weight ? current.tone : next.tone,
      delay: current.delay,
      duration: current.duration,
    }
  })

  return { nodes: values, segments }
}

function signalNarrative(signal: RuntimeSignalCard, language: Language) {
  const summary = localizeRuntimeSignalText(signal.summary.en, language).trim()
  const topReason = localizeRuntimeSignalText(signal.topReason.en, language).trim()

  if (!topReason || topReason === summary) {
    return {
      summary,
      reason: null as string | null,
    }
  }

  return {
    summary,
    reason: topReason,
  }
}

export function RuntimePage({
  language,
  query,
  managerLeaseHolder,
  threads,
  collabRequests,
  signals,
  alerts,
  onOpenPath,
}: RuntimePageProps) {
  const copy =
    language === 'zh'
      ? {
          title: '运行态监控',
          summary: '从管理线程的视角查看已注册线程、协作委托与系统级信号。',
          managerLabel: '当前管理线程',
          threadTitle: '已注册线程',
          threadLink: '查看全部线程',
          threadEmpty: '当前还没有检测到真实线程卡。',
          signalTitle: '信号监测',
          signalEmpty: '当前没有额外的运行信号。',
          signalVisual: '运行信号流',
          requestTitle: '协作请求',
          requestEmpty: '当前没有待处理的协作请求。',
          source: '来源线程',
          target: '目标线程',
          intent: '协作意图',
          priority: '优先级',
          action: '操作',
          open: '打开',
          nextStep: '下一步',
          managerFocus: '管理关注',
          managerFocusEmpty: '当前没有额外需要管理线程介入的提醒。',
          liveFeed: '实时监测',
          healthPrefix: '系统健康',
        }
      : {
          title: 'Runtime Monitor',
          summary: 'See registered threads, collaboration asks, and manager-level system signals.',
          managerLabel: 'Current Manager',
          threadTitle: 'Registered Threads',
          threadLink: 'View All Threads',
          threadEmpty: 'No real thread cards were detected yet.',
          signalTitle: 'Signal Monitor',
          signalEmpty: 'No additional runtime signals are active right now.',
          signalVisual: 'Runtime signal stream',
          requestTitle: 'Collaboration Requests',
          requestEmpty: 'No open collaboration requests were detected.',
          source: 'Source Thread',
          target: 'Target Thread',
          intent: 'Resource Intent',
          priority: 'Priority',
          action: 'Action',
          open: 'Open',
          nextStep: 'Next Step',
          managerFocus: 'Manager Focus',
          managerFocusEmpty: 'No extra runtime attention items are active right now.',
          liveFeed: 'Live Feed',
          healthPrefix: 'System Health',
        }

  const healthSignal = signals.find((signal) => signal.id === 'system-health') ?? signals[0]

  const normalizedManager =
    managerLeaseHolder && !isPlaceholderValue(managerLeaseHolder) ? managerLeaseHolder.trim() : undefined

  const filteredThreads = threads.filter((thread) =>
    matchesQuery(
      [
        thread.threadId,
        thread.tool ?? '',
        thread.role ?? '',
        thread.status ?? '',
        thread.phase ?? '',
        thread.currentTask ?? '',
        thread.scopeClaims ?? '',
        thread.managerPriority ?? '',
        thread.riskGate ?? '',
        thread.recommendedNextStep ?? '',
      ],
      query,
    ),
  )

  const filteredRequests = collabRequests.filter((request) =>
    matchesQuery(
      [
        request.requestId,
        request.fromThreadId ?? '',
        request.targetThreadId ?? '',
        request.type ?? '',
        request.whyNow ?? '',
        request.requestedOutcome ?? '',
        request.doneWhen ?? '',
        request.blockingSeverity ?? '',
      ],
      query,
    ),
  )

  const filteredSignals = signals.filter((signal) =>
    matchesQuery(
      [
        pickLocalizedText(signal.title, language),
        signal.level,
        pickLocalizedText(signal.summary, language),
        pickLocalizedText(signal.topReason, language),
      ],
      query,
    ),
  )

  const visibleAlerts = alerts.slice(0, 3)
  const signalGraph = buildSignalGraph(filteredSignals.length > 0 ? filteredSignals : signals)

  return (
    <div className="page-stack runtime-page-refined">
      <section className="runtime-refined-header">
        <div>
          <Title level={1}>{copy.title}</Title>
          <Paragraph>{copy.summary}</Paragraph>
        </div>
        <div className="runtime-refined-header-status">
          <span className={`runtime-dot runtime-dot-${dotTone(healthSignal?.level)}`} />
          <Text>
            {copy.healthPrefix}
            {language === 'zh' ? '：' : ': '}
            {healthSignal ? valueOrFallback(healthSignal.level, language) : valueOrFallback(undefined, language)}
          </Text>
          {normalizedManager ? (
            <strong>
              {copy.managerLabel}
              {language === 'zh' ? '：' : ': '}
              {normalizedManager}
            </strong>
          ) : null}
        </div>
      </section>

      <section className="runtime-refined-top">
        <div className="surface-panel runtime-refined-panel runtime-refined-threads">
          <div className="runtime-refined-panel-head">
            <Title level={3}>{copy.threadTitle}</Title>
            <Button type="link">{copy.threadLink}</Button>
          </div>

          {filteredThreads.length === 0 ? (
            <Empty description={copy.threadEmpty} />
          ) : (
            <div className="runtime-refined-thread-grid">
              {filteredThreads.slice(0, 4).map((thread) => (
                <article key={thread.path} className="runtime-refined-thread-card">
                  <div className="runtime-refined-thread-top">
                    <div className="runtime-refined-thread-title">
                      <div className="runtime-refined-thread-avatar">
                        <NodeIndexOutlined />
                      </div>
                      <div>
                        <Title level={4}>{thread.threadId}</Title>
                        <Text type="secondary">
                          {valueOrFallback(thread.status, language)}
                          {' · '}
                          {thread.lastMeaningfulProgressAt
                            ? formatDate(thread.lastMeaningfulProgressAt, language)
                            : formatDate(thread.lastUpdated, language)}
                        </Text>
                      </div>
                    </div>
                    <span
                      className={`runtime-status-dot runtime-status-dot-${dotTone(thread.riskGate ?? thread.status)}`}
                    />
                  </div>

                  <Paragraph className="runtime-refined-thread-task">
                    {compactTask(thread, language)}
                  </Paragraph>

                  <div className="runtime-refined-thread-meter">
                    <div
                      className="runtime-refined-thread-meter-fill"
                      style={{ width: `${confidenceMeterWidth(thread)}%` }}
                    />
                  </div>

                  <div className="runtime-refined-thread-foot">
                    <Text>{copy.nextStep}</Text>
                    <Text type="secondary">{compactNextStep(thread, language)}</Text>
                  </div>

                  <div className="runtime-refined-thread-tags">
                    {thread.managerPriority ? (
                      <Tag color={toneColor(thread.managerPriority)}>
                        {valueOrFallback(thread.managerPriority, language)}
                      </Tag>
                    ) : null}
                    {thread.riskGate ? (
                      <Tag color={toneColor(thread.riskGate)}>
                        {valueOrFallback(thread.riskGate, language)}
                      </Tag>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="runtime-refined-side-stack">
          <div className="surface-panel runtime-refined-panel runtime-refined-signals">
            <div className="runtime-refined-panel-head">
              <Title level={3}>{copy.signalTitle}</Title>
            </div>

            {filteredSignals.length === 0 ? (
              <Paragraph type="secondary">{copy.signalEmpty}</Paragraph>
            ) : (
              <div className="runtime-refined-signal-list">
                {filteredSignals.map((signal) => {
                  const narrative = signalNarrative(signal, language)

                  return (
                    <div key={signal.id} className="runtime-refined-signal-row">
                      <div className="runtime-refined-signal-copy">
                        <span className={`runtime-signal-dot runtime-signal-dot-${dotTone(signal.level)}`} />
                        <div>
                          <Text>{localizeRuntimeSignalText(signal.title.en, language)}</Text>
                          <Paragraph>{narrative.summary}</Paragraph>
                          {narrative.reason ? <Text type="secondary">{narrative.reason}</Text> : null}
                        </div>
                      </div>
                      <strong>{valueOrFallback(signal.level, language)}</strong>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="runtime-refined-signal-visual" aria-label={copy.signalVisual}>
              <div className="runtime-refined-wave runtime-refined-wave-a" />
              <div className="runtime-refined-wave runtime-refined-wave-b" />
              <div className="runtime-refined-wave runtime-refined-wave-c" />
              <div className="runtime-refined-spark runtime-refined-spark-a" />
              <div className="runtime-refined-spark runtime-refined-spark-b" />
              <div className="runtime-refined-spark runtime-refined-spark-c" />
              <div className="runtime-refined-signal-graph">
                {signalGraph.segments.map((segment) => (
                  <span
                    key={segment.key}
                    className={`runtime-signal-segment runtime-signal-segment-${segment.tone}`}
                    style={{
                      left: segment.left,
                      bottom: segment.bottom,
                      width: segment.width,
                      transform: `rotate(${segment.angle})`,
                      animationDelay: segment.delay,
                      animationDuration: segment.duration,
                    }}
                  />
                ))}
                {signalGraph.nodes.map((node) => (
                  <span
                    key={node.key}
                    className={`runtime-signal-node runtime-signal-node-${node.tone}`}
                    style={{
                      left: `${node.left}%`,
                      bottom: `${node.bottom}px`,
                      animationDelay: node.delay,
                      animationDuration: node.duration,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="surface-panel runtime-refined-panel runtime-refined-focus">
            <div className="runtime-refined-panel-head">
              <Title level={3}>{copy.managerFocus}</Title>
              <Tag color="success">{copy.liveFeed}</Tag>
            </div>

            {visibleAlerts.length === 0 ? (
              <Paragraph type="secondary">{copy.managerFocusEmpty}</Paragraph>
            ) : (
              <div className="runtime-refined-alert-list">
                {visibleAlerts.map((alert, index) => (
                  <div key={`${alert.source ?? index}`} className="runtime-refined-alert-item">
                    <span className={`runtime-signal-dot runtime-signal-dot-${dotTone(alert.level)}`}>
                      <WarningOutlined />
                    </span>
                    <div>
                      <Paragraph>{localizeRuntimeAlert(alert.message.en, language)}</Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="surface-panel runtime-refined-panel runtime-refined-requests">
        <div className="runtime-refined-panel-head">
          <Title level={3}>{copy.requestTitle}</Title>
          <Tag color="success">{copy.liveFeed}</Tag>
        </div>

        {filteredRequests.length === 0 ? (
          <Empty description={copy.requestEmpty} />
        ) : (
          <div className="runtime-refined-request-table">
            <div className="runtime-refined-request-head">
              <span>{copy.source}</span>
              <span>{copy.target}</span>
              <span>{copy.intent}</span>
              <span>{copy.priority}</span>
              <span>{copy.action}</span>
            </div>

            {filteredRequests.map((request) => (
              <div key={request.path} className="runtime-refined-request-row">
                <div>
                  <strong>{valueOrFallback(request.fromThreadId, language)}</strong>
                </div>
                <div>
                  <strong>{valueOrFallback(request.targetThreadId, language)}</strong>
                </div>
                <div className="runtime-refined-request-intent">
                  <LinkOutlined />
                  <div>
                    <strong>{requestLaneLabel(request.type, language)}</strong>
                    <Text type="secondary">
                      {!isPlaceholderValue(request.requestedOutcome)
                        ? request.requestedOutcome!.trim()
                        : valueOrFallback(request.type, language)}
                    </Text>
                  </div>
                </div>
                <div className="runtime-refined-request-priority">
                  <Tag color={toneColor(request.urgency)}>
                    {valueOrFallback(request.urgency, language)}
                  </Tag>
                  {request.blockingSeverity ? (
                    <Tag color={toneColor(request.blockingSeverity)}>
                      {valueOrFallback(request.blockingSeverity, language)}
                    </Tag>
                  ) : null}
                </div>
                <div className="runtime-refined-request-action">
                  <Button type="primary" onClick={() => void onOpenPath(request.path)}>
                    {copy.open}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
