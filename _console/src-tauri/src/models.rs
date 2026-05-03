use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsoleSnapshot {
    pub snapshot_version: u8,
    pub generated_at: String,
    pub codewinter_root: String,
    pub release: ReleaseSummary,
    pub home: HomeProjection,
    pub manager_brief: DocumentProjection,
    pub instance_manifest: InstanceManifestProjection,
    pub workbench: WorkbenchProjection,
    pub runtime: RuntimeProjection,
    pub explorer: ExplorerProjection,
    pub health: HealthProjection,
}

#[derive(Debug, Clone, Serialize)]
pub struct LocalizedText {
    pub en: String,
    pub zh: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseSummary {
    pub version: String,
    pub channel: String,
    pub theme: Option<String>,
    pub codename: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeProjection {
    pub featured_docs: Vec<HomeDoc>,
    pub sections: Vec<HomeSection>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeDoc {
    pub id: String,
    pub label: LocalizedText,
    pub description: LocalizedText,
    pub path: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct HomeSection {
    pub id: String,
    pub title: LocalizedText,
    pub description: LocalizedText,
    pub docs: Vec<HomeDoc>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DocumentSection {
    pub title: String,
    pub lines: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentProjection {
    pub path: String,
    pub sections: Vec<DocumentSection>,
}

#[derive(Debug, Clone, Serialize)]
pub struct KeyValueField {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstanceManifestProjection {
    pub path: String,
    pub fields: Vec<KeyValueField>,
    pub sections: Vec<InstanceSection>,
}

#[derive(Debug, Clone, Serialize)]
pub struct InstanceSection {
    pub id: String,
    pub title: LocalizedText,
    pub description: LocalizedText,
    pub fields: Vec<KeyValueField>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InboxItem {
    pub name: String,
    pub path: String,
    pub modified_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DeliverableItem {
    pub label: String,
    pub path: String,
    pub kind: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptEntry {
    pub id: String,
    pub path: String,
    pub label: LocalizedText,
    pub description: LocalizedText,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadZoneProjection {
    pub target: String,
    pub path: String,
    pub kicker: LocalizedText,
    pub title: LocalizedText,
    pub headline: LocalizedText,
    pub body: LocalizedText,
    pub button_label: LocalizedText,
    pub empty_state: LocalizedText,
    pub items: Vec<InboxItem>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DeliverableGroup {
    pub id: String,
    pub title: LocalizedText,
    pub description: LocalizedText,
    pub items: Vec<DeliverableItem>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkbenchProjection {
    pub prompts: Vec<PromptEntry>,
    pub upload_zones: Vec<UploadZoneProjection>,
    pub deliverable_groups: Vec<DeliverableGroup>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThreadSummary {
    pub thread_id: String,
    pub path: String,
    pub tool: Option<String>,
    pub role: Option<String>,
    pub status: Option<String>,
    pub phase: Option<String>,
    pub current_task: Option<String>,
    pub scope_claims: Option<String>,
    pub risk_gate: Option<String>,
    pub manager_priority: Option<String>,
    pub confidence: Option<String>,
    pub deviation_flag: Option<String>,
    pub decision_needed: Option<String>,
    pub recommended_next_step: Option<String>,
    pub last_updated: Option<String>,
    pub last_meaningful_progress_at: Option<String>,
    pub ready_for_handoff: Option<String>,
    pub ready_for_archive_review: Option<String>,
    pub manager_attention: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollaborationRequestSummary {
    pub request_id: String,
    pub path: String,
    pub from_thread_id: Option<String>,
    pub status: Option<String>,
    pub r#type: Option<String>,
    pub urgency: Option<String>,
    pub blocking_severity: Option<String>,
    pub target_thread_id: Option<String>,
    pub target_capability: Option<String>,
    pub why_now: Option<String>,
    pub requested_outcome: Option<String>,
    pub done_when: Option<String>,
    pub acceptance_signal: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeSignalCard {
    pub id: String,
    pub title: LocalizedText,
    pub level: String,
    pub summary: LocalizedText,
    pub top_reason: LocalizedText,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeAlert {
    pub level: String,
    pub message: LocalizedText,
    pub source: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeProjection {
    pub manager_lease_holder: Option<String>,
    pub threads: Vec<ThreadSummary>,
    pub collab_requests: Vec<CollaborationRequestSummary>,
    pub signals: Vec<RuntimeSignalCard>,
    pub alerts: Vec<RuntimeAlert>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExplorerEntry {
    pub label: String,
    pub path: String,
    pub area: String,
    pub kind: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExplorerProjection {
    pub entries: Vec<ExplorerEntry>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthProjection {
    pub refresh_status: String,
    pub last_good_at: Option<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadInboxResult {
    pub saved_path: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SnapshotRefreshEvent {
    pub reason: String,
}
