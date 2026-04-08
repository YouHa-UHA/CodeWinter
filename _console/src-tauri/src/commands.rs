use std::{fs, process::Command, sync::Mutex};

use base64::{Engine as _, engine::general_purpose::STANDARD};
use tauri::{AppHandle, State};

use crate::{
    models::{ConsoleSnapshot, UploadInboxResult},
    parser::read_utf8_file,
    paths::ConsolePaths,
    snapshot::build_snapshot,
    watcher::{WatchRuntime, start_watch_loop, stop_watch_loop},
};

pub struct AppState {
    pub paths: ConsolePaths,
    pub watcher: Mutex<Option<WatchRuntime>>,
}

impl AppState {
    pub fn new(paths: ConsolePaths) -> Self {
        Self {
            paths,
            watcher: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub fn load_snapshot(state: State<'_, AppState>) -> Result<ConsoleSnapshot, String> {
    build_snapshot(&state.paths)
}

#[tauri::command]
pub fn read_text_file(path: String, state: State<'_, AppState>) -> Result<String, String> {
    let resolved = state.paths.resolve_read_path(&path)?;
    read_utf8_file(&resolved)
}

#[tauri::command]
pub fn open_path(path: String, state: State<'_, AppState>) -> Result<(), String> {
    let resolved = state.paths.resolve_read_path(&path)?;

    if cfg!(target_os = "windows") {
        let mut command = Command::new("explorer");
        if resolved.is_dir() {
            command.arg(&resolved);
        } else {
            command.arg(format!("/select,{}", resolved.display()));
        }

        command
            .spawn()
            .map_err(|error| format!("Could not open path {}: {error}", resolved.display()))?;
        return Ok(());
    }

    if cfg!(target_os = "macos") {
        let mut command = Command::new("open");
        if resolved.is_dir() {
            command.arg(&resolved);
        } else {
            command.arg("-R").arg(&resolved);
        }

        command
            .spawn()
            .map_err(|error| format!("Could not open path {}: {error}", resolved.display()))?;
        return Ok(());
    }

    let target = if resolved.is_dir() {
        resolved
    } else {
        resolved
            .parent()
            .map(ToOwned::to_owned)
            .ok_or_else(|| "Target file has no openable parent directory.".to_string())?
    };

    Command::new("xdg-open")
        .arg(&target)
        .spawn()
        .map_err(|error| format!("Could not open path {}: {error}", target.display()))?;

    Ok(())
}

#[tauri::command]
pub fn upload_to_inbox(
    file_name: String,
    base64_content: String,
    state: State<'_, AppState>,
) -> Result<UploadInboxResult, String> {
    let target = state.paths.prepare_inbox_target(&file_name)?;
    let bytes = STANDARD
        .decode(base64_content)
        .map_err(|error| format!("Could not decode upload content: {error}"))?;

    fs::write(&target, bytes)
        .map_err(|error| format!("Could not write inbox file {}: {error}", target.display()))?;

    Ok(UploadInboxResult {
        saved_path: state.paths.relative_display_path(&target),
    })
}

#[tauri::command]
pub fn upload_to_task_packet_drop(
    file_name: String,
    base64_content: String,
    state: State<'_, AppState>,
) -> Result<UploadInboxResult, String> {
    let target = state.paths.prepare_task_packet_drop_target(&file_name)?;
    let bytes = STANDARD
        .decode(base64_content)
        .map_err(|error| format!("Could not decode upload content: {error}"))?;

    fs::write(&target, bytes).map_err(|error| {
        format!(
            "Could not write task packet drop file {}: {error}",
            target.display()
        )
    })?;

    Ok(UploadInboxResult {
        saved_path: state.paths.relative_display_path(&target),
    })
}

#[tauri::command]
pub fn start_watch(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let mut watcher = state
        .watcher
        .lock()
        .map_err(|_| "Could not acquire watcher state lock.".to_string())?;

    if watcher.is_some() {
        return Ok(());
    }

    let runtime = start_watch_loop(app, state.paths.clone())?;
    *watcher = Some(runtime);
    Ok(())
}

#[tauri::command]
pub fn stop_watch(state: State<'_, AppState>) -> Result<(), String> {
    let mut watcher = state
        .watcher
        .lock()
        .map_err(|_| "Could not acquire watcher state lock.".to_string())?;

    if let Some(runtime) = watcher.take() {
        stop_watch_loop(runtime)?;
    }

    Ok(())
}
