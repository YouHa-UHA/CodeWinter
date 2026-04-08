use std::{
    sync::mpsc,
    thread::{self, JoinHandle},
    time::{Duration, Instant},
};

use notify::{recommended_watcher, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter};

use crate::{models::SnapshotRefreshEvent, paths::ConsolePaths};

pub struct WatchRuntime {
    watcher: RecommendedWatcher,
    stop_tx: mpsc::Sender<()>,
    thread_handle: Option<JoinHandle<()>>,
}

pub fn start_watch_loop(app: AppHandle, paths: ConsolePaths) -> Result<WatchRuntime, String> {
    let (event_tx, event_rx) = mpsc::channel();
    let mut watcher = recommended_watcher(move |event| {
        let _ = event_tx.send(event);
    })
    .map_err(|error| format!("无法创建文件监听器: {error}"))?;

    for root in paths.watch_roots() {
        if root.exists() {
            watcher
                .watch(&root, RecursiveMode::Recursive)
                .map_err(|error| format!("无法监听目录 {}: {error}", root.display()))?;
        }
    }

    let (stop_tx, stop_rx) = mpsc::channel();
    let thread_handle = thread::spawn(move || {
        let debounce_window = Duration::from_millis(800);

        loop {
            if stop_rx.try_recv().is_ok() {
                break;
            }

            match event_rx.recv_timeout(Duration::from_millis(250)) {
                Ok(Ok(_event)) => {
                    let mut deadline = Instant::now() + debounce_window;
                    loop {
                        if stop_rx.try_recv().is_ok() {
                            return;
                        }

                        let now = Instant::now();
                        if now >= deadline {
                            break;
                        }

                        let wait_duration = deadline.saturating_duration_since(now);
                        match event_rx.recv_timeout(wait_duration.min(Duration::from_millis(250))) {
                            Ok(Ok(_)) => {
                                deadline = Instant::now() + debounce_window;
                            }
                            Ok(Err(_)) => {}
                            Err(mpsc::RecvTimeoutError::Timeout) => {}
                            Err(mpsc::RecvTimeoutError::Disconnected) => return,
                        }
                    }

                    let _ = app.emit(
                        "console://snapshot-refresh-requested",
                        SnapshotRefreshEvent {
                            reason: "fs-change".to_string(),
                        },
                    );
                }
                Ok(Err(_error)) => {}
                Err(mpsc::RecvTimeoutError::Timeout) => {}
                Err(mpsc::RecvTimeoutError::Disconnected) => break,
            }
        }
    });

    Ok(WatchRuntime {
        watcher,
        stop_tx,
        thread_handle: Some(thread_handle),
    })
}

pub fn stop_watch_loop(mut runtime: WatchRuntime) -> Result<(), String> {
    runtime
        .stop_tx
        .send(())
        .map_err(|error| format!("无法停止 watcher: {error}"))?;

    drop(runtime.watcher);

    if let Some(thread_handle) = runtime.thread_handle.take() {
        thread_handle
            .join()
            .map_err(|_| "watcher 线程停止时发生 panic。".to_string())?;
    }

    Ok(())
}
