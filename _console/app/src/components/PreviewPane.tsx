import { EyeOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { Button, Empty, Spin, Tag, Typography } from 'antd'
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
          canonicalPrompt: '可复制正文',
          canonicalHint: '这里仅展示 canonical text block，不包含外围 Markdown 说明。',
          documentPreview: '文档正文',
        }
      : {
          inspector: 'Content Preview',
          openPath: 'Open path',
          loading: 'Reading content…',
          empty: 'There is nothing to preview yet.',
          promptNotes: 'Template Notes',
          canonicalPrompt: 'Canonical Prompt Body',
          canonicalHint:
            'This view isolates the canonical text block and leaves the surrounding Markdown outside the copy surface.',
          documentPreview: 'Document Body',
        }

  return (
    <div className="preview-pane">
      <div className="preview-pane-header">
        <div>
          <Text className="section-kicker">{copy.inspector}</Text>
          <Title level={4}>{preview.title}</Title>
        </div>
        <div className="preview-pane-icon">
          <EyeOutlined />
        </div>
      </div>

      {preview.path ? (
        <div className="preview-pane-meta glass-sheet">
          <Paragraph copyable={{ text: preview.path }} className="path-text">
            {preview.path}
          </Paragraph>
          <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(preview.path!)}>
            {copy.openPath}
          </Button>
        </div>
      ) : null}

      {preview.loading ? (
        <div className="preview-loading solid-surface">
          <Spin />
          <Text type="secondary">{copy.loading}</Text>
        </div>
      ) : preview.body.trim().length === 0 ? (
        <div className="solid-surface empty-surface">
          <Empty description={copy.empty} />
        </div>
      ) : promptBlock ? (
        <div className="preview-stack">
          {promptBlock.notes ? (
            <section className="glass-sheet preview-note-sheet">
              <Text className="section-kicker">{copy.promptNotes}</Text>
              <div className="preview-prose">{promptBlock.notes}</div>
            </section>
          ) : null}

          <section className="solid-surface preview-document-sheet">
            <div className="preview-sheet-head">
              <div>
                <Text className="section-kicker">{copy.canonicalPrompt}</Text>
                <Paragraph type="secondary">{copy.canonicalHint}</Paragraph>
              </div>
              <Tag color="processing">text</Tag>
            </div>
            <pre className="prompt-preview-text">{promptBlock.promptBody}</pre>
          </section>
        </div>
      ) : (
        <section className="solid-surface preview-document-sheet">
          <Text className="section-kicker">{copy.documentPreview}</Text>
          <div className="preview-prose">{preview.body}</div>
        </section>
      )}
    </div>
  )
}
