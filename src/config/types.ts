/**
 * Configuration types for Mini-Claude
 */

// ─── Permission Modes ──────────────────────────────────────────────────────

export type PermissionMode = 'default' | 'bypassPermissions' | 'autoApproveSafe'

// ─── Theme Options ─────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'auto'

// ─── LLM Provider Options ─────────────────────────────────────────────────

export type LLMProvider = 'zhipu' | 'openai' | 'anthropic'

// ─── Main Configuration Interface ───────────────────────────────────────────

export interface MiniClaudeConfig {
  // LLM Settings
  model: string
  provider: LLMProvider
  temperature: number
  maxTokens: number
  topP: number
  maxToolRounds: number

  // Permission Settings
  defaultPermissionMode: PermissionMode
  bypassPermissionsForSafeCommands: boolean

  // UI Settings
  theme: ThemeMode
  showTimestamp: boolean
  maxMessageHistory: number

  // Session Settings
  autoSave: boolean
  saveInterval: number  // seconds
  historyLimit: number
  sessionDir: string

  // Workspace Settings
  workspacePath?: string
  defaultCwd: string

  // Logging Settings
  logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace'
  logFile: string
  logToConsole: boolean
  logToFile: boolean

  // Advanced Settings
  enableAnalytics: boolean
  enableTelemetry: boolean
  disableTools: string[]
  enableSkills: string[]
}

// ─── Config File Options ───────────────────────────────────────────────────

export interface ConfigFileOptions {
  path?: string
  format?: 'json' | 'yaml'
}

// ─── Config Manager Options ─────────────────────────────────────────────────

export interface ConfigManagerOptions {
  configPath?: string
  envPrefix?: string
}

// ─── Partial Config Type ───────────────────────────────────────────────────

export type PartialConfig = Partial<MiniClaudeConfig>

