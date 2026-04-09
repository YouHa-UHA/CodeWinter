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
      return language === 'zh' ? '上传中' : 'Uploading'
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
    return language === 'zh' ? `已写入 ${feedback.savedPath}` : `Saved to ${feedback.savedPath}`
  }

  if (feedback.errorMessage) {
    return feedback.errorMessage
  }

  return null
}

export function WorkbenchPage({
  language,
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
          promptsKicker: '提示词中心',
          promptsTitle: '高频操作入口',
          promptsSummary:
            '把最常用的提示词做成一眼可识别、一步可复制的工作面，而不是埋在目录深处。',
          copyReady: '可直接复制',
          copy: '复制',
          preview: '预览',
          open: '打开',
          uploadKicker: '投递区',
          uploadTitle: '安全写入入口',
          deliverablesKicker: '正式输出',
          deliverablesTitle: '交付与结果访问',
          deliverablesSummary: '优先显示最终版本，再保留 Index 和线程输出作为上下文入口。',
          readOnly: '只读',
          noDeliverables: '当前还没有检测到正式输出文件。',
          itemCount: '项',
          notRecorded: '未记录',
          latestFiles: '最近文件',
        }
      : {
          promptsKicker: 'Prompt Center',
          promptsTitle: 'High-frequency operator actions',
          promptsSummary:
            'Keep the most-used prompts visible, copyable, and calm to operate instead of burying them in the file tree.',
          copyReady: 'Copy-ready',
          copy: 'Copy',
          preview: 'Preview',
          open: 'Open',
          uploadKicker: 'Intake',
          uploadTitle: 'Safe write surfaces',
          deliverablesKicker: 'Deliverables',
          deliverablesTitle: 'Result and deliverable access',
          deliverablesSummary:
            'Surface final versions first while keeping index and thread outputs close enough for context.',
          readOnly: 'Read-only',
          noDeliverables: 'No deliverable files have been detected yet.',
          itemCount: 'items',
          notRecorded: 'Not recorded',
          latestFiles: 'Recent files',
        }

  const inputIds = {
    inbox: useId(),
    taskPacketDrop: useId(),
  }

  return (
    <div className="page-stack">
      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.promptsKicker}</Text>
            <Title level={4}>{copy.promptsTitle}</Title>
          </div>
          <Paragraph type="secondary">{copy.promptsSummary}</Paragraph>
        </div>

        <div className="prompt-shelf">
          {prompts.map((entry) => (
            <article key={entry.id} className="prompt-tile solid-surface">
              <div className="prompt-tile-head">
                <div className="prompt-badge">
                  <CopyOutlined />
                </div>
                <Tag color="processing">{copy.copyReady}</Tag>
              </div>

              <div className="prompt-tile-copy">
                <Title level={5}>{pickLocalizedText(entry.label, language)}</Title>
                <Paragraph type="secondary">
                  {pickLocalizedText(entry.description, language)}
                </Paragraph>
                <Paragraph className="path-text">{entry.path}</Paragraph>
              </div>

              <Space wrap>
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={() => void onCopyPrompt(entry)}
                >
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
              </Space>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.uploadKicker}</Text>
            <Title level={4}>{copy.uploadTitle}</Title>
          </div>
        </div>

        <div className="upload-shelf">
          {uploadZones.map((zone) => {
            const feedback = uploadFeedbacks[zone.target]
            const feedbackMessage = uploadMessage(feedback, language)
            const inputId = inputIds[zone.target]

            return (
              <article key={zone.target} className="upload-zone glass-sheet">
                <div className="upload-zone-head">
                  <div>
                    <Text className="section-kicker">{pickLocalizedText(zone.kicker, language)}</Text>
                    <Title level={4}>{pickLocalizedText(zone.title, language)}</Title>
                  </div>
                  <Tag
                    color={
                      feedback.state === 'error'
                        ? 'red'
                        : feedback.state === 'done'
                          ? 'green'
                          : 'processing'
                    }
                  >
                    {uploadStateLabel(feedback.state, language)}
                  </Tag>
                </div>

                <Paragraph type="secondary">{pickLocalizedText(zone.body, language)}</Paragraph>
                <Paragraph className="path-text">{zone.path}</Paragraph>

                <div className="upload-zone-cta">
                  <div className="upload-zone-icon">
                    <InboxOutlined />
                  </div>
                  <div>
                    <Title level={5}>{pickLocalizedText(zone.headline, language)}</Title>
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
                        {pickLocalizedText(zone.buttonLabel, language)}
                      </Button>
                    </label>
                  </div>
                </div>

                {feedbackMessage ? <Text type="secondary">{feedbackMessage}</Text> : null}

                <div className="subsection-strip">
                  <Text className="section-kicker">{copy.latestFiles}</Text>
                </div>

                {zone.items.length === 0 ? (
                  <div className="solid-surface empty-surface compact-empty">
                    <Empty description={pickLocalizedText(zone.emptyState, language)} />
                  </div>
                ) : (
                  <div className="entry-list compact-list">
                    {zone.items.map((item) => (
                      <article key={item.path} className="entry-row compact-entry-row">
                        <div className="entry-row-copy">
                          <Title level={5}>{item.name}</Title>
                          <Paragraph className="path-text">{item.path}</Paragraph>
                          <Text type="secondary">{item.modifiedAt ?? copy.notRecorded}</Text>
                        </div>
                        <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(item.path)}>
                          {copy.open}
                        </Button>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.deliverablesKicker}</Text>
            <Title level={4}>{copy.deliverablesTitle}</Title>
          </div>
          <Space wrap>
            <Text type="secondary">{copy.deliverablesSummary}</Text>
            <Tag color="blue">{copy.readOnly}</Tag>
          </Space>
        </div>

        {deliverableGroups.length === 0 ? (
          <div className="solid-surface empty-surface">
            <Empty description={copy.noDeliverables} />
          </div>
        ) : (
          <div className="deliverable-stack">
            {deliverableGroups.map((group) => (
              <section key={group.id} className="solid-surface deliverable-group">
                <div className="section-heading section-heading-tight">
                  <div>
                    <Title level={5}>{pickLocalizedText(group.title, language)}</Title>
                    <Paragraph type="secondary">
                      {pickLocalizedText(group.description, language)}
                    </Paragraph>
                  </div>
                  <Tag>
                    {group.items.length} {copy.itemCount}
                  </Tag>
                </div>

                <div className="entry-list">
                  {group.items.map((item) => (
                    <article key={item.path} className="entry-row">
                      <div className="entry-row-main">
                        <div className="entry-row-icon">
                          <FileSearchOutlined />
                        </div>
                        <div className="entry-row-copy">
                          <Space wrap>
                            <Title level={5}>{item.label}</Title>
                            <Tag color={kindColor(item.kind)}>{kindLabel(item.kind, language)}</Tag>
                          </Space>
                          <Paragraph className="path-text">{item.path}</Paragraph>
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
