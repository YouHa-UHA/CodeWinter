import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CompassOutlined,
  FolderOpenOutlined,
  RadarChartOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Empty, List, Space, Statistic, Tag, Typography } from 'antd'
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
          overview: '运行概览',
          title: '线程与协作运行态',
          summary:
            '让状态、阻塞、协作与决策信号更容易被看懂，而不是藏在 Markdown 深处。',
          managerLease: '管理租约',
          threads: '线程',
          requests: '请求',
          alerts: '提醒',
          registeredThreads: '已注册线程',
          noThreads: '当前还没有发现真实线程卡',
          open: '打开',
          scopeClaims: '边界声明',
          nextStep: '推荐下一步',
          lastUpdated: '最近更新',
          collaborationRequests: '协作请求',
          noRequests: '当前没有打开的协作请求卡',
          alertsTitle: '运行提醒',
          noAlerts: '当前没有运行风险提醒',
          from: '来源',
          type: '类型',
          acceptance: '接收信号',
          confidence: '信心',
          deviation: '偏航',
          decision: '决策',
          phase: '阶段',
        }
      : {
          overview: 'Runtime Overview',
          title: 'Thread and collaboration runtime',
          summary:
            'Make status, blockage, collaboration, and decision signals easy to understand instead of burying them in Markdown.',
          managerLease: 'Manager Lease',
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
        }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="surface-card" bordered={false}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text className="section-kicker">{copy.overview}</Text>
            <Title level={4}>{copy.title}</Title>
            <Paragraph type="secondary">{copy.summary}</Paragraph>
          </div>
          <div className="metric-grid-v2">
            <Card className="inner-card" bordered={false}>
              <Statistic
                title={copy.managerLease}
                value={metricLabel(managerLeaseHolder, language)}
                prefix={<CompassOutlined />}
              />
            </Card>
            <Card className="inner-card" bordered={false}>
              <Statistic title={copy.threads} value={threads.length} prefix={<ApartmentOutlined />} />
            </Card>
            <Card className="inner-card" bordered={false}>
              <Statistic
                title={copy.requests}
                value={collabRequests.length}
                prefix={<RadarChartOutlined />}
              />
            </Card>
            <Card className="inner-card" bordered={false}>
              <Statistic title={copy.alerts} value={alerts.length} prefix={<WarningOutlined />} />
            </Card>
          </div>
        </Space>
      </Card>

      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.threads}</Text>
            <Title level={4}>{copy.registeredThreads}</Title>
          </Space>
        }
      >
        {threads.length === 0 ? (
          <Empty description={copy.noThreads} />
        ) : (
          <div className="runtime-card-list">
            {threads.map((thread) => (
              <Card
                key={thread.path}
                className="inner-card"
                bordered={false}
                title={
                  <Space wrap>
                    <Text strong>{thread.threadId}</Text>
                    <Tag color={toneColor(thread.status)}>{metricLabel(thread.status, language)}</Tag>
                    <Tag>{metricLabel(thread.role, language)}</Tag>
                  </Space>
                }
                extra={
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(thread.path)}>
                    {copy.open}
                  </Button>
                }
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Paragraph className="path-text">{thread.path}</Paragraph>
                  <div className="runtime-pill-row">
                    <Tag color="blue">
                      {copy.phase} {metricLabel(thread.phase, language)}
                    </Tag>
                    <Tag color={toneColor(thread.confidence)}>
                      {copy.confidence} {metricLabel(thread.confidence, language)}
                    </Tag>
                    <Tag color={toneColor(thread.deviationFlag)}>
                      {copy.deviation} {metricLabel(thread.deviationFlag, language)}
                    </Tag>
                    <Tag color={toneColor(thread.decisionNeeded)}>
                      {copy.decision} {metricLabel(thread.decisionNeeded, language)}
                    </Tag>
                  </div>
                  <div className="runtime-meta-grid">
                    <Card size="small" bordered={false} className="meta-mini-card">
                      <Text type="secondary">{copy.scopeClaims}</Text>
                      <Paragraph>{metricLabel(thread.scopeClaims, language)}</Paragraph>
                    </Card>
                    <Card size="small" bordered={false} className="meta-mini-card">
                      <Text type="secondary">{copy.nextStep}</Text>
                      <Paragraph>{metricLabel(thread.recommendedNextStep, language)}</Paragraph>
                    </Card>
                    <Card size="small" bordered={false} className="meta-mini-card">
                      <Text type="secondary">{copy.lastUpdated}</Text>
                      <Paragraph>{metricLabel(thread.lastUpdated, language)}</Paragraph>
                    </Card>
                  </div>
                </Space>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.requests}</Text>
            <Title level={4}>{copy.collaborationRequests}</Title>
          </Space>
        }
      >
        {collabRequests.length === 0 ? (
          <Empty description={copy.noRequests} />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={collabRequests}
            renderItem={(request) => (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    icon={<FolderOpenOutlined />}
                    onClick={() => void onOpenPath(request.path)}
                  >
                    {copy.open}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<RadarChartOutlined />}
                  title={
                    <Space wrap>
                      <span>{request.requestId}</span>
                      <Tag color={toneColor(request.urgency)}>
                        {metricLabel(request.urgency, language)}
                      </Tag>
                      <Tag color={toneColor(request.status)}>
                        {metricLabel(request.status, language)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={6}>
                      <Paragraph className="path-text">{request.path}</Paragraph>
                      <Space wrap>
                        <Text type="secondary">
                          {copy.from} {metricLabel(request.fromThreadId, language)}
                        </Text>
                        <ArrowRightOutlined />
                        <Text type="secondary">
                          {metricLabel(request.targetThreadId ?? request.targetCapability, language)}
                        </Text>
                      </Space>
                      <Text type="secondary">
                        {copy.type} {metricLabel(request.type, language)} / {copy.acceptance}{' '}
                        {metricLabel(request.acceptanceSignal, language)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.alerts}</Text>
            <Title level={4}>{copy.alertsTitle}</Title>
          </Space>
        }
      >
        {alerts.length === 0 ? (
          <Empty description={copy.noAlerts} />
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {alerts.map((alert, index) => (
              <Alert
                key={`${alert.source ?? 'alert'}-${index}`}
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
      </Card>
    </Space>
  )
}
