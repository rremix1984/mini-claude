/**
 * Default configuration values for Mini-Claude
 */

import type { MiniClaudeConfig } from './types.js'
import { homedir } from 'node:os'
import { join } from 'node:path'

const HOME_DIR = homedir()
const DEFAULT_CONFIG_DIR = join(HOME_DIR, '.miniclaude')

export const DEFAULT_CONFIG: MiniClaudeConfig = {
  // LLM Settings
  model: 'glm-4',
  provider: 'zhipu',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  maxToolRounds: 20,

  // Permission Settings
  defaultPermissionMode: 'default',
  bypassPermissionsForSafeCommands: true,

  // UI Settings
  theme: 'auto',
  showTimestamp: true,
  maxMessageHistory: 100,

  // Session Settings
  autoSave: true,
  saveInterval: 60,  // save every 60 seconds
  historyLimit: 50,
  sessionDir: join(DEFAULT_CONFIG_DIR, 'sessions'),

  // Workspace Settings
  workspacePath: undefined,
  defaultCwd: process.cwd(),

  // Logging Settings
  logLevel: 'info',
  logFile: join(DEFAULT_CONFIG_DIR, 'miniclaude.log'),
  logToConsole: true,
  logToFile: true,

  // Advanced Settings
  enableAnalytics: false,
  enableTelemetry: false,
  disableTools: [],
  enableSkills: [],
}

// ─── Environment Variable Mappings ───────────────────────────────────────────
// Maps config keys to environment variable names

export const ENV_VAR_MAPPING: Record<keyof MiniClaudeConfig, string | null> = {
  // LLM Settings
  model: 'MINICLAUDE_MODEL',
  provider: 'MINICLAUDE_PROVIDER',
  temperature: 'MINICLAUDE_TEMPERATURE',
  maxTokens: 'MINICLAUDE_MAX_TOKENS',
  topP: 'MINICLAUDE_TOP_P',
  maxToolRounds: 'MINICLAUDE_MAX_TOOL_ROUNDS',

  // Permission Settings
  defaultPermissionMode: 'MINICLAUDE_PERMISSION_MODE',
  bypassPermissionsForSafeCommands: 'MINICLAUDE_BYPASS_PERMISSIONS',

  // UI Settings
  theme: 'MINICLAUDE_THEME',
  showTimestamp: 'MINICLAUDE_SHOW_TIMESTAMP',
  maxMessageHistory: 'MINICLAUDE_MAX_HISTORY',

  // Session Settings
  autoSave: 'MINICLAUDE_AUTO_SAVE',
  saveInterval: 'MINICLAUDE_SAVE_INTERVAL',
  historyLimit: 'MINICLAUDE_HISTORY_LIMIT',
  sessionDir: 'MINICLAUDE_SESSION_DIR',

  // Workspace Settings
  workspacePath: 'MINICLAUDE_WORKSPACE',
  defaultCwd: 'MINICLAUDE_CWD',

  // Logging Settings
  logLevel: 'MINICLAUDE_LOG_LEVEL',
  logFile: 'MINICLAUDE_LOG_FILE',
  logToConsole: 'MINICLAUDE_LOG_CONSOLE',
  logToFile: 'MINICLAUDE_LOG_FILE_ENABLE',

  // Advanced Settings
  enableAnalytics: 'MINICLAUDE_ANALYTICS',
  enableTelemetry: 'MINICLAUDE_TELEMETRY',
  disableTools: 'MINICLAUDE_DISABLE_TOOLS',
  enableSkills: 'MINICLAUDE_ENABLE_SKILLS',
}
