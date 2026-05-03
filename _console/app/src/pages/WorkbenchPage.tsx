import {
  CopyOutlined,
  EyeOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Empty, Space, Tag, Typography } from 'antd'
import { useId } from 'react'
import { pickLocalizedText } from '../lib/i18n'
import type { Language } from '../lib/i18n'
import type {
  DeliverableGroup,
  DeliverableItem,
  PromptEntry,
  UploadFeedback,
  UploadTarget,
  UploadZone,
} from '../types/snapshot'

const { Paragraph, Text, Title } = Typography

interface WorkbenchPageProps {
  language: Language
  query: string
  prompts: PromptEntry[]
  uploadZones: UploadZone[]
  deliverableGroups: DeliverableGroup[]
  uploadFeedbacks: Record<UploadTarget, UploadFeedback>
  onCopyPrompt: (entry: PromptEntry) => Promise<void>
  onPreview: (label: string, path: string) => Promise<void>
  onOpenPath: (path: string) => Promise<void>
  onUploadFile: (target: UploadTarget, file: File) => Promise<void>
}

function kindColor(kind: DeliverableItem['kind']) {
  switch (kind) {
    case 'final':
      return 'success'
    case 'index':
      return 'processing'
    case 'thread-output':
      return 'warning'
    default:
      return 'default'
  }
}

function kindLabel(kind: DeliverableItem['kind'], language: Language) {
  switch (kind) {
    case 'final':
      return language === 'zh' ? '正式版' : 'Final'
    case 'index':
      return 'Index'
    case 'thread-output':
      return language === 'zh' ? '线程输出' : 'Thread Output'
    default:
      return language === 'zh' ? '其他' : 'Other'
  }
}

function uploadStateLabel(state: UploadFeedback['state'], language: Language) {
  switch (state) {
    case 'uploading':
      return language === 'zh' ? '写入中' : 'Uploading'
    case 'done':
      return language === 'zh' ? '已完成' : 'Done'
    case 'error':
      return language === 'zh' ? '错误' : 'Error'
    case 'idle':
    default:
      return language === 'zh' ? '待命' : 'Idle'
  }
}

function uploadMessage(feedback: UploadFeedback, language: Language) {
  if (feedback.browserFallback) {
    return language === 'zh'
      ? '当前处于浏览器回退模式，无法执行本地写入。'
      : 'The console is running in browser fallback mode, so local writes are unavailable.'
  }

  if (feedback.savedPath) {
    return language === 'zh' ? '文件已写入安全入口。' : 'File saved to the selected intake zone.'
  }

  if (feedback.errorMessage) {
    return feedback.errorMessage
  }

  return null
}

function matchesQuery(values: string[], query: string) {
  if (!query) {
    return true
  }

  return values.some((value) => value.toLowerCase().includes(query))
}

function workbenchHeadline(language: Language) {
  return language === 'zh'
    ? '把最常用的提示词、安全写入与正式输出，安静地放在同一处。'
    : 'Keep your most-used prompts, safe intake, and polished outputs in one quieter place.'
}

function normalizePromptKey(path: string) {
  return path
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^CodeWinter\//i, '')
    .toLowerCase()
}

function dedupePrompts(prompts: PromptEntry[], language: Language) {
  const seenPaths = new Set<string>()
  const seenIds = new Set<string>()
  const seenLabels = new Set<string>()

  return prompts.filter((entry) => {
    const pathKey = normalizePromptKey(entry.path)
    const idKey = entry.id.trim().toLowerCase()
    const labelKey = pickLocalizedText(entry.label, language).trim().toLowerCase()

    if (seenPaths.has(pathKey) || seenIds.has(idKey) || seenLabels.has(labelKey)) {
      return false
    }

    seenPaths.add(pathKey)
    seenIds.add(idKey)
    seenLabels.add(labelKey)
    return true
  })
}

export function WorkbenchPage({
  language,
  query,
  prompts,
  uploadZones,
  deliverableGroups,
  uploadFeedbacks,
  onCopyPrompt,
  onPreview,
  onOpenPath,
  onUploadFile,
}: WorkbenchPageProps) {
  const copy =
    language === 'zh'
      ? {
          title: '工作台',
          summary: workbenchHeadline(language),
          support: '当你需要发起线程、投递资料或取回结果时，入口都应该足够近、足够安静。',
          primaryAction: '复制首个提示词',
          secondaryAction: '查看最新结果',
          promptTitle: '高频提示词中心',
          promptSummary: '把最常用的线程动作，放在一眼就能拿到的位置。',
          writeTitle: '安全写入入口',
          writeSummary: '原始资料先进入安全写入区，再由控制面决定如何流入后续协作。',
          copy: '复制',
          preview: '预览',
          open: '打开',
          write: '导入文件',
          emptyPrompts: '当前没有可复制的提示词模板。',
          deliverablesTitle: '正式输出与结果入口',
          deliverablesSummary: '先看 final，再通过 index 和 thread outputs 追回上下文。',
          readOnly: '只读浏览',
          latestFiles: '最近文件',
          notRecorded: '未记录',
          noDeliverables: '当前还没有检测到正式输出或结果文件。',
          itemCount: '项',
        }
      : {
          title: 'Workbench',
          summary: workbenchHeadline(language),
          support:
            'When you need to launch threads, hand off raw files, or retrieve finished results, the route should feel close and quiet.',
          primaryAction: 'Copy first prompt',
          secondaryAction: 'Open latest result',
          promptTitle: 'High-frequency Prompt Center',
          promptSummary: 'Keep the operator actions you use most within immediate reach.',
          writeTitle: 'Safe write zones',
          writeSummary:
            'Raw materials enter through guarded drop points before the control plane routes them onward.',
          copy: 'Copy',
          preview: 'Preview',
          open: 'Open',
          write: 'Import file',
          emptyPrompts: 'No copy-ready prompt templates are available right now.',
          deliverablesTitle: 'Deliverables and result access',
          deliverablesSummary:
            'Start with final outputs, then use index files and thread outputs to recover context.',
          readOnly: 'Read-only',
          latestFiles: 'Recent files',
          notRecorded: 'Not recorded',
          noDeliverables: 'No deliverable or result files have been detected yet.',
          itemCount: 'items',
        }

  const filteredPrompts = dedupePrompts(
    prompts.filter((entry) =>
      matchesQuery(
        [
          pickLocalizedText(entry.label, language),
          pickLocalizedText(entry.description, language),
          entry.path,
        ],
        query,
      ),
    ),
    language,
  )

  const filteredDeliverableGroups = deliverableGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => matchesQuery([item.label, item.path], query)),
    }))
    .filter((group) => group.items.length > 0 || !query)

  const inputIds = {
    inbox: useId(),
    taskPacketDrop: useId(),
  }

  const firstPrompt = filteredPrompts[0]
  const firstDeliverable = filteredDeliverableGroups[0]?.items[0]

  return (
    <div className="page-stack workbench-page-v3">
      <section className="workbench-hero-v3">
        <div className="surface-panel workbench-hero-copy-card">
          <Text className="section-kicker">WORKBENCH</Text>
          <Title level={1}>{copy.title}</Title>
          <Paragraph className="hero-lead">{copy.summary}</Paragraph>
          <Paragraph className="hero-support">{copy.support}</Paragraph>
          <Space wrap>
            <Button
              type="primary"
              disabled={!firstPrompt}
              onClick={() => {
                if (firstPrompt) {
                  void onCopyPrompt(firstPrompt)
                }
              }}
            >
              {copy.primaryAction}
            </Button>
            <Button
              disabled={!firstDeliverable}
              onClick={() => {
                if (firstDeliverable) {
                  void onPreview(firstDeliverable.label, firstDeliverable.path)
                }
              }}
            >
              {copy.secondaryAction}
            </Button>
          </Space>
        </div>

        <aside className="workbench-write-stack">
          {uploadZones.map((zone) => {
            const feedback = uploadFeedbacks[zone.target]
            const message = uploadMessage(feedback, language)
            const inputId = inputIds[zone.target]

            return (
              <article key={zone.target} className="surface-panel workbench-intake-card">
                <div className="upload-card-head">
                  <div className="intake-summary-icon">
                    <InboxOutlined />
                  </div>
                  <Tag color={feedback.state === 'error' ? 'error' : 'processing'}>
                    {uploadStateLabel(feedback.state, language)}
                  </Tag>
                </div>

                <div>
                  <Text className="section-kicker">{pickLocalizedText(zone.kicker, language)}</Text>
                  <Title level={4}>{pickLocalizedText(zone.title, language)}</Title>
                </div>

                <Paragraph>{pickLocalizedText(zone.body, language)}</Paragraph>

                <div className="prompt-card-actions">
                  <input
                    id={inputId}
                    type="file"
                    className="file-input-hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void onUploadFile(zone.target, file)
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                  <label htmlFor={inputId}>
                    <Button type="primary" icon={<UploadOutlined />}>
                      {copy.write}
                    </Button>
                  </label>
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(zone.path)}>
                    {copy.open}
                  </Button>
                </div>

                {message ? <Text type="secondary">{message}</Text> : null}

                <div className="mini-file-list">
                  <Text className="section-kicker">{copy.latestFiles}</Text>
                  {zone.items.length === 0 ? (
                    <Text type="secondary">{pickLocalizedText(zone.emptyState, language)}</Text>
                  ) : (
                    zone.items.slice(0, 3).map((item) => (
                      <div key={item.path} className="mini-file-row">
                        <span>{item.name}</span>
                        <Text type="secondary">{item.modifiedAt ?? copy.notRecorded}</Text>
                      </div>
                    ))
                  )}
                </div>
              </article>
            )
          })}
        </aside>
      </section>

      <section className="section-block">
        <div className="section-block-head">
          <div>
            <Title level={3}>{copy.promptTitle}</Title>
            <Paragraph>{copy.promptSummary}</Paragraph>
          </div>
        </div>

        {filteredPrompts.length === 0 ? (
          <div className="surface-panel empty-surface">
            <Empty description={copy.emptyPrompts} />
          </div>
        ) : (
          <div className="prompt-grid-v2">
            {filteredPrompts.map((entry) => (
              <article key={`${entry.id}-${entry.path}`} className="surface-panel prompt-card-v3">
                <div className="prompt-card-head">
                  <div className="prompt-card-icon">
                    <CopyOutlined />
                  </div>
                </div>
                <Title level={4}>{pickLocalizedText(entry.label, language)}</Title>
                <Text type="secondary">{entry.id.toUpperCase()}</Text>
                <Paragraph>{pickLocalizedText(entry.description, language)}</Paragraph>
                <div className="prompt-card-actions">
                  <Button type="primary" icon={<CopyOutlined />} onClick={() => void onCopyPrompt(entry)}>
                    {copy.copy}
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => void onPreview(pickLocalizedText(entry.label, language), entry.path)}
                  >
                    {copy.preview}
                  </Button>
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(entry.path)}>
                    {copy.open}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-block-head">
          <div>
            <Title level={3}>{copy.deliverablesTitle}</Title>
            <Paragraph>{copy.deliverablesSummary}</Paragraph>
          </div>
          <Tag>{copy.readOnly}</Tag>
        </div>

        {filteredDeliverableGroups.length === 0 ? (
          <div className="surface-panel empty-surface">
            <Empty description={copy.noDeliverables} />
          </div>
        ) : (
          <div className="deliverable-group-stack-v2">
            {filteredDeliverableGroups.map((group) => (
              <section key={group.id} className="surface-panel deliverable-panel deliverable-panel-v3">
                <div className="deliverable-panel-head">
                  <div>
                    <Title level={4}>{pickLocalizedText(group.title, language)}</Title>
                    <Paragraph>{pickLocalizedText(group.description, language)}</Paragraph>
                  </div>
                  <Tag>
                    {group.items.length} {copy.itemCount}
                  </Tag>
                </div>

                <div className="deliverable-list">
                  {group.items.map((item) => (
                    <article key={item.path} className="deliverable-row">
                      <div className="deliverable-row-main">
                        <div className="deliverable-row-icon">
                          <FileSearchOutlined />
                        </div>
                        <div>
                          <Space wrap>
                            <strong>{item.label}</strong>
                            <Tag color={kindColor(item.kind)}>{kindLabel(item.kind, language)}</Tag>
                          </Space>
                        </div>
                      </div>
                      <Space wrap>
                        <Button icon={<EyeOutlined />} onClick={() => void onPreview(item.label, item.path)}>
                          {copy.preview}
                        </Button>
                        <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(item.path)}>
                          {copy.open}
                        </Button>
                      </Space>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
