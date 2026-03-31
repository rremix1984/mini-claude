import React, { useCallback, useRef, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { MessageList } from './components/MessageList.js'
import { PermissionRequest } from './components/PermissionRequest.js'
import { Spinner } from './components/Spinner.js'
import { runTurn } from './QueryEngine.js'
import type { DisplayMessage, PermissionMode, SessionState } from './types.js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingPermission {
  toolName: string
  input: Record<string, unknown>
  resolve: (allowed: boolean) => void
}

interface AppProps {
  model: string
  permissionMode: PermissionMode
  cwd: string
  initialPrompt?: string
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function App({ model, permissionMode, cwd, initialPrompt }: AppProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [pendingPermission, setPendingPermission] = useState<PendingPermission | null>(null)
  const [loadingLabel, setLoadingLabel] = useState('Thinking…')

  const sessionState = useRef<SessionState>({
    model,
    permissionMode,
    history: [],
    cwd,
  })

  const idCounter = useRef(0)
  const nextId = () => String(++idCounter.current)

  const addMessage = useCallback((msg: Omit<DisplayMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: nextId(), timestamp: new Date() },
    ])
  }, [])

  const submitPrompt = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      addMessage({ role: 'user', content: text })
      setInputText('')
      setIsLoading(true)
      setStreamingText('')

      try {
        await runTurn(text, sessionState.current, {
          onText: delta => {
            setStreamingText(prev => prev + delta)
          },
          onAssistantMessage: fullText => {
            setStreamingText('')
            addMessage({ role: 'assistant', content: fullText })
          },
          onPermissionRequest: (toolName, input) => {
            setLoadingLabel(`Waiting for permission: ${toolName}`)
            return new Promise<boolean>(resolve => {
              setPendingPermission({ toolName, input, resolve })
            })
          },
          onToolResult: (toolName, result) => {
            setLoadingLabel('Thinking…')
            addMessage({
              role: 'tool',
              toolName,
              content: result.error
                ? `${result.output}\nError: ${result.error}`
                : result.output,
              isError: !result.success,
            })
          },
          onError: err => {
            addMessage({ role: 'system', content: `Error: ${err.message}`, isError: true })
          },
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        addMessage({ role: 'system', content: `Error: ${msg}`, isError: true })
      } finally {
        setIsLoading(false)
        setStreamingText('')
        setLoadingLabel('Thinking…')
        setPendingPermission(null)
      }
    },
    [isLoading, addMessage],
  )

  // Handle keyboard input in the text field
  useInput(
    (char, key) => {
      if (pendingPermission) return // permission dialog takes over input

      if (key.return) {
        void submitPrompt(inputText)
        return
      }
      if (key.backspace || key.delete) {
        setInputText(prev => prev.slice(0, -1))
        return
      }
      if (key.ctrl && char === 'c') {
        process.exit(0)
      }
      if (!key.ctrl && !key.meta && char) {
        setInputText(prev => prev + char)
      }
    },
    { isActive: !pendingPermission },
  )

  // Auto-submit initial prompt once
  const submitted = useRef(false)
  React.useEffect(() => {
    if (initialPrompt && !submitted.current) {
      submitted.current = true
      void submitPrompt(initialPrompt)
    }
  }, [initialPrompt, submitPrompt])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="blue" bold>
          ◈ mini-claude
        </Text>
        <Text dimColor>  {model}  {cwd}</Text>
        <Text dimColor={sessionState.current.permissionMode !== 'bypassPermissions'}>
          {' '}[{sessionState.current.permissionMode === 'bypassPermissions' ? '✓ Always Allow' : 'Permissions'}]
        </Text>
      </Box>

      {/* Message history */}
      <MessageList messages={messages} streamingText={isLoading ? streamingText : undefined} />

      {/* Permission dialog (takes over bottom area) */}
      {pendingPermission && (
        <PermissionRequest
          toolName={pendingPermission.toolName}
          input={pendingPermission.input}
          onDecision={allowed => {
            const cb = pendingPermission.resolve
            setPendingPermission(null)
            cb(allowed)
          }}
          onAlways={() => {
            // Switch to bypassPermissions mode for all future tool calls
            sessionState.current.permissionMode = 'bypassPermissions'
            addMessage({
              role: 'system',
              content: '✓ Permission mode changed to "always allow" - no more confirmations',
            })
          }}
        />
      )}

      {/* Spinner or input */}
      {isLoading && !pendingPermission ? (
        <Spinner label={loadingLabel} />
      ) : !pendingPermission ? (
        <Box marginTop={1}>
          <Text color="green">❯ </Text>
          <Text>{inputText}</Text>
          <Text color="gray">█</Text>
        </Box>
      ) : null}

      {/* Footer hint */}
      {!isLoading && !pendingPermission && (
        <Box>
          <Text dimColor>  Ctrl+C to exit</Text>
        </Box>
      )}
    </Box>
  )
}
