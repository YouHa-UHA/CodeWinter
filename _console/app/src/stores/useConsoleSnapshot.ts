import { useEffect, useState } from 'react'
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
    setError(
      refreshError instanceof Error
        ? refreshError.message
        : 'Unable to load the latest console snapshot.',
    )
  } finally {
    setLoading(false)
  }
}

export function useConsoleSnapshot() {
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot>(mockSnapshot)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadFeedbacks, setUploadFeedbacks] = useState<Record<UploadTarget, UploadFeedback>>(
    initialUploadFeedback,
  )

  useEffect(() => {
    let unlisten: (() => void) | undefined

    const init = async () => {
      await syncSnapshot(setSnapshot, setLoading, setError)

      if (!isTauriRuntime()) {
        return
      }

      unlisten = await listenSnapshotRefresh(() => {
        void syncSnapshot(setSnapshot, setLoading, setError)
      })

      await startWatch()
    }

    void init()

    return () => {
      unlisten?.()
      if (isTauriRuntime()) {
        void stopWatch()
      }
    }
  }, [])

  const refresh = async () => syncSnapshot(setSnapshot, setLoading, setError)

  const copyPrompt = async (entry: PromptEntry) => {
    const rawText = isTauriRuntime()
      ? await readTextFile(entry.path)
      : `# ${entry.label.en}\n\n\`\`\`text\nMock prompt preview: ${entry.label.en}\nPath: ${entry.path}\n\`\`\``
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
