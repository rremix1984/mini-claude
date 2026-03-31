/**
 * /config command
 * Manage Mini-Claude configuration
 */

import type { Command, CommandArgs, CommandContext, CommandResult } from '../types.js'
import type { ConfigManager } from '../../config/index.js'

// ─── Helper Functions ─────────────────────────────────────────────────────

function formatConfigValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  return String(value)
}

function displayConfigKey(key: string, value: unknown): string {
  return `  ${key}: ${formatConfigValue(value)}`
}

// ─── Subcommands ───────────────────────────────────────────────────────────

/**
 * List all configuration values
 */
async function handleList(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const config = context.config.getConfig()

  const output = [
    'Current Configuration:',
    '=====================',
    '',
    ...Object.entries(config).map(([key, value]) => displayConfigKey(key, value)),
    '',
    `Config file: ${context.config.getConfigPath()}`,
    `Config file exists: ${context.config.hasConfigFile()}`,
  ].join('\n')

  return { success: true, message: output }
}

/**
 * Get a specific configuration value
 */
async function handleGet(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const key = args._[0]

  if (!key) {
    return {
      success: false,
      error: 'Usage: /config get <key>',
    }
  }

  const config = context.config.getConfig()

  if (!(key in config)) {
    return {
      success: false,
      error: `Unknown configuration key: ${key}`,
    }
  }

  const value = (config as any)[key]

  return {
    success: true,
    message: displayConfigKey(key, value),
  }
}

/**
 * Set a configuration value (in-memory only)
 */
async function handleSet(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const key = args._[0]
  const value = args._[1]

  if (!key || value === undefined) {
    return {
      success: false,
      error: 'Usage: /config set <key> <value>',
    }
  }

  const config = context.config.getConfig()

  if (!(key in config)) {
    return {
      success: false,
      error: `Unknown configuration key: ${key}`,
    }
  }

  // Parse the value based on the expected type
  const expectedValue = (config as any)[key]
  let parsedValue: unknown = value

  if (typeof expectedValue === 'boolean') {
    parsedValue = value.toLowerCase() === 'true' || value === '1'
  } else if (typeof expectedValue === 'number') {
    const num = Number.parseFloat(value)
    if (Number.isNaN(num)) {
      return { success: false, error: `Invalid number value: ${value}` }
    }
    parsedValue = num
  } else if (Array.isArray(expectedValue)) {
    parsedValue = value.split(',').map(s => s.trim())
  }

  // Set the value
  (context.config as any).set(key, parsedValue)

  return {
    success: true,
    message: `Set ${key} = ${formatConfigValue(parsedValue)}\n\nNote: Use /config save to persist to file.`,
  }
}

/**
 * Reset configuration to defaults
 */
async function handleReset(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  context.config.reset()

  return {
    success: true,
    message: 'Configuration reset to defaults.\n\nNote: Use /config save to persist to file.',
  }
}

/**
 * Save current configuration to file
 */
async function handleSave(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  try {
    context.config.save()
    return {
      success: true,
      message: `Configuration saved to ${context.config.getConfigPath()}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Reload configuration from file
 */
async function handleReload(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  try {
    context.config.reload()
    return {
      success: true,
      message: 'Configuration reloaded from file.',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Display configuration file info
 */
async function handleInfo(args: CommandArgs, context: CommandContext): Promise<CommandResult> {
  const configPath = context.config.getConfigPath()
  const hasConfig = context.config.hasConfigFile()

  const output = [
    'Configuration Information:',
    '=========================',
    '',
    `Config file path: ${configPath}`,
    `Config file exists: ${hasConfig}`,
    '',
    'Environment Variables:',
    ...Object.entries(context.config.getEnvVars())
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `  ${k}=${v}`),
  ].join('\n')

  return { success: true, message: output || 'No environment variables set.' }
}

// ─── Main Command ─────────────────────────────────────────────────────────

export const configCommand: Command = {
  name: 'config',
  aliases: ['cfg'],
  description: 'Manage Mini-Claude configuration',
  usage: '/config <subcommand> [options]',
  examples: [
    '/config list                    - List all configuration',
    '/config get <key>               - Get a specific value',
    '/config set <key> <value>       - Set a value (in-memory)',
    '/config save                    - Save to file',
    '/config reload                  - Reload from file',
    '/config reset                   - Reset to defaults',
    '/config info                    - Show config file info',
  ],
  category: 'core',
  handler: async (args: CommandArgs, context: CommandContext): Promise<CommandResult> => {
    const subcommand = args._[0] || 'list'

    const subcommands: Record<string, (args: CommandArgs, ctx: CommandContext) => Promise<CommandResult>> = {
      list: handleList,
      ls: handleList,
      get: handleGet,
      show: handleGet,
      set: handleSet,
      reset: handleReset,
      save: handleSave,
      write: handleSave,
      reload: handleReload,
      load: handleReload,
      info: handleInfo,
    }

    const handler = subcommands[subcommand]

    if (!handler) {
      return {
        success: false,
        error: `Unknown subcommand: ${subcommand}\n\nAvailable subcommands: ${Object.keys(subcommands).join(', ')}`,
      }
    }

    return handler(args, context)
  },
}
