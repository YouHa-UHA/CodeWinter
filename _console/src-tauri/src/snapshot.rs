use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
};

use chrono::Utc;

use crate::{
    models::{
        CollaborationRequestSummary, ConsoleSnapshot, DeliverableGroup, DeliverableItem,
        DocumentProjection, ExplorerEntry, ExplorerProjection, HealthProjection, HomeDoc,
        HomeProjection, HomeSection, InboxItem, InstanceManifestProjection, InstanceSection,
        KeyValueField, LocalizedText, PromptEntry, ReleaseSummary, RuntimeAlert, RuntimeProjection,
        RuntimeSignalCard, ThreadSummary, UploadZoneProjection, WorkbenchProjection,
    },
    parser::{parse_field_map, parse_key_value_fields, parse_markdown_sections},
    paths::ConsolePaths,
};

pub fn build_snapshot(paths: &ConsolePaths) -> Result<ConsoleSnapshot, String> {
    let generated_at = Utc::now().to_rfc3339();
    let release_manifest_path = paths.codewinter_root.join("_core").join("release-manifest.md");
    let release_fields = parse_field_map(&release_manifest_path)?;
    let release = build_release_summary(&release_fields);

    let manager_brief_path = paths.control_plane_dir.join("manager-brief.md");
    let instance_manifest_path = paths.control_plane_dir.join("instance-manifest.md");
    let quick_prompts_path = paths.manager_toolkit_dir.join("quick-prompts.md");
    let thread_board_path = paths.control_plane_dir.join("thread-board.md");

    let manager_brief = build_document_projection(paths, &manager_brief_path)?;
    let instance_fields = parse_key_value_fields(&instance_manifest_path)?;
    let instance_field_map = fields_to_map(&instance_fields);
    let instance_manifest = build_instance_manifest_projection(paths, &instance_manifest_path, instance_fields)?;
    let home = build_home_projection(paths, &release_fields);
    let workbench = build_workbench_projection(paths, &quick_prompts_path)?;
    let runtime = build_runtime_projection(paths, &instance_field_map, &thread_board_path)?;
    let explorer = build_explorer_projection(paths)?;
    let health = build_health_projection(&instance_field_map, &runtime, &generated_at);

    Ok(ConsoleSnapshot {
        snapshot_version: 1,
        generated_at,
        codewinter_root: paths.relative_display_path(&paths.codewinter_root),
        release,
        home,
        manager_brief,
        instance_manifest,
        workbench,
        runtime,
        explorer,
        health,
    })
}

fn build_release_summary(fields: &BTreeMap<String, String>) -> ReleaseSummary {
    ReleaseSummary {
        version: field_or(fields, "release_version").unwrap_or_else(|| "unknown".to_string()),
        channel: field_or(fields, "release_channel").unwrap_or_else(|| "draft".to_string()),
        theme: field_or(fields, "release_theme"),
        codename: field_or(fields, "release_codename"),
    }
}

fn build_document_projection(paths: &ConsolePaths, path: &Path) -> Result<DocumentProjection, String> {
    Ok(DocumentProjection {
        path: paths.relative_display_path(path),
        sections: parse_markdown_sections(path)?,
    })
}

fn build_instance_manifest_projection(
    paths: &ConsolePaths,
    path: &Path,
    fields: Vec<KeyValueField>,
) -> Result<InstanceManifestProjection, String> {
    let field_map = fields_to_map(&fields);

    Ok(InstanceManifestProjection {
        path: paths.relative_display_path(path),
        fields,
        sections: vec![
            build_instance_section(
                "instance-basics",
                lt("Instance Basics", "实例基础"),
                lt(
                    "Identity, ownership, and lifecycle state for the current project instance.",
                    "用于说明当前项目实例的身份、接管状态与生命周期位置。",
                ),
                &field_map,
                &[
                    "instance_name",
                    "workspace_root",
                    "status",
                    "compatibility_window",
                    "manager_lease_holder",
                    "last_bootstrap_at",
                    "last_upgrade_at",
                ],
            ),
            build_instance_section(
                "release-baseline",
                lt("Release Baseline", "发布基线"),
                lt(
                    "Which CodeWinter core release this instance is aligned with right now.",
                    "说明当前实例对齐的是哪一版 CodeWinter 本体发布。",
                ),
                &field_map,
                &[
                    "release_version",
                    "release_channel",
                    "release_codename",
                    "release_theme",
                    "release_notes_path",
                    "project_introduction_archive_path",
                    "usage_guide_archive_path",
                ],
            ),
            build_instance_section(
                "compatibility-contracts",
                lt("Compatibility & Contracts", "兼容与协议"),
                lt(
                    "Schema, runtime, and contract versions used to reason about instance migration.",
                    "用于判断实例升级与迁移边界的结构、运行与协议版本。",
                ),
                &field_map,
                &[
                    "instance_schema_version",
                    "runtime_coordination_version",
                    "bootstrap_contract_version",
                    "migration_contract_version",
                    "release_governance_version",
                    "release_notes_model_version",
                ],
            ),
            build_instance_section(
                "control-plane-links",
                lt("Control Plane Links", "控制面入口"),
                lt(
                    "Quick references to the control-plane files this instance currently relies on.",
                    "指向当前实例核心控制面文件的快速入口。",
                ),
                &field_map,
                &[
                    "manager_brief",
                    "active_queue",
                    "thread_board",
                    "upgrade_plan",
                    "upgrade_log",
                ],
            ),
        ],
    })
}

fn build_instance_section(
    id: &str,
    title: LocalizedText,
    description: LocalizedText,
    fields: &BTreeMap<String, String>,
    keys: &[&str],
) -> InstanceSection {
    InstanceSection {
        id: id.to_string(),
        title,
        description,
        fields: keys
            .iter()
            .filter_map(|key| {
                fields.get(*key).map(|value| KeyValueField {
                    key: (*key).to_string(),
                    value: value.to_string(),
                })
            })
            .collect(),
    }
}

fn build_home_projection(paths: &ConsolePaths, release_fields: &BTreeMap<String, String>) -> HomeProjection {
    let release_version = release_fields
        .get("release_version")
        .cloned()
        .unwrap_or_else(|| "v0.1.1".to_string());
    let release_notes_path = release_fields
        .get("release_notes_path")
        .map(|path| resolve_display_or_raw(paths, path))
        .unwrap_or_else(|| paths.relative_display_path(&paths.releases_dir.join(format!("{release_version}.md"))));
    let project_intro_path = release_fields
        .get("project_introduction_archive_path")
        .map(|path| resolve_display_or_raw(paths, path))
        .unwrap_or_else(|| {
            paths.relative_display_path(
                &paths
                    .releases_dir
                    .join(format!("{release_version}.project-introduction.md")),
            )
        });
    let usage_guide_path = release_fields
        .get("usage_guide_archive_path")
        .map(|path| resolve_display_or_raw(paths, path))
        .unwrap_or_else(|| {
            paths.relative_display_path(
                &paths
                    .releases_dir
                    .join(format!("{release_version}.usage-guide.md")),
            )
        });

    let featured_docs = vec![
        HomeDoc {
            id: "project-introduction".to_string(),
            label: lt("Project Introduction", "项目介绍"),
            description: lt(
                "Understand what CodeWinter is, why it exists, and which collaboration capabilities it provides.",
                "帮助你快速理解 CodeWinter 是什么、为什么存在，以及它提供了哪些核心协作能力。",
            ),
            path: project_intro_path.clone(),
        },
        HomeDoc {
            id: "usage-guide".to_string(),
            label: lt("Usage Guide", "使用说明"),
            description: lt(
                "Read the operator-facing guide for bootstrap, daily collaboration, runtime observation, and upgrades.",
                "阅读面向使用者的系统说明，了解初始化接入、日常协作、运行态观察与实例升级。",
            ),
            path: usage_guide_path.clone(),
        },
    ];

    let sections = vec![
        HomeSection {
            id: "core-docs".to_string(),
            title: lt("Core Documents", "系统核心文档"),
            description: lt(
                "Start here to understand the protocols, release model, and upgrade logic before expanding the workspace.",
                "优先理解 CodeWinter 的核心协议、版本模型与升级逻辑，再继续扩展工作区。",
            ),
            docs: vec![
                HomeDoc {
                    id: "design-principles".to_string(),
                    label: lt("Design Principles", "设计原则"),
                    description: lt(
                        "The core design ideas behind progressive disclosure, runtime coordination, and Harness Engineering.",
                        "解释渐进式披露、运行态协作层与 Harness Engineering 等系统核心思想。",
                    ),
                    path: paths.relative_display_path(
                        &paths.codewinter_root.join("_core").join("design-principles.md"),
                    ),
                },
                HomeDoc {
                    id: "bootstrap-v1".to_string(),
                    label: lt("Bootstrap Protocol", "Bootstrap 协议"),
                    description: lt(
                        "Defines how a workspace becomes a real CodeWinter instance, including greenfield startup modes.",
                        "定义工作区如何初始化成真实实例，并包含空工作区的 greenfield 接入模式。",
                    ),
                    path: paths.relative_display_path(
                        &paths.codewinter_root.join("_core").join("bootstrap-v1.md"),
                    ),
                },
                HomeDoc {
                    id: "versioning-model".to_string(),
                    label: lt("Versioning Model", "版本模型"),
                    description: lt(
                        "Explains how release version, schema version, and runtime coordination version fit together.",
                        "说明发布版本、实例结构版本与运行协作版本之间的关系。",
                    ),
                    path: paths.relative_display_path(
                        &paths.codewinter_root.join("_core").join("versioning-model-v1.md"),
                    ),
                },
            ],
        },
        HomeSection {
            id: "release-docs".to_string(),
            title: lt("Release Documents", "发布资料"),
            description: lt(
                "The current public release line, its release notes, and the reader-facing entry documents.",
                "当前公开发布线、对应说明以及对阅读者最重要的入口文档。",
            ),
            docs: vec![
                HomeDoc {
                    id: "current-release-notes".to_string(),
                    label: lt("Current Release Notes", "当前版本说明"),
                    description: lt(
                        "See what this release includes, how mature it is, and what should be validated next.",
                        "查看当前发布包含什么、成熟度如何，以及下一步应该重点验证什么。",
                    ),
                    path: release_notes_path,
                },
                HomeDoc {
                    id: "project-introduction".to_string(),
                    label: lt("Project Introduction", "项目介绍"),
                    description: lt(
                        "A concise overview of the system concept, its problems, and the value it aims to provide.",
                        "一份更简洁的系统介绍，帮助理解它的定位、问题和价值。",
                    ),
                    path: project_intro_path,
                },
                HomeDoc {
                    id: "usage-guide".to_string(),
                    label: lt("Usage Guide", "使用说明"),
                    description: lt(
                        "How to bootstrap, operate, observe, and upgrade a CodeWinter instance in practice.",
                        "如何实际接入、使用、观察并升级一个 CodeWinter 实例。",
                    ),
                    path: usage_guide_path,
                },
            ],
        },
    ];

    HomeProjection { featured_docs, sections }
}

fn build_workbench_projection(
    paths: &ConsolePaths,
    quick_prompts_path: &Path,
) -> Result<WorkbenchProjection, String> {
    let prompts = parse_prompt_entries(paths, quick_prompts_path)?;
    let upload_zones = vec![
        build_upload_zone(paths, "inbox")?,
        build_upload_zone(paths, "taskPacketDrop")?,
    ];
    let deliverable_groups = build_deliverable_groups(paths)?;

    Ok(WorkbenchProjection {
        prompts,
        upload_zones,
        deliverable_groups,
    })
}

fn build_upload_zone(paths: &ConsolePaths, target: &str) -> Result<UploadZoneProjection, String> {
    let (dir, kicker, title, headline, body, button, empty) = match target {
        "taskPacketDrop" => (
            &paths.task_packet_drop_dir,
            lt("Task Packet Drop", "任务投递区"),
            lt("Safe write to 04-task-packets/_incoming", "安全写入 04-task-packets/_incoming"),
            lt(
                "Stage raw files before they are shaped into task packets.",
                "先暂存原始附件，再由控制面整理成正式任务包。",
            ),
            lt(
                "Use this drop zone when materials are meant for later child-thread handoff rather than immediate manager intake.",
                "当材料要先进入子线程任务包，而不是直接交给管理线程时，就先放在这里。",
            ),
            lt("Import file", "导入文件"),
            lt(
                "No task-packet drop files have been detected yet.",
                "当前还没有检测到任务投递区文件。",
            ),
        ),
        _ => (
            &paths.inbox_dir,
            lt("Inbox", "收件箱"),
            lt("Safe write to 03-inbox", "安全写入 03-inbox"),
            lt(
                "Hand raw materials to the manager thread through a guarded intake zone.",
                "把原始材料先送进一个受控入口，再由管理线程决定后续流向。",
            ),
            lt(
                "Use this area for raw intake instead of writing directly into protocol files or the long-term knowledge layer.",
                "这里用于向管理线程投递原始附件，不直接改动协议文件或长期知识层。",
            ),
            lt("Import file", "导入文件"),
            lt("No inbox files have been detected yet.", "当前还没有检测到 Inbox 文件。"),
        ),
    };

    Ok(UploadZoneProjection {
        target: target.to_string(),
        path: paths.relative_display_path(dir),
        kicker,
        title,
        headline,
        body,
        button_label: button,
        empty_state: empty,
        items: collect_inbox_items(paths, dir)?,
    })
}

fn build_deliverable_groups(paths: &ConsolePaths) -> Result<Vec<DeliverableGroup>, String> {
    let files = collect_markdown_files(&paths.deliverables_dir)?;
    let mut governance = Vec::new();
    let mut tasks = Vec::new();
    let mut other = Vec::new();

    for path in files {
        let relative = path
            .strip_prefix(&paths.deliverables_dir)
            .unwrap_or(path.as_path())
            .to_string_lossy()
            .replace('\\', "/");
        let label = path
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("document")
            .to_string();
        let item = DeliverableItem {
            label,
            path: paths.relative_display_path(&path),
            kind: classify_deliverable_kind(&relative).to_string(),
        };

        if relative.starts_with("governance/") {
            governance.push(item);
        } else if relative.starts_with("tasks/") {
            tasks.push(item);
        } else {
            other.push(item);
        }
    }

    let mut groups = Vec::new();
    if !governance.is_empty() {
        groups.push(DeliverableGroup {
            id: "governance".to_string(),
            title: lt("Governance Outputs", "治理输出"),
            description: lt(
                "Operator-facing governance documents, release texts, and project-level summaries.",
                "面向使用者的治理文稿、版本说明与项目层总结材料。",
            ),
            items: governance,
        });
    }
    if !tasks.is_empty() {
        groups.push(DeliverableGroup {
            id: "tasks".to_string(),
            title: lt("Task Outputs", "任务输出"),
            description: lt(
                "Task-specific deliverables, thread outputs, and final artifacts grouped under work items.",
                "按任务组织的正式输出、线程产物与最终结果。",
            ),
            items: tasks,
        });
    }
    if !other.is_empty() {
        groups.push(DeliverableGroup {
            id: "other".to_string(),
            title: lt("Other Deliverables", "其他结果"),
            description: lt(
                "Additional output files that do not fit the main governance or task directories.",
                "暂未归入治理区或任务区的其他输出文件。",
            ),
            items: other,
        });
    }

    Ok(groups)
}

fn build_runtime_projection(
    paths: &ConsolePaths,
    instance_fields: &BTreeMap<String, String>,
    thread_board_path: &Path,
) -> Result<RuntimeProjection, String> {
    let thread_board_fields = parse_field_map(thread_board_path).unwrap_or_default();
    let mut threads = collect_thread_summaries(paths)?;
    let mut collab_requests = collect_collaboration_requests(paths)?;

    threads.sort_by_key(thread_sort_key);
    collab_requests.sort_by_key(request_sort_key);

    let signals = build_runtime_signals(instance_fields, &thread_board_fields, &threads, &collab_requests);
    let alerts = build_runtime_alerts(instance_fields, &threads, &collab_requests);

    Ok(RuntimeProjection {
        manager_lease_holder: field_or(instance_fields, "manager_lease_holder"),
        threads,
        collab_requests,
        signals,
        alerts,
    })
}

fn build_runtime_signals(
    instance_fields: &BTreeMap<String, String>,
    board_fields: &BTreeMap<String, String>,
    threads: &[ThreadSummary],
    requests: &[CollaborationRequestSummary],
) -> Vec<RuntimeSignalCard> {
    vec![
        signal_from_board_or_derived(
            "system-health",
            "system_health",
            lt("System Health", "系统健康度"),
            board_fields,
            derive_system_health(instance_fields, threads, requests),
        ),
        signal_from_board_or_derived(
            "drift-risk",
            "drift_risk",
            lt("Drift Risk", "偏航风险"),
            board_fields,
            derive_drift_risk(threads),
        ),
        signal_from_board_or_derived(
            "decision-pressure",
            "decision_pressure",
            lt("Decision Pressure", "决策压力"),
            board_fields,
            derive_decision_pressure(threads, requests),
        ),
        signal_from_board_or_derived(
            "collab-pressure",
            "collab_pressure",
            lt("Collaboration Pressure", "协作压力"),
            board_fields,
            derive_collab_pressure(threads, requests),
        ),
        signal_from_board_or_derived(
            "closure-pressure",
            "closure_pressure",
            lt("Closure Pressure", "收口压力"),
            board_fields,
            derive_closure_pressure(threads),
        ),
    ]
}

fn signal_from_board_or_derived(
    id: &str,
    prefix: &str,
    title: LocalizedText,
    board_fields: &BTreeMap<String, String>,
    derived: (String, LocalizedText, LocalizedText),
) -> RuntimeSignalCard {
    let level = field_or(board_fields, &format!("{prefix}_level")).unwrap_or(derived.0);
    let summary = field_or(board_fields, &format!("{prefix}_summary"))
        .map(localized_passthrough)
        .unwrap_or(derived.1);
    let top_reason = field_or(board_fields, &format!("{prefix}_top_reason"))
        .map(localized_passthrough)
        .unwrap_or(derived.2);

    RuntimeSignalCard {
        id: id.to_string(),
        title,
        level,
        summary,
        top_reason,
    }
}

fn derive_system_health(
    instance_fields: &BTreeMap<String, String>,
    threads: &[ThreadSummary],
    requests: &[CollaborationRequestSummary],
) -> (String, LocalizedText, LocalizedText) {
    let template_baseline = looks_like_template_baseline(instance_fields);
    let blocked_threads = threads
        .iter()
        .filter(|thread| matches_ci(thread.status.as_deref(), &["BLOCKED", "NEEDS_COLLAB"]))
        .count();
    let red_threads = threads
        .iter()
        .filter(|thread| matches_ci(thread.risk_gate.as_deref(), &["RED"]))
        .count();
    let fully_blocking_requests = requests
        .iter()
        .filter(|request| matches_ci(request.blocking_severity.as_deref(), &["FULL"]))
        .count();

    if template_baseline {
        return (
            "WATCH".to_string(),
            lt(
                "The current instance still looks like a template baseline rather than a fully claimed runtime.",
                "当前实例仍像模板基线，而不是已经被真实项目接管的运行实例。",
            ),
            if threads.is_empty() {
                lt(
                    "No real runtime thread cards were detected yet.",
                    "当前还没有检测到真实线程卡。",
                )
            } else {
                lt(
                    "The workspace baseline has not been fully claimed by a real manager thread yet.",
                    "当前工作区还没有被真实管理线程完全接管。",
                )
            },
        );
    }

    if red_threads > 0 || fully_blocking_requests > 0 {
        return (
            "PRESSURED".to_string(),
            lt(
                "The runtime is active, but at least one high-risk or fully blocking condition needs attention.",
                "系统已进入运行态，但至少存在一个高风险或完整阻塞条件需要优先处理。",
            ),
            if fully_blocking_requests > 0 {
                lt(
                    "A collaboration request is marked as fully blocking the current execution path.",
                    "存在被标记为完整阻塞主链路的协作请求。",
                )
            } else {
                lt(
                    "At least one active thread is currently running under a RED risk gate.",
                    "至少有一个活跃线程当前处于 RED 风险门。",
                )
            },
        );
    }

    if blocked_threads > 0 {
        return (
            "WATCH".to_string(),
            lt(
                "The runtime is moving, but some threads are waiting on collaboration or are currently blocked.",
                "系统仍在推进，但已有部分线程进入阻塞或等待协作状态。",
            ),
            lt(
                "One or more registered threads are currently marked as blocked or collaboration-dependent.",
                "已有一个或多个注册线程被标记为阻塞或协作依赖。",
            ),
        );
    }

    (
        "STABLE".to_string(),
        lt(
            "The runtime currently looks structurally stable and able to continue forward.",
            "当前系统整体结构稳定，可以继续向前推进。",
        ),
        lt(
            "No blocking signals, red risk gates, or unresolved baseline issues are dominant right now.",
            "当前没有明显的阻塞信号、红色风险门或未解决的基线问题占据主导。",
        ),
    )
}

fn derive_drift_risk(threads: &[ThreadSummary]) -> (String, LocalizedText, LocalizedText) {
    let deviation_count = threads
        .iter()
        .filter(|thread| is_truthy(thread.deviation_flag.as_deref()))
        .count();
    let low_confidence_count = threads
        .iter()
        .filter(|thread| matches_ci(thread.confidence.as_deref(), &["LOW"]))
        .count();
    let stale_active_count = threads
        .iter()
        .filter(|thread| is_stale_active_thread(thread))
        .count();

    if deviation_count > 0 || stale_active_count > 0 {
        return (
            "HIGH".to_string(),
            lt(
                "The runtime shows threads that may be drifting away from their intended execution path.",
                "当前运行态显示存在可能偏离预期执行路径的线程。",
            ),
            if deviation_count > 0 {
                lt(
                    "At least one thread explicitly reported a deviation flag.",
                    "至少有一个线程主动上报了偏航信号。",
                )
            } else {
                lt(
                    "One or more active threads have not recorded meaningful progress for too long.",
                    "至少有一个活跃线程已经过久没有记录实质推进。",
                )
            },
        );
    }

    if low_confidence_count > 0 {
        return (
            "MEDIUM".to_string(),
            lt(
                "The runtime is not visibly drifting, but some active threads are operating with low confidence.",
                "当前没有明显偏航，但已有线程在低信心下推进。",
            ),
            lt(
                "One or more active threads currently report LOW confidence.",
                "至少有一个活跃线程当前报告为 LOW confidence。",
            ),
        );
    }

    (
        "LOW".to_string(),
        lt(
            "No strong deviation or staleness signals are visible right now.",
            "当前没有明显的偏航或陈旧执行信号。",
        ),
        lt(
            "No registered thread has reported a deviation flag or stale active state.",
            "当前没有线程上报偏航，也没有明显的活跃空转状态。",
        ),
    )
}

fn derive_decision_pressure(
    threads: &[ThreadSummary],
    requests: &[CollaborationRequestSummary],
) -> (String, LocalizedText, LocalizedText) {
    let decision_threads = threads
        .iter()
        .filter(|thread| !is_placeholder_value(thread.decision_needed.as_deref()))
        .count();
    let p0_threads = threads
        .iter()
        .filter(|thread| matches_ci(thread.manager_priority.as_deref(), &["P0"]))
        .count();
    let urgent_requests = requests
        .iter()
        .filter(|request| matches_ci(request.urgency.as_deref(), &["HIGH"]))
        .count();

    if decision_threads >= 3 || p0_threads > 0 {
        return (
            "HIGH".to_string(),
            lt(
                "Several decisions are currently waiting on the manager thread or an explicit human call.",
                "当前已有多项事项在等待管理线程或人工明确决策。",
            ),
            if p0_threads > 0 {
                lt(
                    "At least one thread is marked as P0 while still carrying a pending decision.",
                    "至少有一个线程在带有待决策事项的同时被标记为 P0。",
                )
            } else {
                lt(
                    "There are multiple unresolved decision-needed threads in the runtime.",
                    "当前运行态里存在多条尚未解决的待决策线程。",
                )
            },
        );
    }

    if decision_threads > 0 || urgent_requests > 0 {
        return (
            "MEDIUM".to_string(),
            lt(
                "There are decision points in flight, but they have not yet become a dominant bottleneck.",
                "当前存在待决策事项，但尚未形成明显的系统性决策瓶颈。",
            ),
            if decision_threads > 0 {
                lt(
                    "At least one thread still carries a non-empty decision-needed field.",
                    "至少有一个线程仍然保留了非空的 decision_needed 字段。",
                )
            } else {
                lt(
                    "A high-urgency collaboration request suggests pending routing or approval work.",
                    "高优先级协作请求意味着当前仍有待路由或待确认的管理动作。",
                )
            },
        );
    }

    (
        "LOW".to_string(),
        lt(
            "No visible decision backlog is active in the current runtime snapshot.",
            "当前运行态快照中没有明显的决策积压。",
        ),
        lt(
            "The runtime does not show unresolved decision-needed threads or urgent routing requests.",
            "当前没有未解决的待决策线程，也没有明显的高优先级路由请求。",
        ),
    )
}

fn derive_collab_pressure(
    threads: &[ThreadSummary],
    requests: &[CollaborationRequestSummary],
) -> (String, LocalizedText, LocalizedText) {
    let open_requests = requests
        .iter()
        .filter(|request| matches_ci(request.status.as_deref(), &["OPEN", "ROUTED", "IN_PROGRESS"]))
        .count();
    let full_block_requests = requests
        .iter()
        .filter(|request| matches_ci(request.blocking_severity.as_deref(), &["FULL"]))
        .count();
    let unserved_collab_threads = threads
        .iter()
        .filter(|thread| matches_ci(thread.status.as_deref(), &["NEEDS_COLLAB"]))
        .filter(|thread| {
            requests.iter().all(|request| {
                request
                    .target_thread_id
                    .as_deref()
                    .map(|target| !target.trim().eq_ignore_ascii_case(&thread.thread_id))
                    .unwrap_or(true)
            })
        })
        .count();

    if full_block_requests > 0 || open_requests >= 4 {
        return (
            "HIGH".to_string(),
            lt(
                "The collaboration queue is actively pressuring system throughput.",
                "当前协作队列已经对系统推进效率形成明显压力。",
            ),
            if full_block_requests > 0 {
                lt(
                    "At least one open collaboration request is marked as fully blocking the main path.",
                    "至少有一条打开的协作请求被标记为完整阻塞主链路。",
                )
            } else {
                lt(
                    "There are too many simultaneously open collaboration asks for the current runtime shape.",
                    "当前同时打开的协作请求数量已经偏多。",
                )
            },
        );
    }

    if open_requests > 0 || unserved_collab_threads > 0 {
        return (
            "MEDIUM".to_string(),
            lt(
                "Collaboration is active, but the queue still looks manageable.",
                "当前协作正在发生，但队列看起来仍可控。",
            ),
            if unserved_collab_threads > 0 {
                lt(
                    "Some threads already need collaboration, even if the request queue is still light.",
                    "有线程已经进入 NEEDS_COLLAB，即使请求队列本身还不重。",
                )
            } else {
                lt(
                    "The request queue is active and should be kept moving to avoid future bottlenecks.",
                    "当前请求队列已处于活跃状态，应尽快流转以避免后续阻塞。",
                )
            },
        );
    }

    (
        "LOW".to_string(),
        lt(
            "No active collaboration bottleneck is visible in the current request queue.",
            "当前协作请求队列里没有明显的协作瓶颈。",
        ),
        lt(
            "No open or manager-blocking collaboration requests were detected.",
            "当前没有检测到打开中的或明显阻塞管理线程的协作请求。",
        ),
    )
}

fn derive_closure_pressure(threads: &[ThreadSummary]) -> (String, LocalizedText, LocalizedText) {
    let closure_ready = threads
        .iter()
        .filter(|thread| is_truthy(thread.ready_for_handoff.as_deref()))
        .count()
        + threads
            .iter()
            .filter(|thread| is_truthy(thread.ready_for_archive_review.as_deref()))
            .count()
        + threads
            .iter()
            .filter(|thread| matches_ci(thread.status.as_deref(), &["HANDOFF_READY", "DONE"]))
            .count();

    if closure_ready >= 4 {
        return (
            "HIGH".to_string(),
            lt(
                "Multiple threads are ready to be handed off, integrated, or closed out.",
                "当前有多条线程已经进入可交接、可集成或可收口状态。",
            ),
            lt(
                "Several outputs are already closure-ready and should not remain in active flow for too long.",
                "已有多项产出具备收口条件，不应长期停留在活跃流中。",
            ),
        );
    }

    if closure_ready > 0 {
        return (
            "MEDIUM".to_string(),
            lt(
                "There are closure-ready items waiting for the manager thread to collect them.",
                "当前已有可收口事项，等待管理线程统一收集。",
            ),
            lt(
                "At least one thread is ready for handoff, completion, or archive review.",
                "至少有一个线程已经准备好交接、完成或归档复核。",
            ),
        );
    }

    (
        "LOW".to_string(),
        lt(
            "Threads are still mostly in active delivery rather than closure preparation.",
            "当前线程仍主要处于推进阶段，而不是收口准备阶段。",
        ),
        lt(
            "No runtime thread has yet reached a clear handoff or archive-ready state.",
            "当前还没有线程进入明确的交接或归档准备状态。",
        ),
    )
}

fn build_runtime_alerts(
    instance_fields: &BTreeMap<String, String>,
    threads: &[ThreadSummary],
    requests: &[CollaborationRequestSummary],
) -> Vec<RuntimeAlert> {
    let mut alerts = Vec::new();

    if looks_like_template_baseline(instance_fields) {
        alerts.push(RuntimeAlert {
            level: "warning".to_string(),
            message: lt(
                "Current instance is still at the BOOTSTRAPPING baseline.",
                "当前实例仍停留在 BOOTSTRAPPING 基线，说明真实接管还没有完全完成。",
            ),
            source: Some("instance-manifest".to_string()),
        });
    }

    if threads.is_empty() {
        alerts.push(RuntimeAlert {
            level: "info".to_string(),
            message: lt(
                "No real thread cards were detected yet.",
                "当前还没有检测到真实线程卡。",
            ),
            source: Some("threads".to_string()),
        });
    }

    for thread in threads.iter().filter(|thread| is_truthy(thread.deviation_flag.as_deref())).take(2) {
        alerts.push(RuntimeAlert {
            level: "warning".to_string(),
            message: lt(
                &format!("Thread {} explicitly reported deviation.", thread.thread_id),
                &format!("线程 {} 主动上报了偏航信号。", thread.thread_id),
            ),
            source: Some(thread.path.clone()),
        });
    }

    for thread in threads
        .iter()
        .filter(|thread| !is_placeholder_value(thread.decision_needed.as_deref()))
        .take(2)
    {
        alerts.push(RuntimeAlert {
            level: "warning".to_string(),
            message: lt(
                &format!("Thread {} still has a pending decision.", thread.thread_id),
                &format!("线程 {} 当前仍有待决策事项。", thread.thread_id),
            ),
            source: Some(thread.path.clone()),
        });
    }

    for request in requests
        .iter()
        .filter(|request| matches_ci(request.blocking_severity.as_deref(), &["FULL"]))
        .take(2)
    {
        alerts.push(RuntimeAlert {
            level: "critical".to_string(),
            message: lt(
                &format!(
                    "Collaboration request {} is marked as fully blocking the current path.",
                    request.request_id
                ),
                &format!("协作请求 {} 被标记为完整阻塞当前主链路。", request.request_id),
            ),
            source: Some(request.path.clone()),
        });
    }

    alerts.truncate(5);
    alerts
}

fn build_explorer_projection(paths: &ConsolePaths) -> Result<ExplorerProjection, String> {
    let mut entries = Vec::new();

    let fixed_entries = vec![
        ("Repository Overview", paths.codewinter_root.join("README.md"), "control-plane", "file"),
        ("Starter Entry", paths.codewinter_root.join("read.md"), "control-plane", "file"),
        ("Manager Brief", paths.control_plane_dir.join("manager-brief.md"), "control-plane", "file"),
        ("Instance Manifest", paths.control_plane_dir.join("instance-manifest.md"), "runtime", "file"),
        ("Thread Board", paths.control_plane_dir.join("thread-board.md"), "runtime", "file"),
        ("Release Manifest", paths.codewinter_root.join("_core").join("release-manifest.md"), "release", "file"),
    ];

    for (label, path, area, kind) in fixed_entries {
        if path.exists() {
            entries.push(ExplorerEntry {
                label: label.to_string(),
                path: paths.relative_display_path(&path),
                area: area.to_string(),
                kind: kind.to_string(),
            });
        }
    }

    for path in collect_markdown_files(&paths.releases_dir)? {
        entries.push(ExplorerEntry {
            label: file_label(&path),
            path: paths.relative_display_path(&path),
            area: "release".to_string(),
            kind: "file".to_string(),
        });
    }

    for path in collect_markdown_files(&paths.deliverables_dir)? {
        entries.push(ExplorerEntry {
            label: file_label(&path),
            path: paths.relative_display_path(&path),
            area: "deliverables".to_string(),
            kind: "file".to_string(),
        });
    }

    for dir in ["10-services", "20-chains", "30-handoffs", "40-evidence", "50-decisions"] {
        let root = paths.codewinter_root.join(dir);
        if !root.exists() {
            continue;
        }
        for path in collect_markdown_files(&root)? {
            entries.push(ExplorerEntry {
                label: file_label(&path),
                path: paths.relative_display_path(&path),
                area: "knowledge".to_string(),
                kind: "file".to_string(),
            });
        }
    }

    entries.sort_by(|left, right| left.label.to_lowercase().cmp(&right.label.to_lowercase()));
    entries.dedup_by(|left, right| left.path.eq_ignore_ascii_case(&right.path));

    Ok(ExplorerProjection { entries })
}

fn build_health_projection(
    instance_fields: &BTreeMap<String, String>,
    runtime: &RuntimeProjection,
    generated_at: &str,
) -> HealthProjection {
    let mut warnings = Vec::new();

    if looks_like_template_baseline(instance_fields) {
        warnings.push("Current instance-manifest still looks like a template baseline.".to_string());
    }

    if runtime.threads.is_empty() {
        warnings.push(
            "No real thread cards were detected yet; Runtime may still be showing an empty baseline."
                .to_string(),
        );
    }

    HealthProjection {
        refresh_status: if warnings.is_empty() {
            "idle".to_string()
        } else {
            "degraded".to_string()
        },
        last_good_at: Some(generated_at.to_string()),
        warnings,
    }
}

fn parse_prompt_entries(paths: &ConsolePaths, quick_prompts_path: &Path) -> Result<Vec<PromptEntry>, String> {
    let content = fs::read_to_string(quick_prompts_path)
        .map_err(|error| format!("Failed to read quick prompts {}: {error}", quick_prompts_path.display()))?;
    let mut prompts = Vec::new();
    let mut current_heading: Option<String> = None;
    let mut description_lines: Vec<String> = Vec::new();
    let mut path: Option<String> = None;

    let flush = |prompts: &mut Vec<PromptEntry>,
                 current_heading: &mut Option<String>,
                 description_lines: &mut Vec<String>,
                 path: &mut Option<String>| {
        if let (Some(heading), Some(prompt_path)) = (current_heading.take(), path.take()) {
            let label = prompt_label(&heading);
            let description = prompt_description(&heading, description_lines.join(" ").trim());
            prompts.push(PromptEntry {
                id: slugify(&heading),
                path: resolve_display_or_raw(paths, &prompt_path),
                label,
                description,
            });
        }
        description_lines.clear();
    };

    for raw_line in content.lines() {
        let line = raw_line.trim();
        if let Some(heading) = line.strip_prefix("## ") {
            flush(&mut prompts, &mut current_heading, &mut description_lines, &mut path);
            current_heading = Some(heading.trim().to_string());
            continue;
        }

        if current_heading.is_none() || line.is_empty() {
            continue;
        }

        if let Some(extracted_path) = extract_numbered_path(line) {
            path = Some(extracted_path);
            continue;
        }

        if !line.starts_with('#') {
            description_lines.push(line.to_string());
        }
    }

    flush(&mut prompts, &mut current_heading, &mut description_lines, &mut path);
    prompts.sort_by(|left, right| left.id.cmp(&right.id));
    prompts.dedup_by(|left, right| left.path.eq_ignore_ascii_case(&right.path));

    Ok(prompts)
}

fn collect_inbox_items(paths: &ConsolePaths, dir: &Path) -> Result<Vec<InboxItem>, String> {
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut items = Vec::new();
    for entry in fs::read_dir(dir).map_err(|error| format!("Failed to read {}: {error}", dir.display()))? {
        let entry = entry.map_err(|error| format!("Failed to read {} entry: {error}", dir.display()))?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        items.push(InboxItem {
            name: file_label(&path),
            path: paths.relative_display_path(&path),
            modified_at: modified_at(&path),
        });
    }

    items.sort_by(|left, right| right.modified_at.cmp(&left.modified_at));
    Ok(items)
}

fn collect_thread_summaries(paths: &ConsolePaths) -> Result<Vec<ThreadSummary>, String> {
    let files = collect_markdown_files(&paths.threads_dir)?;
    let mut threads = Vec::new();

    for path in files.into_iter().filter(|path| !is_template_or_readme(path)) {
        let fields = parse_field_map(&path).unwrap_or_default();
        threads.push(ThreadSummary {
            thread_id: field_or(&fields, "thread_id").unwrap_or_else(|| file_stem(&path)),
            path: paths.relative_display_path(&path),
            tool: field_or(&fields, "tool"),
            role: field_or(&fields, "role"),
            status: field_or(&fields, "status"),
            phase: field_or(&fields, "phase"),
            current_task: field_or(&fields, "current_task"),
            scope_claims: field_or(&fields, "scope_claims"),
            risk_gate: field_or(&fields, "risk_gate"),
            manager_priority: field_or(&fields, "manager_priority"),
            confidence: field_or(&fields, "confidence"),
            deviation_flag: field_or(&fields, "deviation_flag"),
            decision_needed: field_or(&fields, "decision_needed"),
            recommended_next_step: field_or(&fields, "recommended_next_step"),
            last_updated: field_or(&fields, "last_updated"),
            last_meaningful_progress_at: field_or(&fields, "last_meaningful_progress_at"),
            ready_for_handoff: field_or(&fields, "ready_for_handoff"),
            ready_for_archive_review: field_or(&fields, "ready_for_archive_review"),
            manager_attention: field_or(&fields, "manager_attention"),
        });
    }

    Ok(threads)
}

fn collect_collaboration_requests(paths: &ConsolePaths) -> Result<Vec<CollaborationRequestSummary>, String> {
    let files = collect_markdown_files(&paths.collab_requests_dir)?;
    let mut requests = Vec::new();

    for path in files.into_iter().filter(|path| !is_template_or_readme(path)) {
        let fields = parse_field_map(&path).unwrap_or_default();
        requests.push(CollaborationRequestSummary {
            request_id: field_or(&fields, "request_id").unwrap_or_else(|| file_stem(&path)),
            path: paths.relative_display_path(&path),
            from_thread_id: field_or(&fields, "from_thread_id"),
            status: field_or(&fields, "status"),
            r#type: field_or(&fields, "type"),
            urgency: field_or(&fields, "urgency"),
            blocking_severity: field_or(&fields, "blocking_severity"),
            target_thread_id: field_or(&fields, "target_thread_id"),
            target_capability: field_or(&fields, "target_capability"),
            why_now: field_or(&fields, "why_now"),
            requested_outcome: field_or(&fields, "requested_outcome"),
            done_when: field_or(&fields, "done_when"),
            acceptance_signal: field_or(&fields, "acceptance_signal"),
            updated_at: field_or(&fields, "updated_at").or_else(|| modified_at(&path)),
        });
    }

    Ok(requests)
}

fn collect_markdown_files(root: &Path) -> Result<Vec<PathBuf>, String> {
    if !root.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    collect_markdown_files_into(root, &mut files)?;
    files.sort();
    Ok(files)
}

fn collect_markdown_files_into(root: &Path, files: &mut Vec<PathBuf>) -> Result<(), String> {
    for entry in fs::read_dir(root).map_err(|error| format!("Failed to read {}: {error}", root.display()))? {
        let entry = entry.map_err(|error| format!("Failed to read {} entry: {error}", root.display()))?;
        let path = entry.path();
        if path.is_dir() {
            if path
                .file_name()
                .and_then(|value| value.to_str())
                .map(|value| value.eq_ignore_ascii_case("_template"))
                .unwrap_or(false)
            {
                continue;
            }
            collect_markdown_files_into(&path, files)?;
        } else if path
            .extension()
            .and_then(|value| value.to_str())
            .map(|value| value.eq_ignore_ascii_case("md"))
            .unwrap_or(false)
        {
            files.push(path);
        }
    }

    Ok(())
}

fn fields_to_map(fields: &[KeyValueField]) -> BTreeMap<String, String> {
    fields
        .iter()
        .map(|field| (field.key.clone(), field.value.clone()))
        .collect()
}

fn field_or(fields: &BTreeMap<String, String>, key: &str) -> Option<String> {
    fields.get(key).map(|value| value.trim().to_string())
}

fn is_placeholder_value(value: Option<&str>) -> bool {
    let Some(value) = value else {
        return true;
    };
    matches!(
        value.trim().to_lowercase().as_str(),
        "" | "to confirm" | "not yet" | "none" | "-" | "n/a"
    )
}

fn looks_like_template_baseline(fields: &BTreeMap<String, String>) -> bool {
    matches_ci(field_or(fields, "status").as_deref(), &["BOOTSTRAPPING"])
        || is_placeholder_value(field_or(fields, "instance_name").as_deref())
        || is_placeholder_value(field_or(fields, "workspace_root").as_deref())
        || is_placeholder_value(field_or(fields, "manager_lease_holder").as_deref())
}

fn modified_at(path: &Path) -> Option<String> {
    let metadata = fs::metadata(path).ok()?;
    let modified = metadata.modified().ok()?;
    Some(chrono::DateTime::<Utc>::from(modified).to_rfc3339())
}

fn is_template_or_readme(path: &Path) -> bool {
    path.file_name()
        .and_then(|value| value.to_str())
        .map(|value| value.eq_ignore_ascii_case("README.md"))
        .unwrap_or(false)
        || path.components().any(|component| component.as_os_str() == "_template")
}

fn file_label(path: &Path) -> String {
    path.file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("document")
        .to_string()
}

fn file_stem(path: &Path) -> String {
    path.file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("item")
        .to_string()
}

fn resolve_display_or_raw(paths: &ConsolePaths, raw: &str) -> String {
    match paths.resolve_read_path(raw) {
        Ok(path) => paths.relative_display_path(&path),
        Err(_) => raw.to_string(),
    }
}

fn classify_deliverable_kind(relative: &str) -> &'static str {
    let lower = relative.to_lowercase();
    if lower.ends_with("/index.md") || lower == "index.md" {
        "index"
    } else if lower.contains("/final/") {
        "final"
    } else if lower.contains("/thread-outputs/") {
        "thread-output"
    } else {
        "other"
    }
}

fn extract_numbered_path(line: &str) -> Option<String> {
    let trimmed = line.trim();
    let (_, right) = trimmed.split_once(". ")?;
    if right.starts_with("./CodeWinter/") || right.starts_with("CodeWinter/") {
        Some(right.trim().to_string())
    } else {
        None
    }
}

fn prompt_label(heading: &str) -> LocalizedText {
    match heading.trim() {
        "Bootstrap" => lt("Bootstrap", "初始化接管"),
        "Bootstrap Greenfield" => lt("Bootstrap Greenfield", "空工作区接管"),
        "Start" => lt("Start", "开始接手"),
        "Resume" => lt("Resume", "继续推进"),
        "Collaborate" => lt("Collaborate", "交接协作"),
        "Runtime Update" => lt("Runtime Update", "运行态更新"),
        "Collaboration Request" => lt("Collaboration Request", "协作请求"),
        "Archive Direct" => lt("Archive Direct", "直接归档"),
        "Archive Bundle" => lt("Archive Bundle", "归档打包"),
        other => lt(other, other),
    }
}

fn prompt_description(heading: &str, zh_fallback: &str) -> LocalizedText {
    let en = match heading.trim() {
        "Bootstrap" => "Set up a real CodeWinter instance and assign the first manager lease.",
        "Bootstrap Greenfield" => "Shape a blank workspace from goals and constraints before code or scaffolding exists.",
        "Start" => "Hand a first bounded task to an execution thread.",
        "Resume" => "Bring an existing thread back into the next stage of work.",
        "Collaborate" => "Hand context and action cleanly from one thread to the next.",
        "Runtime Update" => "Record meaningful runtime state changes without writing a running diary.",
        "Collaboration Request" => "Create a structured collaboration request instead of a vague ask for help.",
        "Archive Direct" => "Archive a confirmed, low-risk result directly.",
        "Archive Bundle" => "Bundle cross-thread or high-value work for archive review.",
        _ => zh_fallback,
    };

    lt(en, if zh_fallback.is_empty() { heading } else { zh_fallback })
}

fn lt(en: impl Into<String>, zh: impl Into<String>) -> LocalizedText {
    LocalizedText {
        en: en.into(),
        zh: zh.into(),
    }
}

fn localized_passthrough(value: String) -> LocalizedText {
    lt(value.clone(), value)
}

fn slugify(value: &str) -> String {
    value
        .trim()
        .to_lowercase()
        .replace('&', "and")
        .chars()
        .map(|character| if character.is_ascii_alphanumeric() { character } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|segment| !segment.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

fn matches_ci(value: Option<&str>, options: &[&str]) -> bool {
    let Some(value) = value else {
        return false;
    };
    options.iter().any(|option| value.trim().eq_ignore_ascii_case(option))
}

fn is_truthy(value: Option<&str>) -> bool {
    matches_ci(value, &["true", "yes", "1"])
}

fn is_stale_active_thread(thread: &ThreadSummary) -> bool {
    matches_ci(thread.status.as_deref(), &["ACTIVE"])
        && is_placeholder_value(thread.last_meaningful_progress_at.as_deref())
}

fn priority_rank(value: Option<&str>) -> i32 {
    match value.map(|item| item.trim().to_uppercase()).as_deref() {
        Some("P0") => 0,
        Some("P1") => 1,
        Some("P2") => 2,
        Some("P3") => 3,
        _ => 9,
    }
}

fn thread_sort_key(thread: &ThreadSummary) -> (i32, i32, i32, i32, String) {
    (
        priority_rank(thread.manager_priority.as_deref()),
        if !is_placeholder_value(thread.decision_needed.as_deref()) { 0 } else { 1 },
        if is_truthy(thread.deviation_flag.as_deref()) { 0 } else { 1 },
        if matches_ci(thread.risk_gate.as_deref(), &["RED"]) { 0 } else { 1 },
        thread.thread_id.to_lowercase(),
    )
}

fn request_sort_key(request: &CollaborationRequestSummary) -> (i32, i32, String) {
    let blocking = match request
        .blocking_severity
        .as_deref()
        .map(|value| value.trim().to_uppercase())
        .as_deref()
    {
        Some("FULL") => 0,
        Some("PARTIAL") => 1,
        _ => 2,
    };
    let urgency = match request
        .urgency
        .as_deref()
        .map(|value| value.trim().to_uppercase())
        .as_deref()
    {
        Some("HIGH") => 0,
        Some("MEDIUM") => 1,
        _ => 2,
    };
    (blocking, urgency, request.request_id.to_lowercase())
}
