import {
  CopyOutlined,
  EyeOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Card, Empty, List, Space, Tag, Typography } from 'antd'
import { useId } from 'react'
import type { DeliverableItem, DeliverableGroup, PromptEntry, UploadFeedback, UploadTarget, UploadZone } from '../types/snapshot'
import { pickLocalizedText } from '../lib/i18n'
import type { Language } from '../lib/i18n'

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
      return 'Final'
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
          promptCenter: '提示词中心',
          promptTitle: '高频提示词',
          copyReady: '可直接复制',
          copy: '复制',
          preview: '预览',
          open: '打开',
          deliverablesKicker: '正式输出',
          deliverablesTitle: '正式输出入口',
          readOnly: '只读',
          noDeliverables: '当前还没有检测到正式输出文件。',
          itemCount: '项',
        }
      : {
          promptCenter: 'Prompt Center',
          promptTitle: 'High-frequency prompts',
          copyReady: 'Copy-ready',
          copy: 'Copy',
          preview: 'Preview',
          open: 'Open',
          deliverablesKicker: 'Deliverables',
          deliverablesTitle: 'Deliverable access',
          readOnly: 'Read-only',
          noDeliverables: 'No deliverable files have been detected yet.',
          itemCount: 'items',
        }

  const inputIds = {
    inbox: useId(),
    taskPacketDrop: useId(),
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.promptCenter}</Text>
            <Title level={4}>{copy.promptTitle}</Title>
          </Space>
        }
        extra={<Tag color="orange">{copy.copyReady}</Tag>}
      >
        <div className="prompt-grid-v2">
          {prompts.map((entry) => (
            <Card key={entry.id} className="inner-card" bordered={false}>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div>
                  <Title level={5}>{pickLocalizedText(entry.label, language)}</Title>
                  <Paragraph type="secondary">
                    {pickLocalizedText(entry.description, language)}
                  </Paragraph>
                  <Paragraph copyable={{ text: entry.path }} className="path-text">
                    {entry.path}
                  </Paragraph>
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
              </Space>
            </Card>
          ))}
        </div>
      </Card>

      <div className="upload-grid">
        {uploadZones.map((zone) => {
          const feedback = uploadFeedbacks[zone.target]
          const feedbackMessage = uploadMessage(feedback, language)
          const inputId = inputIds[zone.target]

          return (
            <Card
              key={zone.target}
              className="surface-card"
              bordered={false}
              title={
                <Space direction="vertical" size={0}>
                  <Text className="section-kicker">{pickLocalizedText(zone.kicker, language)}</Text>
                  <Title level={4}>{pickLocalizedText(zone.title, language)}</Title>
                </Space>
              }
              extra={
                <Tag
                  color={
                    feedback.state === 'error'
                      ? 'red'
                      : feedback.state === 'done'
                        ? 'green'
                        : 'orange'
                  }
                >
                  {uploadStateLabel(feedback.state, language)}
                </Tag>
              }
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div className="upload-card">
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div>
                      <Title level={5}>{pickLocalizedText(zone.headline, language)}</Title>
                      <Paragraph type="secondary">{pickLocalizedText(zone.body, language)}</Paragraph>
                      <Paragraph className="path-text">{zone.path}</Paragraph>
                    </div>
                    <div>
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
                    {feedbackMessage ? <Text type="secondary">{feedbackMessage}</Text> : null}
                  </Space>
                </div>

                {zone.items.length === 0 ? (
                  <Empty description={pickLocalizedText(zone.emptyState, language)} />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={zone.items}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            key="open"
                            icon={<FolderOpenOutlined />}
                            onClick={() => void onOpenPath(item.path)}
                          >
                            {copy.open}
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={item.name}
                          description={
                            <Space direction="vertical" size={2}>
                              <Paragraph className="path-text">{item.path}</Paragraph>
                              <Text type="secondary">
                                {item.modifiedAt ?? (language === 'zh' ? '未记录' : 'Not recorded')}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Space>
            </Card>
          )
        })}
      </div>

      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.deliverablesKicker}</Text>
            <Title level={4}>{copy.deliverablesTitle}</Title>
          </Space>
        }
        extra={<Tag color="blue">{copy.readOnly}</Tag>}
      >
        {deliverableGroups.length === 0 ? (
          <Empty description={copy.noDeliverables} />
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {deliverableGroups.map((group) => (
              <Card
                key={group.id}
                className="inner-card"
                bordered={false}
                title={pickLocalizedText(group.title, language)}
                extra={
                  <Text type="secondary">
                    {group.items.length} {copy.itemCount}
                  </Text>
                }
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Paragraph type="secondary">
                    {pickLocalizedText(group.description, language)}
                  </Paragraph>
                  <List
                    itemLayout="horizontal"
                    dataSource={group.items}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            key="preview"
                            icon={<FileSearchOutlined />}
                            onClick={() => void onPreview(item.label, item.path)}
                          >
                            {copy.preview}
                          </Button>,
                          <Button
                            key="open"
                            icon={<FolderOpenOutlined />}
                            onClick={() => void onOpenPath(item.path)}
                          >
                            {copy.open}
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space wrap>
                              <span>{item.label}</span>
                              <Tag color={kindColor(item.kind)}>
                                {kindLabel(item.kind, language)}
                              </Tag>
                            </Space>
                          }
                          description={<Paragraph className="path-text">{item.path}</Paragraph>}
                        />
                      </List.Item>
                    )}
                  />
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Card>
    </Space>
  )
}
