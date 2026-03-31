import type OpenAI from 'openai'

// ─── Permission ───────────────────────────────────────────────────────────────

export type PermissionMode = 'default' | 'bypassPermissions'

// ─── Tools ────────────────────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string
  description: string
  /** JSON Schema for the tool's input object */
  inputSchema: Record<string, unknown>
  /** Whether this tool requires user confirmation before execution */
  requiresPermission: boolean
  execute: (input: Record<string, unknown>) => Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant'

/** A single display message shown in the TUI */
export interface DisplayMessage {
  id: string
  role: MessageRole | 'tool' | 'system'
  content: string
  toolName?: string
  isError?: boolean
  timestamp: Date
}

// ─── Conversation ──────────────────────────────────────────────────────────────

/** A raw API message in OpenAI/ZhipuAI format */
export type ApiMessage = OpenAI.ChatCompletionMessageParam

// ─── QueryEngine callbacks ────────────────────────────────────────────────────

export interface QueryCallbacks {
  /** Called when a new text chunk arrives from the stream */
  onText?: (delta: string) => void
  /** Called when the assistant's full turn text is ready */
  onAssistantMessage?: (text: string) => void
  /** Called when a tool is about to be executed; return false to deny */
  onPermissionRequest?: (toolName: string, input: Record<string, unknown>) => Promise<boolean>
  /** Called when a tool finishes executing */
  onToolResult?: (toolName: string, result: ToolResult) => void
  /** Called when an error occurs */
  onError?: (error: Error) => void
}

// ─── Session state ────────────────────────────────────────────────────────────

export interface SessionState {
  model: string
  permissionMode: PermissionMode
  history: ApiMessage[]
  cwd: string
}
