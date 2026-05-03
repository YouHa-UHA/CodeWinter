import { CopyOutlined, EyeOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { Button, Empty, Spin, Tag, Typography } from 'antd'
import { createElement, Fragment } from 'react'
import type { ReactNode } from 'react'
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

function renderInline(text: string, keyPrefix: string) {
  const segments = text.split(/(`[^`]+`)/g).filter(Boolean)
  return segments.map((segment, index) => {
    const key = `${keyPrefix}-${index}`
    if (segment.startsWith('`') && segment.endsWith('`')) {
      return <code key={key}>{segment.slice(1, -1)}</code>
    }
    return <Fragment key={key}>{segment}</Fragment>
  })
}

function renderMarkdown(body: string) {
  const normalized = body.replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return null
  }

  const blocks: ReactNode[] = []
  const lines = normalized.split('\n')
  let paragraph: string[] = []
  let listItems: { ordered: boolean; text: string }[] = []
  let quoteLines: string[] = []
  let codeFenceLanguage = ''
  let codeFenceLines: string[] = []
  let inCodeFence = false
  let sawMarkdownSyntax = false

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return
    }

    blocks.push(
      <p key={`paragraph-${blocks.length}`} className="markdown-paragraph">
        {renderInline(paragraph.join(' '), `paragraph-${blocks.length}`)}
      </p>,
    )
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length === 0) {
      return
    }

    const ordered = listItems[0].ordered
    const ListTag = ordered ? 'ol' : 'ul'
    blocks.push(
      <ListTag key={`list-${blocks.length}`} className="markdown-list">
        {listItems.map((item, index) => (
          <li key={`list-item-${blocks.length}-${index}`}>
            {renderInline(item.text, `list-${blocks.length}-${index}`)}
          </li>
        ))}
      </ListTag>,
    )
    listItems = []
  }

  const flushQuote = () => {
    if (quoteLines.length === 0) {
      return
    }

    blocks.push(
      <blockquote key={`quote-${blocks.length}`} className="markdown-quote">
        {quoteLines.map((line, index) => (
          <p key={`quote-line-${blocks.length}-${index}`}>
            {renderInline(line, `quote-${blocks.length}-${index}`)}
          </p>
        ))}
      </blockquote>,
    )
    quoteLines = []
  }

  const flushCodeFence = () => {
    if (codeFenceLines.length === 0 && !codeFenceLanguage) {
      return
    }

    blocks.push(
      <pre key={`code-${blocks.length}`} className="preview-code-block">
        {codeFenceLanguage ? <span className="preview-code-lang">{codeFenceLanguage}</span> : null}
        <code>{codeFenceLines.join('\n')}</code>
      </pre>,
    )
    codeFenceLines = []
    codeFenceLanguage = ''
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      sawMarkdownSyntax = true
      if (inCodeFence) {
        flushCodeFence()
        inCodeFence = false
      } else {
        flushParagraph()
        flushList()
        flushQuote()
        inCodeFence = true
        codeFenceLanguage = trimmed.slice(3).trim()
      }
      continue
    }

    if (inCodeFence) {
      codeFenceLines.push(rawLine)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      flushQuote()
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      sawMarkdownSyntax = true
      flushParagraph()
      flushList()
      flushQuote()
      const level = Math.min(6, headingMatch[1].length)
      const title = headingMatch[2].trim()
      blocks.push(
        createElement(
          `h${level}`,
          {
            key: `heading-${blocks.length}`,
            className: `markdown-heading markdown-heading-${level}`,
          },
          renderInline(title, `heading-${blocks.length}`),
        ),
      )
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      sawMarkdownSyntax = true
      flushParagraph()
      flushList()
      flushQuote()
      blocks.push(<hr key={`divider-${blocks.length}`} className="markdown-divider" />)
      continue
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/)
    if (quoteMatch) {
      sawMarkdownSyntax = true
      flushParagraph()
      flushList()
      quoteLines.push(quoteMatch[1])
      continue
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/)
    if (unorderedMatch) {
      sawMarkdownSyntax = true
      flushParagraph()
      flushQuote()
      listItems.push({ ordered: false, text: unorderedMatch[1] })
      continue
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      sawMarkdownSyntax = true
      flushParagraph()
      flushQuote()
      listItems.push({ ordered: true, text: orderedMatch[1] })
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()
  flushQuote()
  flushCodeFence()

  if (!sawMarkdownSyntax) {
    return null
  }

  return <div className="preview-markdown">{blocks}</div>
}

export function PreviewPane({ language, preview, onOpenPath }: PreviewPaneProps) {
  const promptBlock = preview.body ? extractPromptBlock(preview.body) : null
  const notesMarkdown = promptBlock?.notes ? renderMarkdown(promptBlock.notes) : null
  const bodyMarkdown = promptBlock ? null : renderMarkdown(preview.body)
  const copy =
    language === 'zh'
      ? {
          inspector: '内容预览',
          openPath: '打开路径',
          loading: '正在读取内容…',
          empty: '当前没有可预览的内容。',
          promptNotes: '模板说明',
          canonicalPrompt: '可复制正文',
          canonicalHint: '这里会优先展示真正被复制出去的 canonical text block，不包含外围 Markdown 说明。',
          documentPreview: '文档预览',
          copyPrompt: '复制正文',
          promptKind: 'Prompt',
        }
      : {
          inspector: 'Content Preview',
          openPath: 'Open path',
          loading: 'Reading content…',
          empty: 'There is nothing to preview yet.',
          promptNotes: 'Template Notes',
          canonicalPrompt: 'Canonical Prompt Body',
          canonicalHint:
            'This surface isolates the canonical text block that is copied out of the template.',
          documentPreview: 'Document Preview',
          copyPrompt: 'Copy prompt body',
          promptKind: 'Prompt',
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
              {notesMarkdown ? (
                notesMarkdown
              ) : (
                <div className="preview-prose">{promptBlock.notes}</div>
              )}
            </section>
          ) : null}

          <section className="solid-surface preview-document-sheet">
            <div className="preview-sheet-head">
              <div>
                <Text className="section-kicker">{copy.canonicalPrompt}</Text>
                <Paragraph type="secondary">{copy.canonicalHint}</Paragraph>
              </div>
              <div className="preview-sheet-actions">
                <Tag color="processing">{copy.promptKind}</Tag>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => void navigator.clipboard.writeText(promptBlock.promptBody)}
                >
                  {copy.copyPrompt}
                </Button>
              </div>
            </div>
            <pre className="prompt-preview-text">{promptBlock.promptBody}</pre>
          </section>
        </div>
      ) : (
        <section className="solid-surface preview-document-sheet">
          <Text className="section-kicker">{copy.documentPreview}</Text>
          {bodyMarkdown ? (
            bodyMarkdown
          ) : (
            <div className="preview-prose">{preview.body}</div>
          )}
        </section>
      )}
    </div>
  )
}
