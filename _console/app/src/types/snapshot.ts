export type RefreshStatus = 'idle' | 'refreshing' | 'degraded'

export type AlertLevel = 'info' | 'warning' | 'critical'

export interface LocalizedText {
  en: string
  zh: string
}

export interface ReleaseSummary {
  version: string
  channel: string
  theme?: string
  codename?: string
}

export interface HomeDoc {
  id: string
  label: LocalizedText
  description: LocalizedText
  path: string
}

export interface HomeSection {
  id: string
  title: LocalizedText
  description: LocalizedText
  docs: HomeDoc[]
}

export interface DocumentSection {
  title: string
  lines: string[]
}

export interface KeyValueField {
  key: string
  value: string
}

export interface InstanceSection {
  id: string
  title: LocalizedText
  description: LocalizedText
  fields: KeyValueField[]
}

export interface InboxItem {
  name: string
  path: string
  modifiedAt?: string
}

export interface DeliverableItem {
  label: string
  path: string
  kind: 'final' | 'thread-output' | 'index' | 'other'
}

export interface ThreadSummary {
  threadId: string
  path: string
  tool?: string
  role?: string
  status?: string
  phase?: string
  currentTask?: string
  scopeClaims?: string
  riskGate?: string
  managerPriority?: string
  confidence?: string
  deviationFlag?: string
  decisionNeeded?: string
  recommendedNextStep?: string
  lastUpdated?: string
  lastMeaningfulProgressAt?: string
  readyForHandoff?: string
  readyForArchiveReview?: string
  managerAttention?: string
}

export interface CollaborationRequestSummary {
  requestId: string
  path: string
  fromThreadId?: string
  status?: string
  type?: string
  urgency?: string
  blockingSeverity?: string
  targetThreadId?: string
  targetCapability?: string
  whyNow?: string
  requestedOutcome?: string
  doneWhen?: string
  acceptanceSignal?: string
  updatedAt?: string
}

export interface RuntimeSignalCard {
  id: string
  title: LocalizedText
  level: string
  summary: LocalizedText
  topReason: LocalizedText
}

export interface RuntimeAlert {
  level: AlertLevel
  message: LocalizedText
  source?: string
}

export interface ExplorerEntry {
  label: string
  path: string
  area: string
  kind: 'file' | 'directory'
}

export interface PromptEntry {
  id: string
  path: string
  label: LocalizedText
  description: LocalizedText
}

export interface UploadZone {
  target: UploadTarget
  path: string
  kicker: LocalizedText
  title: LocalizedText
  headline: LocalizedText
  body: LocalizedText
  buttonLabel: LocalizedText
  emptyState: LocalizedText
  items: InboxItem[]
}

export interface DeliverableGroup {
  id: string
  title: LocalizedText
  description: LocalizedText
  items: DeliverableItem[]
}

export type UploadTarget = 'inbox' | 'taskPacketDrop'
export type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export interface UploadFeedback {
  state: UploadState
  savedPath?: string
  errorMessage?: string
  browserFallback?: boolean
}

export interface ConsoleSnapshot {
  snapshotVersion: 1
  generatedAt: string
  codewinterRoot: string
  release: ReleaseSummary
  home: {
    featuredDocs: HomeDoc[]
    sections: HomeSection[]
  }
  managerBrief: {
    path: string
    sections: DocumentSection[]
  }
  instanceManifest: {
    path: string
    fields: KeyValueField[]
    sections: InstanceSection[]
  }
  workbench: {
    prompts: PromptEntry[]
    uploadZones: UploadZone[]
    deliverableGroups: DeliverableGroup[]
  }
  runtime: {
    managerLeaseHolder?: string
    threads: ThreadSummary[]
    collabRequests: CollaborationRequestSummary[]
    signals: RuntimeSignalCard[]
    alerts: RuntimeAlert[]
  }
  explorer: {
    entries: ExplorerEntry[]
  }
  health: {
    refreshStatus: RefreshStatus
    lastGoodAt?: string
    warnings: string[]
  }
}
