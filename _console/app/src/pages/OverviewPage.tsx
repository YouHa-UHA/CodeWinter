import {
  ArrowRightOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { Button, Empty, Space, Tag, Typography } from 'antd'
import { pickLocalizedText } from '../lib/i18n'
import type { Language } from '../lib/i18n'
import type { HomeDoc, HomeSection, ReleaseSummary } from '../types/snapshot'

const { Paragraph, Text, Title } = Typography

interface OverviewPageProps {
  language: Language
  release: ReleaseSummary
  featuredDocs: HomeDoc[]
  sections: HomeSection[]
  onPreview: (label: string, path: string) => Promise<void>
  onOpenPath: (path: string) => Promise<void>
}

function releaseChannelLabel(channel: string, language: Language) {
  switch (channel.toLowerCase()) {
    case 'stable':
      return language === 'zh' ? '稳定版' : 'Stable'
    case 'candidate':
      return language === 'zh' ? '候选版' : 'Candidate'
    case 'draft':
    default:
      return language === 'zh' ? '草案版' : 'Draft'
  }
}

export function OverviewPage({
  language,
  release,
  featuredDocs,
  sections,
  onPreview,
  onOpenPath,
}: OverviewPageProps) {
  const copy =
    language === 'zh'
      ? {
          kicker: '系统总览',
          title: '从更安静、更轻盈的表面进入 CodeWinter',
          summary:
            '首页不应该像厚重后台，而应该像一层轻质操作层。它把最值得先理解、先阅读、先进入的内容放到前面，让整个系统的复杂度自然退后。',
          releaseKicker: '当前发布',
          releaseTitle: '核心基线',
          releaseHint: '这里显示的是当前 CodeWinter 本体对齐的发布基线。',
          featuredKicker: '重点入口',
          featuredTitle: '建议先看这两份文档',
          featuredHint:
            '如果这是你第一次进入系统，先阅读项目介绍与使用说明，再进入工作台或运行态会更顺畅。',
          open: '打开',
          preview: '预览',
          noDocs: '当前还没有检测到首页级文档。',
          sectionAction: '系统入口',
        }
      : {
          kicker: 'System Overview',
          title: 'Enter CodeWinter from a quieter, lighter surface',
          summary:
            'The opening view should feel like a thin operational layer rather than a heavy dashboard. It keeps the first things to understand and enter close at hand while letting the rest of the system recede.',
          releaseKicker: 'Current Release',
          releaseTitle: 'Core baseline',
          releaseHint:
            'This is the release baseline the current CodeWinter core is aligned with right now.',
          featuredKicker: 'Featured',
          featuredTitle: 'Start with these two documents',
          featuredHint:
            'If this is your first time entering the system, read the project introduction and usage guide before moving deeper into the workbench or runtime.',
          open: 'Open',
          preview: 'Preview',
          noDocs: 'No home-level documents have been detected yet.',
          sectionAction: 'Entrypoints',
        }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <Text className="section-kicker">{copy.kicker}</Text>
          <Title level={2}>{copy.title}</Title>
          <Paragraph>{copy.summary}</Paragraph>
        </div>

        <div className="hero-release-sheet glass-sheet">
          <div className="hero-release-head">
            <div>
              <Text className="section-kicker">{copy.releaseKicker}</Text>
              <Title level={4}>{copy.releaseTitle}</Title>
            </div>
            <InfoCircleOutlined className="accent-icon" />
          </div>
          <Space wrap>
            <Tag color="blue">{release.version}</Tag>
            <Tag>{releaseChannelLabel(release.channel, language)}</Tag>
            {release.theme ? <Tag color="processing">{release.theme}</Tag> : null}
          </Space>
          {release.codename ? <Paragraph className="hero-release-code">{release.codename}</Paragraph> : null}
          <Text type="secondary">{copy.releaseHint}</Text>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <Text className="section-kicker">{copy.featuredKicker}</Text>
            <Title level={4}>{copy.featuredTitle}</Title>
          </div>
          <Text type="secondary">{copy.featuredHint}</Text>
        </div>

        {featuredDocs.length === 0 ? (
          <div className="solid-surface empty-surface">
            <Empty description={copy.noDocs} />
          </div>
        ) : (
          <div className="spotlight-grid">
            {featuredDocs.map((doc) => (
              <article key={doc.id} className="spotlight-tile solid-surface">
                <div className="spotlight-head">
                  <div className="spotlight-icon">
                    <ReadOutlined />
                  </div>
                  <div>
                    <Title level={5}>{pickLocalizedText(doc.label, language)}</Title>
                    <Paragraph type="secondary">
                      {pickLocalizedText(doc.description, language)}
                    </Paragraph>
                  </div>
                </div>
                <Paragraph className="path-text">{doc.path}</Paragraph>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => void onPreview(pickLocalizedText(doc.label, language), doc.path)}
                  >
                    {copy.preview}
                  </Button>
                  <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(doc.path)}>
                    {copy.open}
                  </Button>
                </Space>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-stack">
        {sections.map((section) => (
          <section key={section.id} className="solid-surface layered-section">
            <div className="section-heading section-heading-tight">
              <div>
                <Text className="section-kicker">{copy.sectionAction}</Text>
                <Title level={4}>{pickLocalizedText(section.title, language)}</Title>
              </div>
              <Paragraph type="secondary">
                {pickLocalizedText(section.description, language)}
              </Paragraph>
            </div>

            <div className="entry-list">
              {section.docs.map((doc) => (
                <article key={doc.id} className="entry-row">
                  <div className="entry-row-main">
                    <div className="entry-row-icon">
                      <ArrowRightOutlined />
                    </div>
                    <div className="entry-row-copy">
                      <Title level={5}>{pickLocalizedText(doc.label, language)}</Title>
                      <Paragraph type="secondary">
                        {pickLocalizedText(doc.description, language)}
                      </Paragraph>
                      <Paragraph className="path-text">{doc.path}</Paragraph>
                    </div>
                  </div>
                  <Space wrap>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => void onPreview(pickLocalizedText(doc.label, language), doc.path)}
                    >
                      {copy.preview}
                    </Button>
                    <Button icon={<FolderOpenOutlined />} onClick={() => void onOpenPath(doc.path)}>
                      {copy.open}
                    </Button>
                  </Space>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  )
}
