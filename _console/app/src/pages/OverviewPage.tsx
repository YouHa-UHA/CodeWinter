import {
  ArrowRightOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button, Empty, Space, Tag, Typography } from 'antd'
import { localizeHealthWarning, pickLocalizedText } from '../lib/i18n'
import type { Language } from '../lib/i18n'
import type {
  HomeDoc,
  HomeSection,
  ReleaseSummary,
  RefreshStatus,
} from '../types/snapshot'

const { Paragraph, Text, Title } = Typography

interface OverviewPageProps {
  language: Language
  loading: boolean
  query: string
  release: ReleaseSummary
  featuredDocs: HomeDoc[]
  sections: HomeSection[]
  health: {
    refreshStatus: RefreshStatus
    warnings: string[]
  }
  generatedAt: string
  onPreview: (label: string, path: string) => Promise<void>
  onOpenPath: (path: string) => Promise<void>
  onNavigate: (tab: 'overview' | 'workbench' | 'runtime' | 'explorer') => void
}

function formatDate(value: string, language: Language) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
    hour12: false,
  })
}

function matchesQuery(values: string[], query: string) {
  if (!query) {
    return true
  }

  return values.some((value) => value.toLowerCase().includes(query))
}

function releaseChannelLabel(channel: string, language: Language) {
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

function localizeCodename(codename: string | undefined, language: Language) {
  if (!codename) {
    return undefined
  }

  const firstCjkIndex = codename.search(/[\u4e00-\u9fff]/)

  if (firstCjkIndex === -1) {
    return codename.trim()
  }

  const english = codename.slice(0, firstCjkIndex).trim()
  const chinese = codename.slice(firstCjkIndex).trim()

  if (language === 'zh') {
    return chinese || english || codename.trim()
  }

  return english || chinese || codename.trim()
}

function formatSyncState(status: RefreshStatus, loading: boolean, language: Language) {
  if (loading || status === 'refreshing') {
    return language === 'zh' ? '同步中' : 'Syncing'
  }

  if (status === 'degraded') {
    return language === 'zh' ? '需关注' : 'Needs attention'
  }

  return language === 'zh' ? '已同步' : 'Synced'
}

function dedupeDocs(docs: HomeDoc[]) {
  const seen = new Set<string>()

  return docs.filter((doc) => {
    const key = doc.path.trim().toLowerCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function overviewHeadline(language: Language) {
  return language === 'zh'
    ? '让多线程 AI 协作，轻盈地汇入同一个控制面。'
    : 'Bring multi-thread AI collaboration into one lighter control plane.'
}

export function OverviewPage({
  language,
  loading,
  query,
  release,
  featuredDocs,
  sections,
  health,
  generatedAt,
  onPreview,
  onOpenPath,
  onNavigate,
}: OverviewPageProps) {
  const copy =
    language === 'zh'
      ? {
          title: 'CodeWinter',
          summary: overviewHeadline(language),
          subSummary: '系统介绍、使用说明、发布基线与三个核心入口，都已经就绪。',
          baselineTitle: '当前发布基线',
          baselineChannelLabel: '发布通道',
          baselineSyncLabel: '同步状态',
          baselineCodenameLabel: '版本代号',
          updatedAt: '最后同步时间',
          statusTitle: '系统状态',
          statusHealthy: '当前实例已经处于可继续推进的状态，没有额外的控制面告警。',
          statusNeedsAttention: '当前系统仍处于早期基线阶段，下面这些信号值得优先处理：',
          coreDocsTitle: '系统核心文档',
          coreDocsSummary: '优先理解 CodeWinter 的核心协议、版本模型与升级逻辑。',
          startTitle: '开始使用',
          startSummary: '先阅读项目介绍、使用说明与当前版本说明，再进入工作台或运行态会更顺手。',
          open: '打开',
          preview: '预览',
          empty: '当前没有可展示的首页文档。',
          openWorkbench: '前往工作台',
          openRuntime: '查看运行态',
          openLibrary: '前往资料库',
          currentVersionPrefix: 'CodeWinter - ',
          startSectionKicker: '推荐入口',
          statusTagHealthy: '已就绪',
          statusTagWarning: '需关注',
        }
      : {
          title: 'CodeWinter',
          summary: overviewHeadline(language),
          subSummary:
            'System introduction, usage guidance, release baseline, and the primary entrypoints are already in place.',
          baselineTitle: 'Current release baseline',
          baselineChannelLabel: 'Release channel',
          baselineSyncLabel: 'Sync state',
          baselineCodenameLabel: 'Version codename',
          updatedAt: 'Last synced',
          statusTitle: 'System status',
          statusHealthy: 'The current instance is ready to move forward and no additional control-plane warnings are active.',
          statusNeedsAttention:
            'The system still looks like an early baseline, so these signals deserve attention first:',
          coreDocsTitle: 'Core system documents',
          coreDocsSummary:
            'Understand the central protocols, version model, and upgrade logic before expanding the workspace.',
          startTitle: 'Start here',
          startSummary:
            'Read the project introduction, usage guide, and current release notes before moving into the workbench or runtime.',
          open: 'Open',
          preview: 'Preview',
          empty: 'No home-level documents are available yet.',
          openWorkbench: 'Open Workbench',
          openRuntime: 'Open Runtime',
          openLibrary: 'Open Library',
          currentVersionPrefix: 'CodeWinter - ',
          startSectionKicker: 'Recommended entrypoints',
          statusTagHealthy: 'Healthy',
          statusTagWarning: 'Needs attention',
        }

  const filteredFeaturedDocs = featuredDocs.filter((doc) =>
    matchesQuery(
      [
        pickLocalizedText(doc.label, language),
        pickLocalizedText(doc.description, language),
        doc.path,
      ],
      query,
    ),
  )

  const filteredSections = sections.filter((section) =>
    matchesQuery(
      [
        section.id,
        pickLocalizedText(section.title, language),
        pickLocalizedText(section.description, language),
        ...section.docs.flatMap((doc) => [
          pickLocalizedText(doc.label, language),
          pickLocalizedText(doc.description, language),
          doc.path,
        ]),
      ],
      query,
    ),
  )

  const coreDocsSection = filteredSections.find((section) => section.id === 'core-docs')
  const releaseDocsSection = filteredSections.find((section) => section.id === 'release-docs')
  const releaseNotesDoc =
    releaseDocsSection?.docs.find((doc) => doc.id === 'current-release-notes') ??
    releaseDocsSection?.docs[0]

  const gettingStartedDocs = dedupeDocs(
    [...filteredFeaturedDocs, ...(releaseNotesDoc ? [releaseNotesDoc] : [])].filter(Boolean),
  )

  const localizedCodename = localizeCodename(release.codename, language)
  const releaseCodename = localizedCodename
    ? `${copy.currentVersionPrefix}${localizedCodename}`
    : '-'
  const syncState = formatSyncState(health.refreshStatus, loading, language)
  const localizedWarnings = health.warnings.map((warning) =>
    localizeHealthWarning(warning, language),
  )

  return (
    <div className="page-stack overview-page-v3">
      <section className="overview-hero-v4">
        <div className="overview-hero-copy">
          <Title level={1}>{copy.title}</Title>
          <Paragraph className="hero-lead">{copy.summary}</Paragraph>
          <Paragraph className="hero-support">{copy.subSummary}</Paragraph>
          <Space wrap>
            <Button type="primary" onClick={() => onNavigate('workbench')}>
              {copy.openWorkbench}
            </Button>
            <Button onClick={() => onNavigate('runtime')}>{copy.openRuntime}</Button>
            <Button onClick={() => onNavigate('explorer')}>{copy.openLibrary}</Button>
          </Space>
        </div>
      </section>

      <section className="surface-panel release-baseline-strip-v4">
        <div className="release-baseline-main-v4">
          <div className="baseline-icon">
            <SafetyCertificateOutlined />
          </div>
          <div className="release-baseline-main-copy">
            <span className="release-baseline-label">{copy.baselineTitle}</span>
            <strong className="baseline-primary-value">{release.version}</strong>
          </div>
        </div>

        <div className="baseline-metric">
          <span>{copy.baselineChannelLabel}</span>
          <strong>{releaseChannelLabel(release.channel, language)}</strong>
        </div>
        <div className="baseline-metric">
          <span>{copy.baselineSyncLabel}</span>
          <strong>{syncState}</strong>
        </div>
        <div className="baseline-metric baseline-metric-wide">
          <span>{copy.baselineCodenameLabel}</span>
          <strong>{releaseCodename}</strong>
        </div>
        <div className="baseline-metric baseline-metric-updated">
          <span>{copy.updatedAt}</span>
          <strong>{formatDate(generatedAt, language)}</strong>
        </div>
      </section>

      <section className="surface-panel status-banner-v4">
        <div className="status-banner-copy">
          <Title level={4}>{copy.statusTitle}</Title>
          <Paragraph>
            {localizedWarnings.length === 0 ? copy.statusHealthy : copy.statusNeedsAttention}
          </Paragraph>
          {localizedWarnings.length > 0 ? (
            <div className="status-warning-list">
              {localizedWarnings.map((warning, index) => (
                <div key={`${warning}-${index}`} className="status-warning-item">
                  <span className="activity-bullet" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <Tag color={localizedWarnings.length === 0 ? 'success' : 'warning'}>
          {localizedWarnings.length === 0 ? copy.statusTagHealthy : copy.statusTagWarning}
        </Tag>
      </section>

      <section className="section-block">
        <div className="section-block-head">
          <div>
            <Text className="section-kicker">CORE</Text>
            <Title level={3}>{copy.coreDocsTitle}</Title>
            <Paragraph>{copy.coreDocsSummary}</Paragraph>
          </div>
          <Button type="link" icon={<ArrowRightOutlined />} onClick={() => onNavigate('explorer')}>
            {copy.openLibrary}
          </Button>
        </div>

        <div className="overview-doc-grid">
          {(coreDocsSection?.docs ?? []).map((doc) => (
            <article key={doc.id} className="surface-panel document-card compact-doc-card">
              <div className="document-card-head">
                <div className="document-card-icon">
                  <ReadOutlined />
                </div>
                <div>
                  <Title level={4}>{pickLocalizedText(doc.label, language)}</Title>
                  <Paragraph>{pickLocalizedText(doc.description, language)}</Paragraph>
                </div>
              </div>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => void onPreview(pickLocalizedText(doc.label, language), doc.path)}
                >
                  {copy.preview}
                </Button>
                <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(doc.path)}>
                  {copy.open}
                </Button>
              </Space>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-block-head">
          <div>
            <Text className="section-kicker">{copy.startSectionKicker}</Text>
            <Title level={3}>{copy.startTitle}</Title>
            <Paragraph>{copy.startSummary}</Paragraph>
          </div>
        </div>

        {gettingStartedDocs.length === 0 ? (
          <div className="surface-panel empty-surface">
            <Empty description={copy.empty} />
          </div>
        ) : (
          <div className="overview-doc-grid">
            {gettingStartedDocs.map((doc) => (
              <article key={doc.id} className="surface-panel document-card">
              <div className="document-card-head">
                <div className="document-card-icon">
                  <ReadOutlined />
                </div>
                <div>
                  <Title level={4}>{pickLocalizedText(doc.label, language)}</Title>
                  <Paragraph>{pickLocalizedText(doc.description, language)}</Paragraph>
                </div>
              </div>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => void onPreview(pickLocalizedText(doc.label, language), doc.path)}
                  >
                    {copy.preview}
                  </Button>
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(doc.path)}>
                    {copy.open}
                  </Button>
                </Space>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
