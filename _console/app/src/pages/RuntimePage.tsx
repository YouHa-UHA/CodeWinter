import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CompassOutlined,
  FolderOpenOutlined,
  RadarChartOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, Button, Empty, Space, Tag, Typography } from 'antd'
import { localizeProtocolValue, localizeRuntimeAlert } from '../lib/i18n'
import type { Language } from '../lib/i18n'
import type {
  CollaborationRequestSummary,
  RuntimeAlert,
  ThreadSummary,
} from '../types/snapshot'

const { Paragraph, Text, Title } = Typography

interface RuntimePageProps {
  language: Language
  managerLeaseHolder?: string
  threads: ThreadSummary[]
  collabRequests: CollaborationRequestSummary[]
  alerts: RuntimeAlert[]
  onOpenPath: (path: string) => Promise<void>
}

function metricLabel(value: string | undefined, language: Language) {
  return value && value.trim().length > 0
    ? localizeProtocolValue(value, language)
    : language === 'zh'
      ? '未记录'
      : 'Not set'
}

function toneColor(value?: string) {
  if (!value) {
    return 'default'
  }

  const normalized = value.trim().toUpperCase()
  if (normalized === 'HIGH' || normalized === 'DONE' || normalized === 'FALSE') {
    return 'success'
  }
  if (normalized === 'LOW' || normalized === 'TRUE' || normalized === 'BLOCKED') {
    return 'error'
  }
  if (normalized === 'MEDIUM' || normalized === 'WAITING' || normalized === 'NEEDS_COLLAB') {
    return 'warning'
  }
  return 'processing'
}

export function RuntimePage({
  language,
  managerLeaseHolder,
  threads,
  collabRequests,
  alerts,
  onOpenPath,
}: RuntimePageProps) {
  const copy =
    language === 'zh'
      ? {
          kicker: '实时协作信号',
          title: '让线程状态像空气一样流动，而不是埋在文件里',
          summary:
            '运行态页面的重点不是堆更多字段，而是把谁在推进、谁被阻塞、谁需要决策、哪里正在积累协作压力，变成一眼可扫读的操作层。',
          currentManager: '当前管理线程',
          threads: '线程',
          requests: '请求',
          alerts: '提醒',
          registeredThreads: '已注册线程',
          noThreads: '当前还没有检测到真实线程卡。',
          open: '打开',
          scopeClaims: '边界声明',
          nextStep: '推荐下一步',
          lastUpdated: '最近更新',
          collaborationRequests: '协作请求',
          noRequests: '当前没有待处理的协作请求卡。',
          alertsTitle: '运行提醒',
          noAlerts: '当前没有运行级风险提醒。',
          from: '来源',
          type: '类型',
          acceptance: '接收信号',
          confidence: '信心',
          deviation: '偏航',
          decision: '决策',
          phase: '阶段',
          managerHint: '这里显示当前接管控制面的管理线程，而不是永久不变的管理员身份。',
        }
      : {
          kicker: 'Runtime Signals',
          title: 'Let thread state move like a visible layer instead of hiding in files',
          summary:
            'The runtime surface should not dump more fields. It should make it easy to scan who is moving, who is blocked, who needs a decision, and where collaboration pressure is building.',
          currentManager: 'Current Manager',
          threads: 'Threads',
          requests: 'Requests',
          alerts: 'Alerts',
          registeredThreads: 'Registered threads',
          noThreads: 'No real thread cards were detected yet.',
          open: 'Open',
          scopeClaims: 'Scope Claims',
          nextStep: 'Recommended Next Step',
          lastUpdated: 'Last Updated',
          collaborationRequests: 'Collaboration requests',
          noRequests: 'No open collaboration request cards were detected.',
          alertsTitle: 'Runtime alerts',
          noAlerts: 'No runtime risk alerts are currently active.',
          from: 'From',
          type: 'Type',
          acceptance: 'Acceptance',
          confidence: 'Confidence',
          deviation: 'Deviation',
          decision: 'Decision',
          phase: 'Phase',
          managerHint:
            'This shows the thread currently holding the manager role for the control plane, not a permanent administrator identity.',
        }

  return (
    <div className="page-stack">
      <section className="hero-panel runtime-hero">
        <div className="hero-copy">
          <Text className="section-kicker">{copy.kicker}</Text>
          <Title level={2}>{copy.title}</Title>
          <Paragraph>{copy.summary}</Paragraph>
        </div>

        <div className="metric-grid-v3">
          <article className="metric-orb glass-sheet">
            <CompassOutlined />
            <div>
              <Text className="metric-label">{copy.currentManager}</Text>
              <Title level={4}>{metricLabel(managerLeaseHolder, language)}</Title>
              <Text type="secondary">{copy.managerHint}</Text>
            </div>
          </article>
          <article className="metric-orb glass-sheet">
            <ApartmentOutlined />
            <div>
              <Text className="metric-label">{copy.threads}</Text>
              <Title level={4}>{threads.length}</Title>
            </div>
          </article>
          <article className="metric-orb glass-sheet">
            <RadarChartOutlined />
            <div>
              <Text className="metric-label">{copy.requests}</Text>
              <Title level={4}>{collabRequests.length}</Title>
            </div>
          </article>
          <article className="metric-orb glass-sheet">
            <WarningOutlined />
            <div>
              <Text className="metric-label">{copy.alerts}</Text>
              <Title level={4}>{alerts.length}</Title>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.threads}</Text>
            <Title level={4}>{copy.registeredThreads}</Title>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="solid-surface empty-surface">
            <Empty description={copy.noThreads} />
          </div>
        ) : (
          <div className="runtime-thread-stack">
            {threads.map((thread) => (
              <article key={thread.path} className="runtime-thread solid-surface">
                <div className="runtime-thread-head">
                  <div>
                    <Space wrap>
                      <Title level={5}>{thread.threadId}</Title>
                      <Tag color={toneColor(thread.status)}>{metricLabel(thread.status, language)}</Tag>
                      <Tag>{metricLabel(thread.role, language)}</Tag>
                    </Space>
                    <Paragraph className="path-text">{thread.path}</Paragraph>
                  </div>
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(thread.path)}>
                    {copy.open}
                  </Button>
                </div>

                <div className="runtime-signal-row">
                  <Tag color="processing">
                    {copy.phase} · {metricLabel(thread.phase, language)}
                  </Tag>
                  <Tag color={toneColor(thread.confidence)}>
                    {copy.confidence} · {metricLabel(thread.confidence, language)}
                  </Tag>
                  <Tag color={toneColor(thread.deviationFlag)}>
                    {copy.deviation} · {metricLabel(thread.deviationFlag, language)}
                  </Tag>
                  <Tag color={toneColor(thread.decisionNeeded)}>
                    {copy.decision} · {metricLabel(thread.decisionNeeded, language)}
                  </Tag>
                </div>

                <div className="runtime-detail-grid">
                  <article className="runtime-detail-card">
                    <Text className="detail-label">{copy.scopeClaims}</Text>
                    <Paragraph>{metricLabel(thread.scopeClaims, language)}</Paragraph>
                  </article>
                  <article className="runtime-detail-card">
                    <Text className="detail-label">{copy.nextStep}</Text>
                    <Paragraph>{metricLabel(thread.recommendedNextStep, language)}</Paragraph>
                  </article>
                  <article className="runtime-detail-card">
                    <Text className="detail-label">{copy.lastUpdated}</Text>
                    <Paragraph>{metricLabel(thread.lastUpdated, language)}</Paragraph>
                  </article>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="runtime-dual-grid">
        <section className="solid-surface">
          <div className="section-heading section-heading-tight">
            <div>
              <Text className="section-kicker">{copy.requests}</Text>
              <Title level={4}>{copy.collaborationRequests}</Title>
            </div>
          </div>

          {collabRequests.length === 0 ? (
            <Empty description={copy.noRequests} />
          ) : (
            <div className="entry-list compact-list">
              {collabRequests.map((request) => (
                <article key={request.path} className="entry-row">
                  <div className="entry-row-main">
                    <div className="entry-row-icon">
                      <ArrowRightOutlined />
                    </div>
                    <div className="entry-row-copy">
                      <Space wrap>
                        <Title level={5}>{request.requestId}</Title>
                        <Tag color={toneColor(request.urgency)}>
                          {metricLabel(request.urgency, language)}
                        </Tag>
                        <Tag color={toneColor(request.status)}>
                          {metricLabel(request.status, language)}
                        </Tag>
                      </Space>
                      <Paragraph className="path-text">{request.path}</Paragraph>
                      <Paragraph type="secondary">
                        {copy.from} {metricLabel(request.fromThreadId, language)} · {copy.type}{' '}
                        {metricLabel(request.type, language)} · {copy.acceptance}{' '}
                        {metricLabel(request.acceptanceSignal, language)}
                      </Paragraph>
                    </div>
                  </div>
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(request.path)}>
                    {copy.open}
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="solid-surface">
          <div className="section-heading section-heading-tight">
            <div>
              <Text className="section-kicker">{copy.alerts}</Text>
              <Title level={4}>{copy.alertsTitle}</Title>
            </div>
          </div>

          {alerts.length === 0 ? (
            <Empty description={copy.noAlerts} />
          ) : (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {alerts.map((alert, index) => (
                <Alert
                  key={`${alert.source ?? 'alert'}-${index}`}
                  className="runtime-alert"
                  type={
                    alert.level === 'critical'
                      ? 'error'
                      : alert.level === 'warning'
                        ? 'warning'
                        : 'info'
                  }
                  message={localizeRuntimeAlert(alert.message, language)}
                  description={
                    alert.source ? (
                      <Space wrap>
                        <Paragraph className="path-text">{alert.source}</Paragraph>
                        <Button
                          size="small"
                          icon={<FolderOpenOutlined />}
                          onClick={() => void onOpenPath(alert.source!)}
                        >
                          {copy.open}
                        </Button>
                      </Space>
                    ) : undefined
                  }
                  showIcon
                />
              ))}
            </Space>
          )}
        </section>
      </section>
    </div>
  )
}
