import {
  BellOutlined,
  BookOutlined,
  CloseOutlined,
  CompassOutlined,
  FolderOpenOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HomeOutlined,
  MinusOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  App as AntdApp,
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Input,
  Segmented,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd'
import { Suspense, lazy, type ReactNode, useEffect, useMemo, useState } from 'react'
import { BrandMark } from './components/BrandMark'
import type { PreviewState } from './components/PreviewPane'
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
import {
  closeWindow,
  isTauriRuntime,
  isWindowMaximized,
  listenWindowResize,
  minimizeWindow,
  toggleMaximizeWindow,
} from './lib/tauri'
import { useConsoleSnapshot } from './stores/useConsoleSnapshot'
import type { RefreshStatus } from './types/snapshot'

const PreviewPane = lazy(() =>
  import('./components/PreviewPane').then((module) => ({ default: module.PreviewPane })),
)
const OverviewPage = lazy(() =>
  import('./pages/OverviewPage').then((module) => ({ default: module.OverviewPage })),
)
const WorkbenchPage = lazy(() =>
  import('./pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage })),
)
const RuntimePage = lazy(() =>
  import('./pages/RuntimePage').then((module) => ({ default: module.RuntimePage })),
)
const ExplorerPage = lazy(() =>
  import('./pages/ExplorerPage').then((module) => ({ default: module.ExplorerPage })),
)

const { Text } = Typography

type TabKey = 'overview' | 'workbench' | 'runtime' | 'explorer'

const consoleTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#6b63ff',
    colorSuccess: '#2fba8c',
    colorWarning: '#f0a04b',
    colorError: '#d96b7c',
    colorBgBase: '#f6f7fb',
    colorBgLayout: '#f6f7fb',
    colorBgContainer: '#ffffff',
    colorText: '#182132',
    colorTextSecondary: '#7f879a',
    colorBorderSecondary: '#e8ebf4',
    borderRadius: 18,
    borderRadiusLG: 28,
    fontFamily:
      "'SF Pro Display','SF Pro Text','PingFang SC','Segoe UI Variable','Inter','Noto Sans SC','Microsoft YaHei UI',sans-serif",
    boxShadowSecondary: '0 24px 60px rgba(46, 57, 92, 0.08)',
  },
  components: {
    Button: {
      borderRadius: 999,
      controlHeight: 42,
      primaryShadow: 'none',
    },
    Input: {
      borderRadius: 999,
      activeShadow: 'none',
      activeBorderColor: '#dfe4f4',
      hoverBorderColor: '#dfe4f4',
    },
    Segmented: {
      trackBg: 'rgba(248,249,255,0.72)',
      itemSelectedBg: 'rgba(255,255,255,0.96)',
    },
    Drawer: {
      colorBgElevated: 'rgba(249,250,255,0.86)',
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
      key: 'overview',
      label: language === 'zh' ? '总览' : 'Overview',
      description:
        language === 'zh'
          ? '系统首页、发布基线与核心入口'
          : 'Landing view, release baseline, and core entrypoints',
      icon: <HomeOutlined />,
    },
    {
      key: 'workbench',
      label: language === 'zh' ? '工作台' : 'Workbench',
      description:
        language === 'zh'
          ? '提示词、投递入口与正式输出'
          : 'Prompts, intake flows, and deliverable access',
      icon: <CompassOutlined />,
    },
    {
      key: 'runtime',
      label: language === 'zh' ? '运行态' : 'Runtime',
      description:
        language === 'zh'
          ? '线程、协作请求与编排信号'
          : 'Threads, collaboration requests, and orchestration signals',
      icon: <RadarChartOutlined />,
    },
    {
      key: 'explorer',
      label: language === 'zh' ? '资料库' : 'Library',
      description:
        language === 'zh'
          ? '控制面、实例基线与系统资料'
          : 'Control plane, instance baseline, and system materials',
      icon: <BookOutlined />,
    },
  ]
}

function getShellCopy(language: Language) {
  if (language === 'zh') {
    return {
      title: 'Operator Console',
      subtitle: 'WINTER ETHER V1.0',
      searchPlaceholder: '搜索提示词、任务、线程或系统资料…',
      openWorkspace: '打开工作区',
      refresh: '刷新',
      notifications: '通知',
      account: '当前账户',
      settings: '设置',
      statusLabel: '系统状态',
      generatedAt: '生成时间',
      lastGoodAt: '最近稳定快照',
      refreshFailed: '刷新失败',
      synced: '实时同步中',
      projectionHint: '投影视图版本',
      minimize: '最小化',
      maximize: '最大化',
      restore: '还原',
      close: '关闭',
      previewPanelTitle: '内容预览',
      pageLoading: '正在加载页面内容…',
      footerRole: 'Level 4 Access',
    }
  }

  return {
    title: 'Operator Console',
    subtitle: 'WINTER ETHER V1.0',
    searchPlaceholder: 'Search prompts, tasks, threads, or system materials…',
    openWorkspace: 'Open workspace',
    refresh: 'Refresh',
    notifications: 'Notifications',
    account: 'Current account',
    settings: 'Settings',
    statusLabel: 'System status',
    generatedAt: 'Generated',
    lastGoodAt: 'Last good snapshot',
    refreshFailed: 'Refresh failed',
    synced: 'Realtime synced',
    projectionHint: 'Projection schema',
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    close: 'Close',
    previewPanelTitle: 'Content Preview',
    pageLoading: 'Loading page content…',
    footerRole: 'Level 4 Access',
  }
}

function PageLoadingFallback({ language }: { language: Language }) {
  const copy = getShellCopy(language)

  return (
    <div className="console-page-loading">
      <div className="loading-orb" />
      <Text type="secondary">{copy.pageLoading}</Text>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [windowMaximized, setWindowMaximized] = useState(false)
  const [topSearch, setTopSearch] = useState('')
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

  useEffect(() => {
    if (!isTauriRuntime()) {
      return undefined
    }

    let dispose: (() => void) | undefined

    const syncWindowState = async () => {
      setWindowMaximized(await isWindowMaximized())
    }

    const init = async () => {
      await syncWindowState()
      dispose = await listenWindowResize(() => {
        void syncWindowState()
      })
    }

    void init()

    return () => {
      dispose?.()
    }
  }, [])

  const tabs = useMemo(() => getTabs(language), [language])
  const copy = getShellCopy(language)
  const hasNativeWindowControls = isTauriRuntime()
  const query = topSearch.trim().toLowerCase()
  const effectiveRefreshStatus: RefreshStatus = loading ? 'refreshing' : snapshot.health.refreshStatus

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

  const handleToggleWindow = async () => {
    const next = await toggleMaximizeWindow()
    setWindowMaximized(next)
  }

  return (
    <ConfigProvider theme={consoleTheme}>
      <AntdApp>
        <div className="console-shell console-shell-v4" data-active-tab={activeTab}>
          <aside className="console-sider console-sider-v4">
            <div className="console-brand-block">
              <BrandMark size={44} />
              <div className="console-brand-copy">
                <strong>{copy.title}</strong>
                <span>{copy.subtitle}</span>
              </div>
            </div>

            <nav className="console-nav console-nav-v4" aria-label="Primary navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className="nav-link nav-link-v4"
                  data-active={activeTab === tab.key ? 'true' : 'false'}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="nav-link-icon">{tab.icon}</span>
                  <span className="nav-link-copy">
                    <strong>{tab.label}</strong>
                    <span>{tab.description}</span>
                  </span>
                </button>
              ))}
            </nav>

            <div className="console-sider-foot">
              <button type="button" className="sider-utility-link">
                <SettingOutlined />
                <span>{copy.settings}</span>
              </button>
              <div className="operator-card">
                <Avatar size={34} icon={<UserOutlined />} />
                <div>
                  <strong>Winter_Op</strong>
                  <span>{copy.footerRole}</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="console-main">
            <header
              className="window-chrome window-chrome-v4"
              data-tauri-drag-region={hasNativeWindowControls ? 'true' : undefined}
              onDoubleClick={() => {
                if (hasNativeWindowControls) {
                  void handleToggleWindow()
                }
              }}
            >
              <div
                className="window-chrome-context"
                data-tauri-drag-region={hasNativeWindowControls ? 'true' : undefined}
              >
                <span className="window-context-brand">CodeWinter Operator</span>
              </div>

              <div className="window-toolbar window-toolbar-v4">
                <div className="window-search no-drag">
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder={copy.searchPlaceholder}
                    value={topSearch}
                    onChange={(event) => setTopSearch(event.target.value)}
                    allowClear
                  />
                </div>

                <div className="window-toolbar-actions no-drag">
                  <Tooltip title={copy.notifications}>
                    <button type="button" className="toolbar-icon-button">
                      <BellOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title={copy.account}>
                    <button type="button" className="toolbar-icon-button">
                      <UserOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title={explainRefreshStatus(effectiveRefreshStatus, language)}>
                    <Tag className="toolbar-pill toolbar-pill-status">
                      {formatRefreshStatus(effectiveRefreshStatus, language)}
                    </Tag>
                  </Tooltip>
                  <Tooltip title={explainReleaseChannel(snapshot.release.channel, language)}>
                    <Tag className="toolbar-pill">
                      {formatReleaseChannel(snapshot.release.channel, language)}
                    </Tag>
                  </Tooltip>
                  <Tooltip title={explainSnapshotVersion(snapshot.snapshotVersion, language)}>
                    <Text className="projection-label">
                      {formatSnapshotVersion(snapshot.snapshotVersion, language)}
                    </Text>
                  </Tooltip>
                  <Segmented<Language>
                    value={language}
                    options={[
                      { label: 'EN', value: 'en' },
                      { label: '中文', value: 'zh' },
                    ]}
                    onChange={(value) => setLanguage(value)}
                  />
                  {hasNativeWindowControls ? (
                    <div className="window-controls no-drag">
                      <button
                        type="button"
                        className="window-control"
                        onClick={() => void minimizeWindow()}
                        aria-label={copy.minimize}
                      >
                        <MinusOutlined />
                      </button>
                      <button
                        type="button"
                        className="window-control"
                        onClick={() => void handleToggleWindow()}
                        aria-label={windowMaximized ? copy.restore : copy.maximize}
                      >
                        {windowMaximized ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                      </button>
                      <button
                        type="button"
                        className="window-control close"
                        onClick={() => void closeWindow()}
                        aria-label={copy.close}
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </header>

            <div className="console-status-row">
              <div className="status-row-left">
                <span className="status-row-label">{copy.statusLabel}</span>
                <span className="status-row-dot" />
                <span>{copy.synced}</span>
                <span className="status-row-separator" />
                <span>
                  {copy.generatedAt}: {formatTimestamp(snapshot.generatedAt, language)}
                </span>
                <span className="status-row-separator" />
                <span>
                  {copy.lastGoodAt}: {formatTimestamp(snapshot.health.lastGoodAt, language)}
                </span>
              </div>

              <div className="status-row-right">
                {snapshot.health.warnings.map((warning) => (
                  <Tooltip key={warning} title={localizeHealthWarning(warning, language)}>
                    <Tag color="warning">{localizeHealthWarning(warning, language)}</Tag>
                  </Tooltip>
                ))}
                {error ? (
                  <Tag color="error">
                    {copy.refreshFailed}: {error}
                  </Tag>
                ) : null}
                <Button icon={<FolderOpenOutlined />} onClick={() => void revealPath(snapshot.codewinterRoot)}>
                  {copy.openWorkspace}
                </Button>
                <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={() => void refresh()}>
                  {copy.refresh}
                </Button>
              </div>
            </div>

            <main className="console-main-scroll">
              <section className="console-main-surface">
                <Suspense fallback={<PageLoadingFallback language={language} />}>
                  {activeTab === 'overview' ? (
                    <OverviewPage
                      language={language}
                      loading={loading}
                      query={query}
                      release={snapshot.release}
                      featuredDocs={snapshot.home.featuredDocs}
                      sections={snapshot.home.sections}
                      health={snapshot.health}
                      generatedAt={snapshot.generatedAt}
                      onPreview={handlePreview}
                      onOpenPath={revealPath}
                      onNavigate={setActiveTab}
                    />
                  ) : null}

                  {activeTab === 'workbench' ? (
                    <WorkbenchPage
                      language={language}
                      query={query}
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
                      query={query}
                      managerLeaseHolder={snapshot.runtime.managerLeaseHolder}
                      threads={snapshot.runtime.threads}
                      collabRequests={snapshot.runtime.collabRequests}
                      signals={snapshot.runtime.signals}
                      alerts={snapshot.runtime.alerts}
                      onOpenPath={revealPath}
                    />
                  ) : null}

                  {activeTab === 'explorer' ? (
                    <ExplorerPage
                      language={language}
                      query={query}
                      managerBriefSections={snapshot.managerBrief.sections}
                      instanceSections={snapshot.instanceManifest.sections}
                      entries={snapshot.explorer.entries}
                      onPreview={handlePreview}
                      onOpenPath={revealPath}
                    />
                  ) : null}
                </Suspense>
              </section>
            </main>
          </div>

          <Drawer
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            width={760}
            title={copy.previewPanelTitle}
            className="console-preview-drawer"
            destroyOnClose={false}
          >
            <Suspense fallback={<PageLoadingFallback language={language} />}>
              <PreviewPane
                language={language}
                preview={{
                  ...preview,
                  title: preview.title || copy.previewPanelTitle,
                }}
                onOpenPath={revealPath}
              />
            </Suspense>
          </Drawer>
        </div>
      </AntdApp>
    </ConfigProvider>
  )
}
