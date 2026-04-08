import { EyeOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { Button, Empty, Space, Spin, Tag, Typography } from 'antd'
import type { Language } from '../lib/i18n'

const { Paragraph, Text, Title } = Typography

export interface PreviewState {
  title: string
  path?: string
  body: string
  loading: boolean
}

interface PreviewPaneProps {
  language: Language
  preview: PreviewState
  onOpenPath: (path: string) => Promise<void>
}

function extractPromptBlock(body: string) {
  const match = body.match(/```text\r?\n([\s\S]*?)\r?\n```/)
  if (!match) {
    return null
  }

  const fullMatch = match[0]
  const promptBody = match[1].trim()
  const notes = body.replace(fullMatch, '').trim()

  return {
    notes,
    promptBody,
  }
}

export function PreviewPane({ language, preview, onOpenPath }: PreviewPaneProps) {
  const promptBlock = preview.body ? extractPromptBlock(preview.body) : null
  const copy =
    language === 'zh'
      ? {
          inspector: '内容预览',
          openPath: '打开路径',
          loading: '正在读取内容…',
          empty: '当前没有可预览的内容。',
          promptNotes: '模板说明',
          canonicalPrompt: '可复制提示词',
          canonicalHint: '这里只展示 canonical text block，不包含外围 Markdown 说明。',
          documentPreview: '文档预览',
        }
      : {
          inspector: 'Preview',
          openPath: 'Open path',
          loading: 'Reading content…',
          empty: 'There is nothing to preview yet.',
          promptNotes: 'Template Notes',
          canonicalPrompt: 'Copy-ready Prompt',
          canonicalHint:
            'This view isolates the canonical text block and leaves the surrounding Markdown outside the copy surface.',
          documentPreview: 'Document Preview',
        }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }} className="preview-pane">
      <div className="preview-pane-header">
        <div>
          <Text className="section-kicker">{copy.inspector}</Text>
          <Title level={4}>{preview.title}</Title>
        </div>
        <EyeOutlined className="preview-pane-icon" />
      </div>

      {preview.path ? (
        <div className="preview-pane-meta">
          <Paragraph copyable={{ text: preview.path }} className="path-text">
            {preview.path}
          </Paragraph>
          <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(preview.path!)}>
            {copy.openPath}
          </Button>
        </div>
      ) : null}

      {preview.loading ? (
        <div className="preview-loading">
          <Spin />
          <Text type="secondary">{copy.loading}</Text>
        </div>
      ) : preview.body.trim().length === 0 ? (
        <Empty description={copy.empty} />
      ) : promptBlock ? (
        <div className="prompt-preview-surface">
          {promptBlock.notes ? (
            <div className="prompt-preview-notes">
              <Text className="section-kicker">{copy.promptNotes}</Text>
              <div className="prompt-preview-note-body">{promptBlock.notes}</div>
            </div>
          ) : null}

          <div className="prompt-preview-shell">
            <div className="prompt-preview-toolbar">
              <div>
                <Text className="section-kicker">{copy.canonicalPrompt}</Text>
                <Paragraph type="secondary" className="prompt-preview-hint">
                  {copy.canonicalHint}
                </Paragraph>
              </div>
              <Tag color="orange">text</Tag>
            </div>
            <pre className="prompt-preview-text">{promptBlock.promptBody}</pre>
          </div>
        </div>
      ) : (
        <div className="document-preview-surface">
          <Text className="section-kicker">{copy.documentPreview}</Text>
          <pre className="document-preview-text">{preview.body}</pre>
        </div>
      )}
    </Space>
  )
}
