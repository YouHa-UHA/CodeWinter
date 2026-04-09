use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
    time::SystemTime,
};

use chrono::{DateTime, Utc};

use crate::{
    models::{
        CollaborationRequestSummary, ConsoleSnapshot, DeliverableGroup, DeliverableItem,
        DocumentProjection, ExplorerEntry, ExplorerProjection, HealthProjection, HomeDoc,
        HomeProjection, HomeSection, InboxItem, InstanceManifestProjection, InstanceSection,
        KeyValueField, LocalizedText, PromptEntry, ReleaseSummary, RuntimeAlert,
        RuntimeProjection, ThreadSummary, UploadZoneProjection, WorkbenchProjection,
    },
    parser::{parse_field_map, parse_key_value_fields, parse_markdown_sections, read_utf8_file},
    paths::ConsolePaths,
};

pub fn build_snapshot(paths: &ConsolePaths) -> Result<ConsoleSnapshot, String> {
    let release_manifest_path = paths.codewinter_root.join("_core").join("release-manifest.md");
    let manager_brief_path = paths.control_plane_dir.join("manager-brief.md");
    let instance_manifest_path = paths.control_plane_dir.join("instance-manifest.md");

    let release_fields = parse_field_map(&release_manifest_path)?;
    let manager_sections = parse_markdown_sections(&manager_brief_path)?;
    let instance_fields = parse_key_value_fields(&instance_manifest_path)?;
    let instance_field_map = fields_to_map(&instance_fields);

    let prompts = load_prompt_entries(paths)?;
    let threads = load_threads(paths)?;
    let collab_requests = load_collaboration_requests(paths)?;
    let inbox_items = load_inbox_items(paths, &paths.inbox_dir)?;
    let task_packet_drop_items = load_inbox_items(paths, &paths.task_packet_drop_dir)?;
    let deliverables = load_deliverables(paths)?;
    let explorer_entries = load_explorer_entries(paths, &release_fields);
    let alerts = build_runtime_alerts(&threads, &collab_requests, &instance_field_map);
    let warnings = build_health_warnings(&instance_field_map, &threads);
    let generated_at = Utc::now().to_rfc3339();

    Ok(ConsoleSnapshot {
        snapshot_version: 1,
        generated_at: generated_at.clone(),
        codewinter_root: paths.codewinter_root.to_string_lossy().replace('\\', "/"),
        release: ReleaseSummary {
            version: release_fields
                .get("release_version")
                .cloned()
                .unwrap_or_else(|| "unknown".to_string()),
            channel: release_fields
                .get("release_channel")
                .cloned()
                .unwrap_or_else(|| "unknown".to_string()),
            theme: release_fields.get("release_theme").cloned(),
            codename: release_fields.get("release_codename").cloned(),
        },
        home: build_home_projection(paths, &release_fields),
        manager_brief: DocumentProjection {
            path: paths.relative_display_path(&manager_brief_path),
            sections: manager_sections,
        },
        instance_manifest: InstanceManifestProjection {
            path: paths.relative_display_path(&instance_manifest_path),
            fields: instance_fields.clone(),
            sections: group_instance_fields(instance_fields),
        },
        workbench: WorkbenchProjection {
            prompts,
            upload_zones: build_upload_zones(paths, inbox_items, task_packet_drop_items),
            deliverable_groups: group_deliverables(deliverables),
        },
        runtime: RuntimeProjection {
            manager_lease_holder: instance_field_map.get("manager_lease_holder").cloned(),
            threads,
            collab_requests,
            alerts,
        },
        explorer: ExplorerProjection {
            entries: explorer_entries,
        },
        health: HealthProjection {
            refresh_status: if warnings.is_empty() {
                "idle".to_string()
            } else {
                "degraded".to_string()
            },
            last_good_at: Some(generated_at),
            warnings,
        },
    })
}

fn build_home_projection(
    paths: &ConsolePaths,
    release_fields: &BTreeMap<String, String>,
) -> HomeProjection {
    let featured_docs = vec![
        home_doc_from_release_field(
            paths,
            release_fields,
            "project_introduction_archive_path",
            "project-introduction",
            localized("Project Introduction", "项目介绍"),
            localized(
                "A concise overview of what CodeWinter is, why it exists, and what capabilities it provides.",
                "帮助你快速理解 CodeWinter 是什么、为什么存在，以及它提供了哪些核心能力。",
            ),
        ),
        home_doc_from_release_field(
            paths,
            release_fields,
            "usage_guide_archive_path",
            "usage-guide",
            localized("Usage Guide", "使用说明"),
            localized(
                "The operating guide for bootstrapping, daily collaboration, runtime coordination, and upgrades.",
                "说明初始化接入、日常协作、运行态观察以及实例升级方式的系统使用文档。",
            ),
        ),
    ]
    .into_iter()
    .flatten()
    .collect::<Vec<_>>();

    let sections = vec![
        home_section(
            "getting-started",
            localized("Getting Started", "开始使用"),
            localized(
                "The first documents a human operator or manager thread should read when entering a CodeWinter workspace.",
                "进入 CodeWinter 工作区后，管理者或管理线程应优先阅读的系统入口文档。",
            ),
            vec![
                home_doc_from_path(
                    paths,
                    "readme",
                    paths.codewinter_root.join("README.md"),
                    localized("Repository Overview", "仓库总览"),
                    localized(
                        "The public-facing overview of CodeWinter as a portable collaboration control plane.",
                        "面向仓库阅读者的公开总览，介绍 CodeWinter 的定位与核心能力。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "starter",
                    paths.codewinter_root.join("read.md"),
                    localized("Starter Entry", "Starter 入口"),
                    localized(
                        "The shared starter entry for manager and execution threads.",
                        "管理线程与执行线程共用的统一启动入口。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "start-here",
                    paths.control_plane_dir.join("start-here.md"),
                    localized("Manager Navigation", "管理入口"),
                    localized(
                        "The manager-facing navigation page for the active control plane.",
                        "面向管理者的控制面导航页，用于快速定位最常用入口。",
                    ),
                ),
            ],
        ),
        home_section(
            "core-docs",
            localized("Core System Docs", "系统核心文档"),
            localized(
                "The platform-level documents that explain how CodeWinter is designed, versioned, and upgraded.",
                "说明 CodeWinter 如何设计、如何版本化，以及如何升级的本体级文档。",
            ),
            vec![
                home_doc_from_path(
                    paths,
                    "design-principles",
                    paths.codewinter_root.join("_core").join("design-principles.md"),
                    localized("Design Principles", "设计原则"),
                    localized(
                        "The foundational ideas behind progressive disclosure, runtime coordination, and harness engineering.",
                        "解释渐进式披露、运行态协作层与 Harness Engineering 等核心设计思想。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "bootstrap-contract",
                    paths.codewinter_root.join("_core").join("bootstrap-v1.md"),
                    localized("Bootstrap Contract", "Bootstrap 协议"),
                    localized(
                        "Defines how a fresh CodeWinter folder becomes a running project instance.",
                        "定义一个全新的 CodeWinter 文件夹如何被初始化成真实项目实例。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "versioning-model",
                    paths.codewinter_root.join("_core").join("versioning-model-v1.md"),
                    localized("Versioning Model", "版本模型"),
                    localized(
                        "Explains release versions, instance schema versions, and runtime coordination versions.",
                        "说明发布版本、实例结构版本与运行协作版本之间的关系。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "upgrade-migration",
                    paths.codewinter_root.join("_core").join("upgrade-migration-v1.md"),
                    localized("Upgrade & Migration", "升级与迁移"),
                    localized(
                        "Defines how running instances should follow core upgrades through migration instead of replacement.",
                        "说明运行中的项目实例应如何通过迁移，而不是覆盖文件，来跟进本体升级。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "tool-portability",
                    paths.codewinter_root.join("_core").join("tool-portability.md"),
                    localized("Tool Portability", "工具可迁移约定"),
                    localized(
                        "Describes how CodeWinter remains portable across different AI coding tools.",
                        "说明 CodeWinter 如何在不同 AI coding 工具之间保持可迁移性。",
                    ),
                ),
            ],
        ),
        home_section(
            "release-docs",
            localized("Release & Governance Docs", "发布与治理文档"),
            localized(
                "The documents that explain the current release baseline, governance rules, and release notes model.",
                "说明当前发布基线、发布治理规则与发布说明模型的文档集合。",
            ),
            vec![
                home_doc_from_path(
                    paths,
                    "release-manifest",
                    paths.codewinter_root.join("_core").join("release-manifest.md"),
                    localized("Release Manifest", "发布清单"),
                    localized(
                        "The current release baseline for the CodeWinter core.",
                        "记录当前 CodeWinter 本体发布基线的清单文件。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "release-governance",
                    paths.codewinter_root.join("_core").join("release-governance-v1.md"),
                    localized("Release Governance", "发布治理"),
                    localized(
                        "Defines draft, candidate, and stable release channels.",
                        "定义 draft、candidate 与 stable 等发布通道及其治理边界。",
                    ),
                ),
                home_doc_from_path(
                    paths,
                    "release-notes-model",
                    paths.codewinter_root.join("_core").join("release-notes-model-v1.md"),
                    localized("Release Notes Model", "发布说明模型"),
                    localized(
                        "Defines how release notes should be written as migration-oriented release communications.",
                        "定义发布说明应如何围绕迁移与升级决策来编写。",
                    ),
                ),
                home_doc_from_release_field(
                    paths,
                    release_fields,
                    "release_notes_path",
                    "current-release-notes",
                    localized("Current Release Notes", "当前版本说明"),
                    localized(
                        "The detailed notes for the current core release.",
                        "当前本体发布版本的详细说明与变更摘要。",
                    ),
                ),
            ],
        ),
        home_section(
            "console-docs",
            localized("Operator Console Docs", "Operator Console 文档"),
            localized(
                "Docs that describe the downstream operator console and its role relative to the CodeWinter core.",
                "说明 Operator Console 的定位，以及它与 CodeWinter 本体之间边界关系的文档。",
            ),
            vec![home_doc_from_path(
                paths,
                "operator-console",
                paths.codewinter_root.join("_console").join("README.md"),
                localized("Operator Console Overview", "Operator Console 说明"),
                localized(
                    "Explains what the operator console does, what it is allowed to write, and how it stays subordinate to the core.",
                    "说明 Operator Console 的作用、允许的写入边界，以及它如何保持从属于本体。",
                ),
            )],
        ),
    ]
    .into_iter()
    .filter(|section| !section.docs.is_empty())
    .collect::<Vec<_>>();

    HomeProjection {
        featured_docs,
        sections,
    }
}
fn load_prompt_entries(paths: &ConsolePaths) -> Result<Vec<PromptEntry>, String> {
    let quick_prompts_path = paths.manager_toolkit_dir.join("quick-prompts.md");
    let mut entries = Vec::new();
    let mut seen_paths = BTreeSet::new();

    if quick_prompts_path.exists() {
        for seed in parse_prompt_index(paths, &quick_prompts_path)? {
            seen_paths.insert(seed.path.clone());
            entries.push(build_prompt_entry(&seed));
        }
    }

    for file in collect_markdown_files(&paths.manager_toolkit_dir)? {
        if should_skip_toolkit_prompt(&file) {
            continue;
        }

        let relative_path = paths.relative_display_path(&file);
        if seen_paths.contains(&relative_path) {
            continue;
        }

        entries.push(build_prompt_entry(&PromptSeed {
            label: first_heading(&file)?.unwrap_or_else(|| infer_prompt_label_from_path(&file)),
            description: first_prompt_summary(&file)?,
            path: relative_path,
        }));
    }

    Ok(entries)
}

fn load_threads(paths: &ConsolePaths) -> Result<Vec<ThreadSummary>, String> {
    let mut summaries = Vec::new();
    for file in collect_markdown_files(&paths.threads_dir)? {
        if should_skip_template_file(&file) {
            continue;
        }

        let fields = parse_field_map(&file)?;
        let thread_id = fields
            .get("thread_id")
            .cloned()
            .or_else(|| file.file_stem().map(|value| value.to_string_lossy().into_owned()))
            .unwrap_or_else(|| "unknown-thread".to_string());

        summaries.push(ThreadSummary {
            thread_id,
            path: paths.relative_display_path(&file),
            tool: fields.get("tool").cloned(),
            role: fields.get("role").cloned(),
            status: fields.get("status").cloned(),
            phase: fields.get("phase").cloned(),
            scope_claims: fields.get("scope_claims").cloned(),
            confidence: fields.get("confidence").cloned(),
            deviation_flag: fields.get("deviation_flag").cloned(),
            decision_needed: fields.get("decision_needed").cloned(),
            recommended_next_step: fields.get("recommended_next_step").cloned(),
            last_updated: fields.get("last_updated").cloned(),
        });
    }

    summaries.sort_by(|left, right| left.thread_id.cmp(&right.thread_id));
    Ok(summaries)
}

fn load_collaboration_requests(paths: &ConsolePaths) -> Result<Vec<CollaborationRequestSummary>, String> {
    let mut summaries = Vec::new();
    for file in collect_markdown_files(&paths.collab_requests_dir)? {
        if should_skip_template_file(&file) {
            continue;
        }

        let fields = parse_field_map(&file)?;
        let request_id = fields
            .get("request_id")
            .cloned()
            .or_else(|| file.file_stem().map(|value| value.to_string_lossy().into_owned()))
            .unwrap_or_else(|| "unknown-request".to_string());

        summaries.push(CollaborationRequestSummary {
            request_id,
            path: paths.relative_display_path(&file),
            from_thread_id: fields.get("from_thread_id").cloned(),
            status: fields.get("status").cloned(),
            r#type: fields.get("type").cloned(),
            urgency: fields.get("urgency").cloned(),
            target_thread_id: fields.get("target_thread_id").cloned(),
            target_capability: fields.get("target_capability").cloned(),
            acceptance_signal: fields.get("acceptance_signal").cloned(),
            updated_at: fields.get("updated_at").cloned(),
        });
    }

    summaries.sort_by(|left, right| left.request_id.cmp(&right.request_id));
    Ok(summaries)
}

fn load_inbox_items(paths: &ConsolePaths, root: &Path) -> Result<Vec<InboxItem>, String> {
    let mut items = Vec::new();
    for file in collect_all_files(root)? {
        let metadata = fs::metadata(&file)
            .map_err(|error| format!("Failed to read file metadata for {}: {error}", file.display()))?;
        items.push(InboxItem {
            name: file
                .file_name()
                .map(|value| value.to_string_lossy().into_owned())
                .unwrap_or_else(|| "unknown".to_string()),
            path: paths.relative_display_path(&file),
            modified_at: metadata.modified().ok().map(system_time_to_rfc3339),
        });
    }

    items.sort_by(|left, right| right.modified_at.cmp(&left.modified_at));
    Ok(items)
}

fn load_deliverables(paths: &ConsolePaths) -> Result<Vec<DeliverableItem>, String> {
    let mut items = Vec::new();
    for file in collect_markdown_files(&paths.deliverables_dir)? {
        let relative_path = paths.relative_display_path(&file);
        let normalized = relative_path.replace('\\', "/");
        let label = file
            .file_name()
            .map(|value| value.to_string_lossy().into_owned())
            .unwrap_or_else(|| normalized.clone());

        let kind = if normalized.contains("/final/") {
            "final"
        } else if normalized.contains("/thread-outputs/") {
            "thread-output"
        } else if normalized.ends_with("/index.md") || normalized.ends_with("index.md") {
            "index"
        } else {
            "other"
        };

        items.push(DeliverableItem {
            label,
            path: relative_path,
            kind: kind.to_string(),
        });
    }

    items.sort_by(|left, right| left.path.cmp(&right.path));
    Ok(items)
}

fn load_explorer_entries(
    paths: &ConsolePaths,
    release_fields: &BTreeMap<String, String>,
) -> Vec<ExplorerEntry> {
    let mut entries = vec![
        explorer_file(
            paths,
            "manager-brief.md",
            paths.control_plane_dir.join("manager-brief.md"),
            "control-plane",
        ),
        explorer_file(
            paths,
            "active-queue.md",
            paths.control_plane_dir.join("active-queue.md"),
            "control-plane",
        ),
        explorer_file(
            paths,
            "thread-board.md",
            paths.control_plane_dir.join("thread-board.md"),
            "runtime",
        ),
        explorer_file(
            paths,
            "instance-manifest.md",
            paths.control_plane_dir.join("instance-manifest.md"),
            "runtime",
        ),
        explorer_file(
            paths,
            "release-manifest.md",
            paths.codewinter_root.join("_core").join("release-manifest.md"),
            "release",
        ),
        explorer_dir(paths, "threads/", paths.threads_dir.clone(), "runtime"),
        explorer_dir(
            paths,
            "collab-requests/",
            paths.collab_requests_dir.clone(),
            "runtime",
        ),
        explorer_dir(
            paths,
            "05-deliverables/",
            paths.deliverables_dir.clone(),
            "deliverables",
        ),
        explorer_dir(paths, "10-services/", paths.codewinter_root.join("10-services"), "knowledge"),
    ];

    if let Some(release_notes_path) = release_fields.get("release_notes_path") {
        if let Ok(candidate) = paths.resolve_read_path(release_notes_path) {
            entries.push(explorer_file(
                paths,
                "current release notes",
                candidate,
                "release",
            ));
        }
    }

    entries
}

fn build_runtime_alerts(
    threads: &[ThreadSummary],
    collab_requests: &[CollaborationRequestSummary],
    instance_fields: &BTreeMap<String, String>,
) -> Vec<RuntimeAlert> {
    let mut alerts = Vec::new();

    if instance_fields
        .get("status")
        .map(|value| value == "BOOTSTRAPPING")
        .unwrap_or(false)
    {
        alerts.push(RuntimeAlert {
            level: "info".to_string(),
            message: "Current instance is still at the BOOTSTRAPPING baseline.".to_string(),
            source: Some("./CodeWinter/00-control-plane/instance-manifest.md".to_string()),
        });
    }

    for thread in threads.iter().filter(|thread| {
        thread
            .deviation_flag
            .as_deref()
            .map(|value| value.eq_ignore_ascii_case("true"))
            .unwrap_or(false)
    }) {
        alerts.push(RuntimeAlert {
            level: "warning".to_string(),
            message: format!("Thread {} explicitly reported deviation.", thread.thread_id),
            source: Some(thread.path.clone()),
        });
    }

    for thread in threads.iter().filter(|thread| {
        thread
            .decision_needed
            .as_deref()
            .map(|value| {
                let normalized = value.trim();
                !normalized.is_empty() && normalized != "—" && normalized != "None"
            })
            .unwrap_or(false)
    }) {
        alerts.push(RuntimeAlert {
            level: "warning".to_string(),
            message: format!("Thread {} still has a pending decision.", thread.thread_id),
            source: Some(thread.path.clone()),
        });
    }

    for thread in threads.iter().filter(|thread| {
        matches!(
            thread.status.as_deref(),
            Some("BLOCKED") | Some("NEEDS_COLLAB") | Some("HANDOFF_READY")
        )
    }) {
        alerts.push(RuntimeAlert {
            level: "info".to_string(),
            message: format!(
                "Thread {} is currently in status {}.",
                thread.thread_id,
                thread.status.as_deref().unwrap_or("unknown")
            ),
            source: Some(thread.path.clone()),
        });
    }

    for request in collab_requests.iter().filter(|request| {
        request.urgency.as_deref() == Some("HIGH") && request.status.as_deref() != Some("FULFILLED")
    }) {
        alerts.push(RuntimeAlert {
            level: "warning".to_string(),
            message: format!(
                "Collaboration request {} is still pending at HIGH urgency.",
                request.request_id
            ),
            source: Some(request.path.clone()),
        });
    }

    alerts
}

fn build_health_warnings(
    instance_fields: &BTreeMap<String, String>,
    threads: &[ThreadSummary],
) -> Vec<String> {
    let mut warnings = Vec::new();

    if instance_fields
        .get("instance_name")
        .map(|value| value == "to confirm")
        .unwrap_or(true)
    {
        warnings.push("Current instance-manifest still looks like a template baseline.".to_string());
    }

    if threads.is_empty() {
        warnings.push(
            "No real thread cards were detected yet; Runtime may still be showing an empty baseline."
                .to_string(),
        );
    }

    warnings
}

fn parse_prompt_index(paths: &ConsolePaths, quick_prompts_path: &Path) -> Result<Vec<PromptSeed>, String> {
    let content = read_utf8_file(quick_prompts_path)?;
    let mut seeds = Vec::new();
    let mut current_label: Option<String> = None;
    let mut current_description: Option<String> = None;
    let mut current_path: Option<String> = None;

    for raw_line in content.lines() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        if let Some(label) = line.strip_prefix("## ") {
            flush_prompt_seed(
                &mut seeds,
                current_label.take(),
                current_description.take(),
                current_path.take(),
            );
            current_label = Some(label.trim().to_string());
            continue;
        }

        if current_label.is_none() {
            continue;
        }

        if current_description.is_none() && !line.starts_with("1. ") && !line.starts_with("2. ") {
            current_description = Some(line.to_string());
            continue;
        }

        if current_path.is_none() {
            if let Some(path) = extract_markdown_path(line) {
                current_path = Some(paths.relative_display_path(&paths.resolve_read_path(&path)?));
            }
        }
    }

    flush_prompt_seed(
        &mut seeds,
        current_label.take(),
        current_description.take(),
        current_path.take(),
    );

    Ok(seeds)
}

fn flush_prompt_seed(
    seeds: &mut Vec<PromptSeed>,
    label: Option<String>,
    description: Option<String>,
    path: Option<String>,
) {
    if let (Some(label), Some(path)) = (label, path) {
        seeds.push(PromptSeed {
            label,
            description,
            path,
        });
    }
}

fn extract_markdown_path(line: &str) -> Option<String> {
    for marker in ["./CodeWinter/"] {
        if let Some(start) = line.find(marker) {
            let raw = &line[start..];
            let trimmed = raw.trim().trim_matches('`');
            return Some(trimmed.to_string());
        }
    }

    None
}

fn build_prompt_entry(seed: &PromptSeed) -> PromptEntry {
    let id = normalize_prompt_id(&seed.path);
    let zh_description = seed
        .description
        .as_deref()
        .map(clean_prompt_description)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| prompt_description_zh(&id).to_string());

    PromptEntry {
        id: id.clone(),
        path: seed.path.clone(),
        label: localized(prompt_label_en(&id, &seed.label), prompt_label_zh(&id, &seed.label)),
        description: localized(prompt_description_en(&id), zh_description),
    }
}

fn group_instance_fields(fields: Vec<KeyValueField>) -> Vec<InstanceSection> {
    let basics = [
        "instance_name",
        "workspace_root",
        "status",
        "compatibility_window",
        "manager_lease_holder",
        "last_bootstrap_at",
        "last_upgrade_at",
    ];
    let release = [
        "release_version",
        "release_channel",
        "release_theme",
        "release_codename",
        "release_notes_path",
    ];
    let compatibility = [
        "instance_schema_version",
        "runtime_coordination_version",
        "bootstrap_contract_version",
        "migration_contract_version",
        "release_governance_version",
        "release_notes_model_version",
    ];
    let control_plane = [
        "manager_brief",
        "active_queue",
        "thread_board",
        "upgrade_plan",
        "upgrade_log",
    ];

    let mut basics_fields = Vec::new();
    let mut release_fields = Vec::new();
    let mut compatibility_fields = Vec::new();
    let mut control_plane_fields = Vec::new();

    for field in fields {
        if basics.contains(&field.key.as_str()) {
            basics_fields.push(field);
        } else if release.contains(&field.key.as_str()) {
            release_fields.push(field);
        } else if compatibility.contains(&field.key.as_str()) {
            compatibility_fields.push(field);
        } else if control_plane.contains(&field.key.as_str()) {
            control_plane_fields.push(field);
        } else {
            compatibility_fields.push(field);
        }
    }

    let mut sections = Vec::new();
    push_section(
        &mut sections,
        "basics",
        localized("Instance Basics", "实例基础"),
        localized(
            "Who this instance is, what state it is in, and whether it has already been claimed by a real project.",
            "这一组字段说明当前实例是谁、处于什么状态，以及是否已经被真实项目接管。",
        ),
        basics_fields,
    );
    push_section(
        &mut sections,
        "release",
        localized("Release Baseline", "发布基线"),
        localized(
            "Which CodeWinter core release this instance is currently aligned with.",
            "这一组字段说明当前实例对齐的是哪一版 CodeWinter 本体发布。",
        ),
        release_fields,
    );
    push_section(
        &mut sections,
        "compatibility",
        localized("Compatibility & Contracts", "兼容与协议"),
        localized(
            "Compatibility lines and contract versions used for migration, upgrade, and governance decisions.",
            "这一组字段主要服务于升级、迁移和治理判断，而不是日常业务状态本身。",
        ),
        compatibility_fields,
    );
    push_section(
        &mut sections,
        "control-plane",
        localized("Control Plane Links", "控制面入口"),
        localized(
            "Jump links to the main control-plane artifacts that the manager thread and the console use most often.",
            "这一组路径帮助管理线程和 Console 快速定位最常用的控制面工件。",
        ),
        control_plane_fields,
    );

    sections
}
fn push_section(
    sections: &mut Vec<InstanceSection>,
    id: &str,
    title: LocalizedText,
    description: LocalizedText,
    fields: Vec<KeyValueField>,
) {
    if !fields.is_empty() {
        sections.push(InstanceSection {
            id: id.to_string(),
            title,
            description,
            fields,
        });
    }
}

fn build_upload_zones(
    paths: &ConsolePaths,
    inbox_items: Vec<InboxItem>,
    task_packet_drop_items: Vec<InboxItem>,
) -> Vec<UploadZoneProjection> {
    vec![
        UploadZoneProjection {
            target: "inbox".to_string(),
            path: paths.relative_display_path(&paths.inbox_dir),
            kicker: localized("Inbox", "收件箱"),
            title: localized("Safe write to 03-inbox", "安全写入 03-inbox"),
            headline: localized(
                "Raw intake for the manager thread",
                "管理线程原始收件入口",
            ),
            body: localized(
                "Use this area to hand raw files to the manager thread without mutating protocol files or the long-term knowledge layer.",
                "这里用于向管理线程投递原始材料，不直接改动协议文件或长期知识层。",
            ),
            button_label: localized("Choose a file and write it to Inbox", "选择文件写入 Inbox"),
            empty_state: localized(
                "No inbox files have been detected yet.",
                "当前还没有检测到 Inbox 文件。",
            ),
            items: inbox_items,
        },
        UploadZoneProjection {
            target: "taskPacketDrop".to_string(),
            path: paths.relative_display_path(&paths.task_packet_drop_dir),
            kicker: localized("Task Packet Drop", "任务投递区"),
            title: localized(
                "Safe write to 04-task-packets/_incoming",
                "安全写入 04-task-packets/_incoming",
            ),
            headline: localized(
                "Stage raw files for child-thread delivery",
                "为子线程任务暂存原始附件",
            ),
            body: localized(
                "Use this drop zone to stage files that will later be organized into a real packet.md and task packet structure.",
                "这里用于暂存后续要整理成 packet.md 和正式任务包结构的原始附件。",
            ),
            button_label: localized(
                "Choose a file and send it to Task Packets",
                "选择文件投递到 Task Packets",
            ),
            empty_state: localized(
                "No task packet drop files have been detected yet.",
                "当前还没有检测到任务投递文件。",
            ),
            items: task_packet_drop_items,
        },
    ]
}
fn group_deliverables(items: Vec<DeliverableItem>) -> Vec<DeliverableGroup> {
    let mut groups = BTreeMap::new();

    for item in items {
        let normalized = item.path.replace('\\', "/");
        let id = if normalized.contains("/05-deliverables/governance/") {
            "governance"
        } else if normalized.contains("/05-deliverables/tasks/") {
            "tasks"
        } else {
            "other"
        };

        groups
            .entry(id.to_string())
            .or_insert_with(Vec::new)
            .push(item);
    }

    groups
        .into_iter()
        .map(|(id, mut items)| {
            items.sort_by(deliverable_item_cmp);
            let (title, description) = match id.as_str() {
                "governance" => (
                    localized("Governance", "治理"),
                    localized(
                        "Governance, architecture, roadmap, and operating-model outputs.",
                        "治理、架构、路线图与协作模式相关的正式输出。",
                    ),
                ),
                "tasks" => (
                    localized("Tasks", "任务"),
                    localized(
                        "Formal outputs for concrete project tasks.",
                        "面向具体业务任务的正式输出。",
                    ),
                ),
                _ => (
                    localized("Other", "其他"),
                    localized(
                        "Outputs that do not currently fall under governance or tasks.",
                        "当前暂未落入 governance 或 tasks 结构的正式输出。",
                    ),
                ),
            };

            DeliverableGroup {
                id,
                title,
                description,
                items,
            }
        })
        .collect()
}
fn home_section(
    id: &str,
    title: LocalizedText,
    description: LocalizedText,
    docs: Vec<Option<HomeDoc>>,
) -> HomeSection {
    HomeSection {
        id: id.to_string(),
        title,
        description,
        docs: docs.into_iter().flatten().collect(),
    }
}

fn home_doc_from_path(
    paths: &ConsolePaths,
    id: &str,
    path: PathBuf,
    label: LocalizedText,
    description: LocalizedText,
) -> Option<HomeDoc> {
    if !path.exists() {
        return None;
    }

    Some(HomeDoc {
        id: id.to_string(),
        label,
        description,
        path: paths.relative_display_path(&path),
    })
}

fn home_doc_from_release_field(
    paths: &ConsolePaths,
    release_fields: &BTreeMap<String, String>,
    field: &str,
    id: &str,
    label: LocalizedText,
    description: LocalizedText,
) -> Option<HomeDoc> {
    let relative_path = release_fields.get(field)?;
    let path = paths.resolve_read_path(relative_path).ok()?;
    home_doc_from_path(paths, id, path, label, description)
}

fn collect_markdown_files(root: &Path) -> Result<Vec<PathBuf>, String> {
    collect_paths(root, true)
}

fn collect_all_files(root: &Path) -> Result<Vec<PathBuf>, String> {
    collect_paths(root, false)
}

fn collect_paths(root: &Path, markdown_only: bool) -> Result<Vec<PathBuf>, String> {
    if !root.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    let mut stack = vec![root.to_path_buf()];

    while let Some(current) = stack.pop() {
        let entries = fs::read_dir(&current)
            .map_err(|error| format!("Failed to walk directory {}: {error}", current.display()))?;

        for entry in entries {
            let entry = entry.map_err(|error| format!("Failed to read directory entry: {error}"))?;
            let path = entry.path();
            if path.is_dir() {
                stack.push(path);
                continue;
            }

            if markdown_only {
                let is_markdown = path
                    .extension()
                    .and_then(|value| value.to_str())
                    .map(|value| value.eq_ignore_ascii_case("md"))
                    .unwrap_or(false);
                if !is_markdown {
                    continue;
                }
            }

            files.push(path);
        }
    }

    files.sort();
    Ok(files)
}

fn should_skip_template_file(path: &Path) -> bool {
    let normalized = path.to_string_lossy().replace('\\', "/");
    normalized.contains("/_template/") || normalized.ends_with("/README.md")
}

fn should_skip_toolkit_prompt(path: &Path) -> bool {
    let normalized = path.to_string_lossy().replace('\\', "/");
    normalized.ends_with("/quick-prompts.md")
}

fn explorer_file(paths: &ConsolePaths, label: &str, path: PathBuf, area: &str) -> ExplorerEntry {
    ExplorerEntry {
        label: label.to_string(),
        path: paths.relative_display_path(&path),
        area: area.to_string(),
        kind: "file".to_string(),
    }
}

fn explorer_dir(paths: &ConsolePaths, label: &str, path: PathBuf, area: &str) -> ExplorerEntry {
    ExplorerEntry {
        label: label.to_string(),
        path: paths.relative_display_path(&path),
        area: area.to_string(),
        kind: "directory".to_string(),
    }
}

fn fields_to_map(fields: &[KeyValueField]) -> BTreeMap<String, String> {
    fields
        .iter()
        .map(|field| (field.key.clone(), field.value.clone()))
        .collect::<BTreeMap<_, _>>()
}

fn system_time_to_rfc3339(value: SystemTime) -> String {
    let date_time: DateTime<Utc> = value.into();
    date_time.to_rfc3339()
}

fn deliverable_item_cmp(left: &DeliverableItem, right: &DeliverableItem) -> std::cmp::Ordering {
    deliverable_kind_rank(&left.kind)
        .cmp(&deliverable_kind_rank(&right.kind))
        .then_with(|| left.path.cmp(&right.path))
}

fn deliverable_kind_rank(kind: &str) -> u8 {
    match kind {
        "final" => 0,
        "index" => 1,
        "thread-output" => 2,
        _ => 3,
    }
}

fn localized(en: impl Into<String>, zh: impl Into<String>) -> LocalizedText {
    LocalizedText {
        en: en.into(),
        zh: zh.into(),
    }
}

fn normalize_prompt_id(path: &str) -> String {
    let normalized = path.replace('\\', "/");
    if normalized.ends_with("/bootstrap-manager.md") {
        "bootstrap".to_string()
    } else if normalized.ends_with("/thread-start.md") {
        "start".to_string()
    } else if normalized.ends_with("/thread-resume.md") {
        "resume".to_string()
    } else if normalized.ends_with("/thread-handoff.md") {
        "handoff".to_string()
    } else if normalized.ends_with("/thread-runtime-update.md") {
        "runtime-update".to_string()
    } else if normalized.ends_with("/collab-request.md") {
        "collab-request".to_string()
    } else if normalized.ends_with("/archive-direct.md") {
        "archive-direct".to_string()
    } else if normalized.ends_with("/archive-bundle.md") {
        "archive-bundle".to_string()
    } else {
        Path::new(&normalized)
            .file_stem()
            .and_then(|value| value.to_str())
            .unwrap_or("prompt")
            .to_string()
    }
}

fn prompt_label_zh(id: &str, fallback: &str) -> String {
    match id {
        "bootstrap" => "初始化接管".to_string(),
        "start" => "开始接手".to_string(),
        "resume" => "继续执行".to_string(),
        "handoff" => "交接接力".to_string(),
        "runtime-update" => "运行态更新".to_string(),
        "collab-request" => "协作请求".to_string(),
        "archive-direct" => "直接归档".to_string(),
        "archive-bundle" => "归档包".to_string(),
        _ => fallback.to_string(),
    }
}
fn prompt_label_en(id: &str, fallback: &str) -> String {
    match id {
        "bootstrap" => "Bootstrap".to_string(),
        "start" => "Start".to_string(),
        "resume" => "Resume".to_string(),
        "handoff" => "Handoff".to_string(),
        "runtime-update" => "Runtime Update".to_string(),
        "collab-request" => "Collaboration Request".to_string(),
        "archive-direct" => "Archive Direct".to_string(),
        "archive-bundle" => "Archive Bundle".to_string(),
        _ => fallback.to_string(),
    }
}

fn prompt_description_en(id: &str) -> String {
    match id {
        "bootstrap" => "Set up a new CodeWinter instance and hand the first lease to the manager thread.",
        "start" => "Use when an execution thread is taking ownership of a task for the first time.",
        "resume" => "Use when an existing execution thread is reactivated for a new phase or a new issue.",
        "handoff" => "Transfer stable context, action boundaries, and next-step guidance to another thread.",
        "runtime-update" => "Report runtime status, blockage, deviation, or completion without writing a full handoff.",
        "collab-request" => "Request collaboration from another thread with a clearly scoped ask and acceptance signal.",
        "archive-direct" => "Archive a low-risk, narrow-scope task directly when the result is confirmed.",
        "archive-bundle" => "Prepare a higher-value or multi-thread archive bundle for confirmation before writing back.",
        _ => "Open this prompt template from the manager toolkit.",
    }
    .to_string()
}

fn prompt_description_zh(id: &str) -> &'static str {
    match id {
        "bootstrap" => "用于新项目第一次接入 CodeWinter，由管理线程完成初始化接管。",
        "start" => "用于执行线程第一次接手某个边界清晰的任务。",
        "resume" => "用于旧执行线程在新阶段或新问题中被重新唤起。",
        "handoff" => "用于把稳定上下文、动作边界和下一步建议交给另一个线程。",
        "runtime-update" => "用于登记运行态、上报阻塞、偏航、待决策事项或完成状态。",
        "collab-request" => "用于发起跨线程协作请求，并把当前为什么需要协作说明清楚。",
        "archive-direct" => "用于低风险、小范围任务的直接归档。",
        "archive-bundle" => "用于跨线程或高价值任务的归档包准备与确认。",
        _ => "用于从管理工具箱中打开这份提示词模板。",
    }
}
fn clean_prompt_description(value: &str) -> String {
    value
        .trim()
        .trim_start_matches("适用场景：")
        .trim_start_matches("适用场景:")
        .trim()
        .to_string()
}
fn first_heading(path: &Path) -> Result<Option<String>, String> {
    let content = read_utf8_file(path)?;
    Ok(content
        .lines()
        .map(str::trim)
        .find_map(|line| line.strip_prefix("# ").map(|value| value.trim().to_string())))
}

fn first_prompt_summary(path: &Path) -> Result<Option<String>, String> {
    let content = read_utf8_file(path)?;
    let mut inside_code_block = false;

    for raw_line in content.lines() {
        let line = raw_line.trim();

        if line.starts_with("```") {
            inside_code_block = !inside_code_block;
            continue;
        }

        if inside_code_block || line.is_empty() || line.starts_with('#') {
            continue;
        }

        return Ok(Some(line.to_string()));
    }

    Ok(None)
}

fn infer_prompt_label_from_path(path: &Path) -> String {
    path.file_stem()
        .and_then(|value| value.to_str())
        .map(|value| value.replace('-', " "))
        .unwrap_or_else(|| "Prompt".to_string())
}

#[derive(Debug, Clone)]
struct PromptSeed {
    label: String,
    description: Option<String>,
    path: String,
}
