use std::{
    fs,
    path::{Component, Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

const DISPLAY_ROOT_NAME: &str = "CodeWinter";

#[derive(Debug, Clone)]
pub struct ConsolePaths {
    pub codewinter_root: PathBuf,
    pub workspace_root: PathBuf,
    pub control_plane_dir: PathBuf,
    pub manager_toolkit_dir: PathBuf,
    pub inbox_dir: PathBuf,
    pub task_packets_dir: PathBuf,
    pub task_packet_drop_dir: PathBuf,
    pub deliverables_dir: PathBuf,
    pub releases_dir: PathBuf,
    pub threads_dir: PathBuf,
    pub collab_requests_dir: PathBuf,
}

impl ConsolePaths {
    pub fn discover() -> Result<Self, String> {
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let console_root = manifest_dir
            .parent()
            .ok_or_else(|| "Could not resolve _console root.".to_string())?
            .to_path_buf();
        let codewinter_root = console_root
            .parent()
            .ok_or_else(|| "Could not resolve CodeWinter root.".to_string())?
            .to_path_buf();
        let workspace_root = codewinter_root
            .parent()
            .ok_or_else(|| "Could not resolve workspace root.".to_string())?
            .to_path_buf();
        let task_packets_dir = codewinter_root.join("04-task-packets");

        Ok(Self {
            control_plane_dir: codewinter_root.join("00-control-plane"),
            manager_toolkit_dir: codewinter_root.join("02-manager-toolkit"),
            inbox_dir: codewinter_root.join("03-inbox"),
            task_packet_drop_dir: task_packets_dir.join("_incoming"),
            task_packets_dir,
            deliverables_dir: codewinter_root.join("05-deliverables"),
            releases_dir: codewinter_root.join("_core").join("releases"),
            threads_dir: codewinter_root.join("00-control-plane").join("threads"),
            collab_requests_dir: codewinter_root.join("00-control-plane").join("collab-requests"),
            codewinter_root,
            workspace_root,
        })
    }

    pub fn relative_display_path(&self, path: &Path) -> String {
        if path == self.codewinter_root {
            return format!("./{DISPLAY_ROOT_NAME}");
        }

        if let Ok(relative) = path.strip_prefix(&self.codewinter_root) {
            let relative = to_slash_path(relative);
            return if relative.is_empty() {
                format!("./{DISPLAY_ROOT_NAME}")
            } else {
                format!("./{DISPLAY_ROOT_NAME}/{relative}")
            };
        }

        if let Ok(relative) = path.strip_prefix(&self.workspace_root) {
            let relative = to_slash_path(relative);
            let actual_root_name = self
                .codewinter_root
                .file_name()
                .and_then(|value| value.to_str())
                .unwrap_or(DISPLAY_ROOT_NAME);

            if relative == actual_root_name {
                return format!("./{DISPLAY_ROOT_NAME}");
            }

            if let Some(stripped) = relative.strip_prefix(&format!("{actual_root_name}/")) {
                return format!("./{DISPLAY_ROOT_NAME}/{stripped}");
            }

            return format!("./{relative}");
        }

        path.to_string_lossy().replace('\\', "/")
    }

    pub fn resolve_read_path(&self, raw_path: &str) -> Result<PathBuf, String> {
        let trimmed = raw_path.trim();
        if trimmed.is_empty() {
            return Err("Read path cannot be empty.".to_string());
        }

        let normalized = trimmed.replace('\\', "/");

        let candidate = if Path::new(trimmed).is_absolute() {
            PathBuf::from(trimmed)
        } else if matches!(normalized.as_str(), "./CodeWinter" | "CodeWinter") {
            self.codewinter_root.clone()
        } else if let Some(stripped) = strip_codewinter_prefix(trimmed) {
            self.codewinter_root.join(stripped)
        } else if let Some(stripped) = trimmed.strip_prefix("./") {
            self.codewinter_root.join(stripped)
        } else {
            self.codewinter_root.join(trimmed)
        };

        let canonical = fs::canonicalize(&candidate)
            .map_err(|error| format!("Could not resolve target path {}: {error}", candidate.display()))?;
        let codewinter_root = fs::canonicalize(&self.codewinter_root)
            .map_err(|error| format!("Could not resolve CodeWinter root: {error}"))?;

        if !canonical.starts_with(&codewinter_root) {
            return Err("Target path is outside the CodeWinter root allowlist.".to_string());
        }

        Ok(canonical)
    }

    pub fn prepare_inbox_target(&self, raw_file_name: &str) -> Result<PathBuf, String> {
        self.prepare_upload_target(&self.inbox_dir, raw_file_name)
    }

    pub fn prepare_task_packet_drop_target(&self, raw_file_name: &str) -> Result<PathBuf, String> {
        self.prepare_upload_target(&self.task_packet_drop_dir, raw_file_name)
    }

    pub fn watch_roots(&self) -> Vec<PathBuf> {
        vec![
            self.control_plane_dir.clone(),
            self.inbox_dir.clone(),
            self.task_packets_dir.clone(),
            self.deliverables_dir.clone(),
            self.releases_dir.clone(),
        ]
    }

    fn prepare_upload_target(&self, directory: &Path, raw_file_name: &str) -> Result<PathBuf, String> {
        fs::create_dir_all(directory)
            .map_err(|error| format!("Could not create upload directory {}: {error}", directory.display()))?;

        let sanitized = sanitize_file_name(raw_file_name);
        let mut candidate = directory.join(&sanitized);

        if candidate.exists() {
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map_err(|error| format!("Could not create timestamp: {error}"))?
                .as_secs();

            let stem = Path::new(&sanitized)
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("upload");
            let extension = Path::new(&sanitized)
                .extension()
                .and_then(|value| value.to_str())
                .unwrap_or("");

            let next_name = if extension.is_empty() {
                format!("{stem}-{timestamp}")
            } else {
                format!("{stem}-{timestamp}.{extension}")
            };
            candidate = directory.join(next_name);
        }

        Ok(candidate)
    }
}

fn strip_codewinter_prefix(value: &str) -> Option<String> {
    let normalized = value.replace('\\', "/");
    normalized
        .strip_prefix("./CodeWinter/")
        .or_else(|| normalized.strip_prefix("CodeWinter/"))
        .map(ToOwned::to_owned)
}

fn sanitize_file_name(raw: &str) -> String {
    let base_name = Path::new(raw)
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("upload.bin");

    let sanitized = base_name
        .chars()
        .map(|character| match character {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            _ => character,
        })
        .collect::<String>()
        .trim()
        .trim_matches('.')
        .to_string();

    if sanitized.is_empty() {
        "upload.bin".to_string()
    } else {
        sanitized
    }
}

fn to_slash_path(path: &Path) -> String {
    path.components()
        .filter_map(|component| match component {
            Component::Normal(value) => Some(value.to_string_lossy().into_owned()),
            _ => None,
        })
        .collect::<Vec<_>>()
        .join("/")
}
