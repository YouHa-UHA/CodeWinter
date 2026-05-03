mod commands;
mod models;
mod parser;
mod paths;
mod snapshot;
mod watcher;

use commands::AppState;
use paths::ConsolePaths;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let paths = ConsolePaths::discover().expect("failed to discover CodeWinter console paths");

    tauri::Builder::default()
        .manage(AppState::new(paths))
        .invoke_handler(tauri::generate_handler![
            commands::load_snapshot,
            commands::read_text_file,
            commands::open_path,
            commands::upload_to_inbox,
            commands::upload_to_task_packet_drop,
            commands::start_watch,
            commands::stop_watch,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CodeWinter operator console");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn snapshot_builds_and_serializes() {
        let paths = ConsolePaths::discover().expect("test should resolve console paths");
        let snapshot = snapshot::build_snapshot(&paths).expect("snapshot should build");
        let json = serde_json::to_string(&snapshot).expect("snapshot should serialize");

        assert!(json.contains("\"snapshotVersion\""));
    }
}
