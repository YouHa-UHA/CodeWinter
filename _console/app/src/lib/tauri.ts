import type { ConsoleSnapshot } from '../types/snapshot'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}

export interface UploadInboxResult {
  savedPath: string
}

export interface SnapshotRefreshEvent {
  reason: string
}

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && typeof window.__TAURI_INTERNALS__ !== 'undefined'
}

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<T>(command, args)
}

export async function loadSnapshot(): Promise<ConsoleSnapshot> {
  return invokeCommand<ConsoleSnapshot>('load_snapshot')
}

export async function readTextFile(path: string): Promise<string> {
  return invokeCommand<string>('read_text_file', { path })
}

export async function openPath(path: string): Promise<void> {
  await invokeCommand('open_path', { path })
}

export async function uploadToInbox(
  fileName: string,
  base64Content: string,
): Promise<UploadInboxResult> {
  return invokeCommand<UploadInboxResult>('upload_to_inbox', {
    fileName,
    base64Content,
  })
}

export async function uploadToTaskPacketDrop(
  fileName: string,
  base64Content: string,
): Promise<UploadInboxResult> {
  return invokeCommand<UploadInboxResult>('upload_to_task_packet_drop', {
    fileName,
    base64Content,
  })
}

export async function startWatch(): Promise<void> {
  await invokeCommand('start_watch')
}

export async function stopWatch(): Promise<void> {
  await invokeCommand('stop_watch')
}

export async function listenSnapshotRefresh(
  handler: (payload: SnapshotRefreshEvent) => void,
): Promise<() => void> {
  const { listen } = await import('@tauri-apps/api/event')
  return listen<SnapshotRefreshEvent>('console://snapshot-refresh-requested', (event) =>
    handler(event.payload),
  )
}

async function getCurrentWindowHandle() {
  const { getCurrentWindow } = await import('@tauri-apps/api/window')
  return getCurrentWindow()
}

export async function minimizeWindow() {
  if (!isTauriRuntime()) {
    return
  }

  const appWindow = await getCurrentWindowHandle()
  await appWindow.minimize()
}

export async function toggleMaximizeWindow() {
  if (!isTauriRuntime()) {
    return false
  }

  const appWindow = await getCurrentWindowHandle()
  await appWindow.toggleMaximize()
  return appWindow.isMaximized()
}

export async function closeWindow() {
  if (!isTauriRuntime()) {
    return
  }

  const appWindow = await getCurrentWindowHandle()
  await appWindow.close()
}

export async function startWindowDragging() {
  if (!isTauriRuntime()) {
    return
  }

  const appWindow = await getCurrentWindowHandle()
  await appWindow.startDragging()
}

export async function isWindowMaximized() {
  if (!isTauriRuntime()) {
    return false
  }

  const appWindow = await getCurrentWindowHandle()
  return appWindow.isMaximized()
}

export async function listenWindowResize(handler: () => void): Promise<() => void> {
  if (!isTauriRuntime()) {
    return () => {}
  }

  const appWindow = await getCurrentWindowHandle()
  return appWindow.onResized(() => handler())
}
