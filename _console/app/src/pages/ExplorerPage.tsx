import {
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ReadOutlined,
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
  query: string
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

function matchesQuery(values: string[], query: string) {
  if (!query) {
    return true
  }

  return values.some((value) => value.toLowerCase().includes(query))
}

export function ExplorerPage({
  language,
  query,
  managerBriefSections,
  instanceSections,
  entries,
  onPreview,
  onOpenPath,
}: ExplorerPageProps) {
  const copy =
    language === 'zh'
      ? {
          title: '系统资料库',
          summary: '管理控制面文档、查看实例版本归档，并快速进入核心系统资料。',
          controlDocs: '控制面文档',
          instanceVersions: '实例版本基线',
          materials: '系统资料入口',
          quickSync: '快速同步',
          quickSyncBody: '让本地资料层与 CodeWinter 核心入口保持对齐。',
          syncAction: '初始化同步',
          preview: '预览',
          open: '打开',
        }
      : {
          title: 'System Library',
          summary:
            'Browse control-plane documentation, inspect instance baselines, and move through core system materials.',
          controlDocs: 'Control Plane Docs',
          instanceVersions: 'Instance Version Baseline',
          materials: 'System Materials',
          quickSync: 'Quick Sync',
          quickSyncBody: 'Keep the local library surface aligned with core CodeWinter entrypoints.',
          syncAction: 'Initialize Sync',
          preview: 'Preview',
          open: 'Open',
        }

  const filteredSections = managerBriefSections.filter((section) =>
    matchesQuery([section.title, ...section.lines], query),
  )
  const filteredInstanceSections = instanceSections.filter((section) =>
    matchesQuery(
      [
        pickLocalizedText(section.title, language),
        pickLocalizedText(section.description, language),
        ...section.fields.flatMap((field) => [field.key, field.value]),
      ],
      query,
    ),
  )
  const groupedEntries = groupEntriesByArea(
    entries.filter((entry) => matchesQuery([entry.label, entry.path, entry.area], query)),
  )
  const firstMaterial = groupedEntries[0]?.[1][0]

  return (
    <div className="page-stack library-page-v2">
      <section className="library-header-block">
        <div>
          <Text className="section-kicker">LIBRARY</Text>
          <Title level={1}>{copy.title}</Title>
          <Paragraph>{copy.summary}</Paragraph>
        </div>
      </section>

      <section className="library-top-grid">
        <div className="surface-panel library-control-panel">
          <div className="section-block-head">
            <Title level={3}>{copy.controlDocs}</Title>
          </div>

          <div className="library-brief-sections">
            {filteredSections.map((section) => (
              <article key={section.title} className="library-tree-block">
                <div className="library-tree-title">
                  <FolderOpenOutlined />
                  <strong>{section.title}</strong>
                </div>
                <div className="library-tree-list">
                  {section.lines.map((line, index) => (
                    <div key={`${section.title}-${index}`} className="library-tree-item">
                      <FileTextOutlined />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="surface-panel sync-card-v2">
            <div className="sync-card-icon">⚡</div>
            <div>
              <Title level={4}>{copy.quickSync}</Title>
              <Paragraph>{copy.quickSyncBody}</Paragraph>
              <Button
                type="primary"
                disabled={!firstMaterial}
                onClick={() => {
                  if (firstMaterial) {
                    void onOpenPath(firstMaterial.path)
                  }
                }}
              >
                {copy.syncAction}
              </Button>
            </div>
          </div>
        </div>

        <div className="surface-panel library-instance-panel">
          <div className="section-block-head">
            <Title level={3}>{copy.instanceVersions}</Title>
          </div>

          <div className="library-instance-stack">
            {filteredInstanceSections.map((section) => (
              <section key={section.id} className="library-instance-group">
                <div className="library-instance-group-head">
                  <Title level={4}>{pickLocalizedText(section.title, language)}</Title>
                  <Paragraph>{pickLocalizedText(section.description, language)}</Paragraph>
                </div>
                <div className="library-instance-grid">
                  {section.fields.map((field) => (
                    <article key={field.key} className="library-instance-card">
                      <Text className="section-kicker">
                        {localizeInstanceFieldLabel(field.key, language)}
                      </Text>
                      <div>{localizeInstanceFieldValue(field.key, field.value, language)}</div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-block-head">
          <Title level={3}>{copy.materials}</Title>
        </div>

        <div className="library-material-grid">
          {groupedEntries.map(([area, areaEntries]) => (
            <article key={area} className="surface-panel library-material-panel">
              <div className="library-material-head">
                <div>
                  <Text className="section-kicker">{localizeExplorerArea(area, language)}</Text>
                  <Title level={4}>{localizeExplorerArea(area, language)}</Title>
                </div>
                <Tag>{areaEntries.length}</Tag>
              </div>

              <div className="library-material-list">
                {areaEntries.map((entry) => (
                  <div key={entry.path} className="library-material-item">
                    <div className="library-material-copy">
                      <div className="library-material-icon">
                        {entry.kind === 'directory' ? <FolderOpenOutlined /> : <ReadOutlined />}
                      </div>
                      <div>
                        <strong>{entry.label}</strong>
                      </div>
                    </div>
                    <Space wrap>
                      <Button icon={<EyeOutlined />} onClick={() => void onPreview(entry.label, entry.path)}>
                        {copy.preview}
                      </Button>
                      <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(entry.path)}>
                        {copy.open}
                      </Button>
                    </Space>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
