/**
 * Zod schema for configuration validation
 */

import { z } from 'zod'
import type { MiniClaudeConfig } from './types.js'

// ─── Permission Mode Schema ─────────────────────────────────────────────────

export const PermissionModeSchema = z.enum(['default', 'bypassPermissions', 'autoApproveSafe'])

// ─── Theme Mode Schema ─────────────────────────────────────────────────────

export const ThemeModeSchema = z.enum(['light', 'dark', 'auto'])

// ─── LLM Provider Schema ────────────────────────────────────────────────────

export const LLMProviderSchema = z.enum(['zhipu', 'openai', 'anthropic'])

// ─── Main Config Schema ─────────────────────────────────────────────────────

export const ConfigSchema: z.ZodType<MiniClaudeConfig> = z.object({
  // LLM Settings
  model: z.string().min(1),
  provider: LLMProviderSchema,
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(128000),
  topP: z.number().min(0).max(1),
  maxToolRounds: z.number().min(1).max(100),

  // Permission Settings
  defaultPermissionMode: PermissionModeSchema,
  bypassPermissionsForSafeCommands: z.boolean(),

  // UI Settings
  theme: ThemeModeSchema,
  showTimestamp: z.boolean(),
  maxMessageHistory: z.number().min(10).max(1000),

  // Session Settings
  autoSave: z.boolean(),
  saveInterval: z.number().min(10).max(3600),
  historyLimit: z.number().min(1).max(500),
  sessionDir: z.string(),

  // Workspace Settings
  workspacePath: z.string().optional(),
  defaultCwd: z.string(),

  // Logging Settings
  logLevel: z.enum(['error', 'warn', 'info', 'debug', 'trace']),
  logFile: z.string(),
  logToConsole: z.boolean(),
  logToFile: z.boolean(),

  // Advanced Settings
  enableAnalytics: z.boolean(),
  enableTelemetry: z.boolean(),
  disableTools: z.array(z.string()),
  enableSkills: z.array(z.string()),
})

