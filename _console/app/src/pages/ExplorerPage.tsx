import {
  EyeOutlined,
  FolderOpenOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Space, Tag, Typography } from 'antd'
import {
  localizeExplorerArea,
  localizeInstanceFieldLabel,
  localizeInstanceFieldValue,
  pickLocalizedText,
} from '../lib/i18n'
import type { Language } from '../lib/i18n'
import type { DocumentSection, ExplorerEntry, InstanceSection } from '../types/snapshot'

const { Paragraph, Text, Title } = Typography

interface ExplorerPageProps {
  language: Language
  managerBriefSections: DocumentSection[]
  instanceSections: InstanceSection[]
  entries: ExplorerEntry[]
  onPreview: (label: string, path: string) => Promise<void>
  onOpenPath: (path: string) => Promise<void>
}

function groupEntriesByArea(entries: ExplorerEntry[]) {
  const groups = new Map<string, ExplorerEntry[]>()

  entries.forEach((entry) => {
    const existing = groups.get(entry.area) ?? []
    existing.push(entry)
    groups.set(entry.area, existing)
  })

  return Array.from(groups.entries())
}

export function ExplorerPage({
  language,
  managerBriefSections,
  instanceSections,
  entries,
  onPreview,
  onOpenPath,
}: ExplorerPageProps) {
  const copy =
    language === 'zh'
      ? {
          kicker: '系统资料',
          title: '更像资料层，而不是生硬的文件树',
          summary:
            '这里不负责改动本体，只负责把控制面、实例基线和系统资料按更适合阅读与定位的方式组织出来。',
          controlSummary: '控制面摘要',
          instanceBaseline: '实例版本基线',
          entrypoints: '系统入口',
          readOnlyNote: '这里仅用于查看与定位，不会反向修改 CodeWinter 本体。',
          preview: '预览',
          open: '打开',
        }
      : {
          kicker: 'System Library',
          title: 'More like a readable library, less like a raw file tree',
          summary:
            'This surface does not mutate the core. It reorganizes the control plane, instance baseline, and system materials into a calmer reading and navigation layer.',
          controlSummary: 'Control plane summary',
          instanceBaseline: 'Instance version baseline',
          entrypoints: 'System entrypoints',
          readOnlyNote: 'This surface is view-only and never mutates the CodeWinter core.',
          preview: 'Preview',
          open: 'Open',
        }

  return (
    <div className="page-stack">
      <section className="hero-panel library-hero">
        <div className="hero-copy">
          <Text className="section-kicker">{copy.kicker}</Text>
          <Title level={2}>{copy.title}</Title>
          <Paragraph>{copy.summary}</Paragraph>
        </div>
        <div className="glass-sheet hero-note-sheet">
          <Text className="section-kicker">{copy.entrypoints}</Text>
          <Paragraph type="secondary">{copy.readOnlyNote}</Paragraph>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.controlSummary}</Text>
            <Title level={4}>{copy.controlSummary}</Title>
          </div>
        </div>

        <div className="brief-grid">
          {managerBriefSections.map((section) => (
            <article key={section.title} className="solid-surface brief-panel">
              <Title level={5}>{section.title}</Title>
              <div className="brief-lines">
                {section.lines.map((line, index) => (
                  <div key={`${section.title}-${index}`} className="brief-line">
                    <span className="brief-dot" />
                    <Paragraph>{line}</Paragraph>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.instanceBaseline}</Text>
            <Title level={4}>{copy.instanceBaseline}</Title>
          </div>
        </div>

        <div className="instance-section-stack">
          {instanceSections.map((section) => (
            <section key={section.id} className="solid-surface layered-section">
              <div className="section-heading section-heading-tight">
                <div>
                  <Title level={5}>{pickLocalizedText(section.title, language)}</Title>
                  <Paragraph type="secondary">
                    {pickLocalizedText(section.description, language)}
                  </Paragraph>
                </div>
              </div>

              <div className="instance-grid">
                {section.fields.map((field) => (
                  <article key={field.key} className="instance-field-card">
                    <Text className="instance-field-key">
                      {localizeInstanceFieldLabel(field.key, language)}
                    </Text>
                    <div className="instance-field-value">
                      {localizeInstanceFieldValue(field.key, field.value, language)}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.entrypoints}</Text>
            <Title level={4}>{copy.entrypoints}</Title>
          </div>
        </div>

        <div className="entry-group-stack">
          {groupEntriesByArea(entries).map(([area, areaEntries]) => (
            <section key={area} className="solid-surface layered-section">
              <div className="section-heading section-heading-tight">
                <div>
                  <Title level={5}>{localizeExplorerArea(area, language)}</Title>
                  <Paragraph type="secondary">{copy.readOnlyNote}</Paragraph>
                </div>
                <Tag>{areaEntries.length}</Tag>
              </div>

              <div className="entry-list">
                {areaEntries.map((entry) => (
                  <article key={entry.path} className="entry-row">
                    <div className="entry-row-main">
                      <div className="entry-row-icon">
                        {entry.kind === 'directory' ? <SearchOutlined /> : <ReadOutlined />}
                      </div>
                      <div className="entry-row-copy">
                        <Title level={5}>{entry.label}</Title>
                        <Paragraph className="path-text">{entry.path}</Paragraph>
                      </div>
                    </div>
                    <Space wrap>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => void onPreview(entry.label, entry.path)}
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
          ))}
        </div>
      </section>
    </div>
  )
}
