import {
  CompassOutlined,
  DeploymentUnitOutlined,
  FolderOpenOutlined,
  RadarChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  App as AntdApp,
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Menu,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { BrandMark } from './components/BrandMark'
import { PreviewPane, type PreviewState } from './components/PreviewPane'
import {
  explainRefreshStatus,
  explainReleaseChannel,
  explainSnapshotVersion,
  formatRefreshStatus,
  formatReleaseChannel,
  formatSnapshotVersion,
  getInitialLanguage,
  localizeHealthWarning,
  persistLanguage,
} from './lib/i18n'
import type { Language } from './lib/i18n'
import { ExplorerPage } from './pages/ExplorerPage'
import { RuntimePage } from './pages/RuntimePage'
import { WorkbenchPage } from './pages/WorkbenchPage'
import { useConsoleSnapshot } from './stores/useConsoleSnapshot'

const { Header, Sider, Content } = Layout
const { Paragraph, Text, Title } = Typography

type TabKey = 'workbench' | 'runtime' | 'explorer'

const consoleTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#DD6B20',
    colorSuccess: '#18794E',
    colorWarning: '#B45309',
    colorError: '#C2410C',
    colorInfo: '#2563EB',
    colorBgBase: '#F6F4EF',
    colorBgLayout: '#F6F4EF',
    colorBgContainer: '#FFFDF9',
    colorBorderSecondary: '#E7DFD4',
    colorText: '#1F2937',
    colorTextSecondary: '#6B7280',
    borderRadius: 16,
    borderRadiusLG: 24,
    boxShadowSecondary: '0 18px 48px rgba(15, 23, 42, 0.08)',
    fontFamily:
      "'SF Pro Display','PingFang SC','Segoe UI','Noto Sans SC','Microsoft YaHei UI',sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#FFFCF7',
      headerBg: 'rgba(255, 253, 249, 0.8)',
      bodyBg: '#F6F4EF',
    },
    Menu: {
      itemBorderRadius: 14,
      itemHeight: 44,
      itemSelectedBg: '#FFF1E8',
      itemSelectedColor: '#B45309',
      itemColor: '#475569',
    },
    Card: {
      borderRadiusLG: 24,
    },
    Drawer: {
      colorBgElevated: '#FFFDF9',
    },
    Button: {
      controlHeight: 40,
      borderRadius: 12,
    },
    Tag: {
      borderRadiusSM: 999,
    },
  },
} as const

function formatTimestamp(value: string | undefined, language: Language) {
  if (!value) {
    return language === 'zh' ? '未记录' : 'Not recorded'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
    hour12: false,
  })
}

function getTabs(language: Language): Array<{
  key: TabKey
  label: string
  description: string
  icon: ReactNode
}> {
  return [
    {
      key: 'workbench',
      label: language === 'zh' ? '工作台' : 'Workbench',
      description:
        language === 'zh' ? '高频操作入口与正式输出' : 'High-frequency operator actions',
      icon: <CompassOutlined />,
    },
    {
      key: 'runtime',
      label: language === 'zh' ? '运行态' : 'Runtime',
      description:
        language === 'zh' ? '线程与协作运行情况' : 'Thread and collaboration runtime',
      icon: <RadarChartOutlined />,
    },
    {
      key: 'explorer',
      label: language === 'zh' ? '浏览器' : 'Explorer',
      description:
        language === 'zh' ? '控制面与发布入口' : 'Control plane and release entrypoints',
      icon: <DeploymentUnitOutlined />,
    },
  ]
}

function getAppCopy(language: Language) {
  if (language === 'zh') {
    return {
      operatorConsole: '操作台',
      currentReleaseFallback: '当前发布',
      designLine: '设计方向',
      designSummary: 'Warm Precision：更像长期使用的内部操作台，而不是宣传页。',
      openCodeWinter: '打开 CodeWinter',
      refresh: '刷新',
      generatedAt: '生成时间',
      lastGoodAt: '最近稳定快照',
      refreshFailed: '刷新失败',
      previewTitle: '预览',
      previewPanelTitle: '内容预览',
      closePreview: '关闭预览',
    }
  }

  return {
    operatorConsole: 'Operator Console',
    currentReleaseFallback: 'Current release',
    designLine: 'Design Line',
    designSummary:
      'Warm Precision: an internal operator console meant for repeated use, not a marketing page.',
    openCodeWinter: 'Open CodeWinter',
    refresh: 'Refresh',
    generatedAt: 'Generated',
    lastGoodAt: 'Last good snapshot',
    refreshFailed: 'Refresh failed',
    previewTitle: 'Preview',
    previewPanelTitle: 'Preview',
    closePreview: 'Close preview',
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('workbench')
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [preview, setPreview] = useState<PreviewState>({
    title: 'Preview',
    body: '',
    loading: false,
  })

  const {
    snapshot,
    loading,
    error,
    uploadFeedbacks,
    refresh,
    copyPrompt,
    previewTextFile,
    revealPath,
    uploadFile,
  } = useConsoleSnapshot()

  useEffect(() => {
    persistLanguage(language)
  }, [language])

  const copy = getAppCopy(language)
  const tabs = useMemo(() => getTabs(language), [language])
  const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0]
  const menuItems = useMemo(
    () =>
      tabs.map((tab) => ({
        key: tab.key,
        icon: tab.icon,
        label: tab.label,
      })),
    [tabs],
  )

  const handlePreview = async (title: string, path: string) => {
    setPreviewOpen(true)
    setPreview({
      title,
      path,
      body: '',
      loading: true,
    })

    try {
      const text = await previewTextFile(path)
      setPreview({
        title,
        path,
        body: text,
        loading: false,
      })
    } catch (previewError) {
      setPreview({
        title,
        path,
        body:
          previewError instanceof Error
            ? previewError.message
            : language === 'zh'
              ? '读取失败。'
              : 'Failed to read the selected file.',
        loading: false,
      })
    }
  }

  return (
    <ConfigProvider theme={consoleTheme}>
      <AntdApp>
        <Layout className="console-shell">
          <Sider width={248} className="console-sider" theme="light">
            <div className="console-brand">
              <BrandMark size={42} />
              <div>
                <Title level={4}>CodeWinter</Title>
                <Text type="secondary">{copy.operatorConsole}</Text>
              </div>
            </div>

            <div className="console-release-pill">
              <Tag color="orange">{snapshot.release.version}</Tag>
              <Text type="secondary">
                {snapshot.release.codename ?? copy.currentReleaseFallback}
              </Text>
            </div>

            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              items={menuItems}
              onClick={(event) => setActiveTab(event.key as TabKey)}
            />

            <div className="console-sider-foot">
              <Text className="section-kicker">{copy.designLine}</Text>
              <Paragraph type="secondary">{copy.designSummary}</Paragraph>
            </div>
          </Sider>

          <Layout className="console-main">
            <Header className="console-header">
              <div>
                <Text className="section-kicker">{currentTab.label}</Text>
                <Title level={3}>{currentTab.description}</Title>
              </div>
              <Space wrap>
                <Tooltip title={explainRefreshStatus(snapshot.health.refreshStatus, language)}>
                  <Tag color={snapshot.health.refreshStatus === 'degraded' ? 'warning' : 'default'}>
                    {formatRefreshStatus(snapshot.health.refreshStatus, language)}
                  </Tag>
                </Tooltip>
                <Tooltip title={explainReleaseChannel(snapshot.release.channel, language)}>
                  <Tag>{formatReleaseChannel(snapshot.release.channel, language)}</Tag>
                </Tooltip>
                <Segmented<Language>
                  value={language}
                  size="middle"
                  options={[
                    { label: 'EN', value: 'en' },
                    { label: '中文', value: 'zh' },
                  ]}
                  onChange={(value) => setLanguage(value)}
                />
                <Tooltip title={explainSnapshotVersion(snapshot.snapshotVersion, language)}>
                  <Text type="secondary" className="console-meta-inline">
                    {formatSnapshotVersion(snapshot.snapshotVersion, language)}
                  </Text>
                </Tooltip>
                <Button
                  icon={<FolderOpenOutlined />}
                  onClick={() => void revealPath(snapshot.codewinterRoot)}
                >
                  {copy.openCodeWinter}
                </Button>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={() => void refresh()}
                >
                  {copy.refresh}
                </Button>
              </Space>
            </Header>

            <Content className="console-content">
              <div className="console-status-bar">
                <Space wrap>
                  <Text type="secondary">
                    {copy.generatedAt}: {formatTimestamp(snapshot.generatedAt, language)}
                  </Text>
                  <Text type="secondary">
                    {copy.lastGoodAt}: {formatTimestamp(snapshot.health.lastGoodAt, language)}
                  </Text>
                  {snapshot.health.warnings.map((warning) => (
                    <Tooltip key={warning} title={localizeHealthWarning(warning, language)}>
                      <Tag color="warning">{localizeHealthWarning(warning, language)}</Tag>
                    </Tooltip>
                  ))}
                </Space>
                {error ? (
                  <Tag color="error">
                    {copy.refreshFailed}: {error}
                  </Tag>
                ) : null}
              </div>

              <section className="console-view">
                {activeTab === 'workbench' ? (
                  <WorkbenchPage
                    language={language}
                    prompts={snapshot.workbench.prompts}
                    uploadZones={snapshot.workbench.uploadZones}
                    deliverableGroups={snapshot.workbench.deliverableGroups}
                    uploadFeedbacks={uploadFeedbacks}
                    onCopyPrompt={copyPrompt}
                    onPreview={handlePreview}
                    onOpenPath={revealPath}
                    onUploadFile={uploadFile}
                  />
                ) : null}

                {activeTab === 'runtime' ? (
                  <RuntimePage
                    language={language}
                    managerLeaseHolder={snapshot.runtime.managerLeaseHolder}
                    threads={snapshot.runtime.threads}
                    collabRequests={snapshot.runtime.collabRequests}
                    alerts={snapshot.runtime.alerts}
                    onOpenPath={revealPath}
                  />
                ) : null}

                {activeTab === 'explorer' ? (
                  <ExplorerPage
                    language={language}
                    managerBriefSections={snapshot.managerBrief.sections}
                    instanceSections={snapshot.instanceManifest.sections}
                    entries={snapshot.explorer.entries}
                    onPreview={handlePreview}
                    onOpenPath={revealPath}
                  />
                ) : null}
              </section>
            </Content>
          </Layout>
        </Layout>

        <Drawer
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          width={640}
          title={copy.previewPanelTitle}
          className="console-preview-drawer"
          destroyOnClose={false}
        >
          <PreviewPane
            language={language}
            preview={{
              ...preview,
              title: preview.title || copy.previewTitle,
            }}
            onOpenPath={revealPath}
          />
        </Drawer>
      </AntdApp>
    </ConfigProvider>
  )
}
