import {
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
} from '@ant-design/icons'
import {
  App as AntdApp,
  Button,
  ConfigProvider,
  Drawer,
  Segmented,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd'
import {
  Suspense,
  lazy,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

const { Paragraph, Text, Title } = Typography

type TabKey = 'overview' | 'workbench' | 'runtime' | 'explorer'

const consoleTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#6B8AFF',
    colorSuccess: '#1D8A68',
    colorWarning: '#C88A31',
    colorError: '#C45D49',
    colorInfo: '#6B8AFF',
    colorBgBase: '#EEF4FB',
    colorBgLayout: '#EEF4FB',
    colorBgContainer: '#FCFDFF',
    colorBorderSecondary: '#DAE5F3',
    colorText: '#142336',
    colorTextSecondary: '#657488',
    borderRadius: 18,
    borderRadiusLG: 30,
    boxShadowSecondary: '0 28px 72px rgba(17, 32, 54, 0.12)',
    fontFamily:
      "'SF Pro Display','SF Pro Text','PingFang SC','Segoe UI','Inter','Noto Sans SC','Microsoft YaHei UI',sans-serif",
  },
  components: {
    Drawer: {
      colorBgElevated: 'rgba(246, 250, 255, 0.8)',
    },
    Button: {
      controlHeight: 42,
      borderRadius: 999,
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
      label: language === 'zh' ? '首页' : 'Overview',
      description:
        language === 'zh'
          ? '系统介绍、使用说明与当前发布基线'
          : 'System introduction, usage guidance, and the current release baseline',
      icon: <HomeOutlined />,
    },
    {
      key: 'workbench',
      label: language === 'zh' ? '工作台' : 'Workbench',
      description:
        language === 'zh'
          ? '高频提示词、安全投递区与正式输出入口'
          : 'High-frequency prompts, safe intake zones, and deliverable access',
      icon: <CompassOutlined />,
    },
    {
      key: 'runtime',
      label: language === 'zh' ? '运行态' : 'Runtime',
      description:
        language === 'zh'
          ? '线程、协作请求与实时编排信号'
          : 'Threads, collaboration requests, and live orchestration signals',
      icon: <RadarChartOutlined />,
    },
    {
      key: 'explorer',
      label: language === 'zh' ? '资料库' : 'Library',
      description:
        language === 'zh'
          ? '控制面、实例基线与系统资料入口'
          : 'Control plane, instance baseline, and system reference entrypoints',
      icon: <BookOutlined />,
    },
  ]
}

function getAppCopy(language: Language) {
  if (language === 'zh') {
    return {
      operatorConsole: 'Operator Console',
      releaseFallback: '当前发布',
      shellKicker: '动态材质工作区',
      shellSummary:
        '让内容保持主导，让导航、状态与操作退后成一层更轻、更柔和、更会呼吸的操作材质。',
      openCodeWinter: '打开工作区',
      refresh: '刷新',
      generatedAt: '生成时间',
      lastGoodAt: '最近稳定快照',
      refreshFailed: '刷新失败',
      previewTitle: '预览',
      previewPanelTitle: '内容预览',
      statusRail: '系统状态',
      chromeTitle: 'CodeWinter',
      chromeSubtitle: 'Multi-thread AI collaboration control plane',
      minimize: '最小化',
      maximize: '最大化',
      restore: '还原窗口',
      close: '关闭',
      language: '语言',
      snapshotHint: '投影视图版本',
    }
  }

  return {
    operatorConsole: 'Operator Console',
    releaseFallback: 'Current release',
    shellKicker: 'Responsive Material Workspace',
              shellSummary:
        'Let content lead while navigation, status, and controls settle into a lighter responsive layer.',
    openCodeWinter: 'Open workspace',
    refresh: 'Refresh',
    generatedAt: 'Generated',
    lastGoodAt: 'Last good snapshot',
    refreshFailed: 'Refresh failed',
    previewTitle: 'Preview',
    previewPanelTitle: 'Content Preview',
    statusRail: 'System status',
    chromeTitle: 'CodeWinter',
    chromeSubtitle: 'Multi-thread AI collaboration control plane',
      minimize: 'Minimize',
      maximize: 'Maximize',
      restore: 'Restore',
    close: 'Close',
    language: 'Language',
    snapshotHint: 'Projection version',
  }
}

function PageLoadingFallback({ language }: { language: Language }) {
  return (
    <div className="console-page-loading">
      <Spin size="large" />
      <Text type="secondary">
        {language === 'zh' ? '正在加载页面内容…' : 'Loading page content…'}
      </Text>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [windowMaximized, setWindowMaximized] = useState(false)
  const [preview, setPreview] = useState<PreviewState>({
    title: 'Preview',
    body: '',
    loading: false,
  })
  const shellRef = useRef<HTMLDivElement | null>(null)

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
    const shell = shellRef.current
    if (!shell) {
      return undefined
    }

    let frame = 0
    const state = {
      pointerX: 68,
      pointerY: 18,
      shiftX: 0,
      shiftY: 0,
      scroll: 0,
    }

    const apply = () => {
      frame = 0
      shell.style.setProperty('--pointer-x', `${state.pointerX}%`)
      shell.style.setProperty('--pointer-y', `${state.pointerY}%`)
      shell.style.setProperty('--pointer-shift-x', `${state.shiftX.toFixed(2)}px`)
      shell.style.setProperty('--pointer-shift-y', `${state.shiftY.toFixed(2)}px`)
      shell.style.setProperty('--scroll-progress', state.scroll.toFixed(3))
      shell.dataset.scrolled = state.scroll > 0.035 ? 'true' : 'false'
    }

    const schedule = () => {
      if (frame !== 0) {
        return
      }
      frame = window.requestAnimationFrame(apply)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return
      }

      const nextX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      const nextY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))

      state.pointerX = +(nextX * 100).toFixed(2)
      state.pointerY = +(nextY * 100).toFixed(2)
      state.shiftX = (nextX - 0.5) * 30
      state.shiftY = (nextY - 0.5) * 20
      schedule()
    }

    const resetPointer = () => {
      state.pointerX = 68
      state.pointerY = 18
      state.shiftX = 0
      state.shiftY = 0
      schedule()
    }

    const handleScroll = () => {
      const scrollRoot = document.scrollingElement ?? document.documentElement
      const max = Math.max(1, scrollRoot.scrollHeight - window.innerHeight)
      state.scroll = Math.min(1, window.scrollY / max)
      schedule()
    }

    shell.addEventListener('pointermove', handlePointerMove)
    shell.addEventListener('pointerleave', resetPointer)
    window.addEventListener('scroll', handleScroll, { passive: true })

    handleScroll()
    schedule()

    return () => {
      shell.removeEventListener('pointermove', handlePointerMove)
      shell.removeEventListener('pointerleave', resetPointer)
      window.removeEventListener('scroll', handleScroll)
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

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

  const copy = getAppCopy(language)
  const tabs = useMemo(() => getTabs(language), [language])
  const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0]
  const hasNativeWindowControls = isTauriRuntime()

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
        <div
          ref={shellRef}
          className="console-shell"
          data-active-tab={activeTab}
          data-preview-open={previewOpen ? 'true' : 'false'}
          data-window-maximized={windowMaximized ? 'true' : 'false'}
        >
          <div className="window-frame" data-maximized={windowMaximized ? 'true' : 'false'}>
            <header
              className="window-chrome"
              data-tauri-drag-region={hasNativeWindowControls ? 'true' : undefined}
              onDoubleClick={() => {
                if (hasNativeWindowControls) {
                  void handleToggleWindow()
                }
              }}
            >
              <div
                className="window-brand"
              >
                <BrandMark size={38} />
                <div className="window-brand-copy">
                  <Text strong>{copy.chromeTitle}</Text>
                  <Text type="secondary">{copy.chromeSubtitle}</Text>
                </div>
              </div>

              <div className="window-toolbar">
                <div
                  className="window-toolbar-passive"
                  data-tauri-drag-region={hasNativeWindowControls ? 'true' : undefined}
                >
                  <Tooltip title={explainRefreshStatus(snapshot.health.refreshStatus, language)}>
                    <Tag
                      className="status-chip"
                      color={snapshot.health.refreshStatus === 'degraded' ? 'warning' : 'default'}
                    >
                      {formatRefreshStatus(snapshot.health.refreshStatus, language)}
                    </Tag>
                  </Tooltip>
                  <Tooltip title={explainReleaseChannel(snapshot.release.channel, language)}>
                    <Tag className="status-chip">
                      {formatReleaseChannel(snapshot.release.channel, language)}
                    </Tag>
                  </Tooltip>
                  <Tooltip title={copy.snapshotHint}>
                    <Text type="secondary" className="console-meta-inline">
                      {formatSnapshotVersion(snapshot.snapshotVersion, language)}
                    </Text>
                  </Tooltip>
                </div>
                <Segmented<Language>
                  value={language}
                  size="middle"
                  options={[
                    { label: 'EN', value: 'en' },
                    { label: '中文', value: 'zh' },
                  ]}
                  onChange={(value) => setLanguage(value)}
                />
                {hasNativeWindowControls ? (
                  <div className="window-controls">
                    <Tooltip title={copy.minimize}>
                      <button
                        type="button"
                        className="window-control"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={() => void minimizeWindow()}
                        aria-label={copy.minimize}
                      >
                        <MinusOutlined />
                      </button>
                    </Tooltip>
                    <Tooltip title={windowMaximized ? copy.restore : copy.maximize}>
                      <button
                        type="button"
                        className="window-control"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={() => void handleToggleWindow()}
                        aria-label={windowMaximized ? copy.restore : copy.maximize}
                      >
                        {windowMaximized ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                      </button>
                    </Tooltip>
                    <Tooltip title={copy.close}>
                      <button
                        type="button"
                        className="window-control close"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={() => void closeWindow()}
                        aria-label={copy.close}
                      >
                        <CloseOutlined />
                      </button>
                    </Tooltip>
                  </div>
                ) : null}
              </div>
            </header>

            <div className="window-body">
              <aside className="console-sider">
                <div className="console-release-pill">
                  <div className="release-pill-head">
                    <Tag color="blue">{snapshot.release.version}</Tag>
                    <Tag>{formatReleaseChannel(snapshot.release.channel, language)}</Tag>
                  </div>
                  <Text strong>{snapshot.release.codename ?? copy.releaseFallback}</Text>
                  <Text type="secondary">
                    {snapshot.release.theme ??
                      (language === 'zh' ? '尚未标注发布主题' : 'No release theme label')}
                  </Text>
                </div>

                <nav className="console-nav" aria-label="Primary navigation">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className="nav-button"
                      data-active={activeTab === tab.key ? 'true' : 'false'}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <span className="nav-button-icon">{tab.icon}</span>
                      <span className="nav-button-copy">
                        <span className="nav-button-label">{tab.label}</span>
                        <span className="nav-button-description">{tab.description}</span>
                      </span>
                    </button>
                  ))}
                </nav>

                <div className="console-sider-foot">
                  <Text className="section-kicker">{copy.shellKicker}</Text>
                  <Paragraph type="secondary">{copy.shellSummary}</Paragraph>
                </div>
              </aside>

              <main className="console-main">
                <section className="console-header">
                  <div className="console-header-copy">
                    <Text className="section-kicker">{currentTab.label}</Text>
                    <Title level={3}>{currentTab.description}</Title>
                  </div>
                  <Space wrap size={10}>
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
                </section>

                <section className="console-content">
                  <div className="console-status-bar">
                    <div className="status-bar-heading">
                      <Text className="section-kicker">{copy.statusRail}</Text>
                    </div>
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
                    <Suspense fallback={<PageLoadingFallback language={language} />}>
                      {activeTab === 'overview' ? (
                        <OverviewPage
                          language={language}
                          release={snapshot.release}
                          featuredDocs={snapshot.home.featuredDocs}
                          sections={snapshot.home.sections}
                          onPreview={handlePreview}
                          onOpenPath={revealPath}
                        />
                      ) : null}

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
                    </Suspense>
                  </section>
                </section>
              </main>
            </div>
          </div>

          <Drawer
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            width={820}
            title={copy.previewPanelTitle}
            className="console-preview-drawer"
            destroyOnClose={false}
          >
            <Suspense fallback={<PageLoadingFallback language={language} />}>
              <PreviewPane
                language={language}
                preview={{
                  ...preview,
                  title: preview.title || copy.previewTitle,
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
