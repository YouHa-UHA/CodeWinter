import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { mockSnapshot } from '../lib/mockSnapshot'
import {
  isTauriRuntime,
  listenSnapshotRefresh,
  loadSnapshot,
  openPath,
  readTextFile,
  startWatch,
  stopWatch,
  uploadToInbox,
  uploadToTaskPacketDrop,
} from '../lib/tauri'
import type {
  ConsoleSnapshot,
  PromptEntry,
  UploadFeedback,
  UploadTarget,
} from '../types/snapshot'

type SnapshotSetter = Dispatch<SetStateAction<ConsoleSnapshot>>
type LoadingSetter = Dispatch<SetStateAction<boolean>>
type ErrorSetter = Dispatch<SetStateAction<string | null>>

function createEmptySnapshot(): ConsoleSnapshot {
  return {
    snapshotVersion: 1,
    generatedAt: '',
    codewinterRoot: '',
    release: {
      version: 'unknown',
      channel: 'draft',
    },
    home: {
      featuredDocs: [],
      sections: [],
    },
    managerBrief: {
      path: '',
      sections: [],
    },
    instanceManifest: {
      path: '',
      fields: [],
      sections: [],
    },
    workbench: {
      prompts: [],
      uploadZones: [],
      deliverableGroups: [],
    },
    runtime: {
      threads: [],
      collabRequests: [],
      signals: [],
      alerts: [],
    },
    explorer: {
      entries: [],
    },
    health: {
      refreshStatus: 'refreshing',
      warnings: [],
    },
  }
}

function extractCanonicalCopyBlock(content: string): string {
  const canonicalMatch = content.match(/```text\r?\n([\s\S]*?)\r?\n```/)
  if (canonicalMatch?.[1]) {
    return canonicalMatch[1].trim()
  }

  return content.trim()
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function initialUploadFeedback(): Record<UploadTarget, UploadFeedback> {
  return {
    inbox: { state: 'idle' },
    taskPacketDrop: { state: 'idle' },
  }
}

async function syncSnapshot(
  setSnapshot: SnapshotSetter,
  setLoading: LoadingSetter,
  setError: ErrorSetter,
) {
  if (!isTauriRuntime()) {
    setSnapshot(mockSnapshot)
    setLoading(false)
    setError(null)
    return
  }

  setLoading(true)
  setError(null)

  try {
    const nextSnapshot = await loadSnapshot()
    setSnapshot(nextSnapshot)
  } catch (refreshError) {
    if (refreshError instanceof Error) {
      setError((refreshError as Error).message)
    } else {
      setError('Unable to load the latest console snapshot.')
    }
  } finally {
    setLoading(false)
  }
}

export function useConsoleSnapshot() {
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot>(() =>
    isTauriRuntime() ? createEmptySnapshot() : mockSnapshot,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadFeedbacks, setUploadFeedbacks] = useState<Record<UploadTarget, UploadFeedback>>(
    initialUploadFeedback,
  )
  const mountedRef = useRef(false)
  const syncInFlightRef = useRef(false)
  const syncQueuedRef = useRef(false)
  const refreshTimerRef = useRef<number | undefined>(undefined)

  const runSnapshotSync = useCallback(async () => {
    if (syncInFlightRef.current) {
      syncQueuedRef.current = true
      return
    }

    syncInFlightRef.current = true

    try {
      do {
        syncQueuedRef.current = false

        if (!mountedRef.current) {
          return
        }

        await syncSnapshot(setSnapshot, setLoading, setError)
      } while (mountedRef.current && syncQueuedRef.current)
    } finally {
      syncInFlightRef.current = false
    }
  }, [])

  const scheduleSnapshotSync = useCallback(() => {
    if (refreshTimerRef.current !== undefined) {
      window.clearTimeout(refreshTimerRef.current)
    }

    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = undefined
      void runSnapshotSync()
    }, 450)
  }, [runSnapshotSync])

  useEffect(() => {
    let unlisten: (() => void) | undefined
    mountedRef.current = true

    const init = async () => {
      await runSnapshotSync()

      if (!isTauriRuntime()) {
        return
      }

      unlisten = await listenSnapshotRefresh(() => {
        scheduleSnapshotSync()
      })

      try {
        await startWatch()
      } catch (watchError) {
        setError(
          watchError instanceof Error
            ? (watchError as Error).message
            : 'Unable to start the file watcher.',
        )
      }
    }

    void init()

    return () => {
      mountedRef.current = false
      if (refreshTimerRef.current !== undefined) {
        window.clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = undefined
      }
      unlisten?.()
      if (isTauriRuntime()) {
        void stopWatch()
      }
    }
  }, [runSnapshotSync, scheduleSnapshotSync])

  const refresh = async () => runSnapshotSync()

  const copyPrompt = async (entry: PromptEntry) => {
    const rawText = isTauriRuntime()
      ? await readTextFile(entry.path)
      : `# ${entry.label.en}\n\n\`\`\`text\nMock prompt preview: ${entry.label.en}\n\`\`\``
    const text = extractCanonicalCopyBlock(rawText)

    await navigator.clipboard.writeText(text)
  }

  const previewTextFile = async (path: string) => {
    if (!isTauriRuntime()) {
      return `Mock preview for: ${path}`
    }

    return readTextFile(path)
  }

  const revealPath = async (path: string) => {
    if (!isTauriRuntime()) {
      return
    }

    await openPath(path)
  }

  const uploadFile = async (target: UploadTarget, file: File) => {
    if (!isTauriRuntime()) {
      setUploadFeedbacks((current) => ({
        ...current,
        [target]: {
          state: 'error',
          browserFallback: true,
        },
      }))
      return
    }

    setUploadFeedbacks((current) => ({
      ...current,
      [target]: { state: 'uploading' },
    }))

    try {
      const buffer = await file.arrayBuffer()
      const base64Content = toBase64(new Uint8Array(buffer))
      const result =
        target === 'taskPacketDrop'
          ? await uploadToTaskPacketDrop(file.name, base64Content)
          : await uploadToInbox(file.name, base64Content)

      setUploadFeedbacks((current) => ({
        ...current,
        [target]: {
          state: 'done',
          savedPath: result.savedPath,
        },
      }))
      await refresh()
    } catch (uploadError) {
      setUploadFeedbacks((current) => ({
        ...current,
        [target]: {
          state: 'error',
          errorMessage:
            uploadError instanceof Error ? uploadError.message : 'The file upload failed.',
        },
      }))
    }
  }

  return {
    snapshot,
    loading,
    error,
    uploadFeedbacks,
    refresh,
    copyPrompt,
    previewTextFile,
    revealPath,
    uploadFile,
  }
}
