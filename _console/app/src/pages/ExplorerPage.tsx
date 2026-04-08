import {
  EyeOutlined,
  FolderOpenOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Card, Collapse, List, Space, Typography } from 'antd'
import { localizeExplorerArea, localizeInstanceFieldLabel, localizeInstanceFieldValue, pickLocalizedText } from '../lib/i18n'
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
          explorer: '资料浏览',
          controlSummary: '控制面摘要',
          instance: '实例',
          instanceBaseline: '实例版本基线',
          readOnly: '只读浏览',
          entrypoints: '入口导航',
          readOnlyNote: '这里只做查看，不反向修改 CodeWinter 本体。',
          preview: '预览',
          open: '打开',
        }
      : {
          explorer: 'Explorer',
          controlSummary: 'Control plane summary',
          instance: 'Instance',
          instanceBaseline: 'Instance version baseline',
          readOnly: 'Read-only Explorer',
          entrypoints: 'Entry navigation',
          readOnlyNote: 'This surface is view-only and does not mutate the CodeWinter core.',
          preview: 'Preview',
          open: 'Open',
        }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.explorer}</Text>
            <Title level={4}>{copy.controlSummary}</Title>
          </Space>
        }
      >
        <Collapse
          ghost
          items={managerBriefSections.map((section) => ({
            key: section.title,
            label: section.title,
            children: (
              <List
                dataSource={section.lines}
                renderItem={(line) => <List.Item>{line}</List.Item>}
              />
            ),
          }))}
        />
      </Card>

      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.instance}</Text>
            <Title level={4}>{copy.instanceBaseline}</Title>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {instanceSections.map((section) => (
            <Card key={section.id} className="inner-card" bordered={false}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>
                  <Title level={5}>{pickLocalizedText(section.title, language)}</Title>
                  <Paragraph type="secondary">
                    {pickLocalizedText(section.description, language)}
                  </Paragraph>
                </div>
                <div className="instance-grid">
                  {section.fields.map((field) => (
                    <div key={field.key} className="instance-field-card">
                      <Text className="instance-field-key">
                        {localizeInstanceFieldLabel(field.key, language)}
                      </Text>
                      <div className="instance-field-value">
                        {localizeInstanceFieldValue(field.key, field.value, language)}
                      </div>
                    </div>
                  ))}
                </div>
              </Space>
            </Card>
          ))}
        </Space>
      </Card>

      <Card
        className="surface-card"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Text className="section-kicker">{copy.readOnly}</Text>
            <Title level={4}>{copy.entrypoints}</Title>
          </Space>
        }
        extra={<Text type="secondary">{copy.readOnlyNote}</Text>}
      >
        <List
          itemLayout="horizontal"
          dataSource={entries}
          renderItem={(entry) => (
            <List.Item
              actions={[
                <Button
                  key="preview"
                  icon={<EyeOutlined />}
                  onClick={() => void onPreview(entry.label, entry.path)}
                >
                  {copy.preview}
                </Button>,
                <Button
                  key="open"
                  icon={<FolderOpenOutlined />}
                  onClick={() => void onOpenPath(entry.path)}
                >
                  {copy.open}
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={entry.kind === 'directory' ? <SearchOutlined /> : <ReadOutlined />}
                title={
                  <Space wrap>
                    <span>{entry.label}</span>
                    <Text type="secondary">{localizeExplorerArea(entry.area, language)}</Text>
                  </Space>
                }
                description={<Paragraph className="path-text">{entry.path}</Paragraph>}
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  )
}
